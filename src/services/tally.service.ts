import { prisma } from "@/lib/prisma"

/**
 * Tally Integration Service
 * ─────────────────────────
 * Generates Tally-compatible XML for fee data export.
 * Tally Prime uses a specific XML format for voucher imports.
 *
 * Output format: Tally XML (Receipt Vouchers)
 * Compatible with: Tally Prime / Tally ERP 9
 */

interface TallyVoucher {
  receiptNumber: string
  date: string
  studentName: string
  admissionNumber: string
  className: string
  ledgerName: string // Fee head name
  amount: number
  paymentMethod: string
}

export class TallyService {
  /**
   * Export fee collections as Tally-compatible XML.
   * Generates Receipt Vouchers for all paid/partial fee records.
   */
  static async exportToTallyXML(
    tenantId: string,
    filters: {
      startDate?: Date
      endDate?: Date
      classId?: string
    } = {}
  ): Promise<string> {
    const { startDate, endDate, classId } = filters

    const where: Record<string, unknown> = {
      student: { tenantId },
      amountPaid: { gt: 0 },
    }

    if (startDate || endDate) {
      const paidDateWhere: Record<string, unknown> = {}
      if (startDate) paidDateWhere.gte = startDate
      if (endDate) paidDateWhere.lte = endDate
      where.paidDate = paidDateWhere
    }

    if (classId) {
      where.student = { ...(where.student as object), classRoomId: classId }
    }

    const records = await prisma.feeRecord.findMany({
      where,
      include: {
        student: {
          include: { classroom: true },
        },
        feeStructure: true,
      },
      orderBy: { paidDate: "asc" },
    })

    // Transform to voucher format
    const vouchers: TallyVoucher[] = records.map((r) => ({
      receiptNumber: r.receiptNumber || `RCPT-${r.id.slice(0, 8).toUpperCase()}`,
      date: r.paidDate
        ? formatTallyDate(r.paidDate)
        : formatTallyDate(new Date()),
      studentName: r.student.name,
      admissionNumber: r.student.admissionNumber,
      className: r.student.classroom?.name || "N/A",
      ledgerName: r.feeStructure.name,
      amount: r.amountPaid,
      paymentMethod: r.paymentMethod || "Cash",
    }))

    return generateTallyXML(vouchers, tenantId)
  }

  /**
   * Export fee data as simplified Tally Day Book format (CSV alternative).
   */
  static async exportDayBook(
    tenantId: string,
    date: Date
  ) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const records = await prisma.feeRecord.findMany({
      where: {
        student: { tenantId },
        paidDate: { gte: startOfDay, lte: endOfDay },
        amountPaid: { gt: 0 },
      },
      include: {
        student: true,
        feeStructure: true,
      },
      orderBy: { paidDate: "asc" },
    })

    return records.map((r) => ({
      Date: r.paidDate ? r.paidDate.toISOString().split("T")[0] : "",
      VoucherNo: r.receiptNumber || "",
      StudentName: r.student.name,
      AdmissionNo: r.student.admissionNumber,
      Particular: r.feeStructure.name,
      Debit: r.amountPaid,
      Credit: 0,
      PaymentMode: r.paymentMethod || "Cash",
    }))
  }
}

// ─── Tally XML Generator ───────────────────────

function formatTallyDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}${m}${d}` // Tally format: YYYYMMDD
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function generateTallyXML(vouchers: TallyVoucher[], tenantId: string): string {
  const voucherXMLs = vouchers
    .map(
      (v) => `
    <VOUCHER VCHTYPE="Receipt" ACTION="Create">
      <DATE>${v.date}</DATE>
      <NARRATION>Fee Receipt ${escapeXml(v.receiptNumber)} - ${escapeXml(v.studentName)} (${escapeXml(v.admissionNumber)}) - Class ${escapeXml(v.className)}</NARRATION>
      <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
      <VOUCHERNUMBER>${escapeXml(v.receiptNumber)}</VOUCHERNUMBER>
      <PARTYLEDGERNAME>${escapeXml(v.paymentMethod === "Online" ? "Bank Account" : "Cash")}</PARTYLEDGERNAME>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>${escapeXml(v.paymentMethod === "Online" ? "Bank Account" : "Cash")}</LEDGERNAME>
        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
        <AMOUNT>-${v.amount.toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>${escapeXml(v.ledgerName)}</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>${v.amount.toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
    </VOUCHER>`
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Omni Campus - ${tenantId}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
${voucherXMLs}
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`
}
