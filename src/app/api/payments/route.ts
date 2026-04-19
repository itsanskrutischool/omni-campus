import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FeeService } from "@/services/fee.service"
import { AuditService } from "@/services/audit.service"

// Razorpay integration (mock - replace with actual Razorpay SDK)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_mock"
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "mock_secret"

/**
 * POST /api/payments/create-order
 * Creates a Razorpay payment order for a fee record
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tenant = await prisma.tenant.findUnique({ where: { slug: session.user.tenantSlug } })
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

    const body = await request.json()
    const { action, recordId, amount, studentId } = body

    if (action === "create-order") {
      // In production: Use Razorpay SDK to create order
      // const Razorpay = require('razorpay')
      // const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
      // const order = await razorpay.orders.create({ amount: amount * 100, currency: "INR", receipt: recordId })

      // Mock order response
      const order = {
        id: `order_${Date.now()}`,
        amount: amount * 100, // In paise
        currency: "INR",
        receipt: recordId,
        status: "created",
        key: RAZORPAY_KEY_ID,
      }

      return NextResponse.json(order)
    }

    if (action === "verify-payment") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

      // In production: Verify signature using crypto
      // const expectedSignature = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
      //   .update(razorpay_order_id + '|' + razorpay_payment_id)
      //   .digest('hex')
      // if (expectedSignature !== razorpay_signature) throw new Error("Invalid signature")

      // Record the payment in the fee ledger
      if (recordId) {
        await FeeService.recordPayment(tenant.id, recordId, amount, "ONLINE", `Online payment via Razorpay. Order: ${razorpay_order_id}`)
      }

      await AuditService.log({
        tenantId: tenant.id,
        userId: session.user.id,
        action: "UPDATE",
        module: "fees",
        entityType: "FeeRecord",
        entityId: recordId,
        summary: `Online payment of ₹${amount} verified via Razorpay. Payment ID: ${razorpay_payment_id}`,
      })

      return NextResponse.json({ success: true, paymentId: razorpay_payment_id })
    }

    if (action === "refund") {
      // In production: Use Razorpay SDK to initiate refund
      return NextResponse.json({ success: true, message: "Refund initiated" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Payment Error:", error)
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}

/**
 * GET /api/payments/config
 * Returns Razorpay key for frontend SDK initialization
 */
export async function GET() {
  return NextResponse.json({ key: RAZORPAY_KEY_ID })
}
