import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { TransportService } from "@/services/transport.service"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const routes = await TransportService.getRoutes(session.user.tenantId)
    return NextResponse.json(routes)
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
    const { name, stops, vehicle, driver } = body

    if (!name || !stops) {
      return NextResponse.json({ error: "name and stops are required" }, { status: 400 })
    }

    const route = await TransportService.createRoute(session.user.tenantId, { name, stops, vehicle, driver })
    return NextResponse.json(route)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
