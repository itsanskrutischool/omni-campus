import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

export class QuizService {
  // ─── Quiz Management ───────────────────────────────────

  static async createQuiz(tenantId: string, userId: string | undefined, payload: {
    title: string
    description?: string
    subjectId?: string
    classRoomId?: string
    duration: number
    totalMarks: number
    passingMarks?: number
    maxAttempts?: number
    shuffleQuestions?: boolean
    showResults?: boolean
    startTime?: Date
    endTime?: Date
  }) {
    const quiz = await prisma.quiz.create({
      data: {
        tenantId,
        createdBy: userId || "system",
        title: payload.title,
        description: payload.description,
        subjectId: payload.subjectId,
        classRoomId: payload.classRoomId,
        duration: payload.duration,
        totalMarks: payload.totalMarks,
        passingMarks: payload.passingMarks || 40,
        maxAttempts: payload.maxAttempts || 1,
        shuffleQuestions: payload.shuffleQuestions || false,
        showResults: payload.showResults !== false,
        startTime: payload.startTime,
        endTime: payload.endTime,
        status: "DRAFT",
      },
      include: {
        subject: { select: { name: true } },
        classRoom: { select: { name: true } },
      },
    })

    await AuditService.log({
      tenantId,
      userId,
      action: "CREATE",
      module: "assessment",
      entityType: "Quiz",
      entityId: quiz.id,
      summary: `Quiz created: ${quiz.title}`,
    })

    return quiz
  }

  static async getQuizzes(tenantId: string, query?: {
    subjectId?: string
    classRoomId?: string
    status?: string
    isPublished?: boolean
    createdBy?: string
    page?: number
    pageSize?: number
  }) {
    const page = query?.page || 1
    const pageSize = query?.pageSize || 20
    const skip = (page - 1) * pageSize

    const where: Record<string, unknown> = { tenantId }
    if (query?.subjectId) where.subjectId = query.subjectId
    if (query?.classRoomId) where.classRoomId = query.classRoomId
    if (query?.status) where.status = query.status
    if (query?.isPublished !== undefined) where.isPublished = query.isPublished
    if (query?.createdBy) where.createdBy = query.createdBy

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        include: {
          subject: { select: { name: true } },
          classRoom: { select: { name: true } },
          _count: { select: { questions: true, attempts: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.quiz.count({ where }),
    ])

    return { quizzes, total, page, pageCount: Math.ceil(total / pageSize) }
  }

  static async getQuiz(tenantId: string, quizId: string, includeQuestions = false) {
    return await prisma.quiz.findUnique({
      where: { id: quizId, tenantId },
      include: {
        subject: { select: { name: true } },
        classRoom: { select: { name: true } },
        questions: includeQuestions ? { orderBy: { order: "asc" } } : false,
        _count: { select: { attempts: true } },
      },
    })
  }

  static async updateQuiz(tenantId: string, userId: string | undefined, quizId: string, payload: Partial<{
    title: string
    description: string
    duration: number
    totalMarks: number
    passingMarks: number
    maxAttempts: number
    shuffleQuestions: boolean
    showResults: boolean
    startTime: Date
    endTime: Date
    status: string
    isPublished: boolean
  }>) {
    const existing = await prisma.quiz.findUnique({ where: { id: quizId, tenantId } })
    if (!existing) throw new Error("Quiz not found")

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: payload,
    })

    await AuditService.log({
      tenantId,
      userId,
      action: "UPDATE",
      module: "assessment",
      entityType: "Quiz",
      entityId: quizId,
      summary: `Quiz updated: ${quiz.title}`,
      oldValue: existing,
      newValue: quiz,
    })

    return quiz
  }

  static async deleteQuiz(tenantId: string, userId: string | undefined, quizId: string) {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId, tenantId } })
    if (!quiz) throw new Error("Quiz not found")

    await prisma.quiz.delete({ where: { id: quizId } })

    await AuditService.log({
      tenantId,
      userId,
      action: "DELETE",
      module: "assessment",
      entityType: "Quiz",
      entityId: quizId,
      summary: `Quiz deleted: ${quiz.title}`,
    })
  }

  // ─── Question Management ───────────────────────────────────

  static async addQuestion(tenantId: string, userId: string | undefined, quizId: string, payload: {
    type: string
    text: string
    imageUrl?: string
    options: string[]
    correctAnswer: string
    marks?: number
    explanation?: string
    order?: number
  }) {
    const question = await prisma.question.create({
      data: {
        quizId,
        type: payload.type,
        text: payload.text,
        imageUrl: payload.imageUrl,
        options: JSON.stringify(payload.options),
        correctAnswer: payload.correctAnswer,
        marks: payload.marks || 1,
        explanation: payload.explanation,
        order: payload.order || 0,
      },
    })

    await AuditService.log({
      tenantId,
      userId,
      action: "CREATE",
      module: "assessment",
      entityType: "Question",
      entityId: question.id,
      summary: `Question added to quiz ${quizId}`,
    })

    return question
  }

  static async updateQuestion(tenantId: string, userId: string | undefined, questionId: string, payload: Partial<{
    text: string
    options: string[]
    correctAnswer: string
    marks: number
    explanation: string
    order: number
  }>) {
    const data: Record<string, unknown> = { ...payload }
    if (payload.options) data.options = JSON.stringify(payload.options)

    return await prisma.question.update({
      where: { id: questionId },
      data,
    })
  }

  static async deleteQuestion(tenantId: string, userId: string | undefined, questionId: string) {
    await prisma.question.delete({ where: { id: questionId } })

    await AuditService.log({
      tenantId,
      userId,
      action: "DELETE",
      module: "assessment",
      entityType: "Question",
      entityId: questionId,
      summary: `Question deleted`,
    })
  }

  // ─── Quiz Attempts / Taking ───────────────────────────────────

  static async startAttempt(tenantId: string, quizId: string, studentId: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId, tenantId },
      include: { questions: { orderBy: { order: "asc" } } },
    })

    if (!quiz) throw new Error("Quiz not found")
    if (!quiz.isPublished) throw new Error("Quiz is not published")
    if (quiz.startTime && new Date() < quiz.startTime) throw new Error("Quiz has not started")
    if (quiz.endTime && new Date() > quiz.endTime) throw new Error("Quiz has ended")

    // Check attempt limit
    const attemptCount = await prisma.quizAttempt.count({
      where: { quizId, studentId, status: { not: "IN_PROGRESS" } },
    })

    if (attemptCount >= quiz.maxAttempts) {
      throw new Error(`Maximum ${quiz.maxAttempts} attempts allowed`)
    }

    // Check for existing in-progress attempt
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: { quizId, studentId, status: "IN_PROGRESS" },
    })

    if (existingAttempt) {
      return existingAttempt
    }

    // Create new attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId,
        tenantId,
        answers: JSON.stringify({}),
        status: "IN_PROGRESS",
      },
    })

    return { attempt, quiz }
  }

  static async saveAnswer(tenantId: string, attemptId: string, questionId: string, answer: string) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId, tenantId },
    })

    if (!attempt) throw new Error("Attempt not found")
    if (attempt.status !== "IN_PROGRESS") throw new Error("Attempt is not in progress")

    const answers = JSON.parse(attempt.answers || "{}")
    answers[questionId] = answer

    return await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: { answers: JSON.stringify(answers) },
    })
  }

  static async submitAttempt(tenantId: string, attemptId: string, timeSpent: number) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId, tenantId },
      include: { quiz: { include: { questions: true } } },
    })

    if (!attempt) throw new Error("Attempt not found")
    if (attempt.status !== "IN_PROGRESS") throw new Error("Attempt already submitted")

    const answers = JSON.parse(attempt.answers || "{}")
    let score = 0

    for (const question of attempt.quiz.questions) {
      const studentAnswer = answers[question.id]
      if (studentAnswer === question.correctAnswer) {
        score += question.marks
      }
    }

    const percentage = (score / attempt.quiz.totalMarks) * 100

    const updated = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        score,
        percentage,
        timeSpent,
      },
    })

    return { attempt: updated, score, percentage, totalMarks: attempt.quiz.totalMarks }
  }

  static async getStudentAttempts(tenantId: string, studentId: string) {
    return await prisma.quizAttempt.findMany({
      where: { tenantId, studentId },
      include: {
        quiz: {
          select: {
            title: true,
            subject: { select: { name: true } },
            totalMarks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  static async getQuizResults(tenantId: string, quizId: string) {
    const [attempts, stats] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: { quizId, tenantId, status: { not: "IN_PROGRESS" } },
        include: {
          student: { select: { name: true, admissionNumber: true } },
        },
        orderBy: { score: "desc" },
      }),
      prisma.quizAttempt.aggregate({
        where: { quizId, tenantId, status: { not: "IN_PROGRESS" } },
        _avg: { score: true, percentage: true },
        _max: { score: true },
        _min: { score: true },
        _count: { _all: true },
      }),
    ])

    return { attempts, stats }
  }

  // ─── Analytics ───────────────────────────────────

  static async getAnalytics(tenantId: string, teacherId?: string) {
    const where: Record<string, unknown> = { tenantId }
    if (teacherId) where.createdBy = teacherId

    const [
      totalQuizzes,
      publishedQuizzes,
      totalAttempts,
      avgScore,
    ] = await Promise.all([
      prisma.quiz.count({ where }),
      prisma.quiz.count({ where: { ...where, isPublished: true } }),
      prisma.quizAttempt.count({ where: { tenantId, status: { not: "IN_PROGRESS" } } }),
      prisma.quizAttempt.aggregate({
        where: { tenantId, status: { not: "IN_PROGRESS" } },
        _avg: { percentage: true },
      }),
    ])

    return {
      totalQuizzes,
      publishedQuizzes,
      totalAttempts,
      avgScore: avgScore._avg.percentage || 0,
    }
  }
}
