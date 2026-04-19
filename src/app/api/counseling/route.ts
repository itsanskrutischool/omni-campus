import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CounselingService } from "@/services/counseling.service"
import { requireAuth, requireRole } from "@/lib/api-middleware"

// GET /api/counseling - List counseling sessions
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get("tenantId") || auth.user.tenants[0]?.id
    
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const sessions = await CounselingService.getSessions(tenantId, {
      studentId: searchParams.get("studentId") || undefined,
      counselorId: searchParams.get("counselorId") || undefined,
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      severity: searchParams.get("severity") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("pageSize") || "20"),
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("[COUNSELING_GET_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch counseling sessions" },
      { status: 500 }
    )
  }
}

// POST /api/counseling - Create counseling session
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const tenantId = body.tenantId || auth.user.tenants[0]?.id
    
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const session = await CounselingService.createSession(tenantId, auth.user.id, {
      studentId: body.studentId,
      counselorId: body.counselorId,
      sessionDate: new Date(body.sessionDate),
      duration: body.duration,
      type: body.type,
      severity: body.severity,
      summary: body.summary,
      notes: body.notes,
      recommendations: body.recommendations,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
      isConfidential: body.isConfidential,
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error("[COUNSELING_POST_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create counseling session" },
      { status: 500 }
    )
  }
}
