import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

type ExportRow = Record<string, string | number | null | undefined>

export class ExportService {
  /**
   * Transforms an array of flat JSON objects into a raw CSV string blob.
   */
  static jsonToCsv(data: ExportRow[]): string {
    if (data.length === 0) return ""
    
    // Extract headers safely
    const headers = Object.keys(data[0])
    
    const rows = data.map(row => 
      headers.map(header => {
        const val = row[header]
        // Escape quotes to prevent CSV breakage
        const escaped = (val === null || val === undefined) ? "" : String(val).replace(/"/g, '""')
        return `"${escaped}"`
      }).join(',')
    )
    
    return [headers.join(','), ...rows].join('\n')
  }

  static jsonToWorkbookBuffer(data: ExportRow[], sheetName: string) {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
  }

  /**
   * Export all students mapped intelligently via Classroom
   */
  static async exportStudents(tenantId: string) {
    const students = await prisma.student.findMany({
      where: { tenantId },
      include: {
        classroom: true,
        section: true
      },
      orderBy: { classroom: { numeric: 'asc' } }
    })

    return students.map(s => ({
      AdmissionNumber: s.admissionNumber,
      Name: s.name,
      Gender: s.gender,
      DateOfBirth: s.dob.toISOString().split('T')[0],
      Class: s.classroom?.name || "N/A",
      Section: s.section?.name || "N/A",
      Status: s.status
    }))
  }

  /**
   * Export all staff members
   */
  static async exportStaff(tenantId: string) {
    const staff = await prisma.staff.findMany({
      where: { tenantId },
      include: {
        department: true,
        designation: true,
      },
      orderBy: { name: 'asc' }
    })

    return staff.map(s => ({
      EmployeeID: s.empId,
      Name: s.name,
      Email: s.email,
      Phone: s.phone,
      Role: s.role,
      Department: s.department?.name || "N/A",
      Designation: s.designation?.name || "N/A",
      BasicSalary: s.basicSalary ?? "N/A",
      JoinDate: s.joinDate.toISOString().split('T')[0],
      Status: s.status
    }))
  }

  /**
   * Export fully flattened payment ledgers for analysis
   */
  static async exportFeeLedger(tenantId: string) {
    const records = await prisma.feeRecord.findMany({
      where: { student: { tenantId } },
      include: {
        student: true,
        feeStructure: true
      },
      orderBy: { dueDate: 'asc' }
    })

    return records.map(r => ({
      AdmissionNumber: r.student.admissionNumber,
      StudentName: r.student.name,
      FeeCategory: r.feeStructure.category || "General",
      FeeName: r.feeStructure.name,
      AmountDue: r.amountDue,
      AmountPaid: r.amountPaid,
      BalanceOpen: r.amountDue - r.amountPaid,
      Status: r.status,
      DueDate: r.dueDate.toISOString().split('T')[0],
      PaidDate: r.paidDate ? r.paidDate.toISOString().split('T')[0] : "N/A",
      Receipt: r.receiptNumber || "N/A",
      PaymentMethod: r.paymentMethod || "N/A"
    }))
  }

  static async exportExamMarks(tenantId: string, examId: string, classRoomId?: string) {
    const marks = await prisma.markEntry.findMany({
      where: {
        examId,
        student: {
          tenantId,
          ...(classRoomId ? { classRoomId } : {}),
        },
      },
      include: {
        exam: true,
        student: {
          include: {
            classroom: true,
            section: true,
          },
        },
        subject: true,
      },
      orderBy: [
        { student: { classroom: { numeric: "asc" } } },
        { student: { name: "asc" } },
        { subject: { name: "asc" } },
      ],
    })

    return marks.map((entry) => ({
      Exam: entry.exam.name,
      ExamType: entry.exam.type,
      Term: entry.exam.term,
      AdmissionNumber: entry.student.admissionNumber,
      RollNumber: entry.student.rollNumber || "",
      StudentName: entry.student.name,
      Class: entry.student.classroom?.name || "",
      Section: entry.student.section?.name || "",
      SubjectCode: entry.subject.code,
      SubjectName: entry.subject.name,
      SubjectType: entry.subject.type,
      Marks: entry.marks,
      MaxMarks: entry.maxMarks,
      Grade: entry.grade || "",
      Remarks: entry.remarks || "",
    }))
  }
}
