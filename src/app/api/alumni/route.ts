import { NextRequest, NextResponse } from "next/server"
import { AlumniService } from "@/services/alumni.service"
import { verifyAlumniSchema, createEventSchema } from "@/lib/validation"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"

// GET /api/alumni - Get alumni, events, donations, achievements, or statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get("tenantId")
    const stats = searchParams.get("stats")
    const type = searchParams.get("type") // alumni, event, donation, achievement

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    if (stats === "true") {
      const result = await AlumniService.getAlumniStatistics(tenantId)
      return NextResponse.json(result)
    }

    switch (type) {
      case "alumni":
        const alumniId = searchParams.get("alumniId")
        if (alumniId) {
          const alumni = await AlumniService.getAlumniById(tenantId, alumniId)
          return NextResponse.json(alumni)
        }
        const alumni = await AlumniService.getAlumni(tenantId)
        return NextResponse.json(alumni)

      case "event":
        const events = await AlumniService.getEvents(tenantId)
        return NextResponse.json(events)

      case "donation":
        const donationAlumniId = searchParams.get("alumniId")
        const donations = await AlumniService.getDonations(tenantId, donationAlumniId || undefined)
        return NextResponse.json(donations)

      case "achievement":
        const achievementAlumniId = searchParams.get("alumniId")
        const achievements = await AlumniService.getAchievements(tenantId, achievementAlumniId || undefined)
        return NextResponse.json(achievements)

      default:
        const allAlumni = await AlumniService.getAlumni(tenantId)
        return NextResponse.json(allAlumni)
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/alumni - Register alumni, create event, record donation/achievement
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
      case "registerAlumni":
        const alumni = await AlumniService.registerAlumni(tenantId, data)
        return NextResponse.json(alumni)

      case "createEvent":
        const validatedEvent = createEventSchema.parse(body)
        const event = await AlumniService.createEvent(tenantId, data)
        return NextResponse.json(event)

      case "recordDonation":
        const donation = await AlumniService.recordDonation(tenantId, data)
        return NextResponse.json(donation)

      case "recordAchievement":
        const achievement = await AlumniService.recordAchievement(tenantId, data)
        return NextResponse.json(achievement)

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

// PUT /api/alumni - Update alumni profile, verify alumni, regenerate backup codes
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
      case "updateAlumni":
        const alumni = await AlumniService.updateAlumni(tenantId, id, data)
        return NextResponse.json(alumni)

      case "verifyAlumni":
        const validated = verifyAlumniSchema.parse(body)
        const verified = await AlumniService.verifyAlumni(tenantId, id)
        return NextResponse.json(verified)

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
