import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { FeeService } from "@/services/fee.service"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = await req.json()
    const { classId, feeStructureId, dueDate } = payload
    
    if (!classId || !feeStructureId || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const records = await FeeService.generateStudentFeeRecords(
      session.user.tenantId, 
      classId, 
      feeStructureId, 
      dueDate
    )
    
    return NextResponse.json({ success: true, generated: records.count })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
