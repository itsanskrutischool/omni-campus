import { NextResponse } from "next/server"
import { currentUser } from "@/lib/session"
import { AcademicsService } from "@/services/academics.service"

export async function GET(request: Request) {
  const user = await currentUser()
  if (!user || !user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const statsOnly = searchParams.get("stats") === "true"

  try {
    const query = {
      tenantId: user.tenantId,
      campusId: user.campusId || undefined,
    }

    if (statsOnly) {
      const stats = await AcademicsService.getAcademicStats(query)
      return NextResponse.json(stats)
    }

    const trajectory = await AcademicsService.getCurriculumTrajectory(query)
    return NextResponse.json(trajectory)
  } catch (error) {
    console.error("Academics API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
