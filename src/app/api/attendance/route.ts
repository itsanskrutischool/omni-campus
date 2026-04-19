import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { AttendanceService } from "@/services/attendance.service"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const classRoomId = searchParams.get("classRoomId")
    const dateParam = searchParams.get("date")
    const stats = searchParams.get("stats") === "true"
    const insight = searchParams.get("insight") === "true"

    if (!classRoomId) {
      return NextResponse.json({ error: "classRoomId is required" }, { status: 400 })
    }

    if (stats) {
      const trend = await AttendanceService.getClassAttendanceTrends(session.user.tenantId, classRoomId)
      return NextResponse.json(trend)
    }

    if (insight) {
      const aiInsight = await AttendanceService.getAIAbsenceInsight(session.user.tenantId, classRoomId)
      return NextResponse.json(aiInsight)
    }

    if (!dateParam) {
      return NextResponse.json({ error: "date is required for records" }, { status: 400 })
    }

    const records = await AttendanceService.getAttendanceByClass(
      session.user.tenantId,
      classRoomId,
      new Date(dateParam)
    )

    return NextResponse.json(records)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { classRoomId, date, entries } = body

    if (!classRoomId || !date || !entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const results = await AttendanceService.markBulkAttendance(
      session.user.tenantId,
      classRoomId,
      new Date(date),
      entries
    )

    return NextResponse.json({ success: true, processed: results.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
