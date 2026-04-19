import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

/**
 * Report Service
 * ──────────────
 * Centralized report generation engine for all campus modules.
 * All queries scoped by tenantId for multi-tenant isolation.
 *
 * Supported modules: fees, attendance, academics, library, health, hr, transport, vouchers
 */

export type ReportModule =
  | "fees"
  | "attendance"
  | "academics"
  | "library"
  | "health"
  | "hr"
  | "transport"
  | "vouchers"
  | "students"
  | "enquiries"

export interface ReportConfig {
  module: ReportModule
  dateFrom?: string
  dateTo?: string
  classId?: string
  sectionId?: string
  campusId?: string
  statusFilter?: string
  customFields?: string[]
}

export interface ReportResult {
  title: string
  module: ReportModule
  generatedAt: Date
  rowCount: number
  columns: string[]
  data: Record<string, string | number | null>[]
  summary?: Record<string, string | number>
}

export class ReportService {
  /**
   * Generate a report based on module and config.
   */
  static async generateReport(tenantId: string, config: ReportConfig): Promise<ReportResult> {
    const dateFrom = config.dateFrom ? new Date(config.dateFrom) : undefined
    const dateTo = config.dateTo ? new Date(config.dateTo) : undefined

    switch (config.module) {
      case "fees":
        return this.generateFeeReport(tenantId, config, dateFrom, dateTo)
      case "attendance":
        return this.generateAttendanceReport(tenantId, config, dateFrom, dateTo)
      case "academics":
        return this.generateAcademicsReport(tenantId, config, dateFrom, dateTo)
      case "library":
        return this.generateLibraryReport(tenantId, config, dateFrom, dateTo)
      case "health":
        return this.generateHealthReport(tenantId, config, dateFrom, dateTo)
      case "hr":
        return this.generateHRReport(tenantId, config, dateFrom, dateTo)
      case "transport":
        return this.generateTransportReport(tenantId, config, dateFrom, dateTo)
      case "vouchers":
        return this.generateVoucherReport(tenantId, config, dateFrom, dateTo)
      case "students":
        return this.generateStudentReport(tenantId, config, dateFrom, dateTo)
      case "enquiries":
        return this.generateEnquiryReport(tenantId, config, dateFrom, dateTo)
      default:
        throw new Error(`Unknown report module: ${config.module}`)
    }
  }

  /**
   * Get available fields for a module.
   */
  static getAvailableFields(module: ReportModule): string[] {
    const fields: Record<ReportModule, string[]> = {
      fees: [
        "admissionNumber",
        "studentName",
        "class",
        "section",
        "feeCategory",
        "feeName",
        "amountDue",
        "amountPaid",
        "balance",
        "status",
        "dueDate",
        "paidDate",
        "receiptNumber",
        "paymentMethod",
        "waiver",
      ],
      attendance: [
        "admissionNumber",
        "studentName",
        "class",
        "section",
        "date",
        "status",
        "remarks",
      ],
      academics: [
        "admissionNumber",
        "studentName",
        "class",
        "section",
        "examName",
        "examType",
        "term",
        "subjectCode",
        "subjectName",
        "marks",
        "maxMarks",
        "percentage",
        "grade",
        "remarks",
      ],
      library: [
        "bookTitle",
        "author",
        "isbn",
        "accessionNo",
        "category",
        "studentName",
        "admissionNumber",
        "class",
        "issuedBy",
        "issueDate",
        "dueDate",
        "returnDate",
        "fine",
        "status",
      ],
      health: [
        "studentName",
        "admissionNumber",
        "class",
        "type",
        "date",
        "title",
        "description",
        "severity",
        "diagnosedBy",
        "treatment",
        "medication",
        "status",
      ],
      hr: [
        "empId",
        "name",
        "email",
        "phone",
        "role",
        "department",
        "designation",
        "joinDate",
        "basicSalary",
        "status",
      ],
      transport: [
        "routeName",
        "stops",
        "vehicle",
        "driver",
      ],
      vouchers: [
        "voucherNo",
        "type",
        "category",
        "amount",
        "description",
        "date",
        "paidBy",
        "approvedBy",
        "status",
        "receiptNo",
        "remarks",
      ],
      students: [
        "admissionNumber",
        "rollNumber",
        "name",
        "gender",
        "dob",
        "bloodGroup",
        "category",
        "class",
        "section",
        "fatherName",
        "motherName",
        "phone",
        "address",
        "admissionDate",
        "status",
      ],
      enquiries: [
        "enquiryNo",
        "date",
        "studentName",
        "parentName",
        "phone",
        "email",
        "source",
        "classApplied",
        "status",
        "assignedTo",
        "lastFollowUp",
        "nextFollowUp",
        "notes",
      ],
    }
    return fields[module] || []
  }

  // ─── Fee Report ─────────────────────────────────────────────

  private static async generateFeeReport(
    tenantId: string,
    config: ReportConfig,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ReportResult> {
    const studentWhere: Record<string, unknown> = { tenantId }
    if (config.classId) studentWhere.classRoomId = config.classId
    if (config.sectionId) studentWhere.sectionId = config.sectionId
    if (config.campusId) studentWhere.campusId = config.campusId

    const dueDateWhere: Record<string, unknown> = {}
    if (dateFrom) dueDateWhere.gte = dateFrom
    if (dateTo) dueDateWhere.lte = dateTo

    const where: Record<string, unknown> = { student: studentWhere }
    if (config.statusFilter) where.status = config.statusFilter
    if (Object.keys(dueDateWhere).length > 0) where.dueDate = dueDateWhere

    const records = await prisma.feeRecord.findMany({
      where,
      include: {
        student: { include: { classroom: true, section: true } },
        feeStructure: true,
      },
      orderBy: { dueDate: "asc" },
    })

    const data = records.map((r) => ({
      admissionNumber: r.student.admissionNumber,
      studentName: r.student.name,
      class: r.student.classroom?.name || "N/A",
      section: r.student.section?.name || "N/A",
      feeCategory: r.feeStructure.category || "General",
      feeName: r.feeStructure.name,
      amountDue: r.amountDue,
      amountPaid: r.amountPaid,
      balance: r.amountDue - r.amountPaid - r.waiver,
      status: r.status,
      dueDate: r.dueDate.toISOString().split("T")[0],
      paidDate: r.paidDate ? r.paidDate.toISOString().split("T")[0] : "N/A",
      receiptNumber: r.receiptNumber || "N/A",
      paymentMethod: r.paymentMethod || "N/A",
      waiver: r.waiver,
    }))

    const totalCollected = records.reduce((a, r) => a + r.amountPaid, 0)
    const totalDue = records.reduce((a, r) => a + r.amountDue, 0)
    const totalWaiver = records.reduce((a, r) => a + r.waiver, 0)

    return {
      title: "Fee Collection Report",
      module: "fees",
      generatedAt: new Date(),
      rowCount: data.length,
      columns: this.getAvailableFields("fees"),
      data,
      summary: {
        totalDue,
        totalCollected,
        totalWaiver,
        outstandingBalance: totalDue - totalCollected - totalWaiver,
        collectionRate: totalDue > 0 ? ((totalCollected / totalDue) * 100).toFixed(1) : "0",
        recordCount: data.length,
      },
    }
  }

  // ─── Attendance Report ──────────────────────────────────────

  private static async generateAttendanceReport(
    tenantId: string,
    config: ReportConfig,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ReportResult> {
    const studentWhere: Record<string, unknown> = { tenantId }
    if (config.classId) studentWhere.classRoomId = config.classId
    if (config.sectionId) studentWhere.sectionId = config.sectionId

    const dateWhere: Record<string, unknown> = {}
    if (dateFrom) dateWhere.gte = dateFrom
    if (dateTo) dateWhere.lte = dateTo

    const where: Record<string, unknown> = { student: studentWhere }
    if (config.statusFilter) where.status = config.statusFilter
    if (Object.keys(dateWhere).length > 0) where.date = dateWhere

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        student: { include: { classroom: true, section: true } },
      },
      orderBy: { date: "asc" },
      take: 5000,
    })

    const data = records.map((r) => ({
      admissionNumber: r.student.admissionNumber,
      studentName: r.student.name,
      class: r.student.classroom?.name || "N/A",
      section: r.student.section?.name || "N/A",
      date: r.date.toISOString().split("T")[0],
      status: r.status,
      remarks: r.remarks || "",
    }))

    const presentCount = records.filter((r) => r.status === "PRESENT").length
    const absentCount = records.filter((r) => r.status === "ABSENT").length
    const lateCount = records.filter((r) => r.status === "LATE").length

    return {
      title: "Attendance Report",
      module: "attendance",
      generatedAt: new Date(),
      rowCount: data.length,
      columns: this.getAvailableFields("attendance"),
      data,
      summary: {
        totalRecords: data.length,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        attendanceRate: records.length > 0 ? ((presentCount / records.length) * 100).toFixed(1) : "0",
      },
    }
  }

  // ─── Academics Report ───────────────────────────────────────

  private static async generateAcademicsReport(
    tenantId: string,
    config: ReportConfig,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ReportResult> {
    const studentWhere: Record<string, unknown> = { tenantId }
    if (config.classId) studentWhere.classRoomId = config.classId
    if (config.sectionId) studentWhere.sectionId = config.sectionId

    const examWhere: Record<string, unknown> = {}
    if (dateFrom) examWhere.startDate = { gte: dateFrom }
    if (dateTo) examWhere.endDate = { lte: dateTo }
    if (config.statusFilter) examWhere.type = config.statusFilter

    const where: Record<string, unknown> = { student: studentWhere }
    if (Object.keys(examWhere).length > 0) where.exam = examWhere

    const marks = await prisma.markEntry.findMany({
      where,
      include: {
        student: { include: { classroom: true, section: true } },
        exam: true,
        subject: true,
      },
      orderBy: [
        { student: { classroom: { numeric: "asc" } } },
        { student: { name: "asc" } },
      ],
      take: 5000,
    })

    const data = marks.map((m) => ({
      admissionNumber: m.student.admissionNumber,
      studentName: m.student.name,
      class: m.student.classroom?.name || "N/A",
      section: m.student.section?.name || "N/A",
      examName: m.exam.name,
      examType: m.exam.type,
      term: m.exam.term,
      subjectCode: m.subject.code,
      subjectName: m.subject.name,
      marks: m.marks,
      maxMarks: m.maxMarks,
      percentage: m.maxMarks > 0 ? ((m.marks / m.maxMarks) * 100).toFixed(1) : "0",
      grade: m.grade || "N/A",
      remarks: m.remarks || "",
    }))

    const totalMarks = marks.reduce((a, m) => a + m.marks, 0)
    const totalMaxMarks = marks.reduce((a, m) => a + m.maxMarks, 0)

    return {
      title: "Academic Performance Report",
      module: "academics",
      generatedAt: new Date(),
      rowCount: data.length,
      columns: this.getAvailableFields("academics"),
      data,
      summary: {
        totalMarks,
        totalMaxMarks,
        overallPercentage: totalMaxMarks > 0 ? ((totalMarks / totalMaxMarks) * 100).toFixed(1) : "0",
        recordCount: data.length,
      },
    }
  }

  // ─── Library Report ─────────────────────────────────────────

  private static async generateLibraryReport(
    tenantId: string,
    config: ReportConfig,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ReportResult> {
    const issueDateWhere: Record<string, unknown> = {}
    if (dateFrom) issueDateWhere.gte = dateFrom
    if (dateTo) issueDateWhere.lte = dateTo

    const where: Record<string, unknown> = { tenantId }
    if (config.statusFilter) where.status = config.statusFilter
    if (Object.keys(issueDateWhere).length > 0) where.issueDate = issueDateWhere

    const issues = await prisma.bookIssue.findMany({
      where,
      include: {
        book: true,
        student: { include: { classroom: true } },
      },
      orderBy: { issueDate: "asc" },
    })

    const data = issues.map((i) => ({
      bookTitle: i.book.title,
      author: i.book.author,
      isbn: i.book.isbn || "N/A",
      accessionNo: i.book.accessionNo,
      category: i.book.category,
      studentName: i.student?.name || "Staff",
      admissionNumber: i.student?.admissionNumber || i.staffId || "N/A",
      class: i.student?.classroom?.name || "N/A",
      issuedBy: i.issuedBy,
      issueDate: i.issueDate.toISOString().split("T")[0],
      dueDate: i.dueDate.toISOString().split("T")[0],
      returnDate: i.returnDate ? i.returnDate.toISOString().split("T")[0] : "N/A",
      fine: i.fine,
      status: i.status,
    }))

    const totalFine = issues.reduce((a, i) => a + i.fine, 0)
    const overdueCount = issues.filter((i) => i.status === "OVERDUE").length

    return {
      title: "Library Issue Report",
      module: "library",
      generatedAt: new Date(),
      rowCount: data.length,
      columns: this.getAvailableFields("library"),
      data,
      summary: {
        totalIssues: data.length,
        issued: issues.filter((i) => i.status === "ISSUED").length,
        returned: issues.filter((i) => i.status === "RETURNED").length,
        overdue: overdueCount,
        totalFineCollected: totalFine,
      },
    }
  }

  // ─── Health Report ──────────────────────────────────────────

  private static async generateHealthReport(
    tenantId: string,
    config: ReportConfig,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ReportResult> {
    const studentWhere: Record<string, unknown> = { tenantId }
    if (config.classId) studentWhere.classRoomId = config.classId

    const dateWhere: Record<string, unknown> = {}
    if (dateFrom) dateWhere.gte = dateFrom
    if (dateTo) dateWhere.lte = dateTo

    const where: Record<string, unknown> = { student: studentWhere }
    if (config.statusFilter) where.status = config.statusFilter
    if (Object.keys(dateWhere).length > 0) where.date = dateWhere

    const records = await prisma.healthRecord.findMany({
      where,
      include: {
        student: { include: { classroom: true } },
      },
      orderBy: { date: "asc" },
    })

    const data = records.map((r) => ({
      studentName: r.student.name,
      admissionNumber: r.student.admissionNumber,
      class: r.student.classroom?.name || "N/A",
      type: r.type,
      date: r.date.toISOString().split("T")[0],
      title: r.title,
      description: r.description || "",
      severity: r.severity || "N/A",
      diagnosedBy: r.diagnosedBy || "N/A",
      treatment: r.treatment || "",
      medication: r.medication || "",
      status: r.status,
    }))

    return {
      title: "Health Record Report",
      module: "health",
      generatedAt: new Date(),
      rowCount: data.length,
      columns: this.getAvailableFields("health"),
      data,
      summary: {
        totalRecords: data.length,
        active: records.filter((r) => r.status === "ACTIVE").length,
        resolved: records.filter((r) => r.status === "RESOLVED").length,
        chronic: records.filter((r) => r.status === "CHRONIC").length,
        critical: records.filter((r) => r.severity === "CRITICAL").length,
      },
    }
  }

  // ─── HR Report ──────────────────────────────────────────────

  private static async generateHRReport(
    tenantId: string,
    config: ReportConfig,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ReportResult> {
    const joinDateWhere: Record<string, unknown> = {}
    if (dateFrom) joinDateWhere.gte = dateFrom
    if (dateTo) joinDateWhere.lte = dateTo

    const where: Record<string, unknown> = { tenantId }
    if (config.statusFilter) where.status = config.statusFilter
    if (Object.keys(joinDateWhere).length > 0) where.joinDate = joinDateWhere

    const staff = await prisma.staff.findMany({
      where,
      include: { department: true, designation: true },
      orderBy: { name: "asc" },
    })

    const data = staff.map((s) => ({
      empId: s.empId,
      name: s.name,
      email: s.email,
      phone: s.phone,
      role: s.role,
      department: s.department?.name || "N/A",
      designation: s.designation?.name || "N/A",
      joinDate: s.joinDate.toISOString().split("T")[0],
      basicSalary: s.basicSalary ?? "N/A",
      status: s.status,
    }))

    return {
      title: "Staff Report",
      module: "hr",
      generatedAt: new Date(),
      rowCount: data.length,
      columns: this.getAvailableFields("hr"),
      data,
      summary: {
        totalStaff: data.length,
        active: staff.filter((s) => s.status === "ACTIVE").length,
        inactive: staff.filter((s) => s.status !== "ACTIVE").length,
        departments: new Set(staff.map((s) => s.departmentId).filter(Boolean)).size,
      },
    }
  }

  // ─── Transport Report ───────────────────────────────────────

  private static async generateTransportReport(
    tenantId: string,
    _config: ReportConfig,
    _dateFrom?: Date,
    _dateTo?: Date
  ): Promise<ReportResult> {
    const routes = await prisma.transportRoute.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    })

    const data = routes.map((r) => ({
      routeName: r.name,
      stops: r.stops,
      vehicle: r.vehicle || "N/A",
      driver: r.driver || "N/A",
    }))

    return {
      title: "Transport Route Report",
      module: "transport",
      generatedAt: new Date(),
      rowCount: data.length,
      columns: this.getAvailableFields("transport"),
      data,
      summary: {
        totalRoutes: data.length,
      },
    }
  }

  // ─── Voucher Report ─────────────────────────────────────────

  private static async generateVoucherReport(
    tenantId: string,
    config: ReportConfig,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ReportResult> {
    const dateWhere: Record<string, unknown> = {}
    if (dateFrom) dateWhere.gte = dateFrom
    if (dateTo) dateWhere.lte = dateTo

    const where: Record<string, unknown> = { tenantId }
    if (config.statusFilter) where.status = config.statusFilter
    if (Object.keys(dateWhere).length > 0) where.date = dateWhere

    const vouchers = await prisma.voucher.findMany({
      where,
      orderBy: { date: "asc" },
    })

    const data = vouchers.map((v) => ({
      voucherNo: v.voucherNo,
      type: v.type,
      category: v.category,
      amount: v.amount,
      description: v.description,
      date: v.date.toISOString().split("T")[0],
      paidBy: v.paidBy || "N/A",
      approvedBy: v.approvedBy || "N/A",
      status: v.status,
      receiptNo: v.receiptNo || "N/A",
      remarks: v.remarks || "",
    }))

    const totalAmount = vouchers.reduce((a, v) => a + v.amount, 0)

    return {
      title: "Voucher Report",
      module: "vouchers",
      generatedAt: new Date(),
      rowCount: data.length,
      columns: this.getAvailableFields("vouchers"),
      data,
      summary: {
        totalAmount,
        pending: vouchers.filter((v) => v.status === "PENDING").length,
        approved: vouchers.filter((v) => v.status === "APPROVED").length,
        rejected: vouchers.filter((v) => v.status === "REJECTED").length,
      },
    }
  }

  // ─── Student Report ─────────────────────────────────────────

  private static async generateStudentReport(
    tenantId: string,
    config: ReportConfig,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ReportResult> {
    const admissionDateWhere: Record<string, unknown> = {}
    if (dateFrom) admissionDateWhere.gte = dateFrom
    if (dateTo) admissionDateWhere.lte = dateTo

    const where: Record<string, unknown> = { tenantId }
    if (config.classId) where.classRoomId = config.classId
    if (config.sectionId) where.sectionId = config.sectionId
    if (config.campusId) where.campusId = config.campusId
    if (config.statusFilter) where.status = config.statusFilter
    if (Object.keys(admissionDateWhere).length > 0) where.admissionDate = admissionDateWhere

    const students = await prisma.student.findMany({
      where,
      include: { classroom: true, section: true },
      orderBy: { name: "asc" },
    })

    const data = students.map((s) => ({
      admissionNumber: s.admissionNumber,
      rollNumber: s.rollNumber || "N/A",
      name: s.name,
      gender: s.gender,
      dob: s.dob.toISOString().split("T")[0],
      bloodGroup: s.bloodGroup || "N/A",
      category: s.category,
      class: s.classroom?.name || "N/A",
      section: s.section?.name || "N/A",
      fatherName: s.fatherName,
      motherName: s.motherName,
      phone: s.phone,
      address: s.address || "N/A",
      admissionDate: s.admissionDate.toISOString().split("T")[0],
      status: s.status,
    }))

    return {
      title: "Student Report",
      module: "students",
      generatedAt: new Date(),
      rowCount: data.length,
      columns: this.getAvailableFields("students"),
      data,
      summary: {
        totalStudents: data.length,
        active: students.filter((s) => s.status === "ACTIVE").length,
        inactive: students.filter((s) => s.status !== "ACTIVE").length,
        male: students.filter((s) => s.gender === "MALE").length,
        female: students.filter((s) => s.gender === "FEMALE").length,
      },
    }
  }

  // ─── Enquiry Report ─────────────────────────────────────────

  private static async generateEnquiryReport(
    tenantId: string,
    config: ReportConfig,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ReportResult> {
    const dateWhere: Record<string, unknown> = {}
    if (dateFrom) dateWhere.gte = dateFrom
    if (dateTo) dateWhere.lte = dateTo

    const where: Record<string, unknown> = { tenantId }
    if (config.statusFilter) where.status = config.statusFilter
    if (config.classId) where.classAppliedId = config.classId
    if (Object.keys(dateWhere).length > 0) where.date = dateWhere

    const enquiries = await prisma.enquiry.findMany({
      where,
      include: { classApplied: true, assignedTo: true },
      orderBy: { date: "asc" },
    })

    const data = enquiries.map((e) => ({
      enquiryNo: e.enquiryNo,
      date: e.date.toISOString().split("T")[0],
      studentName: e.studentName,
      parentName: e.parentName,
      phone: e.phone,
      email: e.email || "N/A",
      source: e.source || "N/A",
      classApplied: e.classApplied?.name || "N/A",
      status: e.status,
      assignedTo: e.assignedTo?.name || "Unassigned",
      lastFollowUp: e.lastFollowUp ? e.lastFollowUp.toISOString().split("T")[0] : "N/A",
      nextFollowUp: e.nextFollowUp ? e.nextFollowUp.toISOString().split("T")[0] : "N/A",
      notes: e.notes || "",
    }))

    return {
      title: "Enquiry Report",
      module: "enquiries",
      generatedAt: new Date(),
      rowCount: data.length,
      columns: this.getAvailableFields("enquiries"),
      data,
      summary: {
        totalEnquiries: data.length,
        open: enquiries.filter((e) => e.status === "OPEN").length,
        converted: enquiries.filter((e) => e.status === "CONVERTED").length,
        closed: enquiries.filter((e) => e.status === "CLOSED").length,
      },
    }
  }

  // ─── Drill-down: Fee detail by student ──────────────────────

  static async getFeeDetail(tenantId: string, studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId, tenantId },
      include: { classroom: true, section: true },
    })
    if (!student) throw new Error("Student not found")

    const records = await prisma.feeRecord.findMany({
      where: { studentId },
      include: { feeStructure: true, transactions: { orderBy: { transactionDate: "desc" } } },
      orderBy: { dueDate: "asc" },
    })

    const totalDue = records.reduce((a, r) => a + r.amountDue, 0)
    const totalPaid = records.reduce((a, r) => a + r.amountPaid, 0)
    const totalWaiver = records.reduce((a, r) => a + r.waiver, 0)

    return {
      student,
      records: records.map((r) => ({
        id: r.id,
        feeName: r.feeStructure.name,
        category: r.feeStructure.category,
        amountDue: r.amountDue,
        amountPaid: r.amountPaid,
        waiver: r.waiver,
        balance: r.amountDue - r.amountPaid - r.waiver,
        status: r.status,
        dueDate: r.dueDate.toISOString().split("T")[0],
        paidDate: r.paidDate ? r.paidDate.toISOString().split("T")[0] : null,
        receiptNumber: r.receiptNumber,
        paymentMethod: r.paymentMethod,
        transactions: r.transactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          paymentMethod: t.paymentMethod,
          transactionDate: t.transactionDate.toISOString().split("T")[0],
          receiptNumber: t.receiptNumber,
          remarks: t.remarks,
        })),
      })),
      summary: { totalDue, totalPaid, totalWaiver, outstanding: totalDue - totalPaid - totalWaiver },
    }
  }

  // ─── Drill-down: Attendance detail by student ───────────────

  static async getAttendanceDetail(tenantId: string, studentId: string, dateFrom?: Date, dateTo?: Date) {
    const student = await prisma.student.findUnique({
      where: { id: studentId, tenantId },
      include: { classroom: true, section: true },
    })
    if (!student) throw new Error("Student not found")

    const dateWhere: Record<string, unknown> = {}
    if (dateFrom) dateWhere.gte = dateFrom
    if (dateTo) dateWhere.lte = dateTo

    const where: Record<string, unknown> = { studentId }
    if (Object.keys(dateWhere).length > 0) where.date = dateWhere

    const records = await prisma.attendanceRecord.findMany({
      where,
      orderBy: { date: "desc" },
      take: 365,
    })

    const presentCount = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length
    const absentCount = records.filter((r) => r.status === "ABSENT").length

    return {
      student,
      records: records.map((r) => ({
        date: r.date.toISOString().split("T")[0],
        status: r.status,
        remarks: r.remarks,
      })),
      summary: {
        totalDays: records.length,
        present: presentCount,
        absent: absentCount,
        attendanceRate: records.length > 0 ? ((presentCount / records.length) * 100).toFixed(1) : "0",
      },
    }
  }

  // ─── Drill-down: Academic detail by student ─────────────────

  static async getAcademicDetail(tenantId: string, studentId: string, examId?: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId, tenantId },
      include: { classroom: true, section: true },
    })
    if (!student) throw new Error("Student not found")

    const where: Record<string, unknown> = { studentId }
    if (examId) where.examId = examId

    const marks = await prisma.markEntry.findMany({
      where,
      include: { exam: true, subject: true },
      orderBy: [{ exam: { startDate: "asc" } }, { subject: { name: "asc" } }],
    })

    // Group by exam
    const examGroups = new Map<string, { exam: { name: string; type: string; term: string | number }; subjects: unknown[]; totalMarks: number; totalMaxMarks: number }>()
    marks.forEach((m) => {
      if (!examGroups.has(m.examId)) {
        examGroups.set(m.examId, {
          exam: { name: m.exam.name, type: m.exam.type, term: m.exam.term },
          subjects: [],
          totalMarks: 0,
          totalMaxMarks: 0,
        })
      }
      const group = examGroups.get(m.examId)!
      group.subjects.push({
        subjectCode: m.subject.code,
        subjectName: m.subject.name,
        marks: m.marks,
        maxMarks: m.maxMarks,
        grade: m.grade,
        remarks: m.remarks,
      })
      group.totalMarks += m.marks
      group.totalMaxMarks += m.maxMarks
    })

    return {
      student,
      examGroups: Array.from(examGroups.values()).map((g) => ({
        ...g,
        percentage: g.totalMaxMarks > 0 ? ((g.totalMarks / g.totalMaxMarks) * 100).toFixed(1) : "0",
      })),
    }
  }
}
