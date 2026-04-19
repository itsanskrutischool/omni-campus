import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"
import { PDFService } from "./pdf.service"
import { ReportUtils } from "@/lib/report-utils"

type CBSEComponentKey = "periodicTest" | "notebook" | "subjectEnrichment" | "exam"

type CBSEComponentBucket = {
  periodicTest: number | null
  notebook: number | null
  subjectEnrichment: number | null
  exam: number | null
  total: number
  maxMarks: number
}

type DetailedScholasticRow = {
  name: string
  code: string
  term1: CBSEComponentBucket
  term2: CBSEComponentBucket
  total: number
  maxMarks: number
  percentage: number
  grade: string
}

const CBSE_COMPONENT_LABELS: Record<CBSEComponentKey, string> = {
  periodicTest: "Periodic Test",
  notebook: "Notebook Submission",
  subjectEnrichment: "Subject Enrichment",
  exam: "Major Exam",
}

function createTermBucket(): CBSEComponentBucket {
  return {
    periodicTest: null,
    notebook: null,
    subjectEnrichment: null,
    exam: null,
    total: 0,
    maxMarks: 0,
  }
}

function toNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

function normalizeExamComponent(type: string): CBSEComponentKey {
  const normalized = type.trim().toUpperCase()

  if (normalized.includes("NOTEBOOK")) return "notebook"
  if (normalized.includes("ENRICH") || normalized === "SE") return "subjectEnrichment"
  if (normalized.includes("PT") || normalized.includes("PERIODIC")) return "periodicTest"
  return "exam"
}

function getRecommendedRemarks(percentage: number) {
  if (percentage >= 90) return "Outstanding academic performance with consistently strong subject mastery."
  if (percentage >= 75) return "Very good performance. Keep building consistency to convert strengths into top grades."
  if (percentage >= 60) return "Good progress. Focused practice in core subjects will improve outcomes further."
  if (percentage >= 40) return "Satisfactory progress. Additional support and regular revision are recommended."
  return "Needs improvement. A structured remediation plan and close mentoring are recommended."
}

function getDefaultCoScholasticRows(existing: Array<{ name: string; grade: string }>) {
  const defaults = [
    { name: "Work Education", grade: "A" },
    { name: "Art Education", grade: "A" },
    { name: "Health & Physical Education", grade: "A" },
  ]

  return defaults.map((item) => existing.find((entry) => entry.name === item.name) || item)
}

function getDefaultDisciplineRows(attendancePercentage: number) {
  const grade = attendancePercentage >= 95 ? "A" : attendancePercentage >= 85 ? "B" : "C"
  return [
    { name: "Discipline", grade },
    { name: "Regularity & Punctuality", grade },
    { name: "Sincerity", grade },
  ]
}

// CBSE 9-Point Grading Scale (Scholastic)
export function getCBSEGrade(marks: number, maxMarks: number = 100): string {
  if (maxMarks <= 0) return ""
  const percentage = (marks / maxMarks) * 100

  if (percentage >= 91) return "A1"
  if (percentage >= 81) return "A2"
  if (percentage >= 71) return "B1"
  if (percentage >= 61) return "B2"
  if (percentage >= 51) return "C1"
  if (percentage >= 41) return "C2"
  if (percentage >= 33) return "D"
  if (percentage >= 21) return "E1"
  return "E2"
}

// Co-Scholastic 3-Point scale (Optional mapping if subjects are marked as co-scholastic)
export function getCoScholasticGrade(marks: number, maxMarks: number = 100): string {
  if (maxMarks <= 0) return ""
  const percentage = (marks / maxMarks) * 100
  if (percentage >= 80) return "A" // Outstanding
  if (percentage >= 60) return "B" // Very Good
  return "C" // Fair
}

export class ExamService {
  /**
   * Retrieves all exams for the current active academic year of a tenant.
   */
  static async getExams(tenantId: string) {
    const activeYear = await prisma.academicYear.findFirst({
      where: { tenantId, isCurrent: true },
    })

    if (!activeYear) return []

    return prisma.exam.findMany({
      where: { tenantId, academicYearId: activeYear.id },
      orderBy: { startDate: "desc" },
    })
  }

  /**
   * Create a new Exam event
   */
  static async createExam(tenantId: string, data: {
    name: string
    type: string
    term: number
    startDate: Date
    endDate: Date
  }) {
    const activeYear = await prisma.academicYear.findFirst({
      where: { tenantId, isCurrent: true },
    })

    if (!activeYear) throw new Error("No active academic year found for this school.")

    return prisma.exam.create({
      data: {
        ...data,
        tenantId,
        academicYearId: activeYear.id,
      },
    })
  }

  /**
   * Get Students and their existing marks for a specific Exam + Class + Subject
   */
  static async getMarkEntriesGrid(tenantId: string, examId: string, classRoomId: string, subjectId: string) {
    // Get all students active in this class
    const students = await prisma.student.findMany({
      where: { tenantId, classRoomId, status: "ACTIVE" },
      select: { id: true, admissionNumber: true, rollNumber: true, name: true }
    })

    // Get existing marks for these students in this exam + subject
    const existingMarks = await prisma.markEntry.findMany({
      where: {
        examId,
        subjectId,
        studentId: { in: students.map(s => s.id) }
      }
    })

    // Map existing marks to students
    return students.map(student => {
      const markEntry = existingMarks.find(m => m.studentId === student.id)
      return {
        student,
        markEntry: markEntry || null
      }
    })
  }

  /**
   * Upsert a batch of mark entries.
   * Auto-invalidates physical PDF cache for affected students.
   */
  static async upsertMarksBulk(
    tenantId: string, 
    examId: string, 
    subjectId: string, 
    entries: Array<{
      studentId: string
      marks: number
      maxMarks: number
      remarks?: string
    }>,
    actor?: { userId?: string, userName?: string, userRole?: string }
  ) {
    const results = []
    
    // Using a simple loop; for large datasets, a raw query or Prisma operations array might be used.
    for (const entry of entries) {
      const grade = getCBSEGrade(entry.marks, entry.maxMarks)

      const res = await prisma.markEntry.upsert({
        where: {
          studentId_subjectId_examId: {
            studentId: entry.studentId,
            subjectId,
            examId
          }
        },
        update: {
          marks: entry.marks,
          maxMarks: entry.maxMarks,
          grade,
          remarks: entry.remarks
        },
        create: {
          studentId: entry.studentId,
          subjectId,
          examId,
          marks: entry.marks,
          maxMarks: entry.maxMarks,
          grade,
          remarks: entry.remarks
        }
      })
      results.push(res)

      // Invalidate PDF Cache for this student
      // The cache key matches the pattern used in the report generator
      const cacheKey = ReportUtils.generateCacheKey(entry.studentId, tenantId, "cbse-v1");
      PDFService.invalidateCache(cacheKey);
    }

    // Single audit log for the bulk operation
    await AuditService.log({
      tenantId,
      userId: actor?.userId,
      userName: actor?.userName,
      userRole: actor?.userRole,
      action: 'UPDATE',
      module: 'EXAMINATION',
      entityType: 'MARK_ENTRY_BULK',
      summary: `Bulk updated ${entries.length} mark entries for exam ${examId}`,
      newValue: { examId, subjectId, count: entries.length }
    });

    return results
  }

  /**
   * Retrieves all marks for a student across all subjects for a specific Exam
   * Primarily used for Report Cards
   */
  static async getStudentReportCard(tenantId: string, studentId: string, examId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId, tenantId },
      include: {
        classroom: true,
        section: true
      }
    })

    if (!student) throw new Error("Student not found")

    const exam = await prisma.exam.findUnique({
      where: { id: examId, tenantId }
    })

    if (!exam) throw new Error("Exam not found")

    const marks = await prisma.markEntry.findMany({
      where: { studentId, examId },
      include: {
        subject: true
      }
    })

    let totalMarks = 0
    let totalMaxMarks = 0

    const scholastic: Array<{
      subject: string
      marks: number
      maxMarks: number
      grade: string
    }> = []
    const coScholastic: Array<{
      subject: string
      marks: number
      maxMarks: number
      grade: string
    }> = []

    marks.forEach(m => {
      const subjectType = m.subject.type
      if (subjectType === "SCHOLASTIC") {
        totalMarks += m.marks
        totalMaxMarks += m.maxMarks
        scholastic.push({
          subject: m.subject.name,
          marks: m.marks,
          maxMarks: m.maxMarks,
          grade: m.grade || getCBSEGrade(m.marks, m.maxMarks)
        })
      } else {
        coScholastic.push({
          subject: m.subject.name,
          marks: m.marks,
          maxMarks: m.maxMarks,
          grade: m.grade || getCoScholasticGrade(m.marks, m.maxMarks)
        })
      }
    })

    const overallPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0
    const finalGrade = getCBSEGrade(totalMarks, totalMaxMarks)

    return {
      student: {
        name: student.name,
        admissionNo: student.admissionNumber,
        rollNo: student.rollNumber,
        dob: student.dob,
        class: student.classroom?.name,
        section: student.section?.name,
        fatherName: student.fatherName,
        motherName: student.motherName
      },
      exam: {
        name: exam.name,
        term: exam.term,
      },
      results: {
        scholastic,
        coScholastic,
        summary: {
          totalMarks,
          totalMaxMarks,
          overallPercentage: parseFloat(overallPercentage.toFixed(2)),
          finalGrade
        }
      }
    }
  }

  /**
   * Advanced CBSE Result Engine
   * Aggregates Term 1 & Term 2, calculates ranks, and handles dynamic co-scholastic data.
   */
  static async getDetailedCBSEData(tenantId: string, studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId, tenantId },
      include: {
        classroom: true,
        section: true,
      },
    })

    if (!student) throw new Error("Student not found")

    const [tenant, activeYear] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          name: true,
          logo: true,
          address: true,
          phone: true,
          email: true,
          affiliationNo: true,
          schoolCode: true,
          principalSignature: true,
        },
      }),
      prisma.academicYear.findFirst({
        where: { tenantId, isCurrent: true },
      }),
    ])

    if (!activeYear) throw new Error("No active academic year found")

    const [attendance, allMarks, classStudents] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where: {
          studentId,
          date: {
            gte: activeYear.startDate,
            lte: activeYear.endDate,
          },
        },
      }),
      prisma.markEntry.findMany({
        where: {
          studentId,
          exam: { academicYearId: activeYear.id },
        },
        include: {
          subject: true,
          exam: true,
        },
      }),
      prisma.student.findMany({
        where: {
          classRoomId: student.classRoomId,
          tenantId,
          status: "ACTIVE",
        },
        include: {
          markEntries: {
            where: {
              exam: { academicYearId: activeYear.id },
              subject: { type: "SCHOLASTIC" },
            },
          },
        },
      }),
    ])

    const workingDays = attendance.length
    const presentDays = attendance.filter((item) => item.status === "PRESENT").length

    // Grouping logic for CBSE Terms
    const scholasticMap: Record<string, DetailedScholasticRow> = {}
    const coScholastic: Array<{ name: string; grade: string }> = []

    allMarks.forEach((m) => {
      const subId = m.subjectId
      
      if (m.subject.type === "SCHOLASTIC") {
        if (!scholasticMap[subId]) {
          scholasticMap[subId] = {
            name: m.subject.name,
            code: m.subject.code,
            term1: createTermBucket(),
            term2: createTermBucket(),
            total: 0,
            maxMarks: 0,
            percentage: 0,
            grade: "",
          }
        }

        const termKey = `term${m.exam.term}` as "term1" | "term2"
        const component = normalizeExamComponent(m.exam.type)
        const bucket = scholasticMap[subId][termKey]
        bucket[component] = m.marks
        bucket.total =
          toNumber(bucket.periodicTest) +
          toNumber(bucket.notebook) +
          toNumber(bucket.subjectEnrichment) +
          toNumber(bucket.exam)
        bucket.maxMarks =
          toNumber(bucket.periodicTest !== null ? 10 : 0) +
          toNumber(bucket.notebook !== null ? 5 : 0) +
          toNumber(bucket.subjectEnrichment !== null ? 5 : 0) +
          toNumber(bucket.exam !== null ? m.maxMarks : 0)
      } else {
        coScholastic.push({
          name: m.subject.name,
          grade: m.grade || getCoScholasticGrade(m.marks, m.maxMarks)
        })
      }
    })

    // Finalize Scholastic Data
    const scholastic = Object.values(scholasticMap).map(s => {
      s.total = s.term1.total + s.term2.total
      s.maxMarks = s.term1.maxMarks + s.term2.maxMarks
      s.percentage = s.maxMarks > 0 ? Number(((s.total / s.maxMarks) * 100).toFixed(2)) : 0
      s.grade = getCBSEGrade(s.total, s.maxMarks || 100)
      return s
    })

    const studentScores = classStudents.map((s) => ({
      id: s.id,
      total: s.markEntries.reduce((acc, curr) => acc + curr.marks, 0),
    }))

    studentScores.sort((a, b) => b.total - a.total)
    const rank = studentScores.findIndex((s) => s.id === studentId) + 1

    const totalMarksObtained = scholastic.reduce((acc, row) => acc + row.total, 0)
    const totalMaxMarks = scholastic.reduce((acc, row) => acc + row.maxMarks, 0)
    const overallPercentage = totalMaxMarks > 0 ? Number(((totalMarksObtained / totalMaxMarks) * 100).toFixed(2)) : 0
    const attendancePercentage = workingDays > 0 ? Number(((presentDays / workingDays) * 100).toFixed(2)) : 0
    const overallGrade = getCBSEGrade(totalMarksObtained, totalMaxMarks || 100)
    const promotedClassNumber = (student.classroom?.numeric ?? 0) + 1
    const promotionStatus = totalMarksObtained > 0
      ? `Promoted to ${promotedClassNumber <= 12 ? `Class ${promotedClassNumber}` : "Next Academic Level"}`
      : "Result Awaited"

    return {
      student,
      tenant,
      attendance: { workingDays, presentDays, percentage: attendancePercentage },
      results: {
        scholastic,
        coScholastic: getDefaultCoScholasticRows(coScholastic),
        discipline: getDefaultDisciplineRows(attendancePercentage),
        rank,
        totalStudents: classStudents.length,
        totalMarksObtained,
        totalMaxMarks,
        overallPercentage,
        overallGrade,
        remarks: getRecommendedRemarks(overallPercentage),
      },
      academicYear: activeYear.name,
      promotionStatus,
      gradingScale: {
        scholastic: [
          { range: "91-100", grade: "A1" },
          { range: "81-90", grade: "A2" },
          { range: "71-80", grade: "B1" },
          { range: "61-70", grade: "B2" },
          { range: "51-60", grade: "C1" },
          { range: "41-50", grade: "C2" },
          { range: "33-40", grade: "D" },
          { range: "32 & below", grade: "E" },
        ],
        coScholastic: "A = Outstanding, B = Very Good, C = Fair",
      },
      componentLabels: CBSE_COMPONENT_LABELS,
    }
  }

  static async getStudentsForClassReportCards(tenantId: string, classRoomId: string) {
    return prisma.student.findMany({
      where: {
        tenantId,
        classRoomId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        admissionNumber: true,
        rollNumber: true,
      },
      orderBy: [
        { rollNumber: "asc" },
        { name: "asc" },
      ],
    })
  }
}
