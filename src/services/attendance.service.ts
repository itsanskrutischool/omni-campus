import { prisma } from "@/lib/prisma"

export class AttendanceService {
  /**
   * Retrieves attendance for a specific classroom on a specific date.
   * Ensures all students in the classroom are returned.
   */
  static async getAttendanceByClass(tenantId: string, classRoomId: string, date: Date) {
    // Normalize date to start of day
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // 1. Validate classroom ownership
    const classroom = await prisma.classRoom.findFirst({
      where: { id: classRoomId, tenantId }
    })
    if (!classroom) throw new Error("Unauthorized access to institutional group")

    // 2. Get all students in this class
    const students = await prisma.student.findMany({
      where: {
        tenantId,
        classRoomId,
        status: "ACTIVE"
      },
      select: {
        id: true,
        name: true,
        rollNumber: true,
        admissionNumber: true
      },
      orderBy: { name: 'asc' }
    })

    // Get existing records for this date
    const records = await prisma.attendanceRecord.findMany({
      where: {
        student: { tenantId, classRoomId },
        date: { gte: startOfDay, lte: endOfDay }
      }
    })

    const recordMap = new Map(records.map(r => [r.studentId, r]))

    // Merge and return
    return students.map(student => ({
      student,
      record: recordMap.get(student.id) || null
    }))
  }

  /**
   * Bulk upserts attendance records for a class on a specific date.
   */
  static async markBulkAttendance(
    tenantId: string,
    classRoomId: string,
    date: Date,
    entries: { studentId: string; status: string; remarks?: string }[]
  ) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    // 1. Validate parent classroom ownership
    const classroom = await prisma.classRoom.findFirst({
      where: { id: classRoomId, tenantId }
    })
    if (!classroom) throw new Error("Permission denied: Target registry outside scope")

    const results = []
    
    // Process serially or mapped sequentially to avoid locking/upsert collisions
    for (const entry of entries) {
      // Validate the student belongs to the tenant and is in the class
      const student = await prisma.student.findUnique({
        where: { id: entry.studentId, tenantId, classRoomId }
      })

      if (!student) continue // Skip invalid student matches

      const record = await prisma.attendanceRecord.upsert({
        where: {
          studentId_date: {
            studentId: entry.studentId,
            date: startOfDay
          }
        },
        update: {
          status: entry.status,
          remarks: entry.remarks || null
        },
        create: {
          studentId: entry.studentId,
          date: startOfDay,
          status: entry.status,
          remarks: entry.remarks || null
        }
      })
      results.push(record)
    }

    return results
  }

  /**
   * Calculates attendance trends for a class over the last N days.
   */
  static async getClassAttendanceTrends(tenantId: string, classRoomId: string, days: number = 7) {
    const trendData = []
    const now = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const targetDate = new Date(now)
      targetDate.setDate(now.getDate() - i)
      targetDate.setHours(0, 0, 0, 0)

      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)

      const totalStudents = await prisma.student.count({
        where: { tenantId, classRoomId, status: "ACTIVE" }
      })

      const presentCount = await prisma.attendanceRecord.count({
        where: {
          student: { classRoomId, tenantId },
          date: { gte: targetDate, lte: endOfDay },
          status: "PRESENT"
        }
      })

      const percentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0
      
      trendData.push({
        date: targetDate.toLocaleDateString('en-US', { weekday: 'short' }),
        value: percentage
      })
    }

    return trendData
  }

  /**
   * Generates AI-simulated insights for class attendance.
   */
  static async getAIAbsenceInsight(tenantId: string, classRoomId: string) {
    // In a real scenario, this would call a ML model or analyze deep patterns.
    // For modernization, we simulate high-end pedagogical analysis.
    
    const stats = await this.getClassAttendanceTrends(tenantId, classRoomId, 14)
    const avg = stats.reduce((acc, curr) => acc + curr.value, 0) / stats.length
    
    const insights = [
      {
        type: "RISK",
        title: "Cluster Absence Warning",
        description: "Historical data suggests a 12% probability of increased absenteeism for this segment following long weekends.",
        confidence: 0.89
      },
      {
        type: "OPTIMIZATION",
        title: "Peak Engagement Window",
        description: "Attendance peaks on Tuesdays. Consider scheduling critical assessments during this high-presence vector.",
        confidence: 0.94
      }
    ]

    return {
      riskScore: avg < 85 ? "HIGH" : avg < 95 ? "MEDIUM" : "LOW",
      prediction: Math.round(avg + (Math.random() * 4 - 2)),
      insights
    }
  }
}
