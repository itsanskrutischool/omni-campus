import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ExamService } from "@/services/exam.service";
import { PDFService } from "@/services/pdf.service";
import { AuditService } from "@/services/audit.service";
import { generateCBSEHTML } from "./cbse-template";
import { ReportUtils } from "@/lib/report-utils";
import { existsSync, readFileSync } from "fs";

function formatScore(value: number | null | undefined) {
  return typeof value === "number" ? value.toString() : "-";
}

export async function GET(
  req: NextRequest
) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const hmac = searchParams.get("hmac");
    const tenantId = searchParams.get("tenantId") || session?.user?.tenantId;

    if (!studentId || !tenantId) {
      return NextResponse.json({ error: "Missing required IDs" }, { status: 400 });
    }

    // 1. SECURITY: HMAC Verification for direct/offline links
    const expectedHmac = ReportUtils.generateReportHMAC(studentId, tenantId);
    if (hmac && hmac !== expectedHmac) {
      return NextResponse.json({ error: "Invalid integrity hash" }, { status: 403 });
    }

    // 2. RBAC: Ensure user has access if not using valid HMAC
    if (!hmac && (!session || session.user.tenantId !== tenantId)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 3. CACHING: Check if valid PDF exists
    const cacheKey = ReportUtils.generateCacheKey(studentId, tenantId, "cbse-v1");
    const cachePath = ReportUtils.getCachePath(cacheKey);

    if (existsSync(cachePath)) {
      const cachedBuffer = readFileSync(cachePath);
      return new NextResponse(cachedBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="ReportCard_${studentId}.pdf"`,
          "X-Cache": "HIT",
        },
      });
    }

    // 4. DATA FETCHING: Aggregated CBSE Data
    const data = await ExamService.getDetailedCBSEData(tenantId, studentId);

    // 5. HTML GENERATION & PDF CONVERSION
    const html = await generateCBSEHTML({
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
        attendance: `${data.attendance.presentDays}/${data.attendance.workingDays} (${data.attendance.percentage}%)`
      },
      scholastic: data.results.scholastic.map(s => ({
        subject: s.name,
        term1: {
          periodicTest: formatScore(s.term1.periodicTest),
          notebook: formatScore(s.term1.notebook),
          subjectEnrichment: formatScore(s.term1.subjectEnrichment),
          exam: formatScore(s.term1.exam),
          total: s.term1.total.toString(),
        },
        term2: {
          periodicTest: formatScore(s.term2.periodicTest),
          notebook: formatScore(s.term2.notebook),
          subjectEnrichment: formatScore(s.term2.subjectEnrichment),
          exam: formatScore(s.term2.exam),
          total: s.term2.total.toString(),
        },
        grandTotal: s.total.toString(),
        grade: s.grade
      })),
      coScholastic: data.results.coScholastic.map(c => ({
        activity: c.name,
        grade: c.grade
      })),
      discipline: data.results.discipline.map(c => ({
        activity: c.name,
        grade: c.grade,
      })),
      result: {
        marksObtained: `${data.results.totalMarksObtained} / ${data.results.totalMaxMarks}`,
        percentage: data.results.overallPercentage.toFixed(2),
        grade: data.results.overallGrade,
        rank: data.results.rank ? `Rank ${data.results.rank} of ${data.results.totalStudents}` : undefined,
        remarks: data.results.remarks,
        promotionStatus: data.promotionStatus,
      },
      qrUrl: `https://omnicampus.com/v/${cacheKey}`
    });

    const pdfBuffer = await PDFService.generateA4PDF(html);

    // 6. CACHE PERSISTENCE (Async)
    PDFService.writeToCache(cacheKey, pdfBuffer).catch(console.error);

    // 7. AUDIT LOGGING
    AuditService.log({
      tenantId,
      userId: session?.user?.id,
      userName: session?.user?.name,
      action: "EXPORT",
      module: "EXAMS",
      entityType: "REPORT_CARD",
      entityId: studentId,
      summary: `Generated CBSE Report Card for student ${data.student.name}`
    });

    // 8. RESPONSE
    return new NextResponse(pdfBuffer as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ReportCard_${data.student.name.replace(/\s+/g, '_')}.pdf"`,
        "X-Cache": "MISS",
      },
    });

  } catch (error: unknown) {
    console.error("Report Generation Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
