import { prisma } from "@/lib/prisma"
import { PDFService } from "./pdf.service"

// ─── Report Card PDF Generation Service (CBSE Format) ───────────────────────

export class ReportCardPDFService {
  /**
   * Generate CBSE format report card
   */
  static async generateReportCard(tenantId: string, studentId: string, examId: string) {
    try {
      // Get student data
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          classroom: true,
          section: true,
        },
      })

      if (!student) {
        throw new Error("Student not found")
      }

      // Get exam data
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
          academicYear: true,
        },
      })

      if (!exam) {
        throw new Error("Exam not found")
      }

      // Get mark entries for this student and exam
      const markEntries = await prisma.markEntry.findMany({
        where: {
          studentId,
          examId,
        },
        include: {
          subject: true,
        },
      })

      // Get tenant details
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      })

      if (!tenant) {
        throw new Error("Tenant not found")
      }

      // Calculate aggregates
      const totalMarks = markEntries.reduce((sum, me) => sum + me.marks, 0)
      const totalMaxMarks = markEntries.reduce((sum, me) => sum + me.maxMarks, 0)
      const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0
      const grade = this.calculateGrade(percentage)

      // Generate HTML for report card
      const html = this.generateReportCardHTML(student, exam, markEntries, tenant, {
        totalMarks,
        totalMaxMarks,
        percentage,
        grade,
      })

      // Generate PDF using PDFService
      const pdfBuffer = await PDFService.generateA4PDF(html)

      return {
        success: true,
        pdf: pdfBuffer,
        studentName: student.name,
        examName: exam.name,
        percentage,
        grade,
      }
    } catch (error: any) {
      console.error("Report card PDF generation failed:", error)
      throw new Error(`Failed to generate report card: ${error.message}`)
    }
  }

  /**
   * Calculate grade based on percentage
   */
  private static calculateGrade(percentage: number): string {
    if (percentage >= 90) return "A1"
    if (percentage >= 80) return "A2"
    if (percentage >= 70) return "B1"
    if (percentage >= 60) return "B2"
    if (percentage >= 50) return "C1"
    if (percentage >= 40) return "C2"
    if (percentage >= 33) return "D"
    return "F"
  }

  /**
   * Generate HTML for CBSE format report card
   */
  private static generateReportCardHTML(student: any, exam: any, markEntries: any[], tenant: any, aggregates: any): string {
    const date = new Date().toLocaleDateString()

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .report-card {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border: 2px solid #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px double #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .school-name {
            font-size: 28px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 10px;
          }
          .report-title {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .academic-year {
            font-size: 16px;
            color: #666;
          }
          .student-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border: 1px solid #ddd;
          }
          .info-row {
            display: flex;
            padding: 8px 0;
            font-size: 14px;
          }
          .info-label {
            font-weight: bold;
            width: 150px;
            color: #333;
          }
          .info-value {
            color: #666;
          }
          .marks-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .marks-table th {
            background: #1e3a5f;
            color: white;
            padding: 12px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #333;
          }
          .marks-table td {
            padding: 10px;
            text-align: center;
            border: 1px solid #ddd;
            font-size: 14px;
          }
          .marks-table tr:nth-child(even) {
            background: #f8f9fa;
          }
          .total-row {
            background: #e9ecef !important;
            font-weight: bold;
            font-size: 16px;
          }
          .grade-section {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            text-align: center;
          }
          .grade-box {
            border: 2px solid #1e3a5f;
            padding: 20px;
            border-radius: 8px;
          }
          .grade-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
          }
          .grade-value {
            font-size: 32px;
            font-weight: bold;
            color: #1e3a5f;
          }
          .remarks-section {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            padding: 20px;
          }
          .remarks-title {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .remarks-text {
            font-style: italic;
            color: #666;
          }
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
          }
          .signature {
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #333;
            width: 200px;
            margin-top: 40px;
            padding-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          .grade-a1 { color: #28a745; }
          .grade-a2 { color: #5cb85c; }
          .grade-b1 { color: #5bc0de; }
          .grade-b2 { color: #17a2b8; }
          .grade-c1 { color: #ffc107; }
          .grade-c2 { color: #fd7e14; }
          .grade-d { color: #dc3545; }
          .grade-f { color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="report-card">
          <div class="header">
            <div class="school-name">${tenant.name}</div>
            <div class="report-title">PROGRESSIVE REPORT CARD</div>
            <div class="academic-year">Academic Year: ${exam.academicYear.name}</div>
          </div>

          <div class="student-info">
            <div class="info-row">
              <span class="info-label">Student Name:</span>
              <span class="info-value">${student.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Admission No:</span>
              <span class="info-value">${student.admissionNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Class:</span>
              <span class="info-value">${student.classroom?.name || "N/A"} ${student.section?.name || ""}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Roll No:</span>
              <span class="info-value">${student.rollNumber || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Exam:</span>
              <span class="info-value">${exam.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${date}</span>
            </div>
          </div>

          <table class="marks-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Subject</th>
                <th>Maximum Marks</th>
                <th>Obtained Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              ${markEntries.map((me, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${me.subject.name}</td>
                  <td>${me.maxMarks}</td>
                  <td>${me.marks}</td>
                  <td>${((me.marks / me.maxMarks) * 100).toFixed(1)}%</td>
                  <td class="grade-${this.calculateGrade((me.marks / me.maxMarks) * 100).toLowerCase()}">${this.calculateGrade((me.marks / me.maxMarks) * 100)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="2">TOTAL</td>
                <td>${aggregates.totalMaxMarks}</td>
                <td>${aggregates.totalMarks}</td>
                <td>${aggregates.percentage.toFixed(1)}%</td>
                <td class="grade-${aggregates.grade.toLowerCase()}">${aggregates.grade}</td>
              </tr>
            </tbody>
          </table>

          <div class="grade-section">
            <div class="grade-box">
              <div class="grade-label">Total Marks</div>
              <div class="grade-value">${aggregates.totalMarks}/${aggregates.totalMaxMarks}</div>
            </div>
            <div class="grade-box">
              <div class="grade-label">Percentage</div>
              <div class="grade-value">${aggregates.percentage.toFixed(1)}%</div>
            </div>
            <div class="grade-box">
              <div class="grade-label">Overall Grade</div>
              <div class="grade-value grade-${aggregates.grade.toLowerCase()}">${aggregates.grade}</div>
            </div>
          </div>

          <div class="remarks-section">
            <div class="remarks-title">Remarks:</div>
            <div class="remarks-text">
              ${this.getRemarks(aggregates.percentage, aggregates.grade)}
            </div>
          </div>

          <div class="signature-section">
            <div class="signature">
              <div class="signature-line">Class Teacher</div>
            </div>
            <div class="signature">
              <div class="signature-line">Principal</div>
            </div>
            <div class="signature">
              <div class="signature-line">Parent/Guardian</div>
            </div>
          </div>

          <div class="footer">
            <p>This is a computer-generated report card.</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Get remarks based on performance
   */
  private static getRemarks(percentage: number, grade: string): string {
    if (percentage >= 90) return "Excellent performance. Keep up the good work!"
    if (percentage >= 80) return "Very good performance. Continue working hard."
    if (percentage >= 70) return "Good performance. Scope for improvement."
    if (percentage >= 60) return "Satisfactory performance. Needs more focus."
    if (percentage >= 50) return "Average performance. Regular study required."
    if (percentage >= 40) return "Needs significant improvement. Extra attention needed."
    return "Performance is below acceptable level. Immediate intervention required."
  }

  /**
   * Generate bulk report cards
   */
  static async generateBulkReportCards(tenantId: string, examId: string) {
    const students = await prisma.student.findMany({
      where: { tenantId },
    })

    const results = []

    for (const student of students) {
      try {
        const result = await this.generateReportCard(tenantId, student.id, examId)
        results.push({ studentId: student.id, studentName: student.name, success: true })
      } catch (error: any) {
        results.push({ studentId: student.id, studentName: student.name, success: false, error: error.message })
      }
    }

    return {
      total: students.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    }
  }
}
