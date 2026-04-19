/**
 * Fee Service Tests
 * ────────────────
 */

import { FeeService } from "../fee.service"
import { prisma } from "@/lib/prisma"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    feeRecord: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    feeTransaction: {
      create: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}))

describe("FeeService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getStudentFeeRecords", () => {
    it("should return student fee records", async () => {
      const mockStudent = {
        id: "student-1",
        name: "John Doe",
        tenantId: "tenant-1",
        feeRecords: [
          { id: "record-1", amountDue: 1000, amountPaid: 500, status: "PARTIAL" },
        ],
      }

      ;(prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent)

      const result = await FeeService.getStudentFeeRecords("tenant-1", "student-1")

      expect(result).toBeDefined()
      expect(result?.student.name).toBe("John Doe")
    })
  })

  describe("recordPayment", () => {
    it("should record a payment successfully", async () => {
      const mockRecord = {
        id: "record-1",
        studentId: "student-1",
        amountDue: 1000,
        amountPaid: 0,
        waiver: 0,
        status: "PENDING",
      }

      const mockStudent = {
        id: "student-1",
        name: "John Doe",
        tenantId: "tenant-1",
      }

      ;(prisma.feeRecord.findUnique as jest.Mock).mockResolvedValue(mockRecord)
      ;(prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent)
      ;(prisma.feeRecord.update as jest.Mock).mockResolvedValue({
        ...mockRecord,
        amountPaid: 500,
        status: "PARTIAL",
      })

      const result = await FeeService.recordPayment(
        "tenant-1",
        "record-1",
        500,
        "CASH",
        "Test payment"
      )

      expect(result.amountPaid).toBe(500)
      expect(result.status).toBe("PARTIAL")
    })
  })
})
