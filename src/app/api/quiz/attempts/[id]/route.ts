import { NextRequest, NextResponse } from "next/server"
import { QuizService } from "@/services/quiz.service"
import { requireAuth } from "@/lib/api-middleware"

// PATCH /api/quiz/attempts/[id] - Save answer or submit
export async function PATCH(
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

    if (body.action === "save-answer") {
      const result = await QuizService.saveAnswer(
        tenantId,
        params.id,
        body.questionId,
        body.answer
      )
      return NextResponse.json(result)
    }

    if (body.action === "submit") {
      const result = await QuizService.submitAttempt(tenantId, params.id, body.timeSpent || 0)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[QUIZ_ATTEMPT_PATCH_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update attempt" },
      { status: 500 }
    )
  }
}

// GET /api/quiz/attempts/[id] - Get attempt details
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

    const attempt = await QuizService.getQuizResults(tenantId, searchParams.get("quizId") || "")
    return NextResponse.json(attempt)
  } catch (error) {
    console.error("[QUIZ_ATTEMPT_GET_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch attempt" },
      { status: 500 }
    )
  }
}
