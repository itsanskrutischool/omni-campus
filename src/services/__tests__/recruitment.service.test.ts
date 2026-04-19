/**
 * Recruitment Service Unit Tests
 * ───────────────────────────────
 */

import { RecruitmentService } from "../recruitment.service"

// Mock Prisma client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    jobVacancy: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    jobApplication: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe("RecruitmentService", () => {
  const mockTenantId = "test-tenant-id"

  describe("createJobVacancy", () => {
    it("should create a job vacancy successfully", async () => {
      const { prisma } = require("@/lib/prisma")
      const mockVacancy = {
        id: "vacancy-1",
        title: "Software Engineer",
        description: "Test description",
        department: "Engineering",
        location: "Remote",
        type: "FULL_TIME",
        startDate: new Date(),
        tenantId: mockTenantId,
      }

      prisma.jobVacancy.create.mockResolvedValue(mockVacancy)

      const result = await RecruitmentService.createJobVacancy(mockTenantId, {
        title: "Software Engineer",
        description: "Test description",
        department: "Engineering",
        location: "Remote",
        type: "FULL_TIME",
        startDate: new Date(),
      })

      expect(result.success).toBe(true)
      expect(result.vacancy).toEqual(mockVacancy)
      expect(prisma.jobVacancy.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: "Software Engineer",
          tenantId: mockTenantId,
        }),
      })
    })
  })

  describe("getJobVacancies", () => {
    it("should fetch job vacancies successfully", async () => {
      const { prisma } = require("@/lib/prisma")
      const mockVacancies = [
        { id: "vacancy-1", title: "Engineer", department: "Tech" },
        { id: "vacancy-2", title: "Designer", department: "Design" },
      ]

      prisma.jobVacancy.findMany.mockResolvedValue(mockVacancies)

      const result = await RecruitmentService.getJobVacancies(mockTenantId)

      expect(result.success).toBe(true)
      expect(result.vacancies).toEqual(mockVacancies)
      expect(prisma.jobVacancy.findMany).toHaveBeenCalledWith({
        where: { tenantId: mockTenantId },
        include: { _count: { select: { applications: true } } },
        orderBy: { startDate: "desc" },
      })
    })
  })

  describe("getRecruitmentStatistics", () => {
    it("should fetch recruitment statistics", async () => {
      const { prisma } = require("@/lib/prisma")
      prisma.jobVacancy.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5)
      prisma.jobApplication.count.mockResolvedValue(20)

      const result = await RecruitmentService.getRecruitmentStatistics(mockTenantId)

      expect(result.success).toBe(true)
      expect(result.statistics).toEqual({
        totalVacancies: 10,
        activeVacancies: 5,
        totalApplications: 20,
      })
    })
  })
})
