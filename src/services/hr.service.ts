import { prisma } from "@/lib/prisma"

export class HRService {
  /**
   * Submit a new leave request (STAFF)
   */
  static async applyLeave(tenantId: string, email: string, payload: {
    startDate: Date
    endDate: Date
    reason: string
  }) {
    // Look up staff by email
    const staff = await prisma.staff.findFirst({
      where: { tenantId, email }
    })
    
    if (!staff) {
        throw new Error("Staff profile not found")
    }

    return await prisma.leaveRequest.create({
      data: {
        staffId: staff.id,
        from: new Date(payload.startDate),
        to: new Date(payload.endDate),
        reason: payload.reason,
        status: "PENDING"
      }
    })
  }

  /**
   * Get historical and pending leaves for a specific staff member (STAFF view)
   */
  static async getStaffLeaves(tenantId: string, email: string) {
    const staff = await prisma.staff.findFirst({
      where: { tenantId, email }
    })

    if (!staff) return []

    return await prisma.leaveRequest.findMany({
      where: {
        staffId: staff.id
      },
      orderBy: { from: 'desc' }
    })
  }

  /**
   * Get all pending queue leaves across the network (ADMIN view)
   */
  static async getPendingLeavesQueue(tenantId: string) {
    // We filter by tenantId implicitly through the staff relation
    return await prisma.leaveRequest.findMany({
      where: {
        status: "PENDING",
        staff: {
          tenantId: tenantId
        }
      },
      include: {
        staff: {
          select: { name: true, email: true, department: true }
        }
      },
      orderBy: { from: 'asc' }
    })
  }

  /**
   * Safely mutate status (ADMIN)
   */
  static async updateLeaveStatus(tenantId: string, leaveId: string, status: string) {
    // Verify it belongs to this tenant via staff
    const leave = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: { staff: true }
    })

    if (!leave || leave.staff.tenantId !== tenantId) {
      throw new Error("Unauthorized or not found")
    }

    return await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status
      }
    })
  }
}
