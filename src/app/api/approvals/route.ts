import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  listWorkflowTemplates,
  createWorkflowTemplate,
  deleteWorkflowTemplate,
  listApprovalRequests,
  createApprovalRequest,
  updateApprovalRequest,
  getApprovalStats,
} from "@/services/approval.service"

/**
 * GET /api/approvals
 * ?type=templates - list workflow templates
 * ?type=requests  - list approval requests
 * ?type=stats     - get stats
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "requests"

  if (type === "templates") {
    const templates = await listWorkflowTemplates(session.user.tenantId)
    return NextResponse.json(templates)
  }

  if (type === "stats") {
    const stats = await getApprovalStats(session.user.tenantId)
    return NextResponse.json(stats)
  }

  // Default: list requests
  const result = await listApprovalRequests({
    tenantId: session.user.tenantId,
    status: searchParams.get("status") || undefined,
    page: parseInt(searchParams.get("page") || "1"),
    pageSize: parseInt(searchParams.get("pageSize") || "20"),
  })

  return NextResponse.json(result)
}

/**
 * POST /api/approvals
 * ?type=template  - create workflow template
 * ?type=request   - create approval request
 * ?type=action    - approve/reject a request
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "request"
  const body = await req.json()

  try {
    if (type === "template") {
      const template = await createWorkflowTemplate({
        ...body,
        tenantId: session.user.tenantId,
      })
      return NextResponse.json(template, { status: 201 })
    }

    if (type === "action") {
      const updated = await updateApprovalRequest(body.id, {
        status: body.status,
        currentStep: body.currentStep,
        comments: body.comments,
      })
      return NextResponse.json(updated)
    }

    // Default: create request
    const request = await createApprovalRequest({
      ...body,
      tenantId: session.user.tenantId,
    })
    return NextResponse.json(request, { status: 201 })
  } catch (error: any) {
    console.error("[API_APPROVALS] Error:", error)
    return NextResponse.json(
      { error: error.message || "Operation failed" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/approvals?id=xxx
 * Delete a workflow template
 */
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 })
  }

  try {
    await deleteWorkflowTemplate(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete" },
      { status: 500 }
    )
  }
}
