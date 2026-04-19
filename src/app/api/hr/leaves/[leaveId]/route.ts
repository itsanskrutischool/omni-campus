import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { HRService } from "@/services/hr.service"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ leaveId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Only admin can approve/deny 
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 })
    }

    const { leaveId } = await params
    const { status } = await req.json()
    
    const update = await HRService.updateLeaveStatus(session.user.tenantId, leaveId, status)
    return NextResponse.json(update)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
