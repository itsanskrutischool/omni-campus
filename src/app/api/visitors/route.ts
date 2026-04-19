import { NextRequest, NextResponse } from "next/server"
import { VisitorService } from "@/services/gatepass.service"
import { auth } from "@/lib/auth"

/**
 * GET  /api/visitors — List visitors
 * POST /api/visitors — Check-in a visitor
 */

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId") || session.user.tenantId

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId is required" }, { status: 400 })
    }

    const filters = {
      status: searchParams.get("status") || undefined,
      date: searchParams.get("date") ? new Date(searchParams.get("date")!) : undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")!) : 20,
    }

    const result = await VisitorService.list(tenantId, filters)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const tenantId = body.tenantId || session.user.tenantId

    if (!tenantId || !body.name || !body.phone || !body.purpose || !body.personToMeet) {
      return NextResponse.json(
        { error: "tenantId, name, phone, purpose, and personToMeet are required" },
        { status: 400 }
      )
    }

    const visitor = await VisitorService.checkIn(tenantId, body)
    return NextResponse.json(visitor, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
