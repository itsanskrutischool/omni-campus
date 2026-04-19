import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { FeeService } from "@/services/fee.service"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(req.url)
    const analytics = url.searchParams.get("analytics") === "true"
    const risk = url.searchParams.get("risk") === "true"
    const studentId = url.searchParams.get("studentId")
    const studentQuery = url.searchParams.get("query")

    if (analytics) {
      const data = await FeeService.getRevenueAnalytics(session.user.tenantId)
      return NextResponse.json(data)
    }

    if (risk && studentId) {
      const data = await FeeService.getDefaulterRiskProfile(session.user.tenantId, studentId)
      if (!data) return NextResponse.json({ error: "No records found" }, { status: 404 })
      return NextResponse.json(data)
    }

    if (!studentQuery) return NextResponse.json({ error: "Student query required" }, { status: 400 })

    const data = await FeeService.getStudentFeeRecords(session.user.tenantId, studentQuery)
    if (!data) return NextResponse.json({ error: "Student not found" }, { status: 404 })

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = await req.json()
    const { recordId, amount, paymentMethod, remarks, type = "PAYMENT", payments } = payload

    // Handle Bulk Payments
    if (payments && Array.isArray(payments)) {
      const update = await FeeService.bulkRecordPayment(session.user.tenantId, {
        payments,
        paymentMethod,
        remarks
      })

      try {
        const { auditAction } = await import("@/lib/audit-middleware")
        await auditAction(req, {
          tenantId: session.user.tenantId,
          action: "UPDATE",
          module: "fees",
          entityType: "FeeRecord",
          entityId: "BULK",
          summary: `Processed bulk payment for ${payments.length} records via ${paymentMethod}`,
          newValue: { payments, paymentMethod, remarks }
        })
      } catch(err) {
        console.warn("Audit logging failed:", err)
      }

      return NextResponse.json(update)
    }

    if (parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "Invalid currency operation: Amount must be positive" }, { status: 400 })
    }
    
    let update;
    if (type === "WAIVER") {
      update = await FeeService.applyWaiver(session.user.tenantId, recordId, parseFloat(amount), remarks)
    } else {
      update = await FeeService.recordPayment(session.user.tenantId, recordId, parseFloat(amount), paymentMethod, remarks)
    }

    try {
      const { auditAction } = await import("@/lib/audit-middleware")
      await auditAction(req, {
        tenantId: session.user.tenantId,
        action: "UPDATE",
        module: "fees",
        entityType: "FeeRecord",
        entityId: recordId,
        summary: type === "WAIVER" 
          ? `Applied waiver of ${amount} for record ${recordId}`
          : `Processed payment of ${amount} via ${paymentMethod} for record ${recordId}`,
        newValue: type === "WAIVER"
          ? { waiver: amount, remarks }
          : { amountPaid: amount, paymentMethod, remarks }
      })
    } catch(err) {
      console.warn("Audit logging failed:", err)
    }

    return NextResponse.json(update)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
