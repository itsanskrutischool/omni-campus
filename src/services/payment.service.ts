import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

export interface PaymentOrder {
  amount: number // in paise
  currency: string
  receipt: string
  notes?: Record<string, string>
}

export interface PaymentVerification {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export class PaymentService {
  // ─── Create Payment Order ───────────────────────────────────

  static async createOrder(
    tenantId: string,
    studentId: string,
    feeRecordId: string,
    amount: number // in rupees
  ) {
    try {
      // Check if Razorpay is configured
      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        console.log("[PAYMENT-SERVICE] DEMO MODE - Razorpay not configured")
        
        // Create a demo order
        const demoOrder = {
          id: `demo_order_${Date.now()}`,
          amount: amount * 100, // paise
          currency: "INR",
          receipt: `receipt_${feeRecordId}`,
          status: "created",
        }

        return {
          order: demoOrder,
          key: "demo_key",
          demo: true,
        }
      }

      const Razorpay = require("razorpay")
      const razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      })

      const order = await razorpay.orders.create({
        amount: amount * 100, // Razorpay expects paise
        currency: "INR",
        receipt: `receipt_${feeRecordId}`,
        notes: {
          tenantId,
          studentId,
          feeRecordId,
        },
      })

      // Store order in database
      await prisma.auditLog.create({
        data: {
          tenantId,
          action: "CREATE",
          module: "fees",
          entityType: "PaymentOrder",
          entityId: order.id,
          summary: `Payment order created for fee ${feeRecordId}`,
          details: JSON.stringify({
            amount,
            orderId: order.id,
          }),
        },
      })

      return {
        order,
        key: RAZORPAY_KEY_ID,
      }
    } catch (error) {
      console.error("[PAYMENT-SERVICE] Error creating order:", error)
      throw new Error(`Payment order creation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // ─── Verify Payment ───────────────────────────────────

  static async verifyPayment(
    tenantId: string,
    userId: string | undefined,
    verification: PaymentVerification,
    feeRecordId: string
  ) {
    try {
      // In demo mode, auto-verify
      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        console.log("[PAYMENT-SERVICE] DEMO MODE - Auto verifying payment")

        // Update fee record
        const feeRecord = await prisma.feeRecord.findUnique({
          where: { id: feeRecordId },
        })

        if (!feeRecord) throw new Error("Fee record not found")

        const amountPaid = feeRecord.amountDue - feeRecord.amountPaid
        
        await prisma.feeRecord.update({
          where: { id: feeRecordId },
          data: {
            amountPaid: feeRecord.amountDue,
            status: "PAID",
            paidDate: new Date(),
            paymentMethod: "ONLINE",
            receiptNumber: `DEMO_${Date.now()}`,
          },
        })

        await AuditService.log({
          tenantId,
          userId,
          action: "UPDATE",
          module: "fees",
          entityType: "FeeRecord",
          entityId: feeRecordId,
          summary: `Fee payment completed (DEMO MODE)`,
          details: JSON.stringify({
            amount: amountPaid,
            paymentId: verification.razorpay_payment_id,
            method: "ONLINE",
          }),
        })

        return {
          success: true,
          demo: true,
          feeRecordId,
          amount: amountPaid,
        }
      }

      // Real Razorpay verification
      const crypto = require("crypto")
      const body = verification.razorpay_order_id + "|" + verification.razorpay_payment_id
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex")

      const isAuthentic = expectedSignature === verification.razorpay_signature

      if (!isAuthentic) {
        throw new Error("Payment verification failed - Invalid signature")
      }

      // Get payment details from Razorpay
      const Razorpay = require("razorpay")
      const razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      })

      const payment = await razorpay.payments.fetch(verification.razorpay_payment_id)

      if (payment.status !== "captured") {
        throw new Error(`Payment not captured. Status: ${payment.status}`)
      }

      // Update fee record
      const feeRecord = await prisma.feeRecord.update({
        where: { id: feeRecordId },
        data: {
          amountPaid: { increment: payment.amount / 100 }, // Convert paise to rupees
          status: "PAID",
          paidDate: new Date(),
          paymentMethod: payment.method?.toUpperCase() || "ONLINE",
          receiptNumber: payment.id,
        },
      })

      await AuditService.log({
        tenantId,
        userId,
        action: "UPDATE",
        module: "fees",
        entityType: "FeeRecord",
        entityId: feeRecordId,
        summary: `Fee payment verified and recorded`,
        details: JSON.stringify({
          amount: payment.amount / 100,
          paymentId: payment.id,
          method: payment.method,
        }),
      })

      return {
        success: true,
        feeRecord,
        payment: {
          id: payment.id,
          amount: payment.amount / 100,
          method: payment.method,
        },
      }
    } catch (error) {
      console.error("[PAYMENT-SERVICE] Verification error:", error)
      throw error
    }
  }

  // ─── Get Payment History ───────────────────────────────────

  static async getPaymentHistory(tenantId: string, studentId?: string) {
    const where: Record<string, unknown> = { tenantId }
    if (studentId) where.studentId = studentId

    // Get from audit logs for now
    // In production, should have a dedicated Payment table
    const payments = await prisma.auditLog.findMany({
      where: {
        tenantId,
        module: "fees",
        action: "UPDATE",
        entityType: "FeeRecord",
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return payments.filter((p) => {
      try {
        const details = JSON.parse(p.details || "{}")
        return details.paymentId || details.method === "ONLINE"
      } catch {
        return false
      }
    })
  }

  // ─── Webhook Handler ───────────────────────────────────

  static async handleWebhook(payload: Record<string, unknown>, signature: string) {
    try {
      if (!RAZORPAY_KEY_SECRET) {
        console.log("[PAYMENT-SERVICE] DEMO MODE - Webhook ignored")
        return { success: true, demo: true }
      }

      // Verify webhook signature
      const crypto = require("crypto")
      const body = JSON.stringify(payload)
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex")

      if (expectedSignature !== signature) {
        throw new Error("Invalid webhook signature")
      }

      // Handle different events
      const event = payload.event as string

      switch (event) {
        case "payment.captured":
          // Payment already handled in verifyPayment
          break
        case "payment.failed":
          // Log failed payment
          console.log("[PAYMENT-SERVICE] Payment failed:", payload)
          break
        default:
          console.log(`[PAYMENT-SERVICE] Unhandled webhook event: ${event}`)
      }

      return { success: true }
    } catch (error) {
      console.error("[PAYMENT-SERVICE] Webhook error:", error)
      throw error
    }
  }

  // ─── Refund Payment ───────────────────────────────────

  static async refundPayment(
    tenantId: string,
    userId: string | undefined,
    paymentId: string,
    amount?: number,
    reason?: string
  ) {
    try {
      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        console.log("[PAYMENT-SERVICE] DEMO MODE - Refund simulated")
        return {
          success: true,
          demo: true,
          refundId: `demo_refund_${Date.now()}`,
        }
      }

      const Razorpay = require("razorpay")
      const razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      })

      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount ? amount * 100 : undefined, // Full refund if not specified
        notes: {
          reason: reason || "Customer request",
          refundedBy: userId || "system",
        },
      })

      await AuditService.log({
        tenantId,
        userId,
        action: "CREATE",
        module: "fees",
        entityType: "Refund",
        entityId: refund.id,
        summary: `Refund processed for payment ${paymentId}`,
        details: JSON.stringify({
          amount: refund.amount / 100,
          reason,
        }),
      })

      return {
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
        },
      }
    } catch (error) {
      console.error("[PAYMENT-SERVICE] Refund error:", error)
      throw error
    }
  }

  // ─── Get Config ───────────────────────────────────

  static getConfig() {
    return {
      enabled: !!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),
      keyId: RAZORPAY_KEY_ID ? `${RAZORPAY_KEY_ID.substring(0, 8)}...` : null,
      demo: !RAZORPAY_KEY_ID,
    }
  }
}
