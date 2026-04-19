import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"
import twilio from "twilio"

export class SMSService {
  private static getClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      return null
    }

    return twilio(accountSid, authToken)
  }

  // ─── Send Single SMS ─────────────────────────────────────

  static async sendSMS(tenantId: string, userId: string | undefined, data: {
    to: string
    body: string
    template?: string
    variables?: Record<string, string>
  }) {
    const client = this.getClient()
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!client || !fromNumber) {
      console.log(`[SMS - LOG ONLY] To: ${data.to}, Body: ${data.body}`)
      await AuditService.log({
        tenantId,
        userId,
        action: "CREATE",
        module: "communication",
        entityType: "SMS",
        entityId: data.to,
        summary: `SMS sent to ${data.to} (log mode - no Twilio config)`,
      })
      return { success: true, messageId: `sms_${Date.now()}`, mode: "log" }
    }

    try {
      const message = await client.messages.create({
        body: data.body,
        from: fromNumber,
        to: data.to,
      })

      await AuditService.log({
        tenantId,
        userId,
        action: "CREATE",
        module: "communication",
        entityType: "SMS",
        entityId: message.sid,
        summary: `SMS sent to ${data.to} via Twilio`,
      })

      return { success: true, messageId: message.sid, mode: "twilio" }
    } catch (error: any) {
      console.error("[SMS Twilio Error]", error)
      throw new Error(`SMS failed: ${error.message}`)
    }
  }

  // ─── Send Bulk SMS ───────────────────────────────────────

  static async sendBulkSMS(tenantId: string, userId: string | undefined, messages: Array<{
    to: string
    body: string
  }>) {
    const results = await Promise.all(
      messages.map((msg) => this.sendSMS(tenantId, userId, msg))
    )

    return {
      success: true,
      sent: results.length,
      failed: 0,
    }
  }

  // ─── Use Template ────────────────────────────────────────

  static async useTemplate(
    tenantId: string,
    userId: string | undefined,
    templateId: string,
    phone: string,
    variables?: Record<string, string>
  ) {
    // TODO: Implement template system
    const body = `Template ${templateId} sent to ${phone}`
    return this.sendSMS(tenantId, userId, { to: phone, body })
  }

  // ─── Fee Reminders ───────────────────────────────────────

  static async sendFeeReminders(tenantId: string, userId: string | undefined) {
    const today = new Date()
    const threeDaysFromNow = new Date(today)
    threeDaysFromNow.setDate(today.getDate() + 3)

    // Get fee structures for this tenant
    const feeStructures = await prisma.feeStructure.findMany({
      where: { tenantId },
    })

    // Get fee records due in 3 days
    const feeRecords = await prisma.feeRecord.findMany({
      where: {
        feeStructureId: { in: feeStructures.map((fs) => fs.id) },
        dueDate: { lte: threeDaysFromNow, gte: today },
        status: { in: ["PENDING", "PARTIAL"] },
      },
      include: {
        student: true,
        feeStructure: true,
      },
    })

    let remindersSent = 0

    for (const feeRecord of feeRecords) {
      const parentPhone = feeRecord.student.guardianPhone || feeRecord.student.phone
      const studentName = feeRecord.student.name
      const amount = feeRecord.amountDue - feeRecord.amountPaid
      const dueDate = new Date(feeRecord.dueDate).toLocaleDateString()

      if (parentPhone && amount > 0) {
        await this.sendSMS(tenantId, userId, {
          to: parentPhone,
          body: `Fee reminder: ${amount} due on ${dueDate} for ${studentName}`,
        })
        remindersSent++
      }
    }

    return { success: true, remindersSent }
  }

  // ─── Attendance Alerts ────────────────────────────────────

  static async sendAttendanceAlerts(tenantId: string, userId: string | undefined, date: Date) {
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        date,
        status: "ABSENT",
        student: {
          tenantId,
        },
      },
      include: {
        student: true,
      },
    })

    let alertsSent = 0

    for (const record of attendanceRecords) {
      const parentPhone = record.student.guardianPhone || record.student.phone
      const studentName = record.student.name
      const dateStr = new Date(date).toLocaleDateString()

      if (parentPhone) {
        await this.sendSMS(tenantId, userId, {
          to: parentPhone,
          body: `Attendance alert: ${studentName} was absent on ${dateStr}`,
        })
        alertsSent++
      }
    }

    return { success: true, alertsSent }
  }

  // ─── SMS Analytics ───────────────────────────────────────

  static async getSMSAnalytics(tenantId: string, fromDate?: Date, toDate?: Date) {
    // TODO: Implement SMS analytics when using actual SMS provider
    return {
      sent: 0,
      delivered: 0,
      failed: 0,
      cost: 0,
    }
  }

  // ─── Get Templates ───────────────────────────────────────

  static getTemplates() {
    // TODO: Implement template system
    return []
  }
}
