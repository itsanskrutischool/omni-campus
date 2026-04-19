import { NextRequest, NextResponse } from "next/server"
import { VisitorService } from "@/services/gatepass.service"

/**
 * PATCH /api/visitors/[id] — Check out a visitor
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId is required" }, { status: 400 })
    }

    const visitor = await VisitorService.checkOut(tenantId, id)
    return NextResponse.json(visitor)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
