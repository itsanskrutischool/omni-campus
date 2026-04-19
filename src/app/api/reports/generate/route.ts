import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ReportService, type ReportModule } from "@/services/report.service"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      module,
      dateFrom,
      dateTo,
      classId,
      sectionId,
      campusId,
      statusFilter,
      customFields,
    } = body

    if (!module) {
      return NextResponse.json({ error: "Module is required" }, { status: 400 })
    }

    const validModules: ReportModule[] = [
      "fees",
      "attendance",
      "academics",
      "library",
      "health",
      "hr",
      "transport",
      "vouchers",
      "students",
      "enquiries",
    ]
    if (!validModules.includes(module)) {
      return NextResponse.json({ error: `Invalid module: ${module}` }, { status: 400 })
    }

    const result = await ReportService.generateReport(session.user.tenantId, {
      module,
      dateFrom,
      dateTo,
      classId,
      sectionId,
      campusId,
      statusFilter,
      customFields,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Report generation error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const reportModule = searchParams.get("module") as ReportModule | null

    if (!reportModule) {
      return NextResponse.json(
        { error: "Module query parameter is required" },
        { status: 400 }
      )
    }

    const fields = ReportService.getAvailableFields(reportModule)
    return NextResponse.json({ module: reportModule, fields })
  } catch (error) {
    console.error("Report fields error:", error)
    return NextResponse.json({ error: "Failed to fetch fields" }, { status: 500 })
  }
}
