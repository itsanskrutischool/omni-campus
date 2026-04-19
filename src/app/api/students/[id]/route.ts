import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getStudentById, updateStudent, deleteStudent } from "@/services/student.service"

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/students/[id]
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const student = await getStudentById(id, session.user.tenantId)

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error("[API_STUDENTS_GET] Error:", error)
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 })
  }
}

/**
 * PATCH /api/students/[id]
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role
  if (role !== "ADMIN" && role !== "RECEPTION" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await context.params
    const body = await req.json()
    const student = await updateStudent(id, session.user.tenantId, body)
    return NextResponse.json(student)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update student" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/students/[id]
 * Soft-deletes by setting status to INACTIVE.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await context.params
    await deleteStudent(id, session.user.tenantId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete student" },
      { status: 500 }
    )
  }
}
