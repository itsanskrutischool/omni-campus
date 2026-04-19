import { NextRequest, NextResponse } from "next/server"
import { QuizService } from "@/services/quiz.service"
import { requireAuth } from "@/lib/api-middleware"

// GET /api/quiz/[id]/questions - Get quiz questions
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get("tenantId") || auth.user.tenants[0]?.id
    
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const quiz = await QuizService.getQuiz(tenantId, params.id, true)
    return NextResponse.json(quiz.questions || [])
  } catch (error) {
    console.error("[QUIZ_QUESTIONS_GET_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch questions" },
      { status: 500 }
    )
  }
}

// POST /api/quiz/[id]/questions - Add question to quiz
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const tenantId = body.tenantId || auth.user.tenants[0]?.id
    
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const question = await QuizService.addQuestion(tenantId, auth.user.id, params.id, {
      type: body.type,
      text: body.text,
      imageUrl: body.imageUrl,
      options: body.options,
      correctAnswer: body.correctAnswer,
      marks: body.marks,
      order: body.order,
      explanation: body.explanation,
    })
    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error("[QUIZ_QUESTIONS_POST_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add question" },
      { status: 500 }
    )
  }
}
