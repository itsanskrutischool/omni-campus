/**
 * Student Service Tests
 * ────────────────────
 */

import { listStudents, createStudent, getStudentById } from "../student.service"
import { prisma } from "@/lib/prisma"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    student: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    classRoom: {
      findUnique: jest.fn(),
    },
    section: {
      findUnique: jest.fn(),
    },
  },
}))

describe("Student Service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("listStudents", () => {
    it("should return paginated students", async () => {
      const mockStudents = [
        { id: "1", name: "John Doe", status: "ACTIVE", classRoom: { name: "Class 1" } },
        { id: "2", name: "Jane Doe", status: "ACTIVE", classRoom: { name: "Class 1" } },
      ]

      ;(prisma.student.findMany as jest.Mock).mockResolvedValue(mockStudents)
      ;(prisma.student.count as jest.Mock).mockResolvedValue(2)

      const result = await listStudents({
        tenantId: "tenant-1",
        page: 1,
        pageSize: 20,
      })

      expect(result.data).toHaveLength(2)
      expect(result.pagination.total).toBe(2)
      expect(result.pagination.page).toBe(1)
    })

    it("should filter by classRoomId", async () => {
      await listStudents({
        tenantId: "tenant-1",
        classRoomId: "class-1",
      })

      expect(prisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: "tenant-1",
            classRoomId: "class-1",
          }),
        })
      )
    })
  })

  describe("getStudentById", () => {
    it("should return student by id", async () => {
      const mockStudent = {
        id: "1",
        name: "John Doe",
        tenantId: "tenant-1",
        classRoom: { id: "class-1", name: "Class 1" },
      }

      ;(prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent)

      const result = await getStudentById("1", "tenant-1")

      expect(result).toEqual(mockStudent)
    })

    it("should return null if student not found", async () => {
      ;(prisma.student.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await getStudentById("999", "tenant-1")

      expect(result).toBeNull()
    })
  })
})
