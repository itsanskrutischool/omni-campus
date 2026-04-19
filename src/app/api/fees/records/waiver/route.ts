import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { FeeService } from "@/services/fee.service"

/**
 * Endpoint for applying scholarships or waivers to a specific fee record.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await req.json()
    const { recordId, amount, remarks } = payload

    if (!recordId || amount === undefined) {
      return NextResponse.json({ error: "Record ID and amount are required" }, { status: 400 })
    }

    if (parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "Waiver amount must be positive" }, { status: 400 })
    }

    const updatedRecord = await FeeService.applyWaiver(
      session.user.tenantId,
      recordId,
      parseFloat(amount),
      remarks
    )

    return NextResponse.json(updatedRecord)
  } catch (error: any) {
    console.error("Waiver application error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
