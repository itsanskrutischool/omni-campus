import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ExportService } from "@/services/export.service"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden: Export restricted to administrative authority" }, { status: 403 })
    }

    const url = new URL(req.url)
    const type = url.searchParams.get("type")

    let data: any[] = []
    let filename = "export.csv"

    if (type === 'STUDENT') {
      data = await ExportService.exportStudents(session.user.tenantId)
      filename = `OmniCampus_Students_${Date.now()}.csv`
    } else if (type === 'STAFF') {
      data = await ExportService.exportStaff(session.user.tenantId)
      filename = `OmniCampus_StaffHR_${Date.now()}.csv`
    } else if (type === 'FEES') {
      data = await ExportService.exportFeeLedger(session.user.tenantId)
      filename = `OmniCampus_FinancialLedger_${Date.now()}.csv`
    } else {
      return NextResponse.json({ error: "Invalid Export Type" }, { status: 400 })
    }

    const csvOutput = ExportService.jsonToCsv(data)

    // Stream download explicitly mapping disposition correctly for browsers
    return new NextResponse(csvOutput, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
