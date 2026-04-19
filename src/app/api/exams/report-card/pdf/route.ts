import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ExamService } from "@/services/exam.service"
import puppeteer from "puppeteer-core"
import QRCode from "qrcode"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get("studentId")

  if (!studentId) return new NextResponse("Student ID missing", { status: 400 })

  try {
    const data = await ExamService.getDetailedCBSEData(session.user.tenantId, studentId)

    // Generate Verification QR Code
    // In production, this would be a URL to verify the digital duplicate
    const qrCodeDataUrl = await QRCode.toDataURL(`VERIFIED:${data.student.id}:${data.academicYear}`)

    // Generate HTML for A4 B&W PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 0px; color: #000; line-height: 1.4; font-size: 11px; }
        .page { width: 210mm; height: 297mm; padding: 15mm; box-sizing: border-box; background: white; position: relative; }
        
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .school-name { font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 0; }
        .school-info { font-size: 11px; margin: 5px 0; }
        .affiliation { font-weight: bold; font-size: 11px; }

        .title-box { text-align: center; margin: 15px 0; }
        .title-box h2 { margin: 0; text-transform: uppercase; border: 1px solid #000; display: inline-block; padding: 5px 20px; font-size: 16px; }

        .profile-table { width: 100%; margin-bottom: 20px; }
        .profile-table td { padding: 4px 0; border: none !important; width: 33%; }
        .label { font-weight: bold; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 6px; text-align: center; }
        th { background-color: #f2f2f2; text-transform: uppercase; font-size: 10px; }
        
        .scholastic-table th { font-size: 10px; }
        .sub-name { text-align: left; font-weight: bold; }

        .footer-grid { display: flex; justify-content: space-between; margin-top: 40px; }
        .signature-box { text-align: center; width: 200px; border-top: 1px solid #000; padding-top: 5px; }
        
        .attendance-box { margin: 10px 0; font-weight: bold; }
        .promotion { font-size: 14px; font-weight: bold; margin-top: 20px; text-decoration: underline; }
        
        .qr-code { position: absolute; bottom: 40px; right: 40px; width: 80px; text-align: center; }
        .qr-code img { width: 60px; height: 60px; }
        .qr-code p { font-size: 7px; margin: 5px 0; }

        @media print {
            .page { border: none; margin: 0; }
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            ${data.tenant?.logo ? `<img src="${data.tenant.logo}" style="height: 60px; margin-bottom: 5px;" />` : ""}
            <h1 class="school-name">${data.tenant?.name || "SCHOOL NAME"}</h1>
            <p class="school-info">${data.tenant?.address || ""}</p>
            <p class="school-info">Phone: ${data.tenant?.phone || ""} | Email: ${data.tenant?.email || ""}</p>
            <p class="affiliation">Affiliation No: ${data.tenant?.affiliationNo || "N/A"} | School Code: ${data.tenant?.schoolCode || "N/A"}</p>
            <p style="margin-top: 10px; font-weight: bold;">ACADEMIC SESSION: ${data.academicYear}</p>
        </div>

        <div class="title-box">
            <h2>Report Card</h2>
        </div>

        <table class="profile-table">
            <tr>
                <td><span class="label">Student's Name:</span> ${data.student.name}</td>
                <td><span class="label">Roll No:</span> ${data.student.rollNumber || "N/A"}</td>
                <td><span class="label">Class/Section:</span> ${data.student.classroom?.name || ""}-${data.student.section?.name || ""}</td>
            </tr>
            <tr>
                <td><span class="label">Mother's Name:</span> ${data.student.motherName || "N/A"}</td>
                <td><span class="label">Admission No:</span> ${data.student.admissionNumber}</td>
                <td><span class="label">Date of Birth:</span> ${data.student.dob ? new Date(data.student.dob).toLocaleDateString() : "N/A"}</td>
            </tr>
            <tr>
                <td><span class="label">Father's Name:</span> ${data.student.fatherName || "N/A"}</td>
            </tr>
        </table>

        <table class="scholastic-table">
            <thead>
                <tr>
                    <th rowspan="2">Subject Name</th>
                    <th colspan="5">Term 1 (100)</th>
                    <th colspan="5">Term 2 (100)</th>
                    <th rowspan="2">Grand Total<br>(200)</th>
                    <th rowspan="2">Grade</th>
                </tr>
                <tr>
                    <th>PT</th>
                    <th>NB</th>
                    <th>SE</th>
                    <th>Exam</th>
                    <th>Total</th>
                    <th>PT</th>
                    <th>NB</th>
                    <th>SE</th>
                    <th>Exam</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${data.results.scholastic.map(s => `
                    <tr>
                        <td class="sub-name">${s.name}</td>
                        <td>${s.term1.periodicTest ?? "-"}</td>
                        <td>${s.term1.notebook ?? "-"}</td>
                        <td>${s.term1.subjectEnrichment ?? "-"}</td>
                        <td>${s.term1.exam ?? "-"}</td>
                        <td>${s.term1.total}</td>
                        <td>${s.term2.periodicTest ?? "-"}</td>
                        <td>${s.term2.notebook ?? "-"}</td>
                        <td>${s.term2.subjectEnrichment ?? "-"}</td>
                        <td>${s.term2.exam ?? "-"}</td>
                        <td>${s.term2.total}</td>
                        <td>${s.total}</td>
                        <td style="font-weight: bold;">${s.grade}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>

        <h3>Co-Scholastic Areas (3-Point Scale)</h3>
        <table>
            <thead>
                <tr>
                    <th>Activity</th>
                    <th>Grade</th>
                </tr>
            </thead>
            <tbody>
                ${data.results.coScholastic.map(c => `
                    <tr>
                        <td style="text-align: left;">${c.name}</td>
                        <td style="font-weight: bold;">${c.grade}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>

        <div class="attendance-box">
            Attendance: ${data.attendance.presentDays} / ${data.attendance.workingDays} 
            (${data.attendance.workingDays > 0 ? ((data.attendance.presentDays / data.attendance.workingDays) * 100).toFixed(1) : 0}%)
        </div>

        <div class="promotion">
            Result: ${data.promotionStatus}
        </div>

        <div class="footer-grid">
            <div class="signature-box">Class Teacher</div>
            <div class="signature-box">Principal / Head</div>
            <div class="signature-box">Parent</div>
        </div>

        <div class="qr-code">
            <img src="${qrCodeDataUrl}" />
            <p>Scan to Verify Result</p>
        </div>
    </div>
</body>
</html>
    `

    // Launch Browser and Generate PDF
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: true
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" }
    })
    await browser.close()

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=ReportCard_${data.student.rollNumber || studentId}.pdf`
      }
    })
  } catch (error: unknown) {
    console.error("PDF Generate Error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return new NextResponse(`Error generating PDF: ${message}`, { status: 500 })
  }
}
