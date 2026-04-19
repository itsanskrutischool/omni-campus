import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

export class CounselingService {
  // ─── Counseling Sessions ───────────────────────────────────

  static async getSessions(tenantId: string, query?: {
    studentId?: string
    counselorId?: string
    type?: string
    status?: string
    severity?: string
    fromDate?: Date
    toDate?: Date
    page?: number
    pageSize?: number
  }) {
    const page = query?.page || 1
    const pageSize = query?.pageSize || 20
    const skip = (page - 1) * pageSize

    const where: Record<string, unknown> = { tenantId }
    if (query?.studentId) where.studentId = query.studentId
    if (query?.counselorId) where.counselorId = query.counselorId
    if (query?.type) where.type = query.type
    if (query?.status) where.status = query.status
    if (query?.severity) where.severity = query.severity
    if (query?.fromDate || query?.toDate) {
      where.sessionDate = {}
      if (query?.fromDate) (where.sessionDate as Record<string, Date>).gte = query.fromDate
      if (query?.toDate) (where.sessionDate as Record<string, Date>).lte = query.toDate
    }

    const [sessions, total] = await Promise.all([
      prisma.counselingSession.findMany({
        where,
        include: {
          student: { select: { name: true, admissionNumber: true, classroom: true } },
        },
        orderBy: { sessionDate: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.counselingSession.count({ where }),
    ])

    return { sessions, total, page, pageCount: Math.ceil(total / pageSize) }
  }

  static async createSession(tenantId: string, userId: string | undefined, payload: {
    studentId: string
    counselorId: string
    sessionDate: Date
    duration: number
    type: string
    severity?: string
    summary: string
    notes?: string
    recommendations?: string
    followUpDate?: Date
    isConfidential?: boolean
  }) {
    const session = await prisma.counselingSession.create({
      data: {
        tenantId,
        ...payload,
        severity: payload.severity || "LOW",
        isConfidential: payload.isConfidential || false,
      },
      include: {
        student: { select: { name: true, admissionNumber: true } },
      },
    })

    await AuditService.log({
      tenantId,
      userId,
      action: "CREATE",
      module: "counseling",
      entityType: "CounselingSession",
      entityId: session.id,
      summary: `Counseling session scheduled for ${session.student.name} (${payload.type})`,
    })

    return session
  }

  static async updateSession(tenantId: string, userId: string | undefined, sessionId: string, payload: Partial<{
    sessionDate: Date
    duration: number
    type: string
    severity: string
    summary: string
    notes: string
    recommendations: string
    followUpDate: Date
    followUpDone: boolean
    status: string
    isConfidential: boolean
    parentNotified: boolean
  }>) {
    const existing = await prisma.counselingSession.findUnique({ where: { id: sessionId } })
    if (!existing) throw new Error("Session not found")

    const session = await prisma.counselingSession.update({
      where: { id: sessionId, tenantId },
      data: payload,
      include: {
        student: { select: { name: true } },
      },
    })

    await AuditService.log({
      tenantId,
      userId,
      action: "UPDATE",
      module: "counseling",
      entityType: "CounselingSession",
      entityId: sessionId,
      summary: `Counseling session updated for ${session.student.name}`,
      oldValue: existing,
      newValue: session,
    })

    return session
  }

  // ─── Counseling Alerts ───────────────────────────────────

  static async getAlerts(tenantId: string, query?: {
    studentId?: string
    type?: string
    status?: string
    severity?: string
    assignedTo?: string
    page?: number
    pageSize?: number
  }) {
    const page = query?.page || 1
    const pageSize = query?.pageSize || 20
    const skip = (page - 1) * pageSize

    const where: Record<string, unknown> = { tenantId }
    if (query?.studentId) where.studentId = query.studentId
    if (query?.type) where.type = query.type
    if (query?.status) where.status = query.status
    if (query?.severity) where.severity = query.severity
    if (query?.assignedTo) where.assignedTo = query.assignedTo

    const [alerts, total] = await Promise.all([
      prisma.counselingAlert.findMany({
        where,
        include: {
          student: { select: { name: true, admissionNumber: true, classroom: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.counselingAlert.count({ where }),
    ])

    return { alerts, total, page, pageCount: Math.ceil(total / pageSize) }
  }

  static async createAlert(tenantId: string, userId: string | undefined, payload: {
    studentId: string
    type: string
    severity: string
    description: string
    assignedTo?: string
  }) {
    const alert = await prisma.counselingAlert.create({
      data: {
        tenantId,
        ...payload,
        reportedBy: userId || "system",
      },
      include: {
        student: { select: { name: true, admissionNumber: true } },
      },
    })

    await AuditService.log({
      tenantId,
      userId,
      action: "CREATE",
      module: "counseling",
      entityType: "CounselingAlert",
      entityId: alert.id,
      summary: `Counseling alert created for ${alert.student.name}: ${payload.type}`,
    })

    return alert
  }

  static async resolveAlert(tenantId: string, userId: string | undefined, alertId: string, resolution: string) {
    const alert = await prisma.counselingAlert.update({
      where: { id: alertId, tenantId },
      data: {
        status: "RESOLVED",
        resolution,
        resolvedAt: new Date(),
      },
    })

    await AuditService.log({
      tenantId,
      userId,
      action: "UPDATE",
      module: "counseling",
      entityType: "CounselingAlert",
      entityId: alertId,
      summary: `Counseling alert resolved`,
    })

    return alert
  }

  // ─── Analytics ───────────────────────────────────

  static async getAnalytics(tenantId: string, fromDate?: Date, toDate?: Date) {
    const dateFilter: Record<string, unknown> = {}
    if (fromDate) dateFilter.gte = fromDate
    if (toDate) dateFilter.lte = toDate

    const [
      totalSessions,
      sessionsByType,
      sessionsBySeverity,
      openAlerts,
      alertsByType,
      followUpsPending,
      criticalCases,
    ] = await Promise.all([
      prisma.counselingSession.count({
        where: { tenantId, ...(Object.keys(dateFilter).length > 0 ? { sessionDate: dateFilter } : {}) },
      }),
      prisma.counselingSession.groupBy({
        by: ["type"],
        where: { tenantId, ...(Object.keys(dateFilter).length > 0 ? { sessionDate: dateFilter } : {}) },
        _count: { _all: true },
      }),
      prisma.counselingSession.groupBy({
        by: ["severity"],
        where: { tenantId, ...(Object.keys(dateFilter).length > 0 ? { sessionDate: dateFilter } : {}) },
        _count: { _all: true },
      }),
      prisma.counselingAlert.count({
        where: { tenantId, status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
      prisma.counselingAlert.groupBy({
        by: ["type"],
        where: { tenantId },
        _count: { _all: true },
      }),
      prisma.counselingSession.count({
        where: { tenantId, followUpDate: { lt: new Date() }, followUpDone: false },
      }),
      prisma.counselingSession.count({
        where: { tenantId, severity: "CRITICAL", status: { not: "COMPLETED" } },
      }),
    ])

    return {
      totalSessions,
      sessionsByType,
      sessionsBySeverity,
      openAlerts,
      alertsByType,
      followUpsPending,
      criticalCases,
    }
  }

  // ─── Student Profile ───────────────────────────────────

  static async getStudentCounselingHistory(tenantId: string, studentId: string) {
    const [sessions, alerts] = await Promise.all([
      prisma.counselingSession.findMany({
        where: { tenantId, studentId },
        orderBy: { sessionDate: "desc" },
      }),
      prisma.counselingAlert.findMany({
        where: { tenantId, studentId },
        orderBy: { createdAt: "desc" },
      }),
    ])

    return { sessions, alerts }
  }
}
