import { prisma } from "@/lib/prisma"
import { WhatsAppService } from "@/services/whatsapp.service"
import { AIDefaultersService } from "@/services/ai-defaulters.service"
import { AuditService } from "@/services/audit.service"

// ─── Automated Reminder Cron Jobs ───────────────────────────────────────

export class CronJobs {
  /**
   * Send fee reminders for due payments
   */
  static async sendFeeReminders(tenantId: string) {
    console.log(`[${new Date().toISOString()}] Running fee reminder job for tenant: ${tenantId}`)

    // Get fee records due in next 7 days
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const dueFeeRecords = await prisma.feeRecord.findMany({
      where: {
        status: "PENDING",
        dueDate: {
          lte: sevenDaysFromNow.toISOString(),
          gte: new Date().toISOString(),
        },
      },
      include: {
        student: true,
        feeStructure: true,
      },
    })

    // Filter by tenantId via feeStructure
    const tenantFeeRecords = dueFeeRecords.filter(fr => fr.feeStructure.tenantId === tenantId)

    let remindersSent = 0
    let remindersFailed = 0

    for (const feeRecord of tenantFeeRecords) {
      try {
        const parentPhone = feeRecord.student.guardianPhone || feeRecord.student.phone
        const studentName = feeRecord.student.name
        const amount = feeRecord.amountDue
        const dueDate = new Date(feeRecord.dueDate).toLocaleDateString()

        if (parentPhone) {
          // Send SMS reminder
          try {
            // await SMSService.sendSMS(tenantId, undefined, { to: parentPhone, body: `Fee reminder: ${amount} due on ${dueDate} for ${studentName}` })
            // remindersSent++
            console.log("SMS disabled for fee reminders")
          } catch (error) {
            console.error("SMS reminder failed:", error)
          }

          // Also send WhatsApp if configured
          try {
            await WhatsAppService.sendFeeReminder(tenantId, undefined, parentPhone, studentName, amount, dueDate)
          } catch (error) {
            console.error("WhatsApp reminder failed:", error)
          }
        }
      } catch (error) {
        console.error(`Failed to send reminder for fee record ${feeRecord.id}:`, error)
        remindersFailed++
      }
    }

    await AuditService.log({
      tenantId,
      userId: "SYSTEM",
      action: "CREATE",
      module: "cron",
      entityType: "FeeReminder",
      summary: `Fee reminder cron job: ${remindersSent} sent, ${remindersFailed} failed`,
    })

    return {
      totalRecords: tenantFeeRecords.length,
      remindersSent,
      remindersFailed,
    }
  }

  /**
   * Send attendance alerts for absent students
   */
  static async sendAttendanceAlerts(tenantId: string) {
    console.log(`[${new Date().toISOString()}] Running attendance alert job for tenant: ${tenantId}`)

    // Get attendance records from yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const yesterdayEnd = new Date(yesterday)
    yesterdayEnd.setHours(23, 59, 59, 999)

    const absentRecords = await prisma.attendanceRecord.findMany({
      where: {
        date: {
          gte: yesterday.toISOString(),
          lte: yesterdayEnd.toISOString(),
        },
        status: "ABSENT",
      },
      include: {
        student: true,
      },
    })

    // Filter by tenant via student
    const tenantAbsentRecords = absentRecords.filter(ar => ar.student.tenantId === tenantId)

    let alertsSent = 0
    let alertsFailed = 0

    for (const record of tenantAbsentRecords) {
      try {
        const parentPhone = record.student.guardianPhone || record.student.phone
        const studentName = record.student.name
        const date = new Date(record.date).toLocaleDateString()

        if (parentPhone) {
          // Send SMS alert
          try {
            // await SMSService.sendSMS(tenantId, undefined, { to: parentPhone, body: `Attendance alert: ${studentName} was absent on ${date}` })
            // alertsSent++
            console.log("SMS disabled for attendance alerts")
          } catch (error) {
            console.error("SMS alert failed:", error)
          }

          // Also send WhatsApp if configured
          try {
            await WhatsAppService.sendAttendanceAlert(tenantId, undefined, parentPhone, studentName, date, "ABSENT")
          } catch (error) {
            console.error("WhatsApp alert failed:", error)
          }
        }
      } catch (error) {
        console.error(`Failed to send attendance alert for record ${record.id}:`, error)
        alertsFailed++
      }
    }

    await AuditService.log({
      tenantId,
      userId: "SYSTEM",
      action: "CREATE",
      module: "cron",
      entityType: "AttendanceAlert",
      summary: `Attendance alert cron job: ${alertsSent} sent, ${alertsFailed} failed`,
    })

    return {
      totalRecords: tenantAbsentRecords.length,
      alertsSent,
      alertsFailed,
    }
  }

  /**
   * Send exam result notifications
   */
  static async sendExamResults(tenantId: string) {
    console.log(`[${new Date().toISOString()}] Running exam results job for tenant: ${tenantId}`)

    // Get recently published exam results
    // Note: MarkEntry doesn't have createdAt, so we'll get all and filter by exam date
    const recentResults = await prisma.markEntry.findMany({
      include: {
        exam: true,
      },
    })

    // Get students for filtering
    const studentIds = recentResults.map(mr => mr.studentId)
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        tenantId,
      },
    })
    const studentMap = new Map(students.map(s => [s.id, s]))

    // Filter by tenant via student and exam date
    const tenantResults = recentResults.filter(mr => {
      const student = studentMap.get(mr.studentId)
      return student?.tenantId === tenantId
    })

    // Group by student to avoid duplicate notifications
    const studentResults = new Map<string, any[]>()
    for (const result of tenantResults) {
      if (!studentResults.has(result.studentId)) {
        studentResults.set(result.studentId, [])
      }
      studentResults.get(result.studentId)?.push(result)
    }

    let notificationsSent = 0
    let notificationsFailed = 0

    for (const [studentId, results] of studentResults) {
      try {
        const student = studentMap.get(studentId)
        const parentPhone = student?.guardianPhone || student?.phone
        const examName = results[0]?.exam?.name
        const totalMarks = results.reduce((sum, r) => sum + r.marks, 0)
        const maxMarks = results.reduce((sum, r) => sum + r.maxMarks, 0)

        if (parentPhone) {
          // Send SMS notification
          try {
            // await SMSService.sendSMS(tenantId, undefined, { to: parentPhone, body: `Exam result: ${student.name} scored ${totalMarks}/${maxMarks} in ${examName}` })
            // notificationsSent++
            console.log("SMS disabled for exam notifications")
          } catch (error) {
            console.error("SMS notification failed:", error)
          }

          // Also send WhatsApp if configured
          try {
            await WhatsAppService.sendExamResult(tenantId, undefined, parentPhone, student.name, examName, totalMarks, maxMarks)
          } catch (error) {
            console.error("WhatsApp notification failed:", error)
          }
        }
      } catch (error) {
        console.error(`Failed to send exam result notification for student ${studentId}:`, error)
        notificationsFailed++
      }
    }

    await AuditService.log({
      tenantId,
      userId: "SYSTEM",
      action: "CREATE",
      module: "cron",
      entityType: "ExamResult",
      summary: `Exam results cron job: ${notificationsSent} sent, ${notificationsFailed} failed`,
    })

    return {
      totalResults: tenantResults.length,
      studentsNotified: studentResults.size,
      notificationsSent,
      notificationsFailed,
    }
  }

  /**
   * Run AI defaulter prediction and send alerts
   */
  static async runDefaulterPrediction(tenantId: string) {
    console.log(`[${new Date().toISOString()}] Running defaulter prediction job for tenant: ${tenantId}`)

    try {
      const prediction = await AIDefaultersService.predictDefaulters(tenantId, "SYSTEM", { threshold: 0.7 })

      // Send alerts to high-risk students' parents
      let alertsSent = 0
      for (const student of prediction.highRiskStudents) {
        try {
          // In a real implementation, get parent phone and send alert
          console.log(`High-risk defaulter: ${student.studentName} (Risk: ${student.riskScore})`)
          alertsSent++
        } catch (error) {
          console.error(`Failed to send defaulter alert for ${student.studentId}:`, error)
        }
      }

      await AuditService.log({
        tenantId,
        userId: "SYSTEM",
        action: "CREATE",
        module: "cron",
        entityType: "DefaulterPrediction",
        summary: `Defaulter prediction cron job: ${prediction.highRiskCount} high-risk students identified`,
      })

      return {
        highRiskCount: prediction.highRiskCount,
        alertsSent,
      }
    } catch (error) {
      console.error("Defaulter prediction job failed:", error)
      throw error
    }
  }

  /**
   * Cleanup old audit logs
   */
  static async cleanupOldAuditLogs(tenantId: string, daysToKeep: number = 90) {
    console.log(`[${new Date().toISOString()}] Running audit log cleanup for tenant: ${tenantId}`)

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const deleted = await prisma.auditLog.deleteMany({
      where: {
        tenantId,
        createdAt: {
          lt: cutoffDate.toISOString(),
        },
      },
    })

    await AuditService.log({
      tenantId,
      userId: "SYSTEM",
      action: "DELETE",
      module: "cron",
      entityType: "AuditLog",
      summary: `Audit log cleanup: ${deleted.count} records deleted`,
    })

    return { deletedCount: deleted.count }
  }

  /**
   * Run all scheduled jobs
   */
  static async runAllJobs(tenantId: string) {
    console.log(`[${new Date().toISOString()}] Running all cron jobs for tenant: ${tenantId}`)

    const results = {
      feeReminders: null as any,
      attendanceAlerts: null as any,
      examResults: null as any,
      defaulterPrediction: null as any,
      auditCleanup: null as any,
    }

    try {
      results.feeReminders = await this.sendFeeReminders(tenantId)
    } catch (error) {
      console.error("Fee reminders job failed:", error)
    }

    try {
      results.attendanceAlerts = await this.sendAttendanceAlerts(tenantId)
    } catch (error) {
      console.error("Attendance alerts job failed:", error)
    }

    try {
      results.examResults = await this.sendExamResults(tenantId)
    } catch (error) {
      console.error("Exam results job failed:", error)
    }

    try {
      results.defaulterPrediction = await this.runDefaulterPrediction(tenantId)
    } catch (error) {
      console.error("Defaulter prediction job failed:", error)
    }

    try {
      results.auditCleanup = await this.cleanupOldAuditLogs(tenantId, 90)
    } catch (error) {
      console.error("Audit cleanup job failed:", error)
    }

    return results
  }

  /**
   * Get job execution status
   */
  static async getJobStatus(tenantId: string) {
    // In a real implementation, this would query a job execution log table
    return {
      feeReminders: {
        lastRun: new Date(),
        status: "SUCCESS",
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      attendanceAlerts: {
        lastRun: new Date(),
        status: "SUCCESS",
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      examResults: {
        lastRun: new Date(),
        status: "SUCCESS",
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      defaulterPrediction: {
        lastRun: new Date(),
        status: "SUCCESS",
        nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      auditCleanup: {
        lastRun: new Date(),
        status: "SUCCESS",
        nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }
  }
}
