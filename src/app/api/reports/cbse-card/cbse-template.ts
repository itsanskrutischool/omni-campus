import { PDFService } from "../../../../services/pdf.service";

interface CBSEReportTemplateData {
  school: {
    name: string;
    logo?: string;
    address?: string;
    affiliation?: string;
    schoolCode?: string;
    academicYear: string;
  };
  student: {
    name: string;
    admissionNo: string;
    rollNo: string;
    className: string;
    section: string;
    dob: string;
    fatherName: string;
    motherName: string;
    attendance: string;
  };
  scholastic: Array<{
    subject: string;
    term1: {
      periodicTest: string;
      notebook: string;
      subjectEnrichment: string;
      exam: string;
      total: string;
    };
    term2: {
      periodicTest: string;
      notebook: string;
      subjectEnrichment: string;
      exam: string;
      total: string;
    };
    grandTotal: string;
    grade: string;
  }>;
  coScholastic: Array<{
    activity: string;
    grade: string;
  }>;
  discipline: Array<{
    activity: string;
    grade: string;
  }>;
  result: {
    marksObtained: string;
    percentage: string;
    grade: string;
    rank?: string;
    remarks: string;
    promotionStatus: string;
  };
  qrUrl: string;
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export async function renderCBSEContent(data: CBSEReportTemplateData): Promise<string> {
  const qrBase64 = await PDFService.generateQRCode(data.qrUrl);

  const scholasticRows = data.scholastic
    .map(
      (row) => `
        <tr>
          <td class="left strong">${escapeHtml(row.subject)}</td>
          <td>${row.term1.periodicTest}</td>
          <td>${row.term1.notebook}</td>
          <td>${row.term1.subjectEnrichment}</td>
          <td>${row.term1.exam}</td>
          <td class="term-total">${row.term1.total}</td>
          <td>${row.term2.periodicTest}</td>
          <td>${row.term2.notebook}</td>
          <td>${row.term2.subjectEnrichment}</td>
          <td>${row.term2.exam}</td>
          <td class="term-total">${row.term2.total}</td>
          <td class="grand-total">${row.grandTotal}</td>
          <td class="grade">${row.grade}</td>
        </tr>
      `
    )
    .join("");

  const coScholasticRows = data.coScholastic
    .map(
      (row) => `
        <tr>
          <td class="left strong">${escapeHtml(row.activity)}</td>
          <td class="grade">${row.grade}</td>
        </tr>
      `
    )
    .join("");

  const disciplineRows = data.discipline
    .map(
      (row) => `
        <tr>
          <td class="left strong">${escapeHtml(row.activity)}</td>
          <td class="grade">${row.grade}</td>
        </tr>
      `
    )
    .join("");

  return `
    <style>
      .cbse-shell { color: #0f172a; font-size: 10pt; }
      .header-band { border: 2px solid #0f172a; padding: 14px 18px; margin-bottom: 18px; }
      .header-grid { display: grid; grid-template-columns: 84px 1fr 84px; align-items: center; gap: 16px; }
      .logo-box, .seal-box { height: 74px; display: flex; align-items: center; justify-content: center; border: 1px solid #cbd5e1; border-radius: 12px; background: #f8fafc; }
      .school-title { text-align: center; }
      .school-title h2 { margin: 4px 0; font-size: 22pt; text-transform: uppercase; letter-spacing: -0.4px; }
      .school-title .eyebrow { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.35em; color: #047857; }
      .school-title .meta { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #475569; margin-top: 8px; }
      .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px; }
      .meta-card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 10px 12px; background: #fff; min-height: 58px; }
      .meta-card .label { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.22em; color: #64748b; font-weight: 700; margin-bottom: 4px; }
      .meta-card .value { font-size: 9pt; font-weight: 700; color: #0f172a; }
      .section-title { font-size: 9pt; font-weight: 800; letter-spacing: 0.24em; text-transform: uppercase; margin: 18px 0 8px; }
      .table { width: 100%; border-collapse: collapse; font-size: 8pt; }
      .table th, .table td { border: 1px solid #0f172a; padding: 6px 5px; text-align: center; vertical-align: middle; }
      .table thead tr:first-child { background: #0f172a; color: white; }
      .table thead tr:nth-child(2) { background: #f1f5f9; color: #0f172a; }
      .left { text-align: left; }
      .strong { font-weight: 700; }
      .term-total { background: #f8fafc; font-weight: 800; }
      .grand-total { background: #ecfdf5; font-weight: 800; color: #065f46; }
      .grade { background: #fffbeb; font-weight: 800; color: #92400e; }
      .split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .summary-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px; margin-top: 18px; }
      .remarks-box { border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px; background: #f8fafc; min-height: 92px; }
      .summary-box { border-radius: 14px; padding: 14px; background: #0f172a; color: white; }
      .summary-box .grade-big { font-size: 24pt; font-weight: 800; margin-top: 6px; }
      .summary-box .minor { font-size: 8pt; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.2em; }
      .signature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 28px; }
      .signature-line { border-top: 1px solid #0f172a; padding-top: 6px; text-align: center; font-size: 8pt; text-transform: uppercase; font-weight: 700; letter-spacing: 0.2em; }
    </style>

    <div class="cbse-shell">
      <div class="header-band">
        <div class="header-grid">
          <div class="logo-box">${data.school.logo ? `<img src="${data.school.logo}" style="max-width:64px; max-height:64px;" />` : "Logo"}</div>
          <div class="school-title">
            <div class="eyebrow">Central Board Style Report Card</div>
            <h2>${escapeHtml(data.school.name)}</h2>
            <div>${escapeHtml(data.school.address || "")}</div>
            <div class="meta">
              Affiliation No: ${escapeHtml(data.school.affiliation || "Pending")} |
              School Code: ${escapeHtml(data.school.schoolCode || "Pending")} |
              Session: ${escapeHtml(data.school.academicYear)}
            </div>
          </div>
          <div class="seal-box">Seal</div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-card"><div class="label">Student Name</div><div class="value">${escapeHtml(data.student.name)}</div></div>
        <div class="meta-card"><div class="label">Admission No</div><div class="value">${escapeHtml(data.student.admissionNo)}</div></div>
        <div class="meta-card"><div class="label">Roll No</div><div class="value">${escapeHtml(data.student.rollNo)}</div></div>
        <div class="meta-card"><div class="label">Class / Section</div><div class="value">${escapeHtml(`${data.student.className} - ${data.student.section}`)}</div></div>
        <div class="meta-card"><div class="label">Date of Birth</div><div class="value">${escapeHtml(data.student.dob)}</div></div>
        <div class="meta-card"><div class="label">Attendance</div><div class="value">${escapeHtml(data.student.attendance)}</div></div>
        <div class="meta-card"><div class="label">Father's Name</div><div class="value">${escapeHtml(data.student.fatherName)}</div></div>
        <div class="meta-card"><div class="label">Mother's Name</div><div class="value">${escapeHtml(data.student.motherName)}</div></div>
        <div class="meta-card"><div class="label">Promotion Status</div><div class="value">${escapeHtml(data.result.promotionStatus)}</div></div>
      </div>

      <div class="section-title">Part 1: Scholastic Areas</div>
      <table class="table">
        <thead>
          <tr>
            <th rowspan="2" class="left">Subject</th>
            <th colspan="5">Term 1</th>
            <th colspan="5">Term 2</th>
            <th rowspan="2">Grand Total</th>
            <th rowspan="2">Grade</th>
          </tr>
          <tr>
            <th>PT (10)</th>
            <th>NB (5)</th>
            <th>SE (5)</th>
            <th>Exam</th>
            <th>Total</th>
            <th>PT (10)</th>
            <th>NB (5)</th>
            <th>SE (5)</th>
            <th>Exam</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${scholasticRows}
          <tr style="background:#0f172a;color:white;">
            <td colspan="11" class="left strong">Overall Performance</td>
            <td class="strong">${escapeHtml(data.result.marksObtained)}</td>
            <td class="strong">${escapeHtml(data.result.grade)}</td>
          </tr>
        </tbody>
      </table>

      <div class="split-grid">
        <div>
          <div class="section-title">Part 2: Co-Scholastic Areas</div>
          <table class="table">
            <thead>
              <tr><th class="left">Activity</th><th>Grade</th></tr>
            </thead>
            <tbody>${coScholasticRows}</tbody>
          </table>
        </div>
        <div>
          <div class="section-title">Part 3: Discipline</div>
          <table class="table">
            <thead>
              <tr><th class="left">Indicator</th><th>Grade</th></tr>
            </thead>
            <tbody>${disciplineRows}</tbody>
          </table>
        </div>
      </div>

      <div class="summary-grid">
        <div class="remarks-box">
          <div class="section-title" style="margin-top:0;">Class Teacher Remarks</div>
          <div style="font-size:9pt; line-height:1.6;">${escapeHtml(data.result.remarks)}</div>
        </div>
        <div class="summary-box">
          <div class="minor">Overall Grade</div>
          <div class="grade-big">${escapeHtml(data.result.grade)}</div>
          <div style="font-size:10pt; font-weight:700;">${escapeHtml(data.result.percentage)}%</div>
          <div style="font-size:8pt; color:#cbd5e1; margin-top:8px;">${escapeHtml(data.result.rank || "")}</div>
          <div style="margin-top:10px;">
            <img src="${qrBase64}" style="width:74px;height:74px;" />
          </div>
        </div>
      </div>

      <div class="signature-grid">
        <div class="signature-line">Class Teacher</div>
        <div class="signature-line">Parent / Guardian</div>
        <div class="signature-line">Principal</div>
      </div>
    </div>
  `;
}

export async function generateCBSEHTML(data: CBSEReportTemplateData): Promise<string> {
  const content = await renderCBSEContent(data);
  return PDFService.wrapInTemplate(content, data.school.name);
}
