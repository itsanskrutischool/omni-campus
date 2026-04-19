import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

export class LibraryService {
  // ─── Book CRUD ───────────────────────────────────

  static async getBooks(tenantId: string, query?: {
    search?: string
    category?: string
    subject?: string
    availableOnly?: boolean
    page?: number
    pageSize?: number
  }) {
    const page = query?.page || 1
    const pageSize = query?.pageSize || 20
    const skip = (page - 1) * pageSize

    const where: Record<string, unknown> = { tenantId }

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { author: { contains: query.search, mode: "insensitive" } },
        { isbn: { contains: query.search, mode: "insensitive" } },
        { accessionNo: { contains: query.search, mode: "insensitive" } },
      ]
    }

    if (query?.category) where.category = query.category
    if (query?.subject) where.subject = query.subject
    if (query?.availableOnly) where.availableCopies = { gt: 0 }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy: { title: "asc" },
        take: pageSize,
        skip,
        include: {
          _count: {
            select: { bookIssues: true },
          },
        },
      }),
      prisma.book.count({ where }),
    ])

    return { books, total, page, totalPages: Math.ceil(total / pageSize) }
  }

  static async getBook(tenantId: string, bookId: string) {
    return prisma.book.findFirst({
      where: { id: bookId, tenantId },
      include: {
        bookIssues: {
          where: { status: "ISSUED" },
          include: {
            student: { select: { name: true, admissionNumber: true } },
          },
          orderBy: { issueDate: "desc" },
        },
      },
    })
  }

  static async createBook(tenantId: string, payload: {
    title: string
    author: string
    isbn?: string
    accessionNo: string
    category: string
    subject?: string
    publisher?: string
    publishYear?: number
    edition?: string
    price?: number
    totalCopies?: number
    shelfLocation?: string
  }) {
    const book = await prisma.book.create({
      data: {
        tenantId,
        title: payload.title,
        author: payload.author,
        isbn: payload.isbn || null,
        accessionNo: payload.accessionNo,
        category: payload.category,
        subject: payload.subject || null,
        publisher: payload.publisher || null,
        publishYear: payload.publishYear || null,
        edition: payload.edition || null,
        price: payload.price || null,
        totalCopies: payload.totalCopies || 1,
        availableCopies: payload.totalCopies || 1,
        shelfLocation: payload.shelfLocation || null,
      },
    })

    await AuditService.log({
      tenantId,
      action: "CREATE",
      module: "library",
      entityType: "Book",
      entityId: book.id,
      summary: `New book added: ${book.title} by ${book.author}`,
    })

    return book
  }

  static async updateBook(tenantId: string, bookId: string, payload: Partial<{
    title: string
    author: string
    isbn: string
    category: string
    subject: string
    publisher: string
    publishYear: number
    edition: string
    price: number
    totalCopies: number
    availableCopies: number
    shelfLocation: string
  }>) {
    const existing = await prisma.book.findUnique({ where: { id: bookId } })

    const book = await prisma.book.update({
      where: { id: bookId, tenantId },
      data: payload,
    })

    await AuditService.log({
      tenantId,
      action: "UPDATE",
      module: "library",
      entityType: "Book",
      entityId: bookId,
      summary: `Updated book: ${book.title}`,
      oldValue: existing,
      newValue: book,
    })

    return book
  }

  static async deleteBook(tenantId: string, bookId: string) {
    const book = await prisma.book.findUnique({ where: { id: bookId, tenantId } })
    if (!book) throw new Error("Book not found")

    if (book.availableCopies < book.totalCopies) {
      throw new Error("Cannot delete book with active issues")
    }

    await prisma.book.delete({ where: { id: bookId } })

    await AuditService.log({
      tenantId,
      action: "DELETE",
      module: "library",
      entityType: "Book",
      entityId: bookId,
      summary: `Deleted book: ${book.title}`,
    })
  }

  // ─── Book Issue / Return ───────────────────────────────────

  static async issueBook(tenantId: string, payload: {
    bookId: string
    studentId?: string
    staffId?: string
    issuedBy: string
    dueDate: Date
    remarks?: string
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify book exists and has available copies
      const book = await tx.book.findUnique({
        where: { id: payload.bookId, tenantId },
      })
      if (!book) throw new Error("Book not found")
      if (book.availableCopies <= 0) throw new Error("No available copies")

      // 2. Verify student/staff exists
      if (payload.studentId) {
        const student = await tx.student.findUnique({
          where: { id: payload.studentId, tenantId },
        })
        if (!student) throw new Error("Student not found")
      }

      // 3. Create issue record
      const issue = await tx.bookIssue.create({
        data: {
          tenantId,
          bookId: payload.bookId,
          studentId: payload.studentId || null,
          staffId: payload.staffId || null,
          issuedBy: payload.issuedBy,
          dueDate: payload.dueDate,
          remarks: payload.remarks || null,
        },
        include: {
          book: true,
          student: { select: { name: true, admissionNumber: true } },
        },
      })

      // 4. Decrement available copies
      await tx.book.update({
        where: { id: payload.bookId },
        data: { availableCopies: { decrement: 1 } },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "library",
        entityType: "BookIssue",
        entityId: issue.id,
        summary: `Book issued: ${book.title} to ${payload.studentId ? issue.student?.name : "Staff"}`,
      })

      return issue
    })
  }

  static async returnBook(tenantId: string, issueId: string, payload?: {
    fine?: number
    remarks?: string
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify issue exists
      const issue = await tx.bookIssue.findUnique({
        where: { id: issueId, tenantId },
        include: { book: true },
      })
      if (!issue) throw new Error("Issue record not found")
      if (issue.status === "RETURNED") throw new Error("Book already returned")

      // 2. Calculate fine if overdue
      const now = new Date()
      let fine = payload?.fine || 0
      if (now > issue.dueDate) {
        const daysOverdue = Math.ceil((now.getTime() - issue.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        fine = daysOverdue * 10 // ₹10 per day overdue
      }

      // 3. Update issue record
      const updatedIssue = await tx.bookIssue.update({
        where: { id: issueId },
        data: {
          returnDate: now,
          fine,
          finePaid: false,
          status: "RETURNED",
          remarks: payload?.remarks || issue.remarks,
        },
      })

      // 4. Increment available copies
      await tx.book.update({
        where: { id: issue.bookId },
        data: { availableCopies: { increment: 1 } },
      })

      await AuditService.log({
        tenantId,
        action: "UPDATE",
        module: "library",
        entityType: "BookIssue",
        entityId: issueId,
        summary: `Book returned: ${issue.book.title}${fine > 0 ? ` (Fine: ₹${fine})` : ""}`,
        oldValue: issue,
        newValue: updatedIssue,
      })

      return updatedIssue
    })
  }

  static async getStudentIssues(tenantId: string, studentId: string) {
    return prisma.bookIssue.findMany({
      where: { tenantId, studentId },
      include: { book: { select: { title: true, author: true, accessionNo: true } } },
      orderBy: { issueDate: "desc" },
    })
  }

  static async getOverdueBooks(tenantId: string) {
    const now = new Date()
    return prisma.bookIssue.findMany({
      where: {
        tenantId,
        status: "ISSUED",
        dueDate: { lt: now },
      },
      include: {
        book: { select: { title: true, author: true } },
        student: { select: { name: true, admissionNumber: true, classroom: true } },
      },
      orderBy: { dueDate: "asc" },
    })
  }

  // ─── Analytics ───────────────────────────────────

  static async getAnalytics(tenantId: string) {
    const [
      totalBooks,
      totalIssues,
      activeIssues,
      overdueIssues,
      categoryBreakdown,
      recentIssues,
    ] = await Promise.all([
      prisma.book.count({ where: { tenantId } }),
      prisma.bookIssue.count({ where: { tenantId } }),
      prisma.bookIssue.count({ where: { tenantId, status: "ISSUED" } }),
      prisma.bookIssue.count({
        where: { tenantId, status: "ISSUED", dueDate: { lt: new Date() } },
      }),
      prisma.book.groupBy({
        by: ["category"],
        where: { tenantId },
        _count: { _all: true },
        _sum: { availableCopies: true, totalCopies: true },
      }),
      prisma.bookIssue.findMany({
        where: { tenantId },
        include: {
          book: { select: { title: true, author: true } },
          student: { select: { name: true, admissionNumber: true } },
        },
        orderBy: { issueDate: "desc" },
        take: 10,
      }),
    ])

    return {
      totalBooks,
      totalIssues,
      activeIssues,
      overdueIssues,
      categoryBreakdown,
      recentIssues,
    }
  }
}
