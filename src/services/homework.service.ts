import { prisma } from "@/lib/prisma"
import { AuditService } from "@/services/audit.service"

// ─── Homework / Assignment Service ──────────────────────────────────────────

export class HomeworkService {
  /**
   * Create homework assignment
   */
  static async createHomework(tenantId: string, userId: string | undefined, options: {
    title: string
    description: string
    subjectId?: string
    classRoomId?: string
    sectionId?: string
    assignedBy: string
    dueDate: Date
    attachments?: string[]
    maxMarks?: number
  }) {
    try {
      const homework = await prisma.homework.create({
        data: {
          title: options.title,
          description: options.description,
          subjectId: options.subjectId,
          classRoomId: options.classRoomId,
          sectionId: options.sectionId,
          assignedBy: options.assignedBy,
          dueDate: options.dueDate,
          attachments: options.attachments ? JSON.stringify(options.attachments) : null,
          maxMarks: options.maxMarks || 100,
          tenantId,
        },
      })

      await AuditService.log({
        tenantId,
        userId,
        action: "CREATE",
        module: "homework",
        entityType: "Homework",
        entityId: homework.id,
        summary: `Created homework: ${options.title} due on ${options.dueDate.toLocaleDateString()}`,
      })

      return {
        success: true,
        homework,
        message: "Homework created successfully",
      }
    } catch (error: any) {
      console.error("Homework creation failed:", error)
      throw new Error(`Failed to create homework: ${error.message}`)
    }
  }

  /**
   * Get homework assignments
   */
  static async getHomework(tenantId: string, filters: {
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

      if (filters.sectionId) {
        where.sectionId = filters.sectionId
      }

      if (filters.dateFrom && filters.dateTo) {
        where.dueDate = {
          gte: filters.dateFrom,
          lte: filters.dateTo,
        }
      }

      const homework = await prisma.homework.findMany({
        where,
        include: {
          submissions: true,
        },
        orderBy: {
          dueDate: "asc",
        },
      })

      return {
        success: true,
        homework,
        count: homework.length,
      }
    } catch (error: any) {
      console.error("Failed to get homework:", error)
      throw new Error(`Failed to get homework: ${error.message}`)
    }
  }

  /**
   * Submit homework
   */
  static async submitHomework(tenantId: string, userId: string | undefined, options: {
    homeworkId: string
    studentId: string
    content?: string
    fileUrl?: string
  }) {
    try {
      const homework = await prisma.homework.findUnique({
        where: { id: options.homeworkId },
      })

      if (!homework) {
        throw new Error("Homework not found")
      }

      if (homework.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      const submission = await prisma.homeworkSubmission.create({
        data: {
          homeworkId: options.homeworkId,
          studentId: options.studentId,
          content: options.content,
          fileUrl: options.fileUrl,
          status: "SUBMITTED",
        },
      })

      await AuditService.log({
        tenantId,
        userId,
        action: "CREATE",
        module: "homework",
        entityType: "HomeworkSubmission",
        entityId: submission.id,
        summary: `Homework submitted by student ${options.studentId}`,
      })

      return {
        success: true,
        submission,
        message: "Homework submitted successfully",
      }
    } catch (error: any) {
      console.error("Homework submission failed:", error)
      throw new Error(`Failed to submit homework: ${error.message}`)
    }
  }

  /**
   * Grade homework submission
   */
  static async gradeSubmission(tenantId: string, userId: string | undefined, submissionId: string, options: {
    marks: number
    remarks?: string
  }) {
    try {
      const submission = await prisma.homeworkSubmission.findUnique({
        where: { id: submissionId },
        include: {
          homework: true,
        },
      })

      if (!submission) {
        throw new Error("Submission not found")
      }

      if (submission.homework.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      const graded = await prisma.homeworkSubmission.update({
        where: { id: submissionId },
        data: {
          marks: options.marks,
          remarks: options.remarks,
          status: "GRADED",
        },
      })

      await AuditService.log({
        tenantId,
        userId,
        action: "UPDATE",
        module: "homework",
        entityType: "HomeworkSubmission",
        entityId: submissionId,
        summary: `Graded homework submission: ${options.marks}/${submission.homework.maxMarks}`,
      })

      return {
        success: true,
        submission: graded,
        message: "Submission graded successfully",
      }
    } catch (error: any) {
      console.error("Homework grading failed:", error)
      throw new Error(`Failed to grade submission: ${error.message}`)
    }
  }

  /**
   * Get homework for a student
   */
  static async getStudentHomework(tenantId: string, studentId: string) {
    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      })

      if (!student) {
        throw new Error("Student not found")
      }

      const homework = await prisma.homework.findMany({
        where: {
          tenantId,
          classRoomId: student.classRoomId || undefined,
          sectionId: student.sectionId || undefined,
        },
        include: {
          submissions: {
            where: { studentId },
          },
        },
        orderBy: {
          dueDate: "asc",
        },
      })

      return {
        success: true,
        homework,
        count: homework.length,
      }
    } catch (error: any) {
      console.error("Failed to get student homework:", error)
      throw new Error(`Failed to get student homework: ${error.message}`)
    }
  }

  /**
   * Get homework submissions
   */
  static async getSubmissions(tenantId: string, homeworkId: string) {
    try {
      const homework = await prisma.homework.findUnique({
        where: { id: homeworkId },
      })

      if (!homework) {
        throw new Error("Homework not found")
      }

      if (homework.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      const submissions = await prisma.homeworkSubmission.findMany({
        where: { homeworkId },
        orderBy: {
          submittedAt: "asc",
        },
      })

      return {
        success: true,
        submissions,
        count: submissions.length,
        pendingCount: submissions.filter(s => s.status === "SUBMITTED").length,
        gradedCount: submissions.filter(s => s.status === "GRADED").length,
      }
    } catch (error: any) {
      console.error("Failed to get submissions:", error)
      throw new Error(`Failed to get submissions: ${error.message}`)
    }
  }

  /**
   * Update homework
   */
  static async updateHomework(tenantId: string, userId: string | undefined, homeworkId: string, updates: {
    title?: string
    description?: string
    dueDate?: Date
    maxMarks?: number
    attachments?: string[]
  }) {
    try {
      const existing = await prisma.homework.findUnique({
        where: { id: homeworkId },
      })

      if (!existing) {
        throw new Error("Homework not found")
      }

      if (existing.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      const updateData: any = {}
      if (updates.title) updateData.title = updates.title
      if (updates.description) updateData.description = updates.description
      if (updates.dueDate) updateData.dueDate = updates.dueDate
      if (updates.maxMarks) updateData.maxMarks = updates.maxMarks
      if (updates.attachments) updateData.attachments = JSON.stringify(updates.attachments)

      const updated = await prisma.homework.update({
        where: { id: homeworkId },
        data: updateData,
      })

      await AuditService.log({
        tenantId,
        userId,
        action: "UPDATE",
        module: "homework",
        entityType: "Homework",
        entityId: homeworkId,
        summary: `Updated homework: ${updated.title}`,
      })

      return {
        success: true,
        homework: updated,
        message: "Homework updated successfully",
      }
    } catch (error: any) {
      console.error("Homework update failed:", error)
      throw new Error(`Failed to update homework: ${error.message}`)
    }
  }

  /**
   * Delete homework
   */
  static async deleteHomework(tenantId: string, userId: string | undefined, homeworkId: string) {
    try {
      const existing = await prisma.homework.findUnique({
        where: { id: homeworkId },
      })

      if (!existing) {
        throw new Error("Homework not found")
      }

      if (existing.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      // Delete submissions first
      await prisma.homeworkSubmission.deleteMany({
        where: { homeworkId },
      })

      // Delete homework
      await prisma.homework.delete({
        where: { id: homeworkId },
      })

      await AuditService.log({
        tenantId,
        userId,
        action: "DELETE",
        module: "homework",
        entityType: "Homework",
        entityId: homeworkId,
        summary: `Deleted homework: ${existing.title}`,
      })

      return {
        success: true,
        message: "Homework deleted successfully",
      }
    } catch (error: any) {
      console.error("Homework deletion failed:", error)
      throw new Error(`Failed to delete homework: ${error.message}`)
    }
  }

  /**
   * Get homework statistics
   */
  static async getHomeworkStats(tenantId: string) {
    try {
      const homework = await prisma.homework.findMany({
        where: { tenantId },
        include: {
          submissions: true,
        },
      })

      const stats = {
        total: homework.length,
        withSubmissions: homework.filter(h => h.submissions.length > 0).length,
        withoutSubmissions: homework.filter(h => h.submissions.length === 0).length,
        totalSubmissions: homework.reduce((sum, h) => sum + h.submissions.length, 0),
        gradedSubmissions: homework.reduce((sum, h) => sum + h.submissions.filter(s => s.status === "GRADED").length, 0),
        pendingSubmissions: homework.reduce((sum, h) => sum + h.submissions.filter(s => s.status === "SUBMITTED").length, 0),
      }

      return {
        success: true,
        stats,
      }
    } catch (error: any) {
      console.error("Failed to get homework stats:", error)
      throw new Error(`Failed to get homework stats: ${error.message}`)
    }
  }
}
