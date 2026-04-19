import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

// ─── Alumni Service ─────────────────────────────────────────────────

export class AlumniService {
  /**
   * Register a new alumni
   */
  static async registerAlumni(tenantId: string, data: {
    studentId?: string
    name: string
    email: string
    phone?: string
    graduationYear: string
    course: string
    currentJob?: string
    currentCompany?: string
    location?: string
    linkedin?: string
  }) {
    try {
      const alumni = await prisma.alumni.create({
        data: {
          ...data,
          tenantId,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "ALUMNI",
        entityType: "Alumni",
        entityId: alumni.id,
        summary: `Registered alumni: ${alumni.name}`,
      })

      return {
        success: true,
        alumni,
      }
    } catch (error: any) {
      console.error("Alumni registration failed:", error)
      throw new Error(`Failed to register alumni: ${error.message}`)
    }
  }

  /**
   * Get all alumni for a tenant
   */
  static async getAlumni(tenantId: string, filters?: {
    graduationYear?: string
    course?: string
    isVerified?: boolean
  }) {
    try {
      const where: any = { tenantId }

      if (filters?.graduationYear) where.graduationYear = filters.graduationYear
      if (filters?.course) where.course = filters.course
      if (filters?.isVerified !== undefined) where.isVerified = filters.isVerified

      const alumni = await prisma.alumni.findMany({
        where,
        include: {
          _count: {
            select: {
              donations: true,
              achievements: true,
            },
          },
        },
        orderBy: {
          graduationYear: "desc",
        },
      })

      return {
        success: true,
        alumni,
      }
    } catch (error: any) {
      console.error("Failed to fetch alumni:", error)
      throw new Error(`Failed to fetch alumni: ${error.message}`)
    }
  }

  /**
   * Get alumni by ID
   */
  static async getAlumniById(tenantId: string, alumniId: string) {
    try {
      const alumni = await prisma.alumni.findUnique({
        where: {
          id: alumniId,
          tenantId,
        },
        include: {
          donations: {
            orderBy: {
              donatedAt: "desc",
            },
          },
          achievements: {
            orderBy: {
              achievementDate: "desc",
            },
          },
        },
      })

      if (!alumni) {
        throw new Error("Alumni not found")
      }

      return {
        success: true,
        alumni,
      }
    } catch (error: any) {
      console.error("Failed to fetch alumni:", error)
      throw new Error(`Failed to fetch alumni: ${error.message}`)
    }
  }

  /**
   * Update alumni profile
   */
  static async updateAlumni(tenantId: string, alumniId: string, data: {
    name?: string
    email?: string
    phone?: string
    currentJob?: string
    currentCompany?: string
    location?: string
    linkedin?: string
    isVerified?: boolean
  }) {
    try {
      const alumni = await prisma.alumni.update({
        where: {
          id: alumniId,
          tenantId,
        },
        data,
      })

      await AuditService.log({
        tenantId,
        action: "UPDATE",
        module: "ALUMNI",
        entityType: "Alumni",
        entityId: alumniId,
        summary: `Updated alumni profile: ${alumni.name}`,
      })

      return {
        success: true,
        alumni,
      }
    } catch (error: any) {
      console.error("Alumni update failed:", error)
      throw new Error(`Failed to update alumni: ${error.message}`)
    }
  }

  /**
   * Verify alumni
   */
  static async verifyAlumni(tenantId: string, alumniId: string) {
    try {
      const alumni = await prisma.alumni.update({
        where: {
          id: alumniId,
          tenantId,
        },
        data: {
          isVerified: true,
        },
      })

      await AuditService.log({
        tenantId,
        action: "UPDATE",
        module: "ALUMNI",
        entityType: "Alumni",
        entityId: alumniId,
        summary: `Verified alumni: ${alumni.name}`,
      })

      return {
        success: true,
        alumni,
      }
    } catch (error: any) {
      console.error("Alumni verification failed:", error)
      throw new Error(`Failed to verify alumni: ${error.message}`)
    }
  }

  /**
   * Create alumni event
   */
  static async createEvent(tenantId: string, data: {
    title: string
    description: string
    eventDate: Date
    location?: string
    type: "REUNION" | "MEETUP" | "WEBINAR"
  }) {
    try {
      const event = await prisma.alumniEvent.create({
        data: {
          ...data,
          tenantId,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "ALUMNI",
        entityType: "AlumniEvent",
        entityId: event.id,
        summary: `Created alumni event: ${event.title}`,
      })

      return {
        success: true,
        event,
      }
    } catch (error: any) {
      console.error("Event creation failed:", error)
      throw new Error(`Failed to create event: ${error.message}`)
    }
  }

  /**
   * Get alumni events
   */
  static async getEvents(tenantId: string, filters?: {
    status?: string
    type?: string
  }) {
    try {
      const where: any = { tenantId }

      if (filters?.status) where.status = filters.status
      if (filters?.type) where.type = filters.type

      const events = await prisma.alumniEvent.findMany({
        where,
        orderBy: {
          eventDate: "asc",
        },
      })

      return {
        success: true,
        events,
      }
    } catch (error: any) {
      console.error("Failed to fetch events:", error)
      throw new Error(`Failed to fetch events: ${error.message}`)
    }
  }

  /**
   * Record alumni donation
   */
  static async recordDonation(tenantId: string, data: {
    alumniId: string
    amount: number
    purpose?: string
  }) {
    try {
      const donation = await prisma.alumniDonation.create({
        data: {
          ...data,
          tenantId,
        },
        include: {
          alumni: true,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "ALUMNI",
        entityType: "AlumniDonation",
        entityId: donation.id,
        summary: `Recorded donation of ${data.amount} from ${donation.alumni.name}`,
      })

      return {
        success: true,
        donation,
      }
    } catch (error: any) {
      console.error("Donation recording failed:", error)
      throw new Error(`Failed to record donation: ${error.message}`)
    }
  }

  /**
   * Get alumni donations
   */
  static async getDonations(tenantId: string, alumniId?: string) {
    try {
      const where: any = { tenantId }
      if (alumniId) where.alumniId = alumniId

      const donations = await prisma.alumniDonation.findMany({
        where,
        include: {
          alumni: true,
        },
        orderBy: {
          donatedAt: "desc",
        },
      })

      return {
        success: true,
        donations,
      }
    } catch (error: any) {
      console.error("Failed to fetch donations:", error)
      throw new Error(`Failed to fetch donations: ${error.message}`)
    }
  }

  /**
   * Record alumni achievement
   */
  static async recordAchievement(tenantId: string, data: {
    alumniId: string
    title: string
    description: string
    achievementDate: Date
  }) {
    try {
      const achievement = await prisma.alumniAchievement.create({
        data: {
          ...data,
          tenantId,
        },
        include: {
          alumni: true,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "ALUMNI",
        entityType: "AlumniAchievement",
        entityId: achievement.id,
        summary: `Recorded achievement: ${achievement.title} for ${achievement.alumni.name}`,
      })

      return {
        success: true,
        achievement,
      }
    } catch (error: any) {
      console.error("Achievement recording failed:", error)
      throw new Error(`Failed to record achievement: ${error.message}`)
    }
  }

  /**
   * Get alumni achievements
   */
  static async getAchievements(tenantId: string, alumniId?: string) {
    try {
      const where: any = { tenantId }
      if (alumniId) where.alumniId = alumniId

      const achievements = await prisma.alumniAchievement.findMany({
        where,
        include: {
          alumni: true,
        },
        orderBy: {
          achievementDate: "desc",
        },
      })

      return {
        success: true,
        achievements,
      }
    } catch (error: any) {
      console.error("Failed to fetch achievements:", error)
      throw new Error(`Failed to fetch achievements: ${error.message}`)
    }
  }

  /**
   * Get alumni statistics
   */
  static async getAlumniStatistics(tenantId: string) {
    try {
      const [
        totalAlumni,
        verifiedAlumni,
        totalDonations,
        totalDonationAmount,
        totalAchievements,
        upcomingEvents,
      ] = await Promise.all([
        prisma.alumni.count({ where: { tenantId } }),
        prisma.alumni.count({ where: { tenantId, isVerified: true } }),
        prisma.alumniDonation.count({ where: { tenantId } }),
        prisma.alumniDonation.aggregate({
          where: { tenantId },
          _sum: { amount: true },
        }),
        prisma.alumniAchievement.count({ where: { tenantId } }),
        prisma.alumniEvent.count({ where: { tenantId, status: "UPCOMING" } }),
      ])

      return {
        success: true,
        statistics: {
          totalAlumni,
          verifiedAlumni,
          totalDonations,
          totalDonationAmount: totalDonationAmount._sum.amount || 0,
          totalAchievements,
          upcomingEvents,
        },
      }
    } catch (error: any) {
      console.error("Failed to fetch alumni statistics:", error)
      throw new Error(`Failed to fetch alumni statistics: ${error.message}`)
    }
  }
}
