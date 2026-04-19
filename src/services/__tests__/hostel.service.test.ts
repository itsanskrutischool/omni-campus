/**
 * Hostel Service Unit Tests
 * ─────────────────────────
 */

import { HostelService } from "../hostel.service"

// Mock Prisma client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    hostel: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    room: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    roomAllocation: {
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

describe("HostelService", () => {
  const mockTenantId = "test-tenant-id"

  describe("createHostel", () => {
    it("should create a hostel successfully", async () => {
      const { prisma } = require("@/lib/prisma")
      const mockHostel = {
        id: "hostel-1",
        name: "Main Building",
        code: "MB",
        address: "North Campus",
        capacity: 100,
        tenantId: mockTenantId,
      }

      prisma.hostel.create.mockResolvedValue(mockHostel)

      const result = await HostelService.createHostel(mockTenantId, {
        name: "Main Building",
        code: "MB",
        address: "North Campus",
        capacity: 100,
      })

      expect(result.success).toBe(true)
      expect(result.hostel).toEqual(mockHostel)
    })
  })

  describe("getHostels", () => {
    it("should fetch hostels successfully", async () => {
      const { prisma } = require("@/lib/prisma")
      const mockHostels = [
        { id: "hostel-1", name: "Building A", capacity: 100 },
        { id: "hostel-2", name: "Building B", capacity: 150 },
      ]

      prisma.hostel.findMany.mockResolvedValue(mockHostels)

      const result = await HostelService.getHostels(mockTenantId)

      expect(result.success).toBe(true)
      expect(result.hostels).toEqual(mockHostels)
    })
  })

  describe("getHostelStatistics", () => {
    it("should fetch hostel statistics", async () => {
      const { prisma } = require("@/lib/prisma")
      prisma.hostel.count.mockResolvedValue(5)
      prisma.room.count.mockResolvedValue(100)
      prisma.roomAllocation.count.mockResolvedValue(80)

      const result = await HostelService.getHostelStatistics(mockTenantId)

      expect(result.success).toBe(true)
      expect(result.statistics).toEqual({
        totalHostels: 5,
        totalRooms: 100,
        totalOccupied: 80,
        availableRooms: 20,
      })
    })
  })
})
