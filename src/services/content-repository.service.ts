import { prisma } from "@/lib/prisma"
import { AuditService } from "@/services/audit.service"

// ─── Content Repository Service ───────────────────────────────────────────────

export class ContentRepositoryService {
  /**
   * Upload content to repository
   */
  static async uploadContent(tenantId: string, userId: string | undefined, options: {
    title: string
    description?: string
    type: "VIDEO" | "PDF" | "LINK" | "NOTES" | "PRESENTATION"
    url?: string
    subjectId?: string
    classRoomId?: string
    chapter?: string
    uploadedBy: string
    thumbnail?: string
    duration?: number
    fileSize?: string
    tags?: string
  }) {
    try {
      const content = await prisma.lMSContent.create({
        data: {
          title: options.title,
          description: options.description,
          type: options.type,
          url: options.url,
          subjectId: options.subjectId,
          classRoomId: options.classRoomId,
          chapter: options.chapter,
          uploadedBy: options.uploadedBy,
          tenantId,
          thumbnail: options.thumbnail,
          duration: options.duration,
          fileSize: options.fileSize,
          tags: options.tags,
          isActive: true,
        },
      })

      await AuditService.log({
        tenantId,
        userId,
        action: "CREATE",
        module: "lms",
        entityType: "LMSContent",
        entityId: content.id,
        summary: `Uploaded ${options.type} content: ${options.title}`,
      })

      return {
        success: true,
        content,
        message: "Content uploaded successfully",
      }
    } catch (error: any) {
      console.error("Content upload failed:", error)
      throw new Error(`Failed to upload content: ${error.message}`)
    }
  }

  /**
   * Get content by filters
   */
  static async getContent(tenantId: string, filters: {
    type?: string
    subjectId?: string
    classRoomId?: string
    chapter?: string
    search?: string
    includeInactive?: boolean
  } = {}) {
    try {
      const where: any = {
        tenantId,
      }

      if (!filters.includeInactive) {
        where.isActive = true
      }

      if (filters.type) {
        where.type = filters.type
      }

      if (filters.subjectId) {
        where.subjectId = filters.subjectId
      }

      if (filters.classRoomId) {
        where.classRoomId = filters.classRoomId
      }

      if (filters.chapter) {
        where.chapter = filters.chapter
      }

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
          { tags: { contains: filters.search, mode: "insensitive" } },
        ]
      }

      const content = await prisma.lMSContent.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
      })

      return {
        success: true,
        content,
        count: content.length,
      }
    } catch (error: any) {
      console.error("Failed to get content:", error)
      throw new Error(`Failed to get content: ${error.message}`)
    }
  }

  /**
   * Update content
   */
  static async updateContent(tenantId: string, userId: string | undefined, contentId: string, updates: {
    title?: string
    description?: string
    url?: string
    thumbnail?: string
    duration?: number
    fileSize?: string
    tags?: string
    isActive?: boolean
  }) {
    try {
      const existing = await prisma.lMSContent.findUnique({
        where: { id: contentId },
      })

      if (!existing) {
        throw new Error("Content not found")
      }

      if (existing.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      const updated = await prisma.lMSContent.update({
        where: { id: contentId },
        data: updates,
      })

      await AuditService.log({
        tenantId,
        userId,
        action: "UPDATE",
        module: "lms",
        entityType: "LMSContent",
        entityId: contentId,
        summary: `Updated content: ${updated.title}`,
        oldValue: { ...existing },
        newValue: { ...updated },
      })

      return {
        success: true,
        content: updated,
        message: "Content updated successfully",
      }
    } catch (error: any) {
      console.error("Content update failed:", error)
      throw new Error(`Failed to update content: ${error.message}`)
    }
  }

  /**
   * Delete content
   */
  static async deleteContent(tenantId: string, userId: string | undefined, contentId: string) {
    try {
      const existing = await prisma.lMSContent.findUnique({
        where: { id: contentId },
      })

      if (!existing) {
        throw new Error("Content not found")
      }

      if (existing.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      await prisma.lMSContent.delete({
        where: { id: contentId },
      })

      await AuditService.log({
        tenantId,
        userId,
        action: "DELETE",
        module: "lms",
        entityType: "LMSContent",
        entityId: contentId,
        summary: `Deleted content: ${existing.title}`,
      })

      return {
        success: true,
        message: "Content deleted successfully",
      }
    } catch (error: any) {
      console.error("Content deletion failed:", error)
      throw new Error(`Failed to delete content: ${error.message}`)
    }
  }

  /**
   * Get content by subject and chapter
   */
  static async getContentByChapter(tenantId: string, subjectId: string, chapter: string) {
    try {
      const content = await prisma.lMSContent.findMany({
        where: {
          tenantId,
          subjectId,
          chapter,
          isActive: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return {
        success: true,
        content,
        count: content.length,
      }
    } catch (error: any) {
      console.error("Failed to get content by chapter:", error)
      throw new Error(`Failed to get content by chapter: ${error.message}`)
    }
  }

  /**
   * Get content statistics
   */
  static async getContentStats(tenantId: string) {
    try {
      const allContent = await prisma.lMSContent.findMany({
        where: { tenantId },
      })

      const stats = {
        total: allContent.length,
        byType: {
          VIDEO: allContent.filter(c => c.type === "VIDEO").length,
          PDF: allContent.filter(c => c.type === "PDF").length,
          LINK: allContent.filter(c => c.type === "LINK").length,
          NOTES: allContent.filter(c => c.type === "NOTES").length,
          PRESENTATION: allContent.filter(c => c.type === "PRESENTATION").length,
        },
        active: allContent.filter(c => c.isActive).length,
        inactive: allContent.filter(c => !c.isActive).length,
        totalDuration: allContent.reduce((sum, c) => sum + (c.duration || 0), 0),
      }

      return {
        success: true,
        stats,
      }
    } catch (error: any) {
      console.error("Failed to get content stats:", error)
      throw new Error(`Failed to get content stats: ${error.message}`)
    }
  }

  /**
   * Bulk upload content
   */
  static async bulkUpload(tenantId: string, userId: string | undefined, contentItems: any[]) {
    const results = []
    let successCount = 0
    let failureCount = 0

    for (const item of contentItems) {
      try {
        await this.uploadContent(tenantId, userId, item)
        results.push({ title: item.title, success: true })
        successCount++
      } catch (error: any) {
        results.push({ title: item.title, success: false, error: error.message })
        failureCount++
      }
    }

    return {
      success: true,
      total: contentItems.length,
      successCount,
      failureCount,
      results,
    }
  }
}
