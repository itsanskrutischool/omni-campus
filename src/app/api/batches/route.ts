import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { listBatches, createBatch, deleteBatch } from "@/services/program.service"

/**
 * GET /api/batches
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const batches = await listBatches(session.user.tenantId)
  return NextResponse.json(batches)
}

/**
 * POST /api/batches
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const batch = await createBatch({
      ...body,
      tenantId: session.user.tenantId,
    })
    return NextResponse.json(batch, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create batch" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/batches?id=xxx
 */
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 })
  }

  try {
    await deleteBatch(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete batch" },
      { status: 500 }
    )
  }
}
