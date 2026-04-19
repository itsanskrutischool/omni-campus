import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { HRService } from "@/services/hr.service"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role === 'ADMIN') {
      const pendingLeaves = await HRService.getPendingLeavesQueue(session.user.tenantId)
      return NextResponse.json(pendingLeaves)
    } else {
      const myLeaves = await HRService.getStaffLeaves(session.user.tenantId, session.user.email)
      return NextResponse.json(myLeaves)
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Only staff should be able to apply manually
    const payload = await req.json()
    const leave = await HRService.applyLeave(session.user.tenantId, session.user.email, payload)
    
    return NextResponse.json(leave)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
