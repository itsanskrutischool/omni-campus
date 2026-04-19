import { NextRequest, NextResponse } from "next/server"
import { TallyService } from "@/services/tally.service"

/**
 * GET /api/utilities/tally-export — Export fee data as Tally XML
 * Query params: tenantId, startDate?, endDate?, classId?, format? (xml|daybook)
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")
    const format = searchParams.get("format") || "xml"

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId is required" }, { status: 400 })
    }

    const filters = {
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
      classId: searchParams.get("classId") || undefined,
    }

    if (format === "daybook") {
      const date = searchParams.get("date") ? new Date(searchParams.get("date")!) : new Date()
      const daybook = await TallyService.exportDayBook(tenantId, date)
      return NextResponse.json(daybook)
    }

    // Default: Tally XML export
    const xml = await TallyService.exportToTallyXML(tenantId, filters)

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="tally-export-${new Date().toISOString().split("T")[0]}.xml"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
