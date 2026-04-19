import { prisma } from "@/lib/prisma"
import { AuditService } from "@/services/audit.service"

// ─── Student Promotion & Transfer Service ─────────────────────────────────────

export class StudentPromotionService {
  /**
   * Promote students to next class
   */
  static async promoteStudents(tenantId: string, userId: string | undefined, options: {
    academicYearId: string
    targetClassRoomId?: string
    studentIds?: string[]
    dryRun?: boolean
  }) {
    const { academicYearId, targetClassRoomId, studentIds, dryRun = false } = options

    try {
      // Get current academic year
      const currentAcademicYear = await prisma.academicYear.findUnique({
        where: { id: academicYearId },
      })

      if (!currentAcademicYear) {
        throw new Error("Academic year not found")
      }

      // Get next academic year
      const nextAcademicYear = await prisma.academicYear.findFirst({
        where: {
          tenantId,
          startDate: {
            gt: currentAcademicYear.endDate,
          },
        },
        orderBy: { startDate: "asc" },
      })

      if (!nextAcademicYear) {
        throw new Error("Next academic year not found. Please create it first.")
      }

      // Get students to promote
      const students = await prisma.student.findMany({
        where: {
          tenantId,
          ...(studentIds && { id: { in: studentIds } }),
          status: "ACTIVE",
          classRoomId: { not: null },
        },
        include: {
          classroom: true,
        },
      })

      if (students.length === 0) {
        return {
          success: true,
          message: "No students found to promote",
          promoted: 0,
          skipped: 0,
        }
      }

      const promotionResults = []
      let promotedCount = 0
      let skippedCount = 0

      for (const student of students) {
        try {
          const currentClass = student.classroom
          
          if (!currentClass) {
            promotionResults.push({
              studentId: student.id,
              studentName: student.name,
              status: "SKIPPED",
              reason: "No current class assigned",
            })
            skippedCount++
            continue
          }
          
          // Determine next class (assuming numeric class progression)
          const currentClassNum = currentClass.numeric || 0
          const nextClassNum = currentClassNum + 1
          
          // Find next classroom
          const nextClassRoom = targetClassRoomId 
            ? await prisma.classRoom.findUnique({ where: { id: targetClassRoomId } })
            : await prisma.classRoom.findFirst({
                where: {
                  tenantId,
                  numeric: nextClassNum,
                },
              })

          if (!nextClassRoom) {
            promotionResults.push({
              studentId: student.id,
              studentName: student.name,
              status: "SKIPPED",
              reason: "Next class not found",
            })
            skippedCount++
            continue
          }

          if (!dryRun) {
            // Update student class
            await prisma.student.update({
              where: { id: student.id },
              data: {
                classRoomId: nextClassRoom.id,
                sectionId: null, // Reset section for re-assignment
                updatedAt: new Date(),
              },
            })

            // Log promotion
            await AuditService.log({
              tenantId,
              userId,
              action: "UPDATE",
              module: "students",
              entityType: "Student",
              entityId: student.id,
              summary: `Promoted ${student.name} from ${currentClass.name} to ${nextClassRoom.name}`,
              oldValue: { classRoomId: currentClass.id },
              newValue: { classRoomId: nextClassRoom.id },
            })
          }

          promotionResults.push({
            studentId: student.id,
            studentName: student.name,
            status: "PROMOTED",
            fromClass: currentClass.name,
            toClass: nextClassRoom.name,
          })
          promotedCount++
        } catch (error: any) {
          promotionResults.push({
            studentId: student.id,
            studentName: student.name,
            status: "ERROR",
            reason: error.message,
          })
          skippedCount++
        }
      }

      return {
        success: true,
        message: dryRun 
          ? `Dry run complete: ${promotedCount} students would be promoted, ${skippedCount} skipped`
          : `Successfully promoted ${promotedCount} students, ${skippedCount} skipped`,
        promoted: promotedCount,
        skipped: skippedCount,
        results: promotionResults,
        dryRun,
      }
    } catch (error: any) {
      console.error("Student promotion failed:", error)
      throw new Error(`Failed to promote students: ${error.message}`)
    }
  }

  /**
   * Transfer student to different school/campus
   */
  static async transferStudent(tenantId: string, userId: string | undefined, options: {
    studentId: string
    targetCampusId?: string
    targetClassRoomId?: string
    transferReason: string
    transferDate: Date
  }) {
    const { studentId, targetCampusId, targetClassRoomId, transferReason, transferDate } = options

    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          campus: true,
          classroom: true,
        },
      })

      if (!student) {
        throw new Error("Student not found")
      }

      if (student.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      // Verify target campus exists
      if (targetCampusId) {
        const targetCampus = await prisma.campus.findUnique({
          where: { id: targetCampusId },
        })

        if (!targetCampus || targetCampus.tenantId !== tenantId) {
          throw new Error("Invalid target campus")
        }
      }

      // Verify target class exists
      if (targetClassRoomId) {
        const targetClass = await prisma.classRoom.findUnique({
          where: { id: targetClassRoomId },
        })

        if (!targetClass || targetClass.tenantId !== tenantId) {
          throw new Error("Invalid target class")
        }
      }

      // Update student
      const updated = await prisma.student.update({
        where: { id: studentId },
        data: {
          campusId: targetCampusId || student.campusId,
          classRoomId: targetClassRoomId || student.classRoomId,
          notes: student.notes 
            ? `${student.notes}\n\nTransfer: ${transferReason} on ${transferDate.toISOString()}` 
            : `Transfer: ${transferReason} on ${transferDate.toISOString()}`,
          updatedAt: new Date(),
        },
      })

      // Log transfer
      await AuditService.log({
        tenantId,
        userId,
        action: "UPDATE",
        module: "students",
        entityType: "Student",
        entityId: studentId,
        summary: `Transferred ${student.name} to ${targetCampusId || 'same campus'}, ${targetClassRoomId || 'same class'}`,
        oldValue: { 
          campusId: student.campusId, 
          classRoomId: student.classRoomId 
        },
        newValue: { 
          campusId: updated.campusId, 
          classRoomId: updated.classRoomId 
        },
      })

      return {
        success: true,
        student: updated,
        message: "Student transferred successfully",
      }
    } catch (error: any) {
      console.error("Student transfer failed:", error)
      throw new Error(`Failed to transfer student: ${error.message}`)
    }
  }

  /**
   * Bulk transfer students
   */
  static async bulkTransfer(tenantId: string, userId: string | undefined, options: {
    studentIds: string[]
    targetCampusId?: string
    targetClassRoomId?: string
    transferReason: string
    transferDate: Date
  }) {
    const { studentIds, targetCampusId, targetClassRoomId, transferReason, transferDate } = options

    const results = []
    let successCount = 0
    let failureCount = 0

    for (const studentId of studentIds) {
      try {
        await this.transferStudent(tenantId, userId, {
          studentId,
          targetCampusId,
          targetClassRoomId,
          transferReason,
          transferDate,
        })
        results.push({ studentId, success: true })
        successCount++
      } catch (error: any) {
        results.push({ studentId, success: false, error: error.message })
        failureCount++
      }
    }

    return {
      success: true,
      total: studentIds.length,
      successCount,
      failureCount,
      results,
    }
  }

  /**
   * Get promotion preview
   */
  static async getPromotionPreview(tenantId: string, academicYearId: string) {
    try {
      const students = await prisma.student.findMany({
        where: {
          tenantId,
          status: "ACTIVE",
          classRoomId: { not: null },
        },
        include: {
          classroom: true,
        },
        take: 100,
      })

      const preview = students.map(student => {
        const currentClassNum = student.classroom?.numeric || 0
        const nextClassNum = currentClassNum + 1
        
        return {
          studentId: student.id,
          studentName: student.name,
          admissionNumber: student.admissionNumber,
          currentClass: student.classroom?.name || "N/A",
          currentClassNum,
          nextClassNum,
          canPromote: currentClassNum < 12, // Assuming 12 is max class
        }
      })

      return {
        success: true,
        preview,
        totalStudents: students.length,
        canPromoteCount: preview.filter(p => p.canPromote).length,
        cannotPromoteCount: preview.filter(p => !p.canPromote).length,
      }
    } catch (error: any) {
      console.error("Failed to get promotion preview:", error)
      throw new Error(`Failed to get promotion preview: ${error.message}`)
    }
  }
}
