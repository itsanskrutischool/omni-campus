import { InventoryService } from "../inventory.service"

// Mock Prisma client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    stockCategory: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    stockItem: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    stockStore: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    stockBalance: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    stockPurchase: {
      create: jest.fn(),
    },
    stockTransfer: {
      create: jest.fn(),
    },
    stockAdjustment: {
      create: jest.fn(),
    },
  },
}))

// Mock AuditService
jest.mock("../audit.service", () => ({
  AuditService: {
    logAction: jest.fn(),
  },
}))

describe("InventoryService", () => {
  const tenantId = "test-tenant"

  describe("getCategories", () => {
    it("should return all categories for a tenant", async () => {
      const mockCategories = [
        { id: "1", name: "Electronics", code: "ELEC" },
        { id: "2", name: "Furniture", code: "FURN" },
      ]

      const { prisma } = require("@/lib/prisma")
      prisma.stockCategory.findMany.mockResolvedValue(mockCategories)

      const result = await InventoryService.getCategories(tenantId)

      expect(prisma.stockCategory.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        orderBy: { name: "asc" },
      })
      expect(result).toEqual(mockCategories)
    })
  })

  describe("createCategory", () => {
    it("should create a new category", async () => {
      const categoryData = { name: "Books", code: "BOOK" }
      const mockCategory = { id: "1", ...categoryData, tenantId }

      const { prisma } = require("@/lib/prisma")
      prisma.stockCategory.create.mockResolvedValue(mockCategory)

      const result = await InventoryService.createCategory(tenantId, categoryData)

      expect(prisma.stockCategory.create).toHaveBeenCalledWith({
        data: { ...categoryData, tenantId },
      })
      expect(result).toEqual(mockCategory)
    })
  })

  describe("getItems", () => {
    it("should return items for a tenant with optional category filter", async () => {
      const mockItems = [
        { id: "1", name: "Laptop", code: "LAP001", categoryId: "cat1" },
        { id: "2", name: "Desk", code: "DSK001", categoryId: "cat2" },
      ]

      const { prisma } = require("@/lib/prisma")
      prisma.stockItem.findMany.mockResolvedValue(mockItems)

      const result = await InventoryService.getItems(tenantId)

      expect(prisma.stockItem.findMany).toHaveBeenCalled()
      expect(result).toEqual(mockItems)
    })
  })

  describe("getInventoryStatistics", () => {
    it("should return inventory statistics", async () => {
      const mockStats = {
        totalItems: 100,
        totalCategories: 10,
        totalStores: 5,
        lowStockItems: 3,
      }

      const { prisma } = require("@/lib/prisma")
      prisma.stockItem.count.mockResolvedValue(100)
      prisma.stockCategory.count.mockResolvedValue(10)
      prisma.stockStore.count.mockResolvedValue(5)

      const result = await InventoryService.getInventoryStatistics(tenantId)

      expect(result).toHaveProperty("totalItems", 100)
      expect(result).toHaveProperty("totalCategories", 10)
      expect(result).toHaveProperty("totalStores", 5)
    })
  })
})
