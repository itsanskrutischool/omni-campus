import { NextRequest, NextResponse } from "next/server"
import { RecruitmentService } from "@/services/recruitment.service"
import { createVacancySchema, createApplicationSchema } from "@/lib/validation"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"

// GET /api/recruitment - Get job vacancies, applications, or statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get("tenantId")
    const stats = searchParams.get("stats")
    const type = searchParams.get("type") // vacancy, application

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    if (stats === "true") {
      const result = await RecruitmentService.getRecruitmentStatistics(tenantId)
      return NextResponse.json(result)
    }

    switch (type) {
      case "vacancy":
        const vacancyId = searchParams.get("vacancyId")
        if (vacancyId) {
          const vacancy = await RecruitmentService.getJobVacancy(tenantId, vacancyId)
          return NextResponse.json(vacancy)
        }
        const vacancies = await RecruitmentService.getJobVacancies(tenantId)
        return NextResponse.json(vacancies)

      case "application":
        const appVacancyId = searchParams.get("vacancyId")
        if (!appVacancyId) {
          return NextResponse.json({ error: "Vacancy ID is required" }, { status: 400 })
        }
        const applications = await RecruitmentService.getJobApplications(tenantId, appVacancyId)
        return NextResponse.json(applications)

      default:
        const allVacancies = await RecruitmentService.getJobVacancies(tenantId)
        return NextResponse.json(allVacancies)
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/recruitment - Create job vacancy or submit job application
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const limitId = forwarded ? forwarded.split(",")[0]?.trim() : (realIp ?? "anonymous")
    const limitResult = rateLimit(limitId)

    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(limitResult),
        }
      )
    }

    const body = await request.json()
    const { tenantId, action, ...data } = body

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    switch (action) {
      case "createVacancy":
        const validatedVacancy = createVacancySchema.parse(body)
        const vacancy = await RecruitmentService.createJobVacancy(tenantId, data)
        return NextResponse.json(vacancy)

      case "submitApplication":
        const validatedApplication = createApplicationSchema.parse(body)
        const application = await RecruitmentService.submitJobApplication(tenantId, data)
        return NextResponse.json(application)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/recruitment - Update job vacancy or application status
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const limitId = forwarded ? forwarded.split(",")[0]?.trim() : (realIp ?? "anonymous")
    const limitResult = rateLimit(limitId)

    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(limitResult),
        }
      )
    }

    const body = await request.json()
    const { tenantId, action, id, ...data } = body

    if (!tenantId || !id) {
      return NextResponse.json({ error: "Tenant ID and ID are required" }, { status: 400 })
    }

    switch (action) {
      case "updateVacancy":
        const vacancy = await RecruitmentService.updateJobVacancy(tenantId, id, data)
        return NextResponse.json(vacancy)

      case "updateApplicationStatus":
        const application = await RecruitmentService.updateApplicationStatus(tenantId, id, data.status)
        return NextResponse.json(application)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/recruitment - Delete job vacancy
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const limitId = forwarded ? forwarded.split(",")[0]?.trim() : (realIp ?? "anonymous")
    const limitResult = rateLimit(limitId)

    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(limitResult),
        }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get("tenantId")
    const vacancyId = searchParams.get("vacancyId")

    if (!tenantId || !vacancyId) {
      return NextResponse.json({ error: "Tenant ID and vacancy ID are required" }, { status: 400 })
    }

    await RecruitmentService.deleteJobVacancy(tenantId, vacancyId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
