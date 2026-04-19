import { NextRequest, NextResponse } from "next/server"
import { QuizService } from "@/services/quiz.service"
import { requireAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"

// POST /api/quiz/[id]/attempts - Start quiz attempt
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

    const attempt = await QuizService.startAttempt(tenantId, params.id, body.studentId)
    return NextResponse.json(attempt, { status: 201 })
  } catch (error) {
    console.error("[QUIZ_ATTEMPT_POST_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start attempt" },
      { status: 500 }
    )
  }
}

// GET /api/quiz/[id]/attempts - Get quiz attempts
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

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId: params.id,
        tenantId,
      },
      include: {
        student: { select: { name: true, admissionNumber: true } },
        quiz: { select: { title: true, totalMarks: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(attempts)
  } catch (error) {
    console.error("[QUIZ_ATTEMPTS_GET_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch attempts" },
      { status: 500 }
    )
  }
}
