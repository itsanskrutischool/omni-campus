import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

export class HealthService {
  // ─── Health Records CRUD ───────────────────────────────────

  static async getRecords(tenantId: string, query?: {
    studentId?: string
    type?: string
    status?: string
    search?: string
    page?: number
    pageSize?: number
  }) {
    const page = query?.page || 1
    const pageSize = query?.pageSize || 20
    const skip = (page - 1) * pageSize

    const where: Record<string, unknown> = { tenantId }
    if (query?.studentId) where.studentId = query.studentId
    if (query?.type && query.type !== "ALL") where.type = query.type
    if (query?.status && query.status !== "ALL") where.status = query.status

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { medication: { contains: query.search, mode: "insensitive" } },
      ]
    }

    const [records, total] = await Promise.all([
      prisma.healthRecord.findMany({
        where,
        include: { student: { select: { name: true, admissionNumber: true, classroom: true } } },
        orderBy: { date: "desc" },
        take: pageSize,
        skip,
      }),
      prisma.healthRecord.count({ where }),
    ])

    return { records, total, page, totalPages: Math.ceil(total / pageSize) }
  }

  static async getStudentHealthProfile(tenantId: string, studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId, tenantId },
      include: {
        healthRecords: { orderBy: { date: "desc" } },
      },
    })
    return student
  }

  static async createRecord(tenantId: string, userId: string | undefined, payload: {
    studentId: string
    type: string
    title: string
    description?: string
    severity?: string
    diagnosedBy?: string
    treatment?: string
    medication?: string
    dosage?: string
    followUpDate?: Date
    notes?: string
  }) {
    const record = await prisma.healthRecord.create({
      data: {
        tenantId,
        studentId: payload.studentId,
        type: payload.type,
        title: payload.title,
        description: payload.description || null,
        severity: payload.severity || null,
        diagnosedBy: payload.diagnosedBy || null,
        treatment: payload.treatment || null,
        medication: payload.medication || null,
        dosage: payload.dosage || null,
        followUpDate: payload.followUpDate || null,
        notes: payload.notes || null,
      },
      include: { student: { select: { name: true, admissionNumber: true } } },
    })

    await AuditService.log({
      tenantId,
      userId,
      action: "CREATE",
      module: "health",
      entityType: "HealthRecord",
      entityId: record.id,
      summary: `Health record created: ${record.title} for ${record.student.name}`,
    })

    return record
  }

  static async updateRecord(tenantId: string, userId: string | undefined, recordId: string, payload: Partial<{
    status: string
    description: string
    treatment: string
    medication: string
    dosage: string
    followUpDate: Date
    notes: string
  }>) {
    const record = await prisma.healthRecord.update({
      where: { id: recordId, tenantId },
      data: payload,
    })

    await AuditService.log({
      tenantId,
      userId,
      action: "UPDATE",
      module: "health",
      entityType: "HealthRecord",
      entityId: recordId,
      summary: `Updated health record: ${record.title}`,
    })

    return record
  }

  static async deleteRecord(tenantId: string, recordId: string) {
    await prisma.healthRecord.delete({ where: { id: recordId, tenantId } })
  }

  // ─── Analytics ───────────────────────────────────

  static async getAnalytics(tenantId: string) {
    const [totalRecords, activeRecords, byType, bySeverity, recentVisits, commonMedications] = await Promise.all([
      prisma.healthRecord.count({ where: { tenantId } }),
      prisma.healthRecord.count({ where: { tenantId, status: "ACTIVE" } }),
      prisma.healthRecord.groupBy({
        by: ["type"],
        where: { tenantId },
        _count: { _all: true },
      }),
      prisma.healthRecord.groupBy({
        by: ["severity"],
        where: { tenantId, severity: { not: null } },
        _count: { _all: true },
      }),
      prisma.healthRecord.findMany({
        where: { tenantId, type: "VISIT" },
        include: { student: { select: { name: true, admissionNumber: true } } },
        orderBy: { date: "desc" },
        take: 10,
      }),
      prisma.healthRecord.findMany({
        where: { tenantId, medication: { not: null } },
        select: { medication: true },
        take: 100,
      }),
    ])

    // Parse common medications
    const medCount: Record<string, number> = {}
    commonMedications.forEach(r => {
      if (r.medication) {
        medCount[r.medication] = (medCount[r.medication] || 0) + 1
      }
    })
    const topMeds = Object.entries(medCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

    return {
      totalRecords,
      activeRecords,
      byType,
      bySeverity,
      recentVisits,
      topMeds: topMeds.map(([med, count]) => ({ medication: med, count })),
    }
  }
}
