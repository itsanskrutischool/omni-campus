import { prisma } from "@/lib/prisma"
import { AuditService } from "@/services/audit.service"

// ─── Scholarship Approval Workflow Service ──────────────────────────────────

export class ScholarshipApprovalService {
  /**
   * Submit scholarship application
   */
  static async submitApplication(tenantId: string, userId: string | undefined, options: {
    scholarshipId: string
    studentId: string
    parentIncome?: number
    reason?: string
    documents?: string[]
  }) {
    const { scholarshipId, studentId, parentIncome, reason, documents } = options

    try {
      // Verify scholarship exists and is active
      const scholarship = await prisma.scholarship.findUnique({
        where: { id: scholarshipId },
      })

      if (!scholarship || !scholarship.isActive) {
        throw new Error("Scholarship not found or inactive")
      }

      if (scholarship.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      // Check if student already has a pending application
      const existing = await prisma.scholarshipApplication.findFirst({
        where: {
          scholarshipId,
          studentId,
          status: { in: ["PENDING", "UNDER_REVIEW"] },
        },
      })

      if (existing) {
        throw new Error("Student already has a pending application for this scholarship")
      }

      // Create application
      const application = await prisma.scholarshipApplication.create({
        data: {
          scholarshipId,
          studentId,
          tenantId,
          parentIncome,
          reason,
          documents: documents ? JSON.stringify(documents) : null,
          status: "PENDING",
        },
      })

      // Log submission
      await AuditService.log({
        tenantId,
        userId,
        action: "CREATE",
        module: "scholarships",
        entityType: "ScholarshipApplication",
        entityId: application.id,
        summary: `Scholarship application submitted for student ${studentId}`,
      })

      return {
        success: true,
        application,
        message: "Scholarship application submitted successfully",
      }
    } catch (error: any) {
      console.error("Scholarship application submission failed:", error)
      throw new Error(`Failed to submit application: ${error.message}`)
    }
  }

  /**
   * Review scholarship application
   */
  static async reviewApplication(tenantId: string, userId: string | undefined, options: {
    applicationId: string
    status: "UNDER_REVIEW" | "APPROVED" | "REJECTED"
    remarks?: string
    approvedAmount?: number
  }) {
    const { applicationId, status, remarks, approvedAmount } = options

    try {
      const application = await prisma.scholarshipApplication.findUnique({
        where: { id: applicationId },
        include: {
          scholarship: true,
          student: true,
        },
      })

      if (!application) {
        throw new Error("Application not found")
      }

      if (application.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      if (application.status === "APPROVED" || application.status === "REJECTED") {
        throw new Error("Application already processed")
      }

      // Update application
      const updated = await prisma.scholarshipApplication.update({
        where: { id: applicationId },
        data: {
          status,
          reviewedBy: userId,
          reviewedAt: new Date(),
          remarks,
        },
      })

      // If approved, apply scholarship to fee structure
      if (status === "APPROVED") {
        // Apply scholarship discount to student's fee records
        const feeRecords = await prisma.feeRecord.findMany({
          where: {
            studentId: application.studentId,
            status: "PENDING",
          },
        })

        for (const feeRecord of feeRecords) {
          const discountAmount = (feeRecord.amountDue * application.scholarship.discountPercent) / 100
          
          await prisma.feeRecord.update({
            where: { id: feeRecord.id },
            data: {
              waiver: discountAmount,
              waiverRemarks: `Scholarship: ${application.scholarship.name} (${application.scholarship.discountPercent}% discount)`,
            },
          })
        }
      }

      // Log review
      await AuditService.log({
        tenantId,
        userId,
        action: status === "APPROVED" ? "APPROVE" : "REJECT",
        module: "scholarships",
        entityType: "ScholarshipApplication",
        entityId: applicationId,
        summary: `Scholarship application ${status.toLowerCase()} for ${application.student.name}`,
        oldValue: { status: application.status },
        newValue: { status, remarks },
      })

      return {
        success: true,
        application: updated,
        message: `Application ${status.toLowerCase()} successfully`,
      }
    } catch (error: any) {
      console.error("Scholarship application review failed:", error)
      throw new Error(`Failed to review application: ${error.message}`)
    }
  }

  /**
   * Get pending applications for review
   */
  static async getPendingApplications(tenantId: string) {
    try {
      const applications = await prisma.scholarshipApplication.findMany({
        where: {
          tenantId,
          status: { in: ["PENDING", "UNDER_REVIEW"] },
        },
        include: {
          scholarship: true,
          student: {
            include: {
              classroom: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      })

      return {
        success: true,
        applications,
        count: applications.length,
      }
    } catch (error: any) {
      console.error("Failed to get pending applications:", error)
      throw new Error(`Failed to get pending applications: ${error.message}`)
    }
  }

  /**
   * Get application history for a student
   */
  static async getStudentApplications(tenantId: string, studentId: string) {
    try {
      const applications = await prisma.scholarshipApplication.findMany({
        where: {
          tenantId,
          studentId,
        },
        include: {
          scholarship: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return {
        success: true,
        applications,
        count: applications.length,
      }
    } catch (error: any) {
      console.error("Failed to get student applications:", error)
      throw new Error(`Failed to get student applications: ${error.message}`)
    }
  }

  /**
   * Get scholarship statistics
   */
  static async getScholarshipStats(tenantId: string, scholarshipId?: string) {
    try {
      const where: any = {
        tenantId,
      }

      if (scholarshipId) {
        where.scholarshipId = scholarshipId
      }

      const applications = await prisma.scholarshipApplication.findMany({
        where,
      })

      const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === "PENDING").length,
        underReview: applications.filter(a => a.status === "UNDER_REVIEW").length,
        approved: applications.filter(a => a.status === "APPROVED").length,
        rejected: applications.filter(a => a.status === "REJECTED").length,
      }

      return {
        success: true,
        stats,
      }
    } catch (error: any) {
      console.error("Failed to get scholarship stats:", error)
      throw new Error(`Failed to get scholarship stats: ${error.message}`)
    }
  }

  /**
   * Bulk approve applications
   */
  static async bulkApprove(tenantId: string, userId: string | undefined, applicationIds: string[], remarks?: string) {
    const results = []
    let successCount = 0
    let failureCount = 0

    for (const applicationId of applicationIds) {
      try {
        await this.reviewApplication(tenantId, userId, {
          applicationId,
          status: "APPROVED",
          remarks,
        })
        results.push({ applicationId, success: true })
        successCount++
      } catch (error: any) {
        results.push({ applicationId, success: false, error: error.message })
        failureCount++
      }
    }

    return {
      success: true,
      total: applicationIds.length,
      successCount,
      failureCount,
      results,
    }
  }

  /**
   * Bulk reject applications
   */
  static async bulkReject(tenantId: string, userId: string | undefined, applicationIds: string[], remarks?: string) {
    const results = []
    let successCount = 0
    let failureCount = 0

    for (const applicationId of applicationIds) {
      try {
        await this.reviewApplication(tenantId, userId, {
          applicationId,
          status: "REJECTED",
          remarks,
        })
        results.push({ applicationId, success: true })
        successCount++
      } catch (error: any) {
        results.push({ applicationId, success: false, error: error.message })
        failureCount++
      }
    }

    return {
      success: true,
      total: applicationIds.length,
      successCount,
      failureCount,
      results,
    }
  }
}
