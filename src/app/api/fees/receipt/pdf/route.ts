import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PDFService } from "@/services/pdf.service"
import { getTenantBySlug } from "@/services/tenant.service"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get("recordId")
    const transactionId = searchParams.get("transactionId")

    if (!recordId) {
      return NextResponse.json({ error: "Record ID is required" }, { status: 400 })
    }

    // Fetch fee record with tenant validation
    const record = await prisma.feeRecord.findUnique({
      where: { id: recordId },
      include: {
        feeStructure: true,
        student: {
          include: {
            classroom: true,
            section: true,
            tenant: true,
          },
        },
        transactions: {
          where: transactionId ? { id: transactionId } : undefined,
          orderBy: { transactionDate: "desc" },
        },
      },
    })

    if (!record || record.student.tenant.slug !== session.user.tenantSlug) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    // Get tenant info for branding
    const tenant = record.student.tenant

    // Select transaction (latest if none specified)
    const transaction = record.transactions?.[0] || record

    // Generate QR code data
    const qrText = `OMNI-${record.id}-${transaction.receiptNumber || record.receiptNumber || "N/A"}`
    const qrCode = await PDFService.generateQRCode(qrText)

    // Build receipt HTML
    const html = buildReceiptHTML({
      record,
      transaction,
      student: record.student,
      tenant,
      qrCode,
    })

    // Generate PDF
    const pdfBuffer = await PDFService.generateA4PDF(html)

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Receipt-${transaction.receiptNumber || recordId}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Fee Receipt PDF Error:", error)
    return NextResponse.json(
      { error: "Failed to generate receipt PDF" },
      { status: 500 }
    )
  }
}

function buildReceiptHTML({
  record,
  transaction,
  student,
  tenant,
  qrCode,
}: {
  record: any
  transaction: any
  student: any
  tenant: any
  qrCode: string
}): string {
  const amountPaid = transaction?.amount || record.amountPaid
  const receiptNumber = transaction?.receiptNumber || record.receiptNumber || `TEMP-${record.id.slice(-6).toUpperCase()}`
  const transactionDate = new Date(transaction?.transactionDate || record.paidDate || Date.now())

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        @page { size: A4; margin: 0; }
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; color: #1e293b; background: white; }
        .page { position: relative; width: 210mm; min-height: 297mm; padding: 15mm; margin: auto; box-sizing: border-box; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px double #064e3b; padding-bottom: 15px; margin-bottom: 25px; }
        .school-info { display: flex; align-items: center; gap: 15px; }
        .logo-box { width: 60px; height: 60px; background: #064e3b; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24pt; font-weight: 900; }
        .school-name { font-size: 18pt; font-weight: 900; color: #064e3b; text-transform: uppercase; letter-spacing: -0.5px; margin: 0; }
        .school-address { font-size: 8pt; color: #64748b; margin-top: 3px; }
        .receipt-badge { background: #064e3b; color: white; padding: 8px 16px; border-radius: 10px; font-size: 8pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
        .receipt-number { font-size: 12pt; font-weight: 900; color: #064e3b; text-align: right; margin-top: 5px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
        .detail-box { background: #f0fdf4; padding: 15px; border-radius: 12px; border: 1px solid #bbf7d0; }
        .detail-label { font-size: 7pt; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 5px; }
        .detail-value { font-size: 11pt; font-weight: 700; color: #064e3b; }
        .detail-sub { font-size: 8pt; color: #64748b; margin-top: 2px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th { background: #f0fdf4; text-align: left; padding: 12px; border-bottom: 2px solid #064e3b; font-size: 8pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
        .table td { padding: 15px 12px; border-bottom: 1px solid #e2e8f0; }
        .table .amount { text-align: right; font-size: 14pt; font-weight: 900; color: #064e3b; }
        .total-row { background: #f0fdf4; }
        .total-label { text-align: right; padding: 15px 12px; font-size: 9pt; font-weight: 900; text-transform: uppercase; color: #64748b; }
        .total-value { text-align: right; padding: 15px 12px; font-size: 18pt; font-weight: 900; color: #064e3b; }
        .amount-words { font-style: italic; font-size: 10pt; color: #64748b; margin-top: 15px; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
        .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
        .qr-section { text-align: center; }
        .qr-section img { width: 80px; height: 80px; }
        .qr-label { font-size: 6pt; color: #94a3b8; margin-top: 5px; }
        .signature-box { width: 180px; text-align: center; border-top: 1px solid #334155; padding-top: 10px; font-size: 9pt; color: #64748b; }
        .bottom-bar { margin-top: 40px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 7pt; color: #94a3b8; display: flex; justify-content: space-between; }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Header -->
        <div class="header">
          <div class="school-info">
            <div class="logo-box">${tenant?.name?.charAt(0) || "O"}</div>
            <div>
              <h1 class="school-name">${tenant?.name || "OMNI CAMPUS"}</h1>
              <p class="school-address">${tenant?.address || ""}</p>
              <p class="school-address">Phone: ${tenant?.phone || ""} | Email: ${tenant?.email || ""}</p>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="receipt-badge">Office Copy</div>
            <div class="receipt-number"># ${receiptNumber}</div>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="details-grid">
          <div class="detail-box">
            <div class="detail-label">Student Name</div>
            <div class="detail-value">${student.name}</div>
            <div class="detail-sub">Admission No: ${student.admissionNumber} · Class: ${student.classroom?.name || "N/A"}${student.section?.name ? "-" + student.section.name : ""}</div>
            <div style="margin-top: 8px;">
              <div class="detail-label">Father/Guardian</div>
              <div class="detail-value" style="font-size: 10pt;">${student.fatherName || "N/A"}</div>
            </div>
          </div>
          <div>
            <div class="detail-box" style="margin-bottom: 15px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <div class="detail-label">Payment ID</div>
                  <div class="detail-value" style="font-size: 9pt;">${record.id.slice(0, 12)}</div>
                </div>
                <div>
                  <div class="detail-label">Issue Date</div>
                  <div class="detail-value" style="font-size: 9pt;">${transactionDate.toLocaleDateString("en-IN")}</div>
                </div>
              </div>
            </div>
            <div class="detail-box" style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div class="detail-label">Payment Method</div>
                <div class="detail-value" style="font-size: 10pt;">${transaction?.paymentMethod || record.paymentMethod || "CASH"}</div>
              </div>
              <img src="${qrCode}" style="width: 50px; height: 50px;" />
            </div>
          </div>
        </div>

        <!-- Fee Table -->
        <table class="table">
          <thead>
            <tr>
              <th style="width: 70%;">Service Description</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="font-weight: 700; color: #064e3b; font-size: 11pt;">${record.feeStructure?.name || "Fee Payment"}</div>
                <div style="font-size: 8pt; color: #64748b; margin-top: 3px;">${record.feeStructure?.category || "Tuition"} · ${record.feeStructure?.frequency || "Annual"}</div>
              </td>
              <td class="amount">₹${amountPaid.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td class="total-label">Transaction Total</td>
              <td class="total-value">₹${amountPaid.toLocaleString("en-IN")}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Amount in Words -->
        <div class="amount-words">
          <span style="font-weight: 900; font-size: 8pt; text-transform: uppercase; color: #64748b;">Amount in Words:</span><br/>
          Only ${amountPaid.toLocaleString("en-IN")} Rupees processed
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="qr-section">
            <img src="${qrCode}" />
            <div class="qr-label">Scan to Verify</div>
          </div>
          <div class="signature-box">Authorized Signatory</div>
        </div>

        <!-- Bottom Bar -->
        <div class="bottom-bar">
          <span>© ${new Date().getFullYear()} Omni-Campus Fiscal Ledger Engine</span>
          <span>Verified Digital Document · Generated: ${new Date().toLocaleString()}</span>
        </div>
      </div>
    </body>
    </html>
  `
}
