import { PDFService } from "@/services/pdf.service"
import { prisma } from "@/lib/prisma"

export class CertificateService {
  // ─── Certificate Types ───────────────────────────────────

  static async generateBonafideCertificate(tenantId: string, studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId, tenantId },
      include: { classroom: true, section: true, tenant: true },
    })
    if (!student) throw new Error("Student not found")

    const tenant = student.tenant
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Playfair+Display:wght@700&display=swap');
          @page { size: A4; margin: 0; }
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; color: #1e293b; background: white; }
          .page { position: relative; width: 210mm; min-height: 297mm; padding: 20mm; margin: auto; box-sizing: border-box; }
          .border-frame { position: absolute; top: 15mm; left: 15mm; right: 15mm; bottom: 15mm; border: 3px double #064e3b; }
          .border-inner { position: absolute; top: 18mm; left: 18mm; right: 18mm; bottom: 18mm; border: 1px solid #064e3b; }
          .header { text-align: center; padding-top: 30mm; margin-bottom: 20mm; }
          .school-name { font-family: 'Playfair Display', serif; font-size: 24pt; font-weight: 700; color: #064e3b; margin: 0; }
          .school-details { font-size: 9pt; color: #64748b; margin-top: 5px; }
          .title { font-size: 20pt; font-weight: 900; color: #064e3b; text-align: center; margin: 15mm 0 10mm; text-transform: uppercase; letter-spacing: 3px; border-bottom: 2px solid #064e3b; padding-bottom: 5mm; display: inline-block; }
          .title-wrapper { text-align: center; }
          .content { font-size: 12pt; line-height: 2; margin: 0 10mm; text-align: justify; }
          .content p { margin: 10px 0; }
          .highlight { font-weight: 700; color: #064e3b; text-decoration: underline; }
          .footer { position: absolute; bottom: 25mm; left: 25mm; right: 25mm; display: flex; justify-content: space-between; }
          .signature { text-align: center; width: 200px; }
          .signature-line { border-top: 1px solid #334155; margin-top: 30px; padding-top: 5px; font-size: 10pt; color: #64748b; }
          .date-place { text-align: right; font-size: 11pt; margin: 10mm 10mm 0 0; }
          .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 60pt; font-weight: 900; color: rgba(6, 78, 59, 0.03); white-space: nowrap; pointer-events: none; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="border-frame"></div>
          <div class="border-inner"></div>
          <div class="watermark">${tenant.name}</div>
          <div class="header">
            <h1 class="school-name">${tenant.name}</h1>
            <p class="school-details">${tenant.address || ''}</p>
            <p class="school-details">Affiliated to CBSE · School Code: ${tenant.schoolCode || 'N/A'}</p>
          </div>
          <div class="title-wrapper"><div class="title">Bonafide Certificate</div></div>
          <div class="content">
            <p>This is to certify that <span class="highlight">${student.name}</span>, son/daughter of <span class="highlight">${student.fatherName}</span> and <span class="highlight">${student.motherName}</span>, is a bonafide student of this school.</p>
            <p>He/She is studying in <span class="highlight">Class ${student.classroom?.name || 'N/A'}</span>, <span class="highlight">Section ${student.section?.name || 'N/A'}</span> during the current academic year.</p>
            <p><strong>Admission No:</strong> <span class="highlight">${student.admissionNumber}</span></p>
            <p><strong>Date of Birth:</strong> <span class="highlight">${new Date(student.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span></p>
            <p><strong>Blood Group:</strong> <span class="highlight">${student.bloodGroup || 'N/A'}</span></p>
            <p>This certificate is issued upon the request of the parent/guardian for <span class="highlight">official purposes</span>.</p>
          </div>
          <div class="date-place">
            <p>Date: <strong>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></p>
          </div>
          <div class="footer">
            <div class="signature">
              <div class="signature-line">Parent/Guardian Signature</div>
            </div>
            <div class="signature">
              <div class="signature-line">Principal / Authorized Signatory<br/>${tenant.name}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const pdfBuffer = await PDFService.generateA4PDF(html)
    return pdfBuffer
  }

  static async generateCharacterCertificate(tenantId: string, studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId, tenantId },
      include: { classroom: true, section: true, tenant: true },
    })
    if (!student) throw new Error("Student not found")

    const tenant = student.tenant
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Playfair+Display:wght@700&display=swap');
          @page { size: A4; margin: 0; }
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; color: #1e293b; background: white; }
          .page { position: relative; width: 210mm; min-height: 297mm; padding: 20mm; margin: auto; box-sizing: border-box; }
          .border-frame { position: absolute; top: 15mm; left: 15mm; right: 15mm; bottom: 15mm; border: 3px double #1e40af; }
          .border-inner { position: absolute; top: 18mm; left: 18mm; right: 18mm; bottom: 18mm; border: 1px solid #1e40af; }
          .header { text-align: center; padding-top: 30mm; margin-bottom: 20mm; }
          .school-name { font-family: 'Playfair Display', serif; font-size: 24pt; font-weight: 700; color: #1e40af; margin: 0; }
          .school-details { font-size: 9pt; color: #64748b; margin-top: 5px; }
          .title { font-size: 20pt; font-weight: 900; color: #1e40af; text-align: center; margin: 15mm 0 10mm; text-transform: uppercase; letter-spacing: 3px; border-bottom: 2px solid #1e40af; padding-bottom: 5mm; display: inline-block; }
          .title-wrapper { text-align: center; }
          .content { font-size: 12pt; line-height: 2; margin: 0 10mm; text-align: justify; }
          .highlight { font-weight: 700; color: #1e40af; text-decoration: underline; }
          .traits { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 15px 0; padding: 15px; background: #f0f9ff; border-radius: 8px; }
          .trait { font-size: 11pt; }
          .footer { position: absolute; bottom: 25mm; left: 25mm; right: 25mm; display: flex; justify-content: space-between; }
          .signature { text-align: center; width: 200px; }
          .signature-line { border-top: 1px solid #334155; margin-top: 30px; padding-top: 5px; font-size: 10pt; color: #64748b; }
          .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 60pt; font-weight: 900; color: rgba(30, 64, 175, 0.03); white-space: nowrap; pointer-events: none; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="border-frame"></div>
          <div class="border-inner"></div>
          <div class="watermark">${tenant.name}</div>
          <div class="header">
            <h1 class="school-name">${tenant.name}</h1>
            <p class="school-details">${tenant.address || ''}</p>
          </div>
          <div class="title-wrapper"><div class="title">Character Certificate</div></div>
          <div class="content">
            <p>This is to certify that <span class="highlight">${student.name}</span>, son/daughter of <span class="highlight">${student.fatherName}</span>, is/was a student of this institution bearing Admission No. <span class="highlight">${student.admissionNumber}</span>.</p>
            <p>During his/her stay in this institution, I have found him/her to be of <span class="highlight">excellent moral character</span> and <span class="highlight">good conduct</span>.</p>
            <p><strong>Character Assessment:</strong></p>
            <div class="traits">
              <div class="trait">✓ <strong>Moral Character:</strong> Excellent</div>
              <div class="trait">✓ <strong>Conduct:</strong> Good</div>
              <div class="trait">✓ <strong>Attendance:</strong> Satisfactory</div>
              <div class="trait">✓ <strong>Discipline:</strong> Maintained</div>
            </div>
            <p>To the best of my knowledge, he/she bears a good moral character and has not been involved in any activity subversive of the discipline or morality of the institution.</p>
            <p>This certificate is issued for <span class="highlight">general purposes</span>.</p>
          </div>
          <div style="text-align: right; margin: 10mm 10mm 0 0;">
            <p>Date: <strong>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></p>
          </div>
          <div class="footer">
            <div class="signature"><div class="signature-line">Parent/Guardian</div></div>
            <div class="signature"><div class="signature-line">Principal / Authorized Signatory</div></div>
          </div>
        </div>
      </body>
      </html>
    `

    return PDFService.generateA4PDF(html)
  }

  static async generateTCCertificate(tenantId: string, studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId, tenantId },
      include: { classroom: true, section: true, tenant: true, batch: true },
    })
    if (!student) throw new Error("Student not found")

    const tenant = student.tenant
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Playfair+Display:wght@700&display=swap');
          @page { size: A4; margin: 0; }
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; color: #1e293b; background: white; }
          .page { position: relative; width: 210mm; min-height: 297mm; padding: 20mm; margin: auto; box-sizing: border-box; }
          .border-frame { position: absolute; top: 15mm; left: 15mm; right: 15mm; bottom: 15mm; border: 3px double #7c3aed; }
          .border-inner { position: absolute; top: 18mm; left: 18mm; right: 18mm; bottom: 18mm; border: 1px solid #7c3aed; }
          .header { text-align: center; padding-top: 20mm; }
          .school-name { font-family: 'Playfair Display', serif; font-size: 22pt; font-weight: 700; color: #7c3aed; margin: 0; }
          .school-details { font-size: 9pt; color: #64748b; margin-top: 5px; }
          .tc-title { font-size: 18pt; font-weight: 900; color: #7c3aed; text-align: center; margin: 10mm 0; text-transform: uppercase; letter-spacing: 3px; border: 2px solid #7c3aed; padding: 8px 20px; display: inline-block; }
          .tc-wrapper { text-align: center; }
          .tc-no { text-align: right; font-size: 11pt; margin-bottom: 10mm; }
          .table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11pt; }
          .table td { padding: 10px 15px; border-bottom: 1px solid #e2e8f0; }
          .table td:first-child { font-weight: 700; width: 40%; color: #64748b; font-size: 10pt; text-transform: uppercase; letter-spacing: 0.5px; }
          .table td:last-child { font-weight: 600; color: #0f172a; }
          .highlight { font-weight: 700; color: #7c3aed; }
          .footer { position: absolute; bottom: 25mm; left: 25mm; right: 25mm; display: flex; justify-content: space-between; }
          .signature { text-align: center; width: 200px; }
          .signature-line { border-top: 1px solid #334155; margin-top: 30px; padding-top: 5px; font-size: 10pt; color: #64748b; }
          .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 60pt; font-weight: 900; color: rgba(124, 58, 237, 0.03); white-space: nowrap; pointer-events: none; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="border-frame"></div>
          <div class="border-inner"></div>
          <div class="watermark">TRANSFER CERTIFICATE</div>
          <div class="header">
            <h1 class="school-name">${tenant.name}</h1>
            <p class="school-details">${tenant.address || ''}</p>
            <p class="school-details">Affiliated to CBSE · School Code: ${tenant.schoolCode || 'N/A'} · UDISE: ${tenant.affiliationNo || 'N/A'}</p>
          </div>
          <div class="tc-wrapper"><div class="tc-title">Transfer Certificate</div></div>
          <div class="tc-no">TC No: <strong>TC/${new Date().getFullYear()}/${String(studentId.slice(-6)).toUpperCase()}</strong></div>
          <table class="table">
            <tr><td>Student Name</td><td class="highlight">${student.name}</td></tr>
            <tr><td>Father's Name</td><td>${student.fatherName}</td></tr>
            <tr><td>Mother's Name</td><td>${student.motherName}</td></tr>
            <tr><td>Date of Birth</td><td>${new Date(student.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</td></tr>
            <tr><td>Admission Number</td><td>${student.admissionNumber}</td></tr>
            <tr><td>Admission Date</td><td>${new Date(student.admissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</td></tr>
            <tr><td>Class Last Attended</td><td>Class ${student.classroom?.name || 'N/A'} - Section ${student.section?.name || 'N/A'}</td></tr>
            <tr><td>Batch / Program</td><td>${student.batch?.name || 'N/A'}</td></tr>
            <tr><td>Date of Leaving</td><td class="highlight">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</td></tr>
            <tr><td>Reason for Leaving</td><td>Parent's Request / Completion of Studies</td></tr>
            <tr><td>Conduct</td><td class="highlight">Good</td></tr>
            <tr><td>Any Dues Outstanding</td><td class="highlight">Nil</td></tr>
          </table>
          <div class="footer">
            <div class="signature"><div class="signature-line">Class Teacher</div></div>
            <div class="signature"><div class="signature-line">Principal<br/>${tenant.name}</div></div>
          </div>
        </div>
      </body>
      </html>
    `

    return PDFService.generateA4PDF(html)
  }
}
