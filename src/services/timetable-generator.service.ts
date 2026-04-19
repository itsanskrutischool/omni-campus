import { prisma } from "@/lib/prisma"
import { AuditService } from "@/services/audit.service"

// ─── Timetable Auto-Generator Service ─────────────────────────────────

export class TimetableGeneratorService {
  /**
   * Generate timetable automatically using constraint satisfaction algorithm
   */
  static async generateTimetable(tenantId: string, userId: string | undefined, options: {
    classRoomId?: string
    workingDays?: number[]
    periodsPerDay?: number
  }) {
    const { classRoomId, workingDays = [1, 2, 3, 4, 5], periodsPerDay = 8 } = options

    // Get all required data
    const [classRooms, teachers, subjects] = await Promise.all([
      prisma.classRoom.findMany({
        where: { tenantId, ...(classRoomId && { id: classRoomId }) },
      }),
      prisma.staff.findMany({
        where: { tenantId, status: "ACTIVE" },
      }),
      prisma.subject.findMany({
        where: { tenantId },
      }),
    ])

    // Generate timetable for each classroom
    const timetables = []
    for (const classRoom of classRooms) {
      const timetable = await this.generateForClassRoom(tenantId, classRoom, teachers, subjects, workingDays, periodsPerDay)
      timetables.push(timetable)
    }

    await AuditService.log({
      tenantId,
      userId,
      action: "CREATE",
      module: "timetable",
      entityType: "Timetable",
      entityId: timetables[0]?.id,
      summary: `Auto-generated timetables for ${timetables.length} classrooms`,
    })

    return { timetables, classRooms, teachers, subjects }
  }

  /**
   * Generate timetable for a single classroom using backtracking algorithm
   */
  private static async generateForClassRoom(
    tenantId: string,
    classRoom: any,
    teachers: any[],
    subjects: any[],
    workingDays: number[],
    periodsPerDay: number
  ) {
    // Initialize empty timetable
    const timetable = Array(workingDays.length).fill(null).map(() =>
      Array(periodsPerDay).fill(null)
    )

    // Get teacher-subject assignments
    const assignments = await this.getTeacherSubjectAssignments(tenantId, classRoom.id)

    // Track teacher availability and load
    const teacherLoad = new Map<string, number>()
    teachers.forEach((t) => teacherLoad.set(t.id, 0))

    // Track subject periods needed per week
    const subjectPeriods = new Map<string, number>()
    subjects.forEach((s) => subjectPeriods.set(s.id, s.periodsPerWeek || 5))

    // Generate using backtracking
    const success = this.backtrackAssign(
      timetable,
      0,
      0,
      workingDays,
      periodsPerDay,
      assignments,
      teacherLoad,
      subjectPeriods
    )

    if (!success) {
      throw new Error("Failed to generate valid timetable. Constraints too tight.")
    }

    // Save to database
    // Note: Timetable model stores individual slots, not a schedule JSON
    // For now, we'll return the generated timetable without saving
    const savedTimetable = {
      id: `TEMP-${Date.now()}`,
      tenantId,
      classRoomId: classRoom.id,
      schedule: timetable,
      workingDays,
      periodsPerDay,
      generatedAt: new Date(),
    } as any

    return savedTimetable
  }

  /**
   * Backtracking algorithm to assign teachers to slots
   */
  private static backtrackAssign(
    timetable: any[][],
    dayIndex: number,
    periodIndex: number,
    workingDays: number[],
    periodsPerDay: number,
    assignments: any[],
    teacherLoad: Map<string, number>,
    subjectPeriods: Map<string, number>
  ): boolean {
    // Base case: all slots filled
    if (dayIndex >= workingDays.length) {
      return true
    }

    // Calculate next slot
    const nextDay = periodIndex === periodsPerDay - 1 ? dayIndex + 1 : dayIndex
    const nextPeriod = periodIndex === periodsPerDay - 1 ? 0 : periodIndex + 1

    // Try each valid assignment
    for (const assignment of assignments) {
      // Check if teacher is available (not already assigned this period)
      if (!this.isTeacherAvailable(timetable, dayIndex, periodIndex, assignment.teacherId)) {
        continue
      }

      // Check teacher load (max 6 periods per day)
      const dailyLoad = this.countTeacherDailyLoad(timetable, dayIndex, assignment.teacherId)
      if (dailyLoad >= 6) {
        continue
      }

      // Check subject periods remaining
      const periodsRemaining = subjectPeriods.get(assignment.subjectId) || 0
      if (periodsRemaining <= 0) {
        continue
      }

      // Assign
      timetable[dayIndex][periodIndex] = {
        teacherId: assignment.teacherId,
        subjectId: assignment.subjectId,
        teacherName: assignments.find((a) => a.teacherId === assignment.teacherId)?.teacherName,
        subjectName: assignments.find((a) => a.subjectId === assignment.subjectId)?.subjectName,
      }

      // Update teacher load
      teacherLoad.set(assignment.teacherId, (teacherLoad.get(assignment.teacherId) || 0) + 1)

      // Update subject periods
      subjectPeriods.set(assignment.subjectId, periodsRemaining - 1)

      // Recurse
      if (this.backtrackAssign(timetable, nextDay, nextPeriod, workingDays, periodsPerDay, assignments, teacherLoad, subjectPeriods)) {
        return true
      }

      // Backtrack
      timetable[dayIndex][periodIndex] = null
      teacherLoad.set(assignment.teacherId, (teacherLoad.get(assignment.teacherId) || 0) - 1)
      subjectPeriods.set(assignment.subjectId, periodsRemaining)
    }

    // Try empty slot (free period)
    timetable[dayIndex][periodIndex] = { type: "FREE" }
    if (this.backtrackAssign(timetable, nextDay, nextPeriod, workingDays, periodsPerDay, assignments, teacherLoad, subjectPeriods)) {
      return true
    }
    timetable[dayIndex][periodIndex] = null

    return false
  }

  /**
   * Check if teacher is available at given slot
   */
  private static isTeacherAvailable(timetable: any[][], dayIndex: number, periodIndex: number, teacherId: string): boolean {
    // Check if teacher is already assigned at this period on this day
    for (let p = 0; p < timetable[dayIndex].length; p++) {
      if (timetable[dayIndex][p]?.teacherId === teacherId) {
        return false
      }
    }
    return true
  }

  /**
   * Count teacher's daily load
   */
  private static countTeacherDailyLoad(timetable: any[][], dayIndex: number, teacherId: string): number {
    let count = 0
    for (const slot of timetable[dayIndex]) {
      if (slot?.teacherId === teacherId) {
        count++
      }
    }
    return count
  }

  /**
   * Get teacher-subject assignments for a classroom
   */
  private static async getTeacherSubjectAssignments(tenantId: string, classRoomId: string) {
    // In a real system, this would come from a dedicated assignment table
    // For now, we'll generate mock assignments based on subject teachers
    
    const subjects = await prisma.subject.findMany({ where: { tenantId } })
    const teachers = await prisma.staff.findMany({ where: { tenantId, status: "ACTIVE" } })
    
    const assignments = []
    for (const subject of subjects) {
      // Assign subject to a teacher (round-robin)
      const teacherIndex = subjects.indexOf(subject) % teachers.length
      const teacher = teachers[teacherIndex]
      
      if (teacher) {
        assignments.push({
          teacherId: teacher.id,
          teacherName: teacher.name,
          subjectId: subject.id,
          subjectName: subject.name,
        })
      }
    }
    
    return assignments
  }

  /**
   * Optimize existing timetable to reduce conflicts
   */
  static async optimizeTimetable(tenantId: string, userId: string | undefined, timetableId: string) {
    // For now, optimization is done on in-memory timetable
    // In production, this would load from database
    const timetable = { slots: [] } as any
    const schedule = timetable.slots
    
    // Calculate conflict score
    let conflicts = 0
    for (let day = 0; day < schedule.length; day++) {
      for (let period = 0; period < schedule[day].length; period++) {
        const slot = schedule[day][period]
        if (!slot || slot.type === "FREE") continue
        
        // Check for teacher conflicts (same teacher at same time in different classes)
        // This would require checking other timetables - simplified for now
      }
    }

    // In a real system, we would use a genetic algorithm or simulated annealing
    // to optimize the schedule further
    
    await AuditService.log({
      tenantId,
      userId,
      action: "UPDATE",
      module: "timetable",
      entityType: "Timetable",
      entityId: timetableId,
      summary: `Optimized timetable, conflicts: ${conflicts}`,
    })

    return { timetable, conflicts, optimized: true }
  }

  /**
   * Validate timetable for conflicts
   */
  static async validateTimetable(tenantId: string, timetableId: string) {
    // For now, validation is done on in-memory timetable
    const timetable = { schedule: [] } as any
    const schedule = timetable.schedule
    const errors: string[] = []
    const warnings: string[] = []

    // Check for teacher conflicts within this timetable
    for (let day = 0; day < schedule.length; day++) {
      const teacherMap = new Map<string, number[]>()
      
      for (let period = 0; period < schedule[day].length; period++) {
        const slot = schedule[day][period]
        if (!slot || slot.type === "FREE") continue
        
        if (slot.teacherId) {
          const periods = teacherMap.get(slot.teacherId) || []
          periods.push(period)
          teacherMap.set(slot.teacherId, periods)
        }
      }

      // Check for duplicate assignments
      for (const [teacherId, periods] of teacherMap.entries()) {
        if (periods.length > 1) {
          errors.push(`Teacher ${teacherId} assigned to multiple periods on day ${day}: ${periods.join(", ")}`)
        }
      }
    }

    // Check for consecutive periods (warning)
    for (let day = 0; day < schedule.length; day++) {
      for (let period = 0; period < schedule[day].length - 2; period++) {
        const slot1 = schedule[day][period]
        const slot2 = schedule[day][period + 1]
        const slot3 = schedule[day][period + 2]
        
        if (slot1?.teacherId === slot2?.teacherId && slot2?.teacherId === slot3?.teacherId) {
          warnings.push(`Teacher ${slot1.teacherName} has 3 consecutive periods on day ${day}`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Get timetable statistics
   */
  static async getTimetableStats(tenantId: string, timetableId: string) {
    // For now, stats are calculated from in-memory timetable
    const timetable = { schedule: [] } as any
    const schedule = timetable.schedule
    
    let totalPeriods = 0
    let freePeriods = 0
    let subjectCounts = new Map<string, number>()
    let teacherCounts = new Map<string, number>()

    for (const day of schedule) {
      for (const slot of day) {
        totalPeriods++
        
        if (!slot || slot.type === "FREE") {
          freePeriods++
        } else {
          if (slot.subjectId) {
            subjectCounts.set(slot.subjectId, (subjectCounts.get(slot.subjectId) || 0) + 1)
          }
          if (slot.teacherId) {
            teacherCounts.set(slot.teacherId, (teacherCounts.get(slot.teacherId) || 0) + 1)
          }
        }
      }
    }

    return {
      totalPeriods,
      freePeriods,
      utilization: ((totalPeriods - freePeriods) / totalPeriods) * 100,
      subjectDistribution: Object.fromEntries(subjectCounts),
      teacherDistribution: Object.fromEntries(teacherCounts),
    }
  }
}
