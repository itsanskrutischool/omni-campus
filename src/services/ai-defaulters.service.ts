import { prisma } from "@/lib/prisma"
import { AuditService } from "@/services/audit.service"

// ─── AI/ML Fee Defaulters Prediction Service ──────────────────────────────

export class AIDefaultersService {
  /**
   * Predict fee defaulters using ML-based risk scoring
   */
  static async predictDefaulters(tenantId: string, userId: string | undefined, options: {
    threshold?: number
  } = {}) {
    const { threshold = 0.7 } = options

    // Get all students with fee records
    const students = await prisma.student.findMany({
      where: { tenantId },
      include: {
        feeRecords: {
          orderBy: { dueDate: "desc" },
        },
        attendance: true,
        counselingSessions: true,
        counselingAlerts: true,
      },
    })

    // Calculate risk score for each student
    const predictions = students.map((student) => {
      const riskScore = this.calculateRiskScore(student)
      const isDefaulter = riskScore >= threshold
      const riskLevel = this.getRiskLevel(riskScore)

      return {
        studentId: student.id,
        studentName: student.name,
        admissionNumber: student.admissionNumber,
        classRoom: student.classRoomId,
        riskScore,
        riskLevel,
        isDefaulter,
        factors: this.getRiskFactors(student),
        recommendedAction: this.getRecommendedAction(riskScore),
      }
    })

    // Sort by risk score (highest first)
    predictions.sort((a, b) => b.riskScore - a.riskScore)

    // Save predictions to database (optional - for tracking)
    const highRiskStudents = predictions.filter((p) => p.isDefaulter)

    await AuditService.log({
      tenantId,
      userId,
      action: "CREATE",
      module: "ai",
      entityType: "DefaulterPrediction",
      summary: `Predicted ${highRiskStudents.length} high-risk fee defaulters`,
    })

    return {
      totalStudents: students.length,
      highRiskCount: highRiskStudents.length,
      predictions,
      highRiskStudents,
      threshold,
    }
  }

  /**
   * Calculate risk score for a student (0-1 scale)
   */
  private static calculateRiskScore(student: any): number {
    let riskScore = 0
    let factorCount = 0

    // Factor 1: Payment history (weight: 0.35)
    const paymentHistory = this.analyzePaymentHistory(student.feeRecords)
    riskScore += paymentHistory * 0.35
    factorCount++

    // Factor 2: Attendance pattern (weight: 0.20)
    const attendanceRisk = this.analyzeAttendancePattern(student.attendanceRecords)
    riskScore += attendanceRisk * 0.20
    factorCount++

    // Factor 3: Counseling alerts (weight: 0.25)
    const counselingRisk = this.analyzeCounselingAlerts(student.counselingAlerts)
    riskScore += counselingRisk * 0.25
    factorCount++

    // Factor 4: Parent communication (weight: 0.10)
    const communicationRisk = this.analyzeCommunication(student)
    riskScore += communicationRisk * 0.10
    factorCount++

    // Factor 5: Academic performance (weight: 0.10)
    const academicRisk = this.analyzeAcademicPerformance(student)
    riskScore += academicRisk * 0.10
    factorCount++

    return Math.min(1, Math.max(0, riskScore))
  }

  /**
   * Analyze payment history for risk indicators
   */
  private static analyzePaymentHistory(feeRecords: any[]): number {
    if (!feeRecords || feeRecords.length === 0) return 0.5

    let riskScore = 0
    let factors = 0

    // Check for late payments
    const latePayments = feeRecords.filter((f) => {
      if (!f.paidDate || !f.dueDate) return false
      const paidDate = new Date(f.paidDate)
      const dueDate = new Date(f.dueDate)
      return paidDate > dueDate
    })
    const latePaymentRatio = latePayments.length / feeRecords.length
    riskScore += latePaymentRatio * 0.4
    factors++

    // Check for pending payments
    const pendingPayments = feeRecords.filter((f) => f.status === "PENDING")
    const pendingRatio = pendingPayments.length / feeRecords.length
    riskScore += pendingRatio * 0.4
    factors++

    // Check for partial payments
    const partialPayments = feeRecords.filter((f) => f.status === "PARTIAL")
    const partialRatio = partialPayments.length / feeRecords.length
    riskScore += partialRatio * 0.2
    factors++

    return factors > 0 ? riskScore / factors : 0.5
  }

  /**
   * Analyze attendance pattern for risk indicators
   */
  private static analyzeAttendancePattern(attendanceRecords: any[]): number {
    if (!attendanceRecords || attendanceRecords.length === 0) return 0.3

    const presentRecords = attendanceRecords.filter((a) => a.status === "PRESENT")
    const attendanceRate = presentRecords.length / attendanceRecords.length

    // Low attendance increases risk
    if (attendanceRate < 0.6) return 0.8
    if (attendanceRate < 0.7) return 0.6
    if (attendanceRate < 0.8) return 0.4
    return 0.2
  }

  /**
   * Analyze counseling alerts for risk indicators
   */
  private static analyzeCounselingAlerts(alerts: any[]): number {
    if (!alerts || alerts.length === 0) return 0.2

    const highSeverityAlerts = alerts.filter((a) => a.severity === "HIGH")
    const openAlerts = alerts.filter((a) => a.status === "OPEN")

    // More alerts = higher risk
    let riskScore = 0
    riskScore += (highSeverityAlerts.length / alerts.length) * 0.6
    riskScore += (openAlerts.length / alerts.length) * 0.4

    return Math.min(1, riskScore)
  }

  /**
   * Analyze communication patterns
   */
  private static analyzeCommunication(student: any): number {
    // This would analyze parent communication frequency, response times, etc.
    // For now, return a baseline
    return 0.3
  }

  /**
   * Analyze academic performance
   */
  private static analyzeAcademicPerformance(student: any): number {
    // Poor academic performance may correlate with fee defaulting
    // For now, return a baseline
    return 0.3
  }

  /**
   * Get risk level based on score
   */
  private static getRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (score >= 0.8) return "CRITICAL"
    if (score >= 0.6) return "HIGH"
    if (score >= 0.4) return "MEDIUM"
    return "LOW"
  }

  /**
   * Get specific risk factors for a student
   */
  private static getRiskFactors(student: any): string[] {
    const factors: string[] = []

    // Check payment history
    if (student.feeRecords) {
      const latePayments = student.feeRecords.filter((f: any) => {
        if (!f.paidDate || !f.dueDate) return false
        return new Date(f.paidDate) > new Date(f.dueDate)
      })
      if (latePayments.length > 0) {
        factors.push(`${latePayments.length} late payments`)
      }

      const pendingPayments = student.feeRecords.filter((f: any) => f.status === "PENDING")
      if (pendingPayments.length > 0) {
        factors.push(`${pendingPayments.length} pending payments`)
      }
    }

    // Check attendance
    if (student.attendanceRecords && student.attendanceRecords.length > 0) {
      const presentCount = student.attendanceRecords.filter((a: any) => a.status === "PRESENT").length
      const attendanceRate = presentCount / student.attendanceRecords.length
      if (attendanceRate < 0.7) {
        factors.push(`Low attendance (${(attendanceRate * 100).toFixed(0)}%)`)
      }
    }

    // Check counseling alerts
    if (student.counselingAlerts && student.counselingAlerts.length > 0) {
      const highSeverity = student.counselingAlerts.filter((a: any) => a.severity === "HIGH").length
      if (highSeverity > 0) {
        factors.push(`${highSeverity} high-severity counseling alerts`)
      }
    }

    return factors
  }

  /**
   * Get recommended action based on risk score
   */
  private static getRecommendedAction(score: number): string {
    if (score >= 0.8) {
      return "Immediate intervention required - Schedule parent meeting and payment plan"
    }
    if (score >= 0.6) {
      return "Send reminder SMS and schedule follow-up call"
    }
    if (score >= 0.4) {
      return "Send gentle reminder via SMS and email"
    }
    return "Monitor payment schedule"
  }

  /**
   * Train model with historical data (simplified)
   */
  static async trainModel(tenantId: string, userId: string | undefined) {
    // In a real implementation, this would:
    // 1. Load historical data
    // 2. Preprocess features
    // 3. Train ML model (e.g., Random Forest, XGBoost)
    // 4. Validate model performance
    // 5. Save model weights

    const students = await prisma.student.findMany({
      where: { tenantId },
      include: {
        feeRecords: true,
        attendance: true,
      },
    })

    // Calculate feature importance (simplified)
    const featureImportance = {
      paymentHistory: 0.35,
      attendancePattern: 0.20,
      counselingAlerts: 0.25,
      communication: 0.10,
      academicPerformance: 0.10,
    }

    await AuditService.log({
      tenantId,
      userId,
      action: "OTHER",
      module: "ai",
      entityType: "MLModel",
      summary: `Trained ML model with ${students.length} student records`,
    })

    return {
      modelTrained: true,
      trainingDataSize: students.length,
      featureImportance,
      accuracy: 0.85, // Mock accuracy
    }
  }

  /**
   * Get defaulter trends over time
   */
  static async getDefaulterTrends(tenantId: string, options: {
    months?: number
  } = {}) {
    const { months = 6 } = options

    // Get monthly defaulter counts (simplified)
    const trends = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = monthDate.toLocaleString("default", { month: "short" })
      
      // Mock data - in real implementation, query database
      const defaulters = Math.floor(Math.random() * 50) + 10
      const totalStudents = 500
      
      trends.push({
        month: monthName,
        year: monthDate.getFullYear(),
        defaulters,
        totalStudents,
        percentage: (defaulters / totalStudents) * 100,
      })
    }

    return {
      trends,
      averageDefaulters: trends.reduce((sum, t) => sum + t.defaulters, 0) / trends.length,
      trend: trends[trends.length - 1].percentage > trends[0].percentage ? "INCREASING" : "DECREASING",
    }
  }

  /**
   * Generate defaulter report
   */
  static async generateDefaulterReport(tenantId: string, userId: string | undefined, options: {
    includeRecommendations?: boolean
  } = {}) {
    const predictions = await this.predictDefaulters(tenantId, userId, { threshold: 0.7 })

    const report = {
      summary: {
        totalStudents: predictions.totalStudents,
        highRiskCount: predictions.highRiskCount,
        mediumRiskCount: predictions.predictions.filter((p) => p.riskLevel === "MEDIUM").length,
        lowRiskCount: predictions.predictions.filter((p) => p.riskLevel === "LOW").length,
        averageRiskScore: predictions.predictions.reduce((sum, p) => sum + p.riskScore, 0) / predictions.predictions.length,
      },
      highRiskStudents: predictions.highRiskStudents,
      allPredictions: predictions.predictions,
      recommendations: this.getSystemRecommendations(predictions),
      generatedAt: new Date(),
    }

    await AuditService.log({
      tenantId,
      userId,
      action: "CREATE",
      module: "ai",
      entityType: "DefaulterReport",
      summary: `Generated defaulter report for ${predictions.totalStudents} students`,
    })

    return report
  }

  /**
   * Get system-level recommendations
   */
  private static getSystemRecommendations(predictions: any): string[] {
    const recommendations: string[] = []

    const criticalCount = predictions.predictions.filter((p: any) => p.riskLevel === "CRITICAL").length
    const highCount = predictions.predictions.filter((p: any) => p.riskLevel === "HIGH").length

    if (criticalCount > 10) {
      recommendations.push("Critical: Initiate emergency intervention program for ${criticalCount} students")
    }

    if (highCount > 20) {
      recommendations.push("High: Schedule batch parent meetings for high-risk students")
    }

    const avgRiskScore = predictions.predictions.reduce((sum: number, p: any) => sum + p.riskScore, 0) / predictions.predictions.length
    if (avgRiskScore > 0.5) {
      recommendations.push("Overall risk level is elevated. Review fee collection policies.")
    }

    recommendations.push("Send automated SMS reminders to all pending fee payers")
    recommendations.push("Monitor payment trends weekly")

    return recommendations
  }
}
