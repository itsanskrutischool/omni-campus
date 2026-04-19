import { prisma } from "@/lib/prisma"
import { AuditService } from "@/services/audit.service"

// ─── Live Class Links Service ─────────────────────────────────────────────────

export class LiveClassService {
  /**
   * Create live class link
   */
  static async createLiveClass(tenantId: string, userId: string | undefined, options: {
    title: string
    subjectId?: string
    classRoomId?: string
    sectionId?: string
    platform: "ZOOM" | "GOOGLE_MEET" | "MICROSOFT_TEAMS" | "OTHER"
    meetingUrl: string
    meetingId?: string
    password?: string
    scheduledAt: Date
    duration?: number
    description?: string
    recurring?: boolean
  }) {
    try {
      // Get a default subject if not provided
      let subjectId = options.subjectId
      if (!subjectId) {
        const defaultSubject = await prisma.subject.findFirst({
          where: { tenantId },
        })
        subjectId = defaultSubject?.id || ""
      }

      // Verify class exists if specified
      if (options.classRoomId) {
        const classRoom = await prisma.classRoom.findUnique({
          where: { id: options.classRoomId },
        })

        if (!classRoom || classRoom.tenantId !== tenantId) {
          throw new Error("Invalid class room")
        }
      }

      // Create live class record (using LessonPlan as base since we don't have a dedicated LiveClass model)
      const liveClass = await prisma.lessonPlan.create({
        data: {
          teacherId: userId || "SYSTEM",
          subjectId,
          classRoomId: options.classRoomId || "",
          chapter: options.title,
          topic: options.description || "",
          objectives: JSON.stringify({
            platform: options.platform,
            meetingUrl: options.meetingUrl,
            meetingId: options.meetingId,
            password: options.password,
            isLiveClass: true,
          }),
          materials: JSON.stringify({
            scheduledAt: options.scheduledAt,
            duration: options.duration || 60,
            recurring: options.recurring || false,
          }),
          date: options.scheduledAt,
          duration: options.duration || 60,
          status: "PLANNED",
          tenantId,
        },
      })

      await AuditService.log({
        tenantId,
        userId,
        action: "CREATE",
        module: "live-class",
        entityType: "LiveClass",
        entityId: liveClass.id,
        summary: `Created live class: ${options.title} via ${options.platform}`,
      })

      return {
        success: true,
        liveClass,
        message: "Live class created successfully",
      }
    } catch (error: any) {
      console.error("Live class creation failed:", error)
      throw new Error(`Failed to create live class: ${error.message}`)
    }
  }

  /**
   * Get live classes
   */
  static async getLiveClasses(tenantId: string, filters: {
    subjectId?: string
    classRoomId?: string
    sectionId?: string
    status?: string
    dateFrom?: Date
    dateTo?: Date
  } = {}) {
    try {
      const where: any = {
        tenantId,
      }

      if (filters.subjectId) {
        where.subjectId = filters.subjectId
      }

      if (filters.classRoomId) {
        where.classRoomId = filters.classRoomId
      }

      if (filters.status) {
        where.status = filters.status
      }

      if (filters.dateFrom && filters.dateTo) {
        where.date = {
          gte: filters.dateFrom,
          lte: filters.dateTo,
        }
      }

      const lessonPlans = await prisma.lessonPlan.findMany({
        where,
        include: {
          subject: true,
          classRoom: true,
        },
        orderBy: {
          date: "asc",
        },
      })

      // Filter for live classes only
      const liveClasses = lessonPlans.filter(lp => {
        try {
          const objectives = JSON.parse(lp.objectives || "{}")
          return objectives.isLiveClass === true
        } catch {
          return false
        }
      })

      return {
        success: true,
        liveClasses,
        count: liveClasses.length,
      }
    } catch (error: any) {
      console.error("Failed to get live classes:", error)
      throw new Error(`Failed to get live classes: ${error.message}`)
    }
  }

  /**
   * Update live class
   */
  static async updateLiveClass(tenantId: string, userId: string | undefined, classId: string, updates: {
    title?: string
    meetingUrl?: string
    meetingId?: string
    password?: string
    scheduledAt?: Date
    duration?: number
    status?: string
  }) {
    try {
      const existing = await prisma.lessonPlan.findUnique({
        where: { id: classId },
      })

      if (!existing) {
        throw new Error("Live class not found")
      }

      if (existing.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      const currentObjectives = JSON.parse(existing.objectives || "{}")
      const currentMaterials = JSON.parse(existing.materials || "{}")

      const updateData: any = {
        ...(updates.title && { chapter: updates.title }),
        ...(updates.scheduledAt && { date: updates.scheduledAt }),
        ...(updates.duration && { duration: updates.duration }),
        ...(updates.status && { status: updates.status }),
      }

      if (updates.meetingUrl || updates.meetingId || updates.password) {
        updateData.objectives = JSON.stringify({
          ...currentObjectives,
          ...(updates.meetingUrl && { meetingUrl: updates.meetingUrl }),
          ...(updates.meetingId && { meetingId: updates.meetingId }),
          ...(updates.password && { password: updates.password }),
        })
      }

      if (updates.scheduledAt || updates.duration) {
        updateData.materials = JSON.stringify({
          ...currentMaterials,
          ...(updates.scheduledAt && { scheduledAt: updates.scheduledAt }),
          ...(updates.duration && { duration: updates.duration }),
        })
      }

      const updated = await prisma.lessonPlan.update({
        where: { id: classId },
        data: updateData,
      })

      await AuditService.log({
        tenantId,
        userId,
        action: "UPDATE",
        module: "live-class",
        entityType: "LiveClass",
        entityId: classId,
        summary: `Updated live class: ${updated.chapter}`,
      })

      return {
        success: true,
        liveClass: updated,
        message: "Live class updated successfully",
      }
    } catch (error: any) {
      console.error("Live class update failed:", error)
      throw new Error(`Failed to update live class: ${error.message}`)
    }
  }

  /**
   * Delete live class
   */
  static async deleteLiveClass(tenantId: string, userId: string | undefined, classId: string) {
    try {
      const existing = await prisma.lessonPlan.findUnique({
        where: { id: classId },
      })

      if (!existing) {
        throw new Error("Live class not found")
      }

      if (existing.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      await prisma.lessonPlan.delete({
        where: { id: classId },
      })

      await AuditService.log({
        tenantId,
        userId,
        action: "DELETE",
        module: "live-class",
        entityType: "LiveClass",
        entityId: classId,
        summary: `Deleted live class: ${existing.chapter}`,
      })

      return {
        success: true,
        message: "Live class deleted successfully",
      }
    } catch (error: any) {
      console.error("Live class deletion failed:", error)
      throw new Error(`Failed to delete live class: ${error.message}`)
    }
  }

  /**
   * Get upcoming live classes for students
   */
  static async getUpcomingClasses(tenantId: string, studentId: string) {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      })

      if (!student) {
        throw new Error("Student not found")
      }

      const lessonPlans = await prisma.lessonPlan.findMany({
        where: {
          tenantId,
          classRoomId: student.classRoomId || undefined,
          status: "PLANNED",
          date: {
            gte: new Date(),
          },
        },
        orderBy: {
          date: "asc",
        },
      })

      const liveClasses = lessonPlans.filter(lp => {
        try {
          const objectives = JSON.parse(lp.objectives || "{}")
          return objectives.isLiveClass === true
        } catch {
          return false
        }
      })

      return {
        success: true,
        liveClasses,
        count: liveClasses.length,
      }
    } catch (error: any) {
      console.error("Failed to get upcoming classes:", error)
      throw new Error(`Failed to get upcoming classes: ${error.message}`)
    }
  }

  /**
   * Generate Zoom meeting link (mock implementation)
   */
  static async generateZoomLink(tenantId: string, options: {
    topic: string
    startTime: Date
    duration: number
  }) {
    // In production, this would call Zoom API
    const meetingId = Math.random().toString(36).substring(2, 11).toUpperCase()
    const password = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const meetingUrl = `https://zoom.us/j/${meetingId}?pwd=${password}`

    return {
      success: true,
      meetingUrl,
      meetingId,
      password,
      message: "Zoom meeting link generated",
    }
  }

  /**
   * Generate Google Meet link
   */
  static async generateGoogleMeetLink() {
    const meetingUrl = `https://meet.google.com/${Math.random().toString(36).substring(2, 10)}`

    return {
      success: true,
      meetingUrl,
      message: "Google Meet link generated",
    }
  }
}
