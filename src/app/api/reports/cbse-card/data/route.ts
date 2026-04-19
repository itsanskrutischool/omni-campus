import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { ExamService } from "@/services/exam.service"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentId = req.nextUrl.searchParams.get("studentId")
    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId" }, { status: 400 })
    }

    const data = await ExamService.getDetailedCBSEData(session.user.tenantId, studentId)
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load report data"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
