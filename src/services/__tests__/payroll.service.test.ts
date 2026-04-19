/**
 * Payroll Service Unit Tests
 * ──────────────────────────
 */

import { PayrollService } from "../payroll.service"

// Mock Prisma client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    payroll: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    payHead: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    salaryTemplate: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    staff: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

describe("PayrollService", () => {
  const mockTenantId = "test-tenant-id"

  describe("getPayrolls", () => {
    it("should fetch payrolls successfully", async () => {
      const { prisma } = require("@/lib/prisma")
      const mockPayrolls = [
        { id: "payroll-1", staffId: "staff-1", month: 1, year: 2024, netSalary: 50000 },
        { id: "payroll-2", staffId: "staff-2", month: 1, year: 2024, netSalary: 60000 },
      ]

      prisma.payroll.findMany.mockResolvedValue(mockPayrolls)

      const result = await PayrollService.getPayrolls(mockTenantId, {
        month: 1,
        year: 2024,
      })

      expect(result.success).toBe(true)
      expect(result.payrolls).toEqual(mockPayrolls)
    })
  })

  describe("getPayrollStatistics", () => {
    it("should fetch payroll statistics", async () => {
      const { prisma } = require("@/lib/prisma")
      prisma.payroll.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(40)
      prisma.staff.count.mockResolvedValue(100)

      const result = await PayrollService.getPayrollStatistics(mockTenantId, 1, 2024)

      expect(result.success).toBe(true)
      expect(result.statistics).toEqual({
        totalStaff: 100,
        processedPayrolls: 50,
        pendingPayrolls: 10,
        paidPayrolls: 40,
      })
    })
  })

  describe("createPayHead", () => {
    it("should create a pay head successfully", async () => {
      const { prisma } = require("@/lib/prisma")
      const mockPayHead = {
        id: "payhead-1",
        name: "Basic Salary",
        code: "BASIC",
        type: "EARNING",
        tenantId: mockTenantId,
      }

      prisma.payHead.create.mockResolvedValue(mockPayHead)

      const result = await PayrollService.createPayHead(mockTenantId, {
        name: "Basic Salary",
        code: "BASIC",
        type: "EARNING",
        isPercent: false,
        amount: 5000,
      })

      expect(result.success).toBe(true)
      expect(result.payHead).toEqual(mockPayHead)
    })
  })
})
