import { prisma } from "@/lib/prisma"

// ─── Tally XML Export Service ────────────────────────────────────────────────

export class TallyExportService {
  /**
   * Generate Tally XML for fee transactions
   */
  static async exportFeeTransactions(tenantId: string, startDate: Date, endDate: Date) {
    try {
      // Get fee transactions in date range
      const transactions = await prisma.feeTransaction.findMany({
        where: {
          transactionDate: {
            gte: startDate,
            lte: endDate,
          },
          tenantId,
        },
        include: {
          feeRecord: {
            include: {
              student: true,
              feeStructure: true,
            },
          },
        },
      })

      // Get tenant details
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      })

      if (!tenant) {
        throw new Error("Tenant not found")
      }

      // Generate Tally XML
      const xml = this.generateFeeTransactionsXML(transactions, tenant)

      return {
        success: true,
        xml,
        filename: `tally_fee_transactions_${startDate.toISOString().split('T')[0]}.xml`,
        recordCount: transactions.length,
      }
    } catch (error: any) {
      console.error("Tally export failed:", error)
      throw new Error(`Failed to export to Tally: ${error.message}`)
    }
  }

  /**
   * Generate Tally XML for vouchers
   */
  static async exportVouchers(tenantId: string, startDate: Date, endDate: Date) {
    try {
      const vouchers = await prisma.voucher.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
          tenantId,
          status: "APPROVED",
        },
      })

      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      })

      if (!tenant) {
        throw new Error("Tenant not found")
      }

      const xml = this.generateVouchersXML(vouchers, tenant)

      return {
        success: true,
        xml,
        filename: `tally_vouchers_${startDate.toISOString().split('T')[0]}.xml`,
        recordCount: vouchers.length,
      }
    } catch (error: any) {
      console.error("Tally voucher export failed:", error)
      throw new Error(`Failed to export vouchers to Tally: ${error.message}`)
    }
  }

  /**
   * Generate Tally XML for all financial data
   */
  static async exportAllFinancialData(tenantId: string, academicYearId: string) {
    try {
      // Get fee transactions
      const feeTransactions = await prisma.feeTransaction.findMany({
        where: { tenantId },
        include: {
          feeRecord: {
            include: {
              student: true,
              feeStructure: true,
            },
          },
        },
      })

      // Get vouchers
      const vouchers = await prisma.voucher.findMany({
        where: {
          tenantId,
          status: "APPROVED",
        },
      })

      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      })

      if (!tenant) {
        throw new Error("Tenant not found")
      }

      const xml = this.generateCompleteXML(feeTransactions, vouchers, tenant)

      return {
        success: true,
        xml,
        filename: `tally_complete_export_${new Date().toISOString().split('T')[0]}.xml`,
        feeTransactionCount: feeTransactions.length,
        voucherCount: vouchers.length,
      }
    } catch (error: any) {
      console.error("Tally complete export failed:", error)
      throw new Error(`Failed to export complete data to Tally: ${error.message}`)
    }
  }

  /**
   * Generate fee transactions XML
   */
  private static generateFeeTransactionsXML(transactions: any[], tenant: any): string {
    const voucherDate = new Date().toISOString().split('T')[0]

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUESTNAME>Import Vouchers</TALLYREQUESTNAME>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
`

    transactions.forEach((tx, index) => {
      const student = tx.feeRecord.student
      const feeType = tx.feeRecord.feeStructure.name
      const date = tx.transactionDate.toISOString().split('T')[0]
      const voucherNo = tx.receiptNumber || `REC${index + 1}`

      xml += `
        <VOUCHER REMOTEID="${tx.id}" VCHTYPE="Receipt" ACTION="Create">
          <DATE>${date}</DATE>
          <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
          <VOUCHERNUMBER>${voucherNo}</VOUCHERNUMBER>
          <PARTYLEDGERNAME>${student.name}</PARTYLEDGERNAME>
          <COSTCENTRENAME>${tenant.name}</COSTCENTRENAME>
          <NARRATION>Fee payment for ${feeType} - ${student.admissionNumber}</NARRATION>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERENTRY>
              <LEDGERNAME>${feeType}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${tx.amount}</AMOUNT>
            </LEDGERENTRY>
            <LEDGERENTRY>
              <LEDGERNAME>Cash</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>${tx.amount}</AMOUNT>
            </LEDGERENTRY>
          </ALLLEDGERENTRIES.LIST>
        </VOUCHER>
`
    })

    xml += `
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`

    return xml
  }

  /**
   * Generate vouchers XML
   */
  private static generateVouchersXML(vouchers: any[], tenant: any): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUESTNAME>Import Vouchers</TALLYREQUESTNAME>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
`

    vouchers.forEach((voucher, index) => {
      const date = voucher.date.toISOString().split('T')[0]
      const voucherNo = voucher.voucherNo
      const vchType = voucher.type === "RECEIPT" ? "Receipt" : voucher.type === "PAYMENT" ? "Payment" : "Journal"

      xml += `
        <VOUCHER REMOTEID="${voucher.id}" VCHTYPE="${vchType}" ACTION="Create">
          <DATE>${date}</DATE>
          <VOUCHERTYPENAME>${vchType}</VOUCHERTYPENAME>
          <VOUCHERNUMBER>${voucherNo}</VOUCHERNUMBER>
          <PARTYLEDGERNAME>${voucher.paidBy || "Cash"}</PARTYLEDGERNAME>
          <COSTCENTRENAME>${tenant.name}</COSTCENTRENAME>
          <NARRATION>${voucher.description}</NARRATION>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERENTRY>
              <LEDGERNAME>${voucher.category}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${voucher.type === "RECEIPT" ? "No" : "Yes"}</ISDEEMEDPOSITIVE>
              <AMOUNT>${voucher.amount}</AMOUNT>
            </LEDGERENTRY>
            <LEDGERENTRY>
              <LEDGERNAME>Cash</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${voucher.type === "RECEIPT" ? "Yes" : "No"}</ISDEEMEDPOSITIVE>
              <AMOUNT>${voucher.amount}</AMOUNT>
            </LEDGERENTRY>
          </ALLLEDGERENTRIES.LIST>
        </VOUCHER>
`
    })

    xml += `
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`

    return xml
  }

  /**
   * Generate complete XML with all financial data
   */
  private static generateCompleteXML(feeTransactions: any[], vouchers: any[], tenant: any): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUESTNAME>Import Data</TALLYREQUESTNAME>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <STATICVARIABLES>
          <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
`

    // Add ledgers
    xml += `
        <TALLYMESSAGE>
          <LEDGER NAME="${tenant.name}" ACTION="Create">
            <PARENT>Cash-in-Hand</PARENT>
          </LEDGER>
        </TALLYMESSAGE>
`

    // Add fee transactions
    feeTransactions.forEach((tx, index) => {
      const student = tx.feeRecord.student
      const feeType = tx.feeRecord.feeStructure.name
      const date = tx.transactionDate.toISOString().split('T')[0]

      xml += `
        <VOUCHER REMOTEID="${tx.id}" VCHTYPE="Receipt" ACTION="Create">
          <DATE>${date}</DATE>
          <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
          <PARTYLEDGERNAME>${student.name}</PARTYLEDGERNAME>
          <COSTCENTRENAME>${tenant.name}</COSTCENTRENAME>
          <NARRATION>Fee payment for ${feeType}</NARRATION>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERENTRY>
              <LEDGERNAME>${feeType}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${tx.amount}</AMOUNT>
            </LEDGERENTRY>
            <LEDGERENTRY>
              <LEDGERNAME>Cash</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>${tx.amount}</AMOUNT>
            </LEDGERENTRY>
          </ALLLEDGERENTRIES.LIST>
        </VOUCHER>
`
    })

    // Add vouchers
    vouchers.forEach((voucher) => {
      const date = voucher.date.toISOString().split('T')[0]
      const vchType = voucher.type === "RECEIPT" ? "Receipt" : voucher.type === "PAYMENT" ? "Payment" : "Journal"

      xml += `
        <VOUCHER REMOTEID="${voucher.id}" VCHTYPE="${vchType}" ACTION="Create">
          <DATE>${date}</DATE>
          <VOUCHERTYPENAME>${vchType}</VOUCHERTYPENAME>
          <PARTYLEDGERNAME>${voucher.paidBy || "Cash"}</PARTYLEDGERNAME>
          <COSTCENTRENAME>${tenant.name}</COSTCENTRENAME>
          <NARRATION>${voucher.description}</NARRATION>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERENTRY>
              <LEDGERNAME>${voucher.category}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${voucher.type === "RECEIPT" ? "No" : "Yes"}</ISDEEMEDPOSITIVE>
              <AMOUNT>${voucher.amount}</AMOUNT>
            </LEDGERENTRY>
            <LEDGERENTRY>
              <LEDGERNAME>Cash</LEDGERNAME>
              <ISDEEMEDPOSITIVE>${voucher.type === "RECEIPT" ? "Yes" : "No"}</ISDEEMEDPOSITIVE>
              <AMOUNT>${voucher.amount}</AMOUNT>
            </LEDGERENTRY>
          </ALLLEDGERENTRIES.LIST>
        </VOUCHER>
`
    })

    xml += `
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`

    return xml
  }
}
