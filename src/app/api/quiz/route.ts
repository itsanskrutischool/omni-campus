import { NextRequest, NextResponse } from "next/server"
import { QuizService } from "@/services/quiz.service"
import { requireAuth } from "@/lib/api-middleware"

// GET /api/quiz - List quizzes
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get("tenantId") || auth.user.tenants[0]?.id
    
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const quizzes = await QuizService.getQuizzes(tenantId, {
      subjectId: searchParams.get("subjectId") || undefined,
      classRoomId: searchParams.get("classRoomId") || undefined,
      status: searchParams.get("status") || undefined,
      isPublished: searchParams.get("isPublished") === "true",
      createdBy: searchParams.get("createdBy") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("pageSize") || "20"),
    })

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error("[QUIZ_GET_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch quizzes" },
      { status: 500 }
    )
  }
}

// POST /api/quiz - Create quiz
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const tenantId = body.tenantId || auth.user.tenants[0]?.id
    
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const quiz = await QuizService.createQuiz(tenantId, auth.user.id, {
      title: body.title,
      description: body.description,
      subjectId: body.subjectId,
      classRoomId: body.classRoomId,
      duration: body.duration,
      totalMarks: body.totalMarks,
      passingMarks: body.passingMarks,
      maxAttempts: body.maxAttempts,
      shuffleQuestions: body.shuffleQuestions,
      showResults: body.showResults,
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined,
    })

    return NextResponse.json(quiz, { status: 201 })
  } catch (error) {
    console.error("[QUIZ_POST_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create quiz" },
      { status: 500 }
    )
  }
}
