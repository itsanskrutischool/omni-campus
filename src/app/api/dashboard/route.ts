import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { DashboardService } from "@/services/dashboard.service"

/**
 * GET /api/dashboard — Full dashboard aggregation
 */
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const data = await DashboardService.getDashboardData(session.user.tenantId)
        return NextResponse.json(data)
    } catch (error: any) {
        console.error("[API_DASHBOARD] Error:", error)
        return NextResponse.json({ error: error.message || "Dashboard fetch failed" }, { status: 500 })
    }
}
