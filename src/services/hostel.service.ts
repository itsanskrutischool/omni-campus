import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

// ─── Hostel Management Service ─────────────────────────────────────────────

export class HostelService {
  /**
   * Create a new hostel
   */
  static async createHostel(tenantId: string, data: {
    name: string
    code: string
    address?: string
    capacity: number
  }) {
    try {
      const hostel = await prisma.hostel.create({
        data: {
          ...data,
          tenantId,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "HOSTEL",
        entityType: "Hostel",
        entityId: hostel.id,
        summary: `Created hostel: ${hostel.name}`,
      })

      return {
        success: true,
        hostel,
      }
    } catch (error: any) {
      console.error("Hostel creation failed:", error)
      throw new Error(`Failed to create hostel: ${error.message}`)
    }
  }

  /**
   * Get all hostels for a tenant
   */
  static async getHostels(tenantId: string) {
    try {
      const hostels = await prisma.hostel.findMany({
        where: { tenantId },
        include: {
          rooms: {
            include: {
              roomType: true,
              _count: {
                select: { allocations: true },
              },
            },
          },
          _count: {
            select: { rooms: true },
          },
        },
        orderBy: { name: "asc" },
      })

      return {
        success: true,
        hostels,
      }
    } catch (error: any) {
      console.error("Failed to fetch hostels:", error)
      throw new Error(`Failed to fetch hostels: ${error.message}`)
    }
  }

  /**
   * Create a room type
   */
  static async createRoomType(tenantId: string, data: {
    name: string
    capacity: number
    price: number
  }) {
    try {
      const roomType = await prisma.roomType.create({
        data: {
          ...data,
          tenantId,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "HOSTEL",
        entityType: "RoomType",
        entityId: roomType.id,
        summary: `Created room type: ${roomType.name}`,
      })

      return {
        success: true,
        roomType,
      }
    } catch (error: any) {
      console.error("Room type creation failed:", error)
      throw new Error(`Failed to create room type: ${error.message}`)
    }
  }

  /**
   * Get all room types for a tenant
   */
  static async getRoomTypes(tenantId: string) {
    try {
      const roomTypes = await prisma.roomType.findMany({
        where: { tenantId },
        include: {
          _count: {
            select: { rooms: true },
          },
        },
        orderBy: { name: "asc" },
      })

      return {
        success: true,
        roomTypes,
      }
    } catch (error: any) {
      console.error("Failed to fetch room types:", error)
      throw new Error(`Failed to fetch room types: ${error.message}`)
    }
  }

  /**
   * Create a room
   */
  static async createRoom(tenantId: string, data: {
    number: string
    floor?: string
    hostelId: string
    roomTypeId: string
    capacity: number
  }) {
    try {
      const room = await prisma.room.create({
        data: {
          ...data,
          tenantId,
        },
        include: {
          hostel: true,
          roomType: true,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "HOSTEL",
        entityType: "Room",
        entityId: room.id,
        summary: `Created room: ${room.number} in ${room.hostel.name}`,
      })

      return {
        success: true,
        room,
      }
    } catch (error: any) {
      console.error("Room creation failed:", error)
      throw new Error(`Failed to create room: ${error.message}`)
    }
  }

  /**
   * Get rooms for a hostel
   */
  static async getRooms(tenantId: string, hostelId?: string) {
    try {
      const where: any = { tenantId }
      if (hostelId) where.hostelId = hostelId

      const rooms = await prisma.room.findMany({
        where,
        include: {
          hostel: true,
          roomType: true,
          allocations: {
            where: { status: "ACTIVE" },
            include: {
              student: true,
            },
          },
          _count: {
            select: { allocations: true },
          },
        },
        orderBy: [
          { hostel: { name: "asc" } },
          { number: "asc" },
        ],
      })

      return {
        success: true,
        rooms,
      }
    } catch (error: any) {
      console.error("Failed to fetch rooms:", error)
      throw new Error(`Failed to fetch rooms: ${error.message}`)
    }
  }

  /**
   * Allocate room to student
   */
  static async allocateRoom(tenantId: string, data: {
    roomId: string
    studentId: string
    from: Date
    to?: Date
  }) {
    try {
      const room = await prisma.room.findUnique({
        where: { id: data.roomId },
        include: {
          allocations: {
            where: { status: "ACTIVE" },
          },
        },
      })

      if (!room) {
        throw new Error("Room not found")
      }

      if (room.allocations.length >= room.capacity) {
        throw new Error("Room is at full capacity")
      }

      const allocation = await prisma.roomAllocation.create({
        data: {
          ...data,
          tenantId,
          status: "ACTIVE",
        },
        include: {
          room: {
            include: {
              hostel: true,
              roomType: true,
            },
          },
          student: true,
        },
      })

      // Update room occupied count
      await prisma.room.update({
        where: { id: data.roomId },
        data: {
          occupied: room.allocations.length + 1,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "HOSTEL",
        entityType: "RoomAllocation",
        entityId: allocation.id,
        summary: `Allocated room ${room.number} to student`,
      })

      return {
        success: true,
        allocation,
      }
    } catch (error: any) {
      console.error("Room allocation failed:", error)
      throw new Error(`Failed to allocate room: ${error.message}`)
    }
  }

  /**
   * Get room allocations for a student
   */
  static async getStudentAllocations(tenantId: string, studentId: string) {
    try {
      const allocations = await prisma.roomAllocation.findMany({
        where: {
          tenantId,
          studentId,
        },
        include: {
          room: {
            include: {
              hostel: true,
              roomType: true,
            },
          },
        },
        orderBy: {
          from: "desc",
        },
      })

      return {
        success: true,
        allocations,
      }
    } catch (error: any) {
      console.error("Failed to fetch student allocations:", error)
      throw new Error(`Failed to fetch student allocations: ${error.message}`)
    }
  }

  /**
   * Release room allocation
   */
  static async releaseAllocation(tenantId: string, allocationId: string) {
    try {
      const allocation = await prisma.roomAllocation.findUnique({
        where: { id: allocationId },
        include: {
          room: true,
        },
      })

      if (!allocation) {
        throw new Error("Allocation not found")
      }

      const updated = await prisma.roomAllocation.update({
        where: { id: allocationId },
        data: {
          status: "RELEASED",
          to: new Date(),
        },
      })

      // Update room occupied count
      await prisma.room.update({
        where: { id: allocation.roomId },
        data: {
          occupied: Math.max(0, allocation.room.occupied - 1),
        },
      })

      await AuditService.log({
        tenantId,
        action: "UPDATE",
        module: "HOSTEL",
        entityType: "RoomAllocation",
        entityId: allocationId,
        summary: `Released room allocation`,
      })

      return {
        success: true,
        allocation: updated,
      }
    } catch (error: any) {
      console.error("Allocation release failed:", error)
      throw new Error(`Failed to release allocation: ${error.message}`)
    }
  }

  /**
   * Create a meal
   */
  static async createMeal(tenantId: string, data: {
    name: string
    type: "BREAKFAST" | "LUNCH" | "DINNER"
    time: string
  }) {
    try {
      const meal = await prisma.meal.create({
        data: {
          ...data,
          tenantId,
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "HOSTEL",
        entityType: "Meal",
        entityId: meal.id,
        summary: `Created meal: ${meal.name}`,
      })

      return {
        success: true,
        meal,
      }
    } catch (error: any) {
      console.error("Meal creation failed:", error)
      throw new Error(`Failed to create meal: ${error.message}`)
    }
  }

  /**
   * Get all meals for a tenant
   */
  static async getMeals(tenantId: string) {
    try {
      const meals = await prisma.meal.findMany({
        where: { tenantId },
        orderBy: [
          { type: "asc" },
          { time: "asc" },
        ],
      })

      return {
        success: true,
        meals,
      }
    } catch (error: any) {
      console.error("Failed to fetch meals:", error)
      throw new Error(`Failed to fetch meals: ${error.message}`)
    }
  }

  /**
   * Record meal attendance
   */
  static async recordMealAttendance(tenantId: string, data: {
    mealId: string
    studentId: string
    date: Date
    status?: string
  }) {
    try {
      const mealLog = await prisma.mealLog.upsert({
        where: {
          mealId_studentId_date: {
            mealId: data.mealId,
            studentId: data.studentId,
            date: data.date,
          },
        },
        update: {
          status: data.status || "PRESENT",
        },
        create: {
          ...data,
          tenantId,
          status: data.status || "PRESENT",
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "HOSTEL",
        entityType: "MealLog",
        entityId: mealLog.id,
        summary: `Recorded meal attendance`,
      })

      return {
        success: true,
        mealLog,
      }
    } catch (error: any) {
      console.error("Meal attendance recording failed:", error)
      throw new Error(`Failed to record meal attendance: ${error.message}`)
    }
  }

  /**
   * Get meal logs for a date range
   */
  static async getMealLogs(tenantId: string, filters?: {
    date?: Date
    studentId?: string
    mealId?: string
  }) {
    try {
      const where: any = { tenantId }

      if (filters?.date) where.date = filters.date
      if (filters?.studentId) where.studentId = filters.studentId
      if (filters?.mealId) where.mealId = filters.mealId

      const logs = await prisma.mealLog.findMany({
        where,
        include: {
          meal: true,
          student: true,
        },
        orderBy: {
          date: "desc",
        },
      })

      return {
        success: true,
        logs,
      }
    } catch (error: any) {
      console.error("Failed to fetch meal logs:", error)
      throw new Error(`Failed to fetch meal logs: ${error.message}`)
    }
  }

  /**
   * Get hostel statistics
   */
  static async getHostelStatistics(tenantId: string) {
    try {
      const [
        totalHostels,
        totalRooms,
        totalAllocations,
        activeAllocations,
      ] = await Promise.all([
        prisma.hostel.count({ where: { tenantId } }),
        prisma.room.count({ where: { tenantId } }),
        prisma.roomAllocation.count({ where: { tenantId } }),
        prisma.roomAllocation.count({ where: { tenantId, status: "ACTIVE" } }),
      ])

      const rooms = await prisma.room.findMany({
        where: { tenantId },
        select: {
          capacity: true,
          occupied: true,
        },
      })

      const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0)
      const totalOccupied = rooms.reduce((sum, r) => sum + r.occupied, 0)

      return {
        success: true,
        statistics: {
          totalHostels,
          totalRooms,
          totalCapacity,
          totalOccupied,
          availableBeds: totalCapacity - totalOccupied,
          totalAllocations,
          activeAllocations,
          occupancyRate: totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0,
        },
      }
    } catch (error: any) {
      console.error("Failed to fetch hostel statistics:", error)
      throw new Error(`Failed to fetch hostel statistics: ${error.message}`)
    }
  }
}
