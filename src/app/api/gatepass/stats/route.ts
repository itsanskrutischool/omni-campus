import { NextRequest, NextResponse } from "next/server"
import { GatePassService } from "@/services/gatepass.service"
import { auth } from "@/lib/auth"

/**
 * GET /api/gatepass/stats — Today's gate pass stats
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId") || session.user.tenantId

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId is required" }, { status: 400 })
    }

    const stats = await GatePassService.getTodayStats(tenantId)
    return NextResponse.json(stats)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
