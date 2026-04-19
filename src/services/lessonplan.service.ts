import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

export class LessonPlanService {
  static async getPlans(tenantId: string, query?: {
    teacherId?: string
    subjectId?: string
    classRoomId?: string
    fromDate?: Date
    toDate?: Date
    status?: string
    page?: number
    pageSize?: number
  }) {
    const page = query?.page || 1
    const pageSize = query?.pageSize || 20
    const skip = (page - 1) * pageSize

    const where: Record<string, unknown> = { tenantId }
    if (query?.teacherId) where.teacherId = query.teacherId
    if (query?.subjectId) where.subjectId = query.subjectId
    if (query?.classRoomId) where.classRoomId = query.classRoomId
    if (query?.status) where.status = query.status
    if (query?.fromDate || query?.toDate) {
      where.date = {}
      if (query?.fromDate) (where.date as Record<string, Date>).gte = query.fromDate
      if (query?.toDate) (where.date as Record<string, Date>).lte = query.toDate
    }

    const [plans, total] = await Promise.all([
      prisma.lessonPlan.findMany({
        where,
        include: {
          subject: { select: { name: true } },
          classRoom: { select: { name: true } },
        },
        orderBy: { date: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.lessonPlan.count({ where }),
    ])

    return { plans, total, page, pageCount: Math.ceil(total / pageSize) }
  }

  static async createPlan(tenantId: string, userId: string | undefined, payload: {
    teacherId: string
    subjectId: string
    classRoomId: string
    chapter: string
    topic: string
    objectives: string
    materials?: string[]
    activities?: string[]
    homework?: string
    assessment?: string
    duration: number
    date: Date
    attachments?: string[]
  }) {
    const plan = await prisma.lessonPlan.create({
      data: {
        tenantId,
        teacherId: payload.teacherId,
        subjectId: payload.subjectId,
        classRoomId: payload.classRoomId,
        chapter: payload.chapter,
        topic: payload.topic,
        objectives: payload.objectives,
        materials: payload.materials ? JSON.stringify(payload.materials) : null,
        activities: payload.activities ? JSON.stringify(payload.activities) : null,
        homework: payload.homework || null,
        assessment: payload.assessment || null,
        duration: payload.duration,
        date: payload.date,
        attachments: payload.attachments ? JSON.stringify(payload.attachments) : null,
      },
      include: {
        subject: { select: { name: true } },
        classRoom: { select: { name: true } },
      },
    })

    await AuditService.log({
      tenantId,
      userId,
      action: "CREATE",
      module: "academics",
      entityType: "LessonPlan",
      entityId: plan.id,
      summary: `Lesson plan created: ${payload.topic} (${payload.chapter})`,
    })

    return plan
  }

  static async updatePlan(tenantId: string, userId: string | undefined, planId: string, payload: Partial<{
    chapter: string
    topic: string
    objectives: string
    materials: string[]
    activities: string[]
    homework: string
    assessment: string
    duration: number
    date: Date
    status: string
    notes: string
    attachments: string[]
  }>) {
    const existing = await prisma.lessonPlan.findUnique({ where: { id: planId } })
    if (!existing) throw new Error("Lesson plan not found")

    const data: Record<string, unknown> = { ...payload }
    if (payload.materials) data.materials = JSON.stringify(payload.materials)
    if (payload.activities) data.activities = JSON.stringify(payload.activities)
    if (payload.attachments) data.attachments = JSON.stringify(payload.attachments)

    const plan = await prisma.lessonPlan.update({
      where: { id: planId, tenantId },
      data,
    })

    await AuditService.log({
      tenantId,
      userId,
      action: "UPDATE",
      module: "academics",
      entityType: "LessonPlan",
      entityId: planId,
      summary: `Lesson plan updated: ${plan.topic}`,
      oldValue: existing,
      newValue: plan,
    })

    return plan
  }

  static async deletePlan(tenantId: string, userId: string | undefined, planId: string) {
    const plan = await prisma.lessonPlan.findUnique({ where: { id: planId, tenantId } })
    if (!plan) throw new Error("Lesson plan not found")

    await prisma.lessonPlan.delete({ where: { id: planId } })

    await AuditService.log({
      tenantId,
      userId,
      action: "DELETE",
      module: "academics",
      entityType: "LessonPlan",
      entityId: planId,
      summary: `Lesson plan deleted: ${plan.topic}`,
    })
  }

  static async markAsDelivered(tenantId: string, userId: string | undefined, planId: string, notes?: string) {
    const plan = await prisma.lessonPlan.update({
      where: { id: planId, tenantId },
      data: { status: "DELIVERED", notes: notes || undefined },
    })

    await AuditService.log({
      tenantId,
      userId,
      action: "UPDATE",
      module: "academics",
      entityType: "LessonPlan",
      entityId: planId,
      summary: `Lesson plan marked as delivered: ${plan.topic}`,
    })

    return plan
  }

  static async getTeacherStats(tenantId: string, teacherId: string, month?: Date) {
    const startOfMonth = month ? new Date(month.getFullYear(), month.getMonth(), 1) : new Date()
    const endOfMonth = month ? new Date(month.getFullYear(), month.getMonth() + 1, 0) : new Date()

    const [
      totalPlans,
      deliveredPlans,
      pendingPlans,
      cancelledPlans,
    ] = await Promise.all([
      prisma.lessonPlan.count({ where: { tenantId, teacherId, date: { gte: startOfMonth, lte: endOfMonth } } }),
      prisma.lessonPlan.count({ where: { tenantId, teacherId, status: "DELIVERED", date: { gte: startOfMonth, lte: endOfMonth } } }),
      prisma.lessonPlan.count({ where: { tenantId, teacherId, status: "PLANNED", date: { gte: startOfMonth, lte: endOfMonth } } }),
      prisma.lessonPlan.count({ where: { tenantId, teacherId, status: "CANCELLED", date: { gte: startOfMonth, lte: endOfMonth } } }),
    ])

    return { totalPlans, deliveredPlans, pendingPlans, cancelledPlans }
  }
}
