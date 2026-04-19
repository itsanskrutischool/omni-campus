import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

// SMS Configuration
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER

export interface SMSMessage {
  to: string
  body: string
  template?: string
  variables?: Record<string, string>
}

export interface SMSTemplate {
  id: string
  name: string
  body: string
  category: string
}

export class SMSService {
  // ─── Send Single SMS ───────────────────────────────────

  static async sendSMS(tenantId: string, userId: string | undefined, message: SMSMessage) {
    try {
      // In development/demo mode, log only
      if (!TWILIO_SID || !TWILIO_TOKEN) {
        console.log(`[SMS-SERVICE] DEMO MODE - Would send to ${message.to}: ${message.body}`)
        
        await AuditService.log({
          tenantId,
          userId,
          action: "CREATE",
          module: "communications",
          entityType: "SMS",
          entityId: "demo",
          summary: `SMS sent to ${message.to} (DEMO MODE)`,
        })

        return { success: true, sid: "demo_" + Date.now(), demo: true }
      }

      // Real Twilio integration
      const twilio = require("twilio")
      const client = twilio(TWILIO_SID, TWILIO_TOKEN)

      const result = await client.messages.create({
        body: message.body,
        from: TWILIO_PHONE,
        to: message.to.startsWith("+") ? message.to : `+91${message.to}`,
      })

      await AuditService.log({
        tenantId,
        userId,
        action: "CREATE",
        module: "communications",
        entityType: "SMS",
        entityId: result.sid,
        summary: `SMS sent to ${message.to}`,
      })

      return { success: true, sid: result.sid }
    } catch (error) {
      console.error("[SMS-SERVICE] Error:", error)
      throw new Error(`SMS send failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // ─── Send Bulk SMS ───────────────────────────────────

  static async sendBulkSMS(
    tenantId: string,
    userId: string | undefined,
    messages: SMSMessage[]
  ) {
    const results = await Promise.allSettled(
      messages.map((msg) => this.sendSMS(tenantId, userId, msg))
    )

    const succeeded = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    return {
      total: messages.length,
      succeeded,
      failed,
      results: results.map((r, i) => ({
        to: messages[i].to,
        status: r.status,
        result: r.status === "fulfilled" ? r.value : r.reason,
      })),
    }
  }

  // ─── Templates ───────────────────────────────────

  static getTemplates(): SMSTemplate[] {
    return [
      {
        id: "fee_reminder",
        name: "Fee Payment Reminder",
        body: "Dear Parent, Fee payment of Rs.{amount} for {studentName} is due on {dueDate}. Please pay to avoid late charges. -{schoolName}",
        category: "fees",
      },
      {
        id: "attendance_alert",
        name: "Absence Alert",
        body: "Dear Parent, {studentName} was absent on {date}. Please send a leave note. -{schoolName}",
        category: "attendance",
      },
      {
        id: "homework_alert",
        name: "Homework Due",
        body: "Dear Parent, Homework for {subject} is due tomorrow for {studentName}. -{schoolName}",
        category: "academics",
      },
      {
        id: "exam_schedule",
        name: "Exam Schedule",
        body: "Dear Parent, {studentName}'s {examName} starts on {startDate}. Timetable available on app. -{schoolName}",
        category: "academics",
      },
      {
        id: "result_declared",
        name: "Result Declared",
        body: "Dear Parent, {examName} results are now available. Check {studentName}'s performance on the app. -{schoolName}",
        category: "academics",
      },
      {
        id: "emergency_alert",
        name: "Emergency Alert",
        body: "URGENT: {message} -{schoolName}",
        category: "emergency",
      },
      {
        id: "event_reminder",
        name: "Event Reminder",
        body: "Dear Parent, {eventName} is scheduled on {date} at {time}. {studentName} is expected to attend. -{schoolName}",
        category: "events",
      },
      {
        id: "gatepass_otp",
        name: "Gate Pass OTP",
        body: "Your Gate Pass OTP for {studentName} is {otp}. Valid for 60 minutes. -{schoolName}",
        category: "security",
      },
    ]
  }

  static async useTemplate(
    tenantId: string,
    userId: string | undefined,
    templateId: string,
    phone: string,
    variables: Record<string, string>
  ) {
    const templates = this.getTemplates()
    const template = templates.find((t) => t.id === templateId)

    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    let body = template.body
    for (const [key, value] of Object.entries(variables)) {
      body = body.replace(new RegExp(`{${key}}`, "g"), value)
    }

    return this.sendSMS(tenantId, userId, { to: phone, body })
  }

  // ─── Fee Reminders ───────────────────────────────────

  static async sendFeeReminders(tenantId: string, userId: string | undefined) {
    const today = new Date()
    const threeDaysFromNow = new Date(today)
    threeDaysFromNow.setDate(today.getDate() + 3)

    // Get students with fees due in 3 days
    const dueFees = await prisma.feeRecord.findMany({
      where: {
        tenantId,
        dueDate: { lte: threeDaysFromNow, gte: today },
        status: { in: ["PENDING", "PARTIAL"] },
        balance: { gt: 0 },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            fatherPhone: true,
            motherPhone: true,
          },
        },
        structure: {
          select: { name: true },
        },
      },
    })

    const messages: SMSMessage[] = []
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    })

    for (const fee of dueFees) {
      const phone = fee.student.fatherPhone || fee.student.motherPhone
      if (!phone) continue

      const template = this.getTemplates().find((t) => t.id === "fee_reminder")
      if (!template) continue

      let body = template.body
        .replace("{amount}", fee.balance.toString())
        .replace("{studentName}", fee.student.name)
        .replace("{dueDate}", fee.dueDate.toLocaleDateString("en-IN"))
        .replace("{schoolName}", tenant?.name || "School")

      messages.push({ to: phone, body })
    }

    return this.sendBulkSMS(tenantId, userId, messages)
  }

  // ─── Attendance Alerts ───────────────────────────────────

  static async sendAttendanceAlerts(tenantId: string, userId: string | undefined, date: Date) {
    const absentStudents = await prisma.attendance.findMany({
      where: {
        tenantId,
        date: new Date(date.setHours(0, 0, 0, 0)),
        status: "ABSENT",
      },
      include: {
        student: {
          select: {
            name: true,
            fatherPhone: true,
            motherPhone: true,
          },
        },
      },
    })

    const messages: SMSMessage[] = []
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    })

    for (const record of absentStudents) {
      const phone = record.student.fatherPhone || record.student.motherPhone
      if (!phone) continue

      const template = this.getTemplates().find((t) => t.id === "attendance_alert")
      if (!template) continue

      let body = template.body
        .replace("{studentName}", record.student.name)
        .replace("{date}", date.toLocaleDateString("en-IN"))
        .replace("{schoolName}", tenant?.name || "School")

      messages.push({ to: phone, body })
    }

    return this.sendBulkSMS(tenantId, userId, messages)
  }

  // ─── Analytics ───────────────────────────────────

  static async getSMSAnalytics(tenantId: string, fromDate?: Date, toDate?: Date) {
    // This would query an SMS log table in production
    // For now, return audit logs
    const where: Record<string, unknown> = {
      tenantId,
      module: "communications",
      action: "CREATE",
    }

    if (fromDate || toDate) {
      where.createdAt = {}
      if (fromDate) (where.createdAt as Record<string, Date>).gte = fromDate
      if (toDate) (where.createdAt as Record<string, Date>).lte = toDate
    }

    const count = await prisma.auditLog.count({ where })

    return {
      totalSent: count,
      period: { from: fromDate, to: toDate },
      // In production, would include:
      // - Delivery rates
      // - Template usage
      // - Cost per SMS
      // - Failed messages
    }
  }
}
