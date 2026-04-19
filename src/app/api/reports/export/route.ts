import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ReportService, type ReportModule } from "@/services/report.service"
import { ExportService } from "@/services/export.service"
import { PDFService } from "@/services/pdf.service"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      module,
      format,
      dateFrom,
      dateTo,
      classId,
      sectionId,
      campusId,
      statusFilter,
      customFields,
    } = body

    if (!module || !format) {
      return NextResponse.json({ error: "Module and format are required" }, { status: 400 })
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

    // Generate report data
    const report = await ReportService.generateReport(session.user.tenantId, {
      module,
      dateFrom,
      dateTo,
      classId,
      sectionId,
      campusId,
      statusFilter,
      customFields,
    })

    // Filter columns if customFields provided
    let exportData = report.data
    if (customFields && customFields.length > 0) {
      exportData = report.data.map((row) => {
        const filtered: Record<string, string | number | null> = {}
        customFields.forEach((field: string) => {
          filtered[field] = row[field] ?? null
        })
        return filtered
      })
    }

    const fileName = `${report.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`

    if (format === "csv") {
      const csv = ExportService.jsonToCsv(exportData)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${fileName}.csv"`,
        },
      })
    }

    if (format === "xlsx") {
      const buffer = ExportService.jsonToWorkbookBuffer(exportData, report.title)
      return new NextResponse(buffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${fileName}.xlsx"`,
        },
      })
    }

    if (format === "pdf") {
      const html = generatePDFHTML(report, session.user.tenantSlug || "Omni Campus")
      const pdfBuffer = await PDFService.generateA4PDF(html)
      return new NextResponse(pdfBuffer as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
        },
      })
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
  } catch (error) {
    console.error("Report export error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function generatePDFHTML(report: Awaited<ReturnType<typeof ReportService.generateReport>>, schoolName: string): string {
  const { title, data, summary, generatedAt, rowCount } = report
  const columns = data.length > 0 ? Object.keys(data[0]) : []

  const summaryHTML = summary
    ? `
      <div class="summary-section">
        <h2>Summary</h2>
        <table class="summary-table">
          ${Object.entries(summary)
            .map(
              ([key, val]) => `
              <tr>
                <td class="label">${formatLabel(key)}</td>
                <td class="value">${typeof val === "number" ? val.toLocaleString("en-IN") : val}</td>
              </tr>
            `
            )
            .join("")}
        </table>
      </div>
    `
    : ""

  const tableRows = data
    .slice(0, 200)
    .map(
      (row) => `
    <tr>
      ${columns.map((col) => `<td>${row[col] ?? ""}</td>`).join("")}
    </tr>
  `
    )
    .join("")

  const truncatedNote = data.length > 200 ? `<p class="note">Showing first 200 of ${rowCount} rows. Export CSV for full data.</p>` : ""

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        @page { size: A4; margin: 0; }
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; color: #1e293b; background: white; font-size: 9pt; }
        .page { padding: 15mm; }
        .header { text-align: center; border-bottom: 3px double #059669; margin-bottom: 15px; padding-bottom: 10px; }
        .header h1 { margin: 0; font-size: 20pt; color: #059669; }
        .header p { margin: 4px 0 0; color: #64748b; font-size: 9pt; }
        .meta { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 8pt; color: #94a3b8; }
        .summary-section { margin-bottom: 15px; }
        .summary-section h2 { font-size: 12pt; color: #0f172a; margin-bottom: 8px; }
        .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .summary-table td { padding: 4px 8px; border-bottom: 1px solid #e2e8f0; }
        .summary-table .label { font-weight: 600; color: #475569; width: 40%; }
        .summary-table .value { font-weight: 700; color: #0f172a; }
        table.data-table { width: 100%; border-collapse: collapse; font-size: 7.5pt; }
        table.data-table th { background: #059669; color: white; padding: 5px 4px; text-align: left; font-weight: 600; font-size: 7pt; }
        table.data-table td { padding: 4px; border-bottom: 1px solid #e2e8f0; }
        table.data-table tr:nth-child(even) { background: #f8fafc; }
        .footer { position: fixed; bottom: 10mm; left: 15mm; right: 15mm; border-top: 1px solid #e2e8f0; padding-top: 5px; font-size: 7pt; color: #94a3b8; display: flex; justify-content: space-between; }
        .note { font-size: 8pt; color: #ef4444; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <h1>${schoolName}</h1>
          <p>${title}</p>
        </div>
        <div class="meta">
          <span>Generated: ${generatedAt.toLocaleString()}</span>
          <span>Records: ${rowCount}</span>
        </div>
        ${summaryHTML}
        <table class="data-table">
          <thead>
            <tr>${columns.map((c) => `<th>${formatLabel(c)}</th>`).join("")}</tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        ${truncatedNote}
        <div class="footer">
          <span>${schoolName} - ${title}</span>
          <span>Page 1</span>
        </div>
      </div>
    </body>
    </html>
  `
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}
