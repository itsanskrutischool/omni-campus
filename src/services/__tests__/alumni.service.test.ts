/**
 * Alumni Service Unit Tests
 * ─────────────────────────
 */

import { AlumniService } from "../alumni.service"

// Mock Prisma client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    alumni: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    alumniEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    alumniDonation: {
      create: jest.fn(),
    },
    alumniAchievement: {
      create: jest.fn(),
    },
  },
}))

describe("AlumniService", () => {
  const mockTenantId = "test-tenant-id"

  describe("registerAlumni", () => {
    it("should register an alumni successfully", async () => {
      const { prisma } = require("@/lib/prisma")
      const mockAlumni = {
        id: "alumni-1",
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        graduationYear: "2020",
        course: "Computer Science",
        tenantId: mockTenantId,
      }

      prisma.alumni.create.mockResolvedValue(mockAlumni)

      const result = await AlumniService.registerAlumni(mockTenantId, {
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        graduationYear: "2020",
        course: "Computer Science",
      })

      expect(result.success).toBe(true)
      expect(result.alumni).toEqual(mockAlumni)
    })
  })

  describe("getAlumni", () => {
    it("should fetch alumni successfully", async () => {
      const { prisma } = require("@/lib/prisma")
      const mockAlumni = [
        { id: "alumni-1", name: "John Doe", batch: "2020" },
        { id: "alumni-2", name: "Jane Smith", batch: "2019" },
      ]

      prisma.alumni.findMany.mockResolvedValue(mockAlumni)

      const result = await AlumniService.getAlumni(mockTenantId)

      expect(result.success).toBe(true)
      expect(result.alumni).toEqual(mockAlumni)
    })
  })

  describe("createEvent", () => {
    it("should create an alumni event successfully", async () => {
      const { prisma } = require("@/lib/prisma")
      const mockEvent = {
        id: "event-1",
        title: "Annual Reunion",
        eventDate: new Date(),
        location: "Main Hall",
        tenantId: mockTenantId,
      }

      prisma.alumniEvent.create.mockResolvedValue(mockEvent)

      const result = await AlumniService.createEvent(mockTenantId, {
        title: "Annual Reunion",
        description: "Annual alumni reunion event",
        eventDate: new Date(),
        location: "Main Hall",
        type: "REUNION",
      })

      expect(result.success).toBe(true)
      expect(result.event).toEqual(mockEvent)
    })
  })

  describe("getAlumniStatistics", () => {
    it("should fetch alumni statistics", async () => {
      const { prisma } = require("@/lib/prisma")
      prisma.alumni.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(75)
      prisma.alumniEvent.count.mockResolvedValue(10)

      const result = await AlumniService.getAlumniStatistics(mockTenantId)

      expect(result.success).toBe(true)
      expect(result.statistics).toEqual({
        totalAlumni: 100,
        verifiedAlumni: 75,
        upcomingEvents: 10,
        totalDonations: 0,
      })
    })
  })
})
