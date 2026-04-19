import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ExportService } from "@/services/export.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId } = await params;
    const { searchParams } = new URL(req.url);
    const classRoomId = searchParams.get("classRoomId") || undefined;
    const format = (searchParams.get("format") || "xlsx").toLowerCase();

    const rows = await ExportService.exportExamMarks(session.user.tenantId, examId, classRoomId);

    if (format === "csv") {
      return new NextResponse(ExportService.jsonToCsv(rows), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="ExamMarks_${examId}.csv"`,
        },
      });
    }

    const workbookBuffer = ExportService.jsonToWorkbookBuffer(rows, "Marks");
    return new NextResponse(workbookBuffer as any, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="ExamMarks_${examId}.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
