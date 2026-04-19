import { NextRequest, NextResponse } from "next/server"
import { HostelService } from "@/services/hostel.service"
import { createHostelSchema, allocateRoomSchema } from "@/lib/validation"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"

// GET /api/hostel - Get hostels, rooms, or statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get("tenantId")
    const stats = searchParams.get("stats")
    const type = searchParams.get("type") // hostel, room, roomType, meal

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    if (stats === "true") {
      const result = await HostelService.getHostelStatistics(tenantId)
      return NextResponse.json(result)
    }

    switch (type) {
      case "hostel":
        const hostels = await HostelService.getHostels(tenantId)
        return NextResponse.json(hostels)

      case "room":
        const hostelId = searchParams.get("hostelId")
        const rooms = await HostelService.getRooms(tenantId, hostelId || undefined)
        return NextResponse.json(rooms)

      case "roomType":
        const roomTypes = await HostelService.getRoomTypes(tenantId)
        return NextResponse.json(roomTypes)

      case "meal":
        const meals = await HostelService.getMeals(tenantId)
        return NextResponse.json(meals)

      default:
        const allHostels = await HostelService.getHostels(tenantId)
        return NextResponse.json(allHostels)
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/hostel - Create hostel, room, roomType, meal, or allocate room
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
      case "createHostel":
        const validatedHostel = createHostelSchema.parse(body)
        const hostel = await HostelService.createHostel(tenantId, data)
        return NextResponse.json(hostel)

      case "createRoomType":
        const roomType = await HostelService.createRoomType(tenantId, data)
        return NextResponse.json(roomType)

      case "createRoom":
        const room = await HostelService.createRoom(tenantId, data)
        return NextResponse.json(room)

      case "createMeal":
        const meal = await HostelService.createMeal(tenantId, data)
        return NextResponse.json(meal)

      case "allocateRoom":
        const validatedAllocation = allocateRoomSchema.parse(body)
        const allocation = await HostelService.allocateRoom(tenantId, data)
        return NextResponse.json(allocation)

      case "recordMealAttendance":
        const mealAttendance = await HostelService.recordMealAttendance(tenantId, data)
        return NextResponse.json(mealAttendance)

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

// PUT /api/hostel - Release room allocation
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
      case "releaseAllocation":
        const deallocation = await HostelService.releaseAllocation(tenantId, id)
        return NextResponse.json(deallocation)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
