/**
 * API Middleware Wrapper
 * ──────────────────────
 * Combines auth, rate limiting, and validation for API routes.
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "./auth"
import { rateLimit, getRateLimitHeaders } from "./rate-limit"
import { UserRole } from "./permissions"

interface ApiOptions {
  requireAuth?: boolean
  allowedRoles?: UserRole[]
  rateLimitId?: (req: NextRequest) => string
}

export async function withApiMiddleware(
  req: NextRequest,
  handler: (req: NextRequest, context: { user: { id: string; tenantId: string; role: UserRole } }) => Promise<NextResponse>,
  options: ApiOptions = {}
) {
  const { requireAuth = true, allowedRoles } = options

  // Rate limiting (use IP or user ID)
  const forwarded = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  const limitId = options.rateLimitId?.(req) ??
    (forwarded ? forwarded.split(",")[0]?.trim() : null) ??
    realIp ??
    "anonymous"

  const limitResult = rateLimit(limitId)

  if (!limitResult.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      {
        status: 429,
        headers: getRateLimitHeaders(limitResult),
      }
    )
  }

  // Authentication
  if (requireAuth) {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: getRateLimitHeaders(limitResult),
        }
      )
    }

    // Role check
    if (allowedRoles && !allowedRoles.includes(session.user.role as UserRole)) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        {
          status: 403,
          headers: getRateLimitHeaders(limitResult),
        }
      )
    }

    // Call handler with user context
    const response = await handler(req, { user: session.user as { id: string; tenantId: string; role: UserRole } })

    // Add rate limit headers to successful response
    const headers = new Headers(response.headers)
    Object.entries(getRateLimitHeaders(limitResult)).forEach(([key, value]) => {
      headers.set(key, value)
    })

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }

  // No auth required
  const response = await handler(req, { user: { id: "", tenantId: "", role: "STUDENT" as UserRole } })

  const headers = new Headers(response.headers)
  Object.entries(getRateLimitHeaders(limitResult)).forEach(([key, value]) => {
    headers.set(key, value)
  })

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

// Simple auth check helper for direct use in route handlers
export async function requireAuth(
  req: NextRequest
): Promise<{ user: { id: string; tenants: { id: string }[] } } | NextResponse> {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return {
      user: {
        id: session.user.id as string,
        tenants: [{ id: (session.user as { tenantId?: string }).tenantId || "" }],
      },
    }
  } catch (error) {
    console.error("[REQUIRE_AUTH_ERROR]", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

// Role check helper
export function requireRole(
  userRole: string,
  allowedRoles: string[]
): boolean {
  return allowedRoles.includes(userRole)
}
