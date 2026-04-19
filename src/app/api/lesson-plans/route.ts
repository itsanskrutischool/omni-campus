import { NextRequest, NextResponse } from "next/server"
import { LessonPlanService } from "@/services/lessonplan.service"
import { requireAuth } from "@/lib/api-middleware"

// GET /api/lesson-plans - List lesson plans
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get("tenantId") || auth.user.tenants[0]?.id
    
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const plans = await LessonPlanService.getPlans(tenantId, {
      teacherId: searchParams.get("teacherId") || undefined,
      subjectId: searchParams.get("subjectId") || undefined,
      classRoomId: searchParams.get("classRoomId") || undefined,
      fromDate: searchParams.get("fromDate") ? new Date(searchParams.get("fromDate")!) : undefined,
      toDate: searchParams.get("toDate") ? new Date(searchParams.get("toDate")!) : undefined,
      status: searchParams.get("status") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("pageSize") || "20"),
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error("[LESSON_PLANS_GET_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch lesson plans" },
      { status: 500 }
    )
  }
}

// POST /api/lesson-plans - Create lesson plan
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const tenantId = body.tenantId || auth.user.tenants[0]?.id
    
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const plan = await LessonPlanService.createPlan(tenantId, auth.user.id, {
      teacherId: body.teacherId,
      subjectId: body.subjectId,
      classRoomId: body.classRoomId,
      chapter: body.chapter,
      topic: body.topic,
      objectives: body.objectives,
      materials: body.materials,
      activities: body.activities,
      homework: body.homework,
      assessment: body.assessment,
      duration: body.duration,
      date: new Date(body.date),
      attachments: body.attachments,
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error("[LESSON_PLANS_POST_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create lesson plan" },
      { status: 500 }
    )
  }
}
