import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ExamService } from "@/services/exam.service"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const reportCardStudentId = searchParams.get("reportCardStudentId")
    const reportCardExamId = searchParams.get("reportCardExamId")

    // If report card params are present, return the report card data.
    if (reportCardStudentId && reportCardExamId) {
      const data = await ExamService.getStudentReportCard(session.user.tenantId, reportCardStudentId, reportCardExamId)
      return NextResponse.json(data)
    }

    // Default: Get all exams
    const exams = await ExamService.getExams(session.user.tenantId)
    return NextResponse.json(exams)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, type, term, startDate, endDate } = body

    if (!name || !type || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newExam = await ExamService.createExam(session.user.tenantId, {
      name,
      type,
      term: term ? Number(term) : 1,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    })

    return NextResponse.json(newExam)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
