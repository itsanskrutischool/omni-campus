import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ExamService } from "@/services/exam.service"

export async function GET(req: Request, { params }: { params: Promise<{ examId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { examId } = await params
    const { searchParams } = new URL(req.url)
    const classRoomId = searchParams.get("classRoomId")
    const subjectId = searchParams.get("subjectId")

    if (!classRoomId || !subjectId) {
      return NextResponse.json({ error: "Missing classRoomId or subjectId" }, { status: 400 })
    }

    const grid = await ExamService.getMarkEntriesGrid(session.user.tenantId, examId, classRoomId, subjectId)
    return NextResponse.json(grid)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ examId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { examId } = await params
    const body = await req.json()
    const { classRoomId, subjectId, entries } = body

    if (!classRoomId || !subjectId || !entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 })
    }

    const results = await ExamService.upsertMarksBulk(
      session.user.tenantId, 
      examId, 
      subjectId, 
      entries,
      {
        userId: session.user.id,
        userName: session.user.name || undefined,
        userRole: session.user.role
      }
    )
    return NextResponse.json({ success: true, processed: results.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
