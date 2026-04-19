import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

export class FeeService {
  static async getFeeStructures(tenantId: string) {
    return await prisma.feeStructure.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    })
  }

  static async createFeeStructure(tenantId: string, academicYearId: string, payload: {
    name: string
    amount: number
    frequency: string
    classId?: string
    category?: string
  }) {
    return await prisma.feeStructure.create({
      data: {
        tenantId,
        academicYearId,
        name: payload.name,
        amount: payload.amount,
        frequency: payload.frequency,
        classId: payload.classId || null,
        category: payload.category || null
      }
    })
  }

  static async updateFeeStructure(tenantId: string, id: string, payload: Record<string, unknown>) {
    return await prisma.feeStructure.update({
      where: { id, tenantId },
      data: payload
    })
  }

  static async deleteFeeStructure(tenantId: string, id: string) {
    return await prisma.feeStructure.delete({
      where: { id, tenantId }
    })
  }

  /**
   * Bulk deploy a fee structure to all students in a classroom.
   */
  static async generateStudentFeeRecords(
    tenantId: string, 
    classRoomId: string, 
    feeStructureId: string, 
    dueDate: Date
  ) {
    const students = await prisma.student.findMany({
      where: { tenantId, classRoomId, status: "ACTIVE" },
      select: { id: true }
    })

    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: feeStructureId, tenantId }
    })

    if (!feeStructure) throw new Error("Fee Structure not found")

    // 1. Check for existing records to prevent double-deployment
    const existingCount = await prisma.feeRecord.count({
      where: {
        studentId: { in: students.map(s => s.id) },
        feeStructureId: feeStructure.id
      }
    })

    if (existingCount > 0) {
      throw new Error(`Conflict: ${existingCount} students already have this fee structure assigned. Operation aborted to prevent double-billing.`)
    }

    // 2. Optimized Bulk Deployment
    const data = students.map(student => ({
      studentId: student.id,
      feeStructureId: feeStructure.id,
      amountDue: feeStructure.amount,
      amountPaid: 0,
      dueDate: new Date(dueDate),
      status: "PENDING"
    }))

    return await prisma.feeRecord.createMany({
      data
    })
  }

  /**
   * Get pending or all ledger items for a student
   */
  static async getStudentFeeRecords(tenantId: string, studentQuery: string) {
    // Attempt lookup by admission number or ID
    const student = await prisma.student.findFirst({
      where: {
        tenantId,
        OR: [
          { admissionNumber: studentQuery },
          { id: studentQuery }
        ]
      }
    })

    if (!student) return null

    const records = await prisma.feeRecord.findMany({
      where: { studentId: student.id },
      include: { 
        feeStructure: true,
        transactions: {
          orderBy: { transactionDate: 'desc' }
        }
      },
      orderBy: { dueDate: 'asc' }
    })

    return { student, records }
  }

  /**
   * Revenue analytics for the finance dashboard.
   */
  static async getRevenueAnalytics(tenantId: string) {
    const students = await prisma.student.findMany({
      where: { tenantId, status: "ACTIVE" },
      select: { id: true }
    })
    const studentIds = students.map(s => s.id)

    const records = await prisma.feeRecord.findMany({
      where: { studentId: { in: studentIds } },
      include: { feeStructure: true }
    })

    const totalExpected = records.reduce((a, r) => a + r.amountDue, 0)
    const totalCollected = records.reduce((a, r) => a + r.amountPaid, 0)
    const totalPending = totalExpected - totalCollected
    const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 10000) / 100 : 0

    const paid = records.filter(r => r.status === "PAID").length
    const partial = records.filter(r => r.status === "PARTIAL").length
    const pending = records.filter(r => r.status === "PENDING").length
    const overdue = records.filter(r => r.status === "PENDING" && r.dueDate < new Date()).length

    // Monthly trend (last 6 months)
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      const monthCollected = records
        .filter(r => r.paidDate && r.paidDate >= monthStart && r.paidDate <= monthEnd)
        .reduce((a, r) => a + r.amountPaid, 0)
      monthlyTrend.push({
        month: monthStart.toLocaleString("default", { month: "short" }),
        amount: monthCollected
      })
    }

    // Top defaulters
    const studentMap = new Map<string, number>()
    records.filter(r => r.status !== "PAID").forEach(r => {
      const owed = r.amountDue - r.amountPaid
      studentMap.set(r.studentId, (studentMap.get(r.studentId) || 0) + owed)
    })
    const topDefaulterIds = [...studentMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id)

    const topDefaulters = await prisma.student.findMany({
      where: { id: { in: topDefaulterIds } },
      select: { id: true, name: true, admissionNumber: true }
    })

    const defaulterList = topDefaulters.map(s => ({
      ...s,
      outstandingAmount: studentMap.get(s.id) || 0
    })).sort((a, b) => b.outstandingAmount - a.outstandingAmount)

    // Risk distribution calculation
    const studentRiskMap = new Map<string, { totalDue: number, totalPaid: number, overdueCount: number, latePayments: number, pendingCount: number, oldestOverdueDays: number }>()
    
    records.forEach(r => {
      if (!studentRiskMap.has(r.studentId)) {
        studentRiskMap.set(r.studentId, { totalDue: 0, totalPaid: 0, overdueCount: 0, latePayments: 0, pendingCount: 0, oldestOverdueDays: 0 })
      }
      const stats = studentRiskMap.get(r.studentId)!
      stats.totalDue += r.amountDue
      stats.totalPaid += r.amountPaid
      if (r.status !== "PAID" && r.dueDate < new Date()) {
        stats.overdueCount++
        const diff = new Date().getTime() - r.dueDate.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        if (days > stats.oldestOverdueDays) stats.oldestOverdueDays = days
      }
      if (r.paidDate && r.dueDate && r.paidDate > r.dueDate) stats.latePayments++
      if (r.status === "PENDING") stats.pendingCount++
    })

    let lowRisk = 0, moderateRisk = 0, criticalRisk = 0
    studentRiskMap.forEach((stats) => {
      const paymentRatio = stats.totalDue > 0 ? stats.totalPaid / stats.totalDue : 1
      let score = 0
      score += (1 - paymentRatio) * 40
      score += Math.min(stats.overdueCount * 10, 30)
      score += Math.min(stats.latePayments * 5, 20)
      score += stats.pendingCount > 3 ? 10 : 0
      score += Math.min(Math.floor(stats.oldestOverdueDays / 30) * 10, 20) 
      
      score = Math.min(Math.round(score), 100)
      if (score >= 70) criticalRisk++
      else if (score >= 40) moderateRisk++
      else lowRisk++
    })

    return {
      totalExpected,
      totalCollected,
      totalPending,
      collectionRate,
      statusBreakdown: { paid, partial, pending, overdue },
      riskDistribution: { lowRisk, moderateRisk, criticalRisk },
      monthlyTrend,
      topDefaulters: defaulterList
    }
  }

  /**
   * AI-powered defaulter risk scoring.
   */
  static async getDefaulterRiskProfile(tenantId: string, studentId: string) {
    // 1. Verify student-tenant integrity
    const student = await prisma.student.findUnique({
      where: { id: studentId, tenantId }
    })
    if (!student) throw new Error("Fiscal integrity failure: Student scope mismatch")

    const records = await prisma.feeRecord.findMany({
      where: { studentId },
      include: { feeStructure: true },
      orderBy: { dueDate: "asc" }
    })
    if (records.length === 0) return null

    const totalDue = records.reduce((a, r) => a + r.amountDue, 0)
    const totalPaid = records.reduce((a, r) => a + r.amountPaid, 0)
    const paymentRatio = totalDue > 0 ? totalPaid / totalDue : 1

    const overdueRecords = records.filter(r => r.status !== "PAID" && r.dueDate < new Date())
    const overdueCount = overdueRecords.length
    const latePayments = records.filter(r => r.paidDate && r.dueDate && r.paidDate > r.dueDate).length

    // Debt age factor: How many days has the oldest debt been sitting?
    let oldestOverdueDays = 0
    if (overdueRecords.length > 0) {
      const oldestDate = overdueRecords.reduce((oldest, current) => 
        current.dueDate < oldest ? current.dueDate : oldest, overdueRecords[0].dueDate)
      oldestOverdueDays = Math.floor((new Date().getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24))
    }

    // Advanced risk score: 0 (safe) to 100 (high risk)
    let riskScore = 0
    riskScore += (1 - paymentRatio) * 40
    riskScore += Math.min(overdueCount * 10, 30)
    riskScore += Math.min(latePayments * 5, 20)
    riskScore += records.filter(r => r.status === "PENDING").length > 3 ? 10 : 0
    riskScore += Math.min(Math.floor(oldestOverdueDays / 30) * 10, 20) // +10 for every month overdue, capped at 20
    
    riskScore = Math.min(Math.round(riskScore), 100)

    const riskLevel = riskScore >= 70 ? "CRITICAL" : riskScore >= 40 ? "MODERATE" : "LOW"

    return {
      riskScore,
      riskLevel,
      paymentRatio: Math.round(paymentRatio * 100),
      overdueCount,
      latePayments,
      totalRecords: records.length,
      recommendation: riskScore >= 70
        ? "Immediate intervention required. Schedule parent meeting."
        : riskScore >= 40
        ? "Send payment reminder and escalate if not resolved within 7 days."
        : "Account in good standing. No action needed."
    }
  }

  /**
   * Process an atomic ledger payment.
   */
  static async recordPayment(
    tenantId: string,
    recordId: string,
    amount: number,
    paymentMethod: string,
    remarks?: string,
    transactionDate: Date = new Date(),
    referenceNumber?: string
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Get current record
      const record = await tx.feeRecord.findUnique({
        where: { id: recordId }
      })
      if (!record) throw new Error("Record not found")

      // 2. Validate tenant access
      const student = await tx.student.findUnique({
        where: { id: record.studentId }
      })
      if (!student || student.tenantId !== tenantId) throw new Error("Unauthorized access to ledger")

      // 3. Compute new amounts
      const newPaid = record.amountPaid + amount
      const isFullyPaid = (newPaid + record.waiver) >= record.amountDue
      const newStatus = isFullyPaid ? "PAID" : (newPaid > 0 ? "PARTIAL" : "PENDING")

      const receiptNumber = `RCPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      // 4. Create Transaction Record
      await tx.feeTransaction.create({
        data: {
          tenantId,
          feeRecordId: recordId,
          amount,
          paymentMethod,
          receiptNumber,
          remarks,
          transactionDate
        }
      })

      // 5. Update Fee Record
      const updatedRecord = await tx.feeRecord.update({
        where: { id: recordId },
        data: {
          amountPaid: newPaid,
          status: newStatus,
          paymentMethod,
          receiptNumber: record.receiptNumber || receiptNumber,
          paidDate: isFullyPaid ? transactionDate : undefined,
          remarks: remarks || record.remarks
        }
      })

      // 6. Log Audit
      await AuditService.log({
        tenantId,
        action: 'UPDATE',
        module: 'fees',
        entityType: 'FeeRecord',
        entityId: recordId,
        summary: `Payment of ${amount} recorded for student ${student.name} via ${paymentMethod}. Status: ${newStatus}`,
        oldValue: { amountPaid: record.amountPaid, status: record.status },
        newValue: { amountPaid: updatedRecord.amountPaid, status: updatedRecord.status }
      })

      return updatedRecord
    })
  }

  /**
   * Apply a scholarship or waiver to a fee record.
   */
  static async applyWaiver(
    tenantId: string,
    recordId: string,
    amount: number,
    remarks?: string
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Get current record
      const record = await tx.feeRecord.findUnique({
        where: { id: recordId }
      })
      if (!record) throw new Error("Record not found")

      // 2. Validate tenant access
      const student = await tx.student.findUnique({
        where: { id: record.studentId, tenantId }
      })
      if (!student) throw new Error("Unauthorized access to ledger")

      // 3. Compute new amounts
      const newWaiver = record.waiver + amount
      if ((newWaiver + record.amountPaid) > record.amountDue) {
        throw new Error("Total waiver and payments cannot exceed amount due")
      }
      
      const isFullyPaid = (record.amountPaid + newWaiver) >= record.amountDue
      const newStatus = isFullyPaid ? "PAID" : (record.amountPaid > 0 ? "PARTIAL" : "PENDING")

      const receiptNumber = `WVR-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      // 4. Create specialized transaction entry
      await tx.feeTransaction.create({
        data: {
          tenantId,
          feeRecordId: recordId,
          amount,
          paymentMethod: "WAIVER",
          receiptNumber,
          remarks: remarks || "Scholarship/Waiver Applied"
        }
      })

      // 5. Update Fee Record
      const updatedRecord = await tx.feeRecord.update({
        where: { id: recordId },
        data: {
          waiver: newWaiver,
          status: newStatus,
          waiverRemarks: remarks || record.waiverRemarks
        }
      })

      // 6. Log Audit
      await AuditService.log({
        tenantId,
        action: 'UPDATE',
        module: 'fees',
        entityType: 'FeeRecord',
        entityId: recordId,
        summary: `Waiver of ${amount} applied for student ${student.name}. Status: ${newStatus}`,
        oldValue: { waiver: record.waiver, status: record.status },
        newValue: { waiver: updatedRecord.waiver, status: updatedRecord.status }
      })

      return updatedRecord
    })
  }

  /**
   * Process multiple ledger payments in one transaction.
   */
  static async bulkRecordPayment(
    tenantId: string,
    payload: {
      payments: Array<{
        recordId: string;
        amount: number;
      }>;
      paymentMethod: string;
      transactionDate?: string | Date;
      referenceNumber?: string;
      remarks?: string;
    }
  ) {
    const transactionDate = payload.transactionDate ? new Date(payload.transactionDate) : new Date()
    
    return await prisma.$transaction(async (tx) => {
      const results = []

      for (const item of payload.payments) {
        // 1. Get current record
        const record = await tx.feeRecord.findUnique({
          where: { id: item.recordId }
        })
        if (!record) throw new Error(`Record ${item.recordId} not found`)

        // 2. Validate tenant access
        const student = await tx.student.findUnique({
          where: { id: record.studentId }
        })
        if (!student || student.tenantId !== tenantId) throw new Error(`Unauthorized access to ledger for ${record.id}`)

        // 3. Compute new amounts
        const newPaid = record.amountPaid + item.amount
        const isFullyPaid = (newPaid + record.waiver) >= record.amountDue
        const newStatus = isFullyPaid ? "PAID" : (newPaid > 0 ? "PARTIAL" : "PENDING")

        const receiptNumber = `RCPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`

        // 4. Create Transaction Record
        await tx.feeTransaction.create({
          data: {
            tenantId,
            feeRecordId: item.recordId,
            amount: item.amount,
            paymentMethod: payload.paymentMethod,
            receiptNumber,
            remarks: payload.remarks,
            transactionDate
          }
        })

        // 5. Update Fee Record
        const updatedRecord = await tx.feeRecord.update({
          where: { id: item.recordId },
          data: {
            amountPaid: newPaid,
            status: newStatus,
            paymentMethod: payload.paymentMethod,
            receiptNumber: record.receiptNumber || receiptNumber,
            paidDate: isFullyPaid ? transactionDate : undefined,
            remarks: payload.remarks || record.remarks
          }
        })

        // 6. Log Audit
        await AuditService.log({
          tenantId,
          action: 'UPDATE',
          module: 'fees',
          entityType: 'FeeRecord',
          entityId: item.recordId,
          summary: `Bulk payment of ${item.amount} recorded for student ${student.name}. Status: ${newStatus}`,
          oldValue: { amountPaid: record.amountPaid, status: record.status },
          newValue: { amountPaid: updatedRecord.amountPaid, status: updatedRecord.status }
        })

        results.push(updatedRecord)
      }

      return results
    })
  }

}
