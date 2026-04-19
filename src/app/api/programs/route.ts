import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { listPrograms, createProgram, deleteProgram } from "@/services/program.service"

/**
 * GET /api/programs
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const programs = await listPrograms(session.user.tenantId)
  return NextResponse.json(programs)
}

/**
 * POST /api/programs
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const program = await createProgram({
      ...body,
      tenantId: session.user.tenantId,
    })
    return NextResponse.json(program, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create program" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/programs?id=xxx
 */
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 })
  }

  try {
    await deleteProgram(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete program" },
      { status: 500 }
    )
  }
}
