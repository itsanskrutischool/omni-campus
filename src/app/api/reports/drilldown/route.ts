import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ReportService } from "@/services/report.service"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const reportModule = searchParams.get("module")
    const studentId = searchParams.get("studentId")

    if (!reportModule || !studentId) {
      return NextResponse.json({ error: "module and studentId are required" }, { status: 400 })
    }

    const tenantId = session.user.tenantId
    const dateFrom = searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined
    const dateTo = searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined
    const examId = searchParams.get("examId") || undefined

    let result
    switch (reportModule) {
      case "fees":
        result = await ReportService.getFeeDetail(tenantId, studentId)
        break
      case "attendance":
        result = await ReportService.getAttendanceDetail(tenantId, studentId, dateFrom, dateTo)
        break
      case "academics":
        result = await ReportService.getAcademicDetail(tenantId, studentId, examId)
        break
      default:
        return NextResponse.json({ error: `Drill-down not supported for module: ${module}` }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Drill-down error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
