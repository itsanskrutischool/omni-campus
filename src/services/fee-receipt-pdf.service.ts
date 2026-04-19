import { prisma } from "@/lib/prisma"
import { PDFService } from "./pdf.service"

// ─── Fee Receipt PDF Generation Service ─────────────────────────────────────

export class FeeReceiptPDFService {
  /**
   * Generate fee receipt PDF
   */
  static async generateReceipt(tenantId: string, feeRecordId: string) {
    try {
      // Get fee record with related data
      const feeRecord = await prisma.feeRecord.findUnique({
        where: { id: feeRecordId },
        include: {
          student: true,
          feeStructure: true,
          transactions: {
            orderBy: { transactionDate: "desc" },
          },
        },
      })

      if (!feeRecord) {
        throw new Error("Fee record not found")
      }

      // Get tenant details
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      })

      if (!tenant) {
        throw new Error("Tenant not found")
      }

      // Generate HTML for receipt
      const html = this.generateReceiptHTML(feeRecord, tenant)

      // Generate PDF using PDFService
      const pdfBuffer = await PDFService.generateA4PDF(html)

      return {
        success: true,
        pdf: pdfBuffer,
        receiptNumber: feeRecord.transactions[0]?.receiptNumber || "N/A",
      }
    } catch (error: any) {
      console.error("Fee receipt PDF generation failed:", error)
      throw new Error(`Failed to generate receipt: ${error.message}`)
    }
  }

  /**
   * Generate HTML for receipt
   */
  private static generateReceiptHTML(feeRecord: any, tenant: any): string {
    const student = feeRecord.student
    const feeStructure = feeRecord.feeStructure
    const transaction = feeRecord.transactions[0]
    const receiptNo = transaction?.receiptNumber || "N/A"
    const receiptDate = transaction?.transactionDate 
      ? new Date(transaction.transactionDate).toLocaleDateString()
      : new Date().toLocaleDateString()

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #1e3a5f;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .school-name {
            font-size: 24px;
            font-weight: bold;
            color: #1e3a5f;
            margin-bottom: 5px;
          }
          .receipt-title {
            font-size: 18px;
            color: #666;
            margin-bottom: 10px;
          }
          .receipt-number {
            font-size: 14px;
            color: #999;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .info-section h3 {
            font-size: 14px;
            color: #1e3a5f;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            font-size: 13px;
          }
          .info-label {
            color: #666;
          }
          .info-value {
            font-weight: 500;
            color: #333;
          }
          .fee-details {
            margin: 20px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
          }
          .fee-header {
            background: #1e3a5f;
            color: white;
            padding: 10px 15px;
            font-weight: bold;
          }
          .fee-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
          }
          .fee-row:last-child {
            border-bottom: none;
          }
          .fee-row.total {
            background: #f8f9fa;
            font-weight: bold;
            font-size: 15px;
          }
          .amount {
            font-weight: bold;
            color: #1e3a5f;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .stamp-area {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
          }
          .signature {
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #333;
            margin-top: 40px;
            padding-top: 5px;
            width: 200px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="school-name">${tenant.name}</div>
            <div class="receipt-title">FEE RECEIPT</div>
            <div class="receipt-number">Receipt No: ${receiptNo} | Date: ${receiptDate}</div>
          </div>

          <div class="info-grid">
            <div class="info-section">
              <h3>Student Information</h3>
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${student.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Admission No:</span>
                <span class="info-value">${student.admissionNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Class:</span>
                <span class="info-value">${student.classRoomId || "N/A"}</span>
              </div>
            </div>

            <div class="info-section">
              <h3>Fee Information</h3>
              <div class="info-row">
                <span class="info-label">Fee Type:</span>
                <span class="info-value">${feeStructure.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Due Date:</span>
                <span class="info-value">${new Date(feeRecord.dueDate).toLocaleDateString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${transaction?.paymentMethod || "N/A"}</span>
              </div>
            </div>
          </div>

          <div class="fee-details">
            <div class="fee-header">Fee Details</div>
            <div class="fee-row">
              <span>Total Amount Due</span>
              <span class="amount">₹${feeRecord.amountDue.toLocaleString()}</span>
            </div>
            <div class="fee-row">
              <span>Amount Paid</span>
              <span class="amount">₹${feeRecord.amountPaid.toLocaleString()}</span>
            </div>
            ${feeRecord.waiver > 0 ? `
            <div class="fee-row">
              <span>Waiver</span>
              <span class="amount">-₹${feeRecord.waiver.toLocaleString()}</span>
            </div>
            ` : ''}
            <div class="fee-row total">
              <span>Balance Due</span>
              <span class="amount">₹${(feeRecord.amountDue - feeRecord.amountPaid - feeRecord.waiver).toLocaleString()}</span>
            </div>
          </div>

          <div class="stamp-area">
            <div class="signature">
              <div class="signature-line">Accounts Officer</div>
            </div>
            <div class="signature">
              <div class="signature-line">Principal</div>
            </div>
          </div>

          <div class="footer">
            <p>This is a computer-generated receipt. No signature required.</p>
            <p>For any queries, please contact the school office.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Generate bulk receipts for multiple fee records
   */
  static async generateBulkReceipts(tenantId: string, feeRecordIds: string[]) {
    const results = []
    
    for (const feeRecordId of feeRecordIds) {
      try {
        const result = await this.generateReceipt(tenantId, feeRecordId)
        results.push({ feeRecordId, success: true, receiptNumber: result.receiptNumber })
      } catch (error: any) {
        results.push({ feeRecordId, success: false, error: error.message })
      }
    }

    return {
      total: feeRecordIds.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    }
  }
}
