import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createStudent, listStudents, getAdmissionStats } from "@/services/student.service"

/**
 * GET /api/students
 * List students with filters. Query params: classRoomId, sectionId, status, search, page, pageSize
 * Also supports ?stats=true to return admission statistics.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)

    // Stats endpoint
    if (searchParams.get("stats") === "true") {
      const stats = await getAdmissionStats(session.user.tenantId)
      return NextResponse.json(stats)
    }

    const filters = {
      tenantId: session.user.tenantId,
      classRoomId: searchParams.get("classRoomId") || undefined,
      sectionId: searchParams.get("sectionId") || undefined,
      status: searchParams.get("status") || undefined,
      admissionStatus: searchParams.get("admissionStatus") || undefined,
      search: searchParams.get("search") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("pageSize") || "20"),
    }

    const result = await listStudents(filters)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[API_STUDENTS_LIST] Error:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

/**
 * POST /api/students
 * Create a new student. Body: CreateStudentInput fields.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only ADMIN and RECEPTION can create students
  const role = session.user.role
  if (role !== "ADMIN" && role !== "RECEPTION" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const student = await createStudent({
      ...body,
      tenantId: session.user.tenantId,
      campusId: body.campusId || session.user.campusId,
    })
    return NextResponse.json(student, { status: 201 })
  } catch (error: any) {
    console.error("[API_STUDENTS] Create error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create student" },
      { status: 500 }
    )
  }
}
