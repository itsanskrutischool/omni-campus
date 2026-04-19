import { NextRequest, NextResponse } from "next/server"
import { CounselingService } from "@/services/counseling.service"
import { requireAuth } from "@/lib/api-middleware"

// GET /api/counseling/alerts - List counseling alerts
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get("tenantId") || auth.user.tenants[0]?.id
    
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const alerts = await CounselingService.getAlerts(tenantId, {
      studentId: searchParams.get("studentId") || undefined,
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      severity: searchParams.get("severity") || undefined,
      assignedTo: searchParams.get("assignedTo") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("pageSize") || "20"),
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("[COUNSELING_ALERTS_GET_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch alerts" },
      { status: 500 }
    )
  }
}

// POST /api/counseling/alerts - Create counseling alert
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const tenantId = body.tenantId || auth.user.tenants[0]?.id
    
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const alert = await CounselingService.createAlert(tenantId, auth.user.id, {
      studentId: body.studentId,
      type: body.type,
      severity: body.severity,
      description: body.description,
      assignedTo: body.assignedTo,
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error("[COUNSELING_ALERTS_POST_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create alert" },
      { status: 500 }
    )
  }
}
