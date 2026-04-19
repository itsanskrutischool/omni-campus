import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { AuditService } from "@/services/audit.service"

// GET /api/bus - List buses
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get("tenantId") || auth.user.tenants[0]?.id
    
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const status = searchParams.get("status")
    const routeId = searchParams.get("routeId")
    
    const buses = await prisma.bus.findMany({
      where: {
        tenantId,
        ...(status && { status }),
        ...(routeId && { routeId }),
      },
      include: {
        route: true,
        _count: {
          select: { gpsLogs: true },
        },
      },
      orderBy: { vehicleNo: "asc" },
    })

    return NextResponse.json(buses)
  } catch (error) {
    console.error("[BUS_GET_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch buses" },
      { status: 500 }
    )
  }
}

// POST /api/bus - Create bus
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const tenantId = body.tenantId || auth.user.tenants[0]?.id
    
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const bus = await prisma.bus.create({
      data: {
        tenantId,
        vehicleNo: body.vehicleNo,
        registrationNo: body.registrationNo,
        model: body.model,
        capacity: body.capacity,
        driverId: body.driverId,
        driverName: body.driverName,
        driverPhone: body.driverPhone,
        routeId: body.routeId,
        gpsDeviceId: body.gpsDeviceId,
        status: body.status || "ACTIVE",
      },
    })

    await AuditService.log({
      tenantId,
      userId: auth.user.id,
      action: "CREATE",
      module: "transport",
      entityType: "Bus",
      entityId: bus.id,
      summary: `New bus added: ${bus.vehicleNo}`,
    })

    return NextResponse.json(bus, { status: 201 })
  } catch (error) {
    console.error("[BUS_POST_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create bus" },
      { status: 500 }
    )
  }
}
