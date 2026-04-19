import { NextRequest, NextResponse } from "next/server"
import { AuditService } from "@/services/audit.service"

/**
 * GET /api/audit/stats — Get audit log summary stats
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId is required" }, { status: 400 })
    }

    const stats = await AuditService.getStats(tenantId)
    return NextResponse.json(stats)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
