import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

// ─── Recruitment Service ─────────────────────────────────────────────────

export class RecruitmentService {
  /**
   * Create a new job vacancy
   */
  static async createJobVacancy(tenantId: string, data: {
    title: string
    description: string
    department: string
    location: string
    type: "FULL_TIME" | "PART_TIME" | "CONTRACT"
    salary?: string
    startDate: Date
    endDate?: Date
  }) {
    try {
      const vacancy = await prisma.jobVacancy.create({
        data: {
          ...data,
          tenantId,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "RECRUITMENT",
        entityType: "JobVacancy",
        entityId: vacancy.id,
        summary: `Created job vacancy: ${vacancy.title}`,
      })

      return {
        success: true,
        vacancy,
      }
    } catch (error: any) {
      console.error("Job vacancy creation failed:", error)
      throw new Error(`Failed to create job vacancy: ${error.message}`)
    }
  }

  /**
   * Get all job vacancies for a tenant
   */
  static async getJobVacancies(tenantId: string, filters?: {
    status?: string
    department?: string
  }) {
    try {
      const where: any = { tenantId }

      if (filters?.status) where.status = filters.status
      if (filters?.department) where.department = filters.department

      const vacancies = await prisma.jobVacancy.findMany({
        where,
        include: {
          _count: {
            select: { applications: true },
          },
        },
        orderBy: {
          startDate: "desc",
        },
      })

      return {
        success: true,
        vacancies,
      }
    } catch (error: any) {
      console.error("Failed to fetch job vacancies:", error)
      throw new Error(`Failed to fetch job vacancies: ${error.message}`)
    }
  }

  /**
   * Get job vacancy by ID
   */
  static async getJobVacancy(tenantId: string, vacancyId: string) {
    try {
      const vacancy = await prisma.jobVacancy.findUnique({
        where: {
          id: vacancyId,
          tenantId,
        },
        include: {
          applications: {
            orderBy: {
              appliedAt: "desc",
            },
          },
        },
      })

      if (!vacancy) {
        throw new Error("Job vacancy not found")
      }

      return {
        success: true,
        vacancy,
      }
    } catch (error: any) {
      console.error("Failed to fetch job vacancy:", error)
      throw new Error(`Failed to fetch job vacancy: ${error.message}`)
    }
  }

  /**
   * Update job vacancy
   */
  static async updateJobVacancy(tenantId: string, vacancyId: string, data: {
    title?: string
    description?: string
    department?: string
    location?: string
    type?: string
    salary?: string
    startDate?: Date
    endDate?: Date
    status?: string
  }) {
    try {
      const vacancy = await prisma.jobVacancy.update({
        where: {
          id: vacancyId,
          tenantId,
        },
        data,
      })

      await AuditService.log({
        tenantId,
        action: "UPDATE",
        module: "RECRUITMENT",
        entityType: "JobVacancy",
        entityId: vacancyId,
        summary: `Updated job vacancy: ${vacancy.title}`,
      })

      return {
        success: true,
        vacancy,
      }
    } catch (error: any) {
      console.error("Job vacancy update failed:", error)
      throw new Error(`Failed to update job vacancy: ${error.message}`)
    }
  }

  /**
   * Delete job vacancy
   */
  static async deleteJobVacancy(tenantId: string, vacancyId: string) {
    try {
      await prisma.jobApplication.deleteMany({
        where: { vacancyId },
      })

      await prisma.jobVacancy.delete({
        where: {
          id: vacancyId,
          tenantId,
        },
      })

      await AuditService.log({
        tenantId,
        action: "DELETE",
        module: "RECRUITMENT",
        entityType: "JobVacancy",
        entityId: vacancyId,
        summary: `Deleted job vacancy`,
      })

      return {
        success: true,
      }
    } catch (error: any) {
      console.error("Job vacancy deletion failed:", error)
      throw new Error(`Failed to delete job vacancy: ${error.message}`)
    }
  }

  /**
   * Submit job application
   */
  static async submitJobApplication(tenantId: string, data: {
    vacancyId: string
    name: string
    email: string
    phone: string
    resume?: string
    coverLetter?: string
  }) {
    try {
      const application = await prisma.jobApplication.create({
        data: {
          ...data,
          tenantId,
        },
        include: {
          vacancy: true,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "RECRUITMENT",
        entityType: "JobApplication",
        entityId: application.id,
        summary: `Submitted job application for ${application.vacancy.title}`,
      })

      return {
        success: true,
        application,
      }
    } catch (error: any) {
      console.error("Job application submission failed:", error)
      throw new Error(`Failed to submit job application: ${error.message}`)
    }
  }

  /**
   * Get job applications for a vacancy
   */
  static async getJobApplications(tenantId: string, vacancyId: string) {
    try {
      const applications = await prisma.jobApplication.findMany({
        where: {
          vacancyId,
          tenantId,
        },
        include: {
          vacancy: true,
        },
        orderBy: {
          appliedAt: "desc",
        },
      })

      return {
        success: true,
        applications,
      }
    } catch (error: any) {
      console.error("Failed to fetch job applications:", error)
      throw new Error(`Failed to fetch job applications: ${error.message}`)
    }
  }

  /**
   * Update job application status
   */
  static async updateApplicationStatus(tenantId: string, applicationId: string, status: "PENDING" | "SHORTLISTED" | "REJECTED" | "HIRED") {
    try {
      const application = await prisma.jobApplication.update({
        where: {
          id: applicationId,
          tenantId,
        },
        data: { status },
        include: {
          vacancy: true,
        },
      })

      await AuditService.log({
        tenantId,
        action: "UPDATE",
        module: "RECRUITMENT",
        entityType: "JobApplication",
        entityId: applicationId,
        summary: `Updated application status to ${status} for ${application.vacancy.title}`,
      })

      return {
        success: true,
        application,
      }
    } catch (error: any) {
      console.error("Application status update failed:", error)
      throw new Error(`Failed to update application status: ${error.message}`)
    }
  }

  /**
   * Get recruitment statistics
   */
  static async getRecruitmentStatistics(tenantId: string) {
    try {
      const [
        totalVacancies,
        openVacancies,
        totalApplications,
        pendingApplications,
        shortlistedApplications,
        hiredApplications,
      ] = await Promise.all([
        prisma.jobVacancy.count({ where: { tenantId } }),
        prisma.jobVacancy.count({ where: { tenantId, status: "OPEN" } }),
        prisma.jobApplication.count({ where: { tenantId } }),
        prisma.jobApplication.count({ where: { tenantId, status: "PENDING" } }),
        prisma.jobApplication.count({ where: { tenantId, status: "SHORTLISTED" } }),
        prisma.jobApplication.count({ where: { tenantId, status: "HIRED" } }),
      ])

      return {
        success: true,
        statistics: {
          totalVacancies,
          openVacancies,
          totalApplications,
          pendingApplications,
          shortlistedApplications,
          hiredApplications,
        },
      }
    } catch (error: any) {
      console.error("Failed to fetch recruitment statistics:", error)
      throw new Error(`Failed to fetch recruitment statistics: ${error.message}`)
    }
  }
}
