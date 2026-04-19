import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ExamService } from "@/services/exam.service";
import { PDFService } from "@/services/pdf.service";
import { renderCBSEContent } from "../cbse-template";

function formatScore(value: number | null | undefined) {
  return typeof value === "number" ? value.toString() : "-";
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classRoomId = searchParams.get("classRoomId");

    if (!classRoomId) {
      return NextResponse.json({ error: "classRoomId is required" }, { status: 400 });
    }

    const students = await ExamService.getStudentsForClassReportCards(session.user.tenantId, classRoomId);
    if (!students.length) {
      return NextResponse.json({ error: "No active students found for this class" }, { status: 404 });
    }

    const pages = await Promise.all(
      students.map(async (student) => {
        const data = await ExamService.getDetailedCBSEData(session.user.tenantId, student.id);
        return renderCBSEContent({
          school: {
            name: data.tenant?.name || "OMNI CAMPUS",
            logo: data.tenant?.logo || undefined,
            address: data.tenant?.address || "",
            affiliation: data.tenant?.affiliationNo || "",
            schoolCode: data.tenant?.schoolCode || "",
            academicYear: data.academicYear,
          },
          student: {
            name: data.student.name,
            admissionNo: data.student.admissionNumber,
            rollNo: data.student.rollNumber || "N/A",
            className: data.student.classroom?.name || "",
            section: data.student.section?.name || "",
            dob: data.student.dob ? new Date(data.student.dob).toLocaleDateString("en-IN") : "",
            fatherName: data.student.fatherName || "",
            motherName: data.student.motherName || "",
            attendance: `${data.attendance.presentDays}/${data.attendance.workingDays} (${data.attendance.percentage}%)`,
          },
          scholastic: data.results.scholastic.map((row) => ({
            subject: row.name,
            term1: {
              periodicTest: formatScore(row.term1.periodicTest),
              notebook: formatScore(row.term1.notebook),
              subjectEnrichment: formatScore(row.term1.subjectEnrichment),
              exam: formatScore(row.term1.exam),
              total: row.term1.total.toString(),
            },
            term2: {
              periodicTest: formatScore(row.term2.periodicTest),
              notebook: formatScore(row.term2.notebook),
              subjectEnrichment: formatScore(row.term2.subjectEnrichment),
              exam: formatScore(row.term2.exam),
              total: row.term2.total.toString(),
            },
            grandTotal: row.total.toString(),
            grade: row.grade,
          })),
          coScholastic: data.results.coScholastic.map((row) => ({
            activity: row.name,
            grade: row.grade,
          })),
          discipline: data.results.discipline.map((row) => ({
            activity: row.name,
            grade: row.grade,
          })),
          result: {
            marksObtained: `${data.results.totalMarksObtained} / ${data.results.totalMaxMarks}`,
            percentage: data.results.overallPercentage.toFixed(2),
            grade: data.results.overallGrade,
            rank: data.results.rank ? `Rank ${data.results.rank} of ${data.results.totalStudents}` : undefined,
            remarks: data.results.remarks,
            promotionStatus: data.promotionStatus,
          },
          qrUrl: `https://omnicampus.com/v/${student.id}`,
        });
      })
    );

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; color: #0f172a; }
            .report-page { page-break-after: always; padding: 10mm; box-sizing: border-box; }
            .report-page:last-child { page-break-after: auto; }
          </style>
        </head>
        <body>
          ${pages.map((page) => `<section class="report-page">${page}</section>`).join("")}
        </body>
      </html>
    `;

    const pdfBuffer = await PDFService.generateA4PDF(html);
    return new NextResponse(pdfBuffer as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Class_${classRoomId}_ReportCards.pdf"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
