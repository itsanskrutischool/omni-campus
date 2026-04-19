import { auth } from "@/lib/auth"
import { isValidRole } from "@/lib/permissions"
import { NextResponse } from "next/server"

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"]

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

function isSystemRoute(pathname: string) {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  )
}

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  if (isSystemRoute(pathname)) {
    return NextResponse.next()
  }

  if (isPublicRoute(pathname)) {
    if (session && pathname === "/login") {
      const { tenantSlug, role } = session.user
      return NextResponse.redirect(new URL(`/${tenantSlug}/${role.toLowerCase()}/dashboard`, req.url))
    }

    return NextResponse.next()
  }

  if (pathname === "/") {
    if (session) {
      const { tenantSlug, role } = session.user
      return NextResponse.redirect(new URL(`/${tenantSlug}/${role.toLowerCase()}/dashboard`, req.url))
    }

    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (!session) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const parts = pathname.split("/").filter(Boolean)
  const routeTenantSlug = parts[0]
  const routeRole = parts[1]?.toUpperCase()
  const sessionRole = session.user.role?.toUpperCase()

  if (routeTenantSlug !== session.user.tenantSlug) {
    return NextResponse.redirect(
      new URL(`/${session.user.tenantSlug}/${session.user.role.toLowerCase()}/dashboard`, req.url)
    )
  }

  if (!routeRole || !isValidRole(routeRole) || routeRole !== sessionRole) {
    return NextResponse.redirect(
      new URL(`/${session.user.tenantSlug}/${session.user.role.toLowerCase()}/dashboard`, req.url)
    )
  }

  const response = NextResponse.next()
  const isLocalhost = req.nextUrl.hostname === "localhost" || req.nextUrl.hostname === "127.0.0.1"

  let cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://i.pravatar.cc https://images.unsplash.com https://api.dicebear.com https://ui-avatars.com;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://fonts.googleapis.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
  `

  if (!isLocalhost) {
    cspHeader += " upgrade-insecure-requests;"
  }

  response.headers.set("Content-Security-Policy", cspHeader.replace(/\s{2,}/g, " ").trim())
  response.headers.set("X-DNS-Prefetch-Control", "on")

  if (!isLocalhost) {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  }

  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "origin-when-cross-origin")

  return response
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
