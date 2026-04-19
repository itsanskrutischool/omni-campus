import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

export class ScholarshipService {
  // ─── Scholarships CRUD ───────────────────────────────────

  static async getScholarships(tenantId: string, includeInactive = false) {
    return prisma.scholarship.findMany({
      where: { tenantId, ...(includeInactive ? {} : { isActive: true }) },
      include: { _count: { select: { applications: true } } },
      orderBy: { name: "asc" },
    })
  }

  static async createScholarship(tenantId: string, payload: {
    name: string
    description?: string
    type: string
    discountPercent: number
    maxAmount?: number
    eligibility?: string
    applicationFee?: number
    deadline?: Date
  }) {
    return prisma.scholarship.create({
      data: { tenantId, ...payload },
    })
  }

  // ─── Applications ───────────────────────────────────

  static async getApplications(tenantId: string, status?: string) {
    return prisma.scholarshipApplication.findMany({
      where: { tenantId, ...(status && status !== "ALL" ? { status } : {}) },
      include: {
        scholarship: { select: { name: true, type: true, discountPercent: true } },
        student: { select: { name: true, admissionNumber: true, classroom: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  static async applyForScholarship(tenantId: string, userId: string | undefined, payload: {
    scholarshipId: string
    studentId: string
    parentIncome?: number
    reason?: string
  }) {
    const app = await prisma.scholarshipApplication.create({
      data: {
        tenantId,
        scholarshipId: payload.scholarshipId,
        studentId: payload.studentId,
        parentIncome: payload.parentIncome || null,
        reason: payload.reason || null,
      },
      include: {
        scholarship: { select: { name: true } },
        student: { select: { name: true } },
      },
    })

    await AuditService.log({
      tenantId,
      userId,
      action: "CREATE",
      module: "scholarships",
      entityType: "ScholarshipApplication",
      entityId: app.id,
      summary: `Scholarship application: ${app.scholarship.name} for ${app.student.name}`,
    })

    return app
  }

  static async reviewApplication(tenantId: string, userId: string | undefined, applicationId: string, payload: {
    status: "APPROVED" | "REJECTED"
    remarks?: string
  }) {
    const app = await prisma.scholarshipApplication.update({
      where: { id: applicationId, tenantId },
      data: {
        status: payload.status,
        remarks: payload.remarks || null,
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    })

    await AuditService.log({
      tenantId,
      userId,
      action: "UPDATE",
      module: "scholarships",
      entityType: "ScholarshipApplication",
      entityId: applicationId,
      summary: `Scholarship application ${payload.status} by ${userId}`,
    })

    return app
  }

  // ─── Analytics ───────────────────────────────────

  static async getAnalytics(tenantId: string) {
    const [total, pending, approved, rejected, byType] = await Promise.all([
      prisma.scholarshipApplication.count({ where: { tenantId } }),
      prisma.scholarshipApplication.count({ where: { tenantId, status: "PENDING" } }),
      prisma.scholarshipApplication.count({ where: { tenantId, status: "APPROVED" } }),
      prisma.scholarshipApplication.count({ where: { tenantId, status: "REJECTED" } }),
      prisma.scholarship.groupBy({
        by: ["type"],
        where: { tenantId },
        _count: { _all: true },
      }),
    ])

    return { total, pending, approved, rejected, byType }
  }
}
