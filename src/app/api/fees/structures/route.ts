import { NextResponse } from "next/server"
import { currentUser } from "@/lib/session"
import { FeeService } from "@/services/fee.service"

export async function GET(request: Request) {
  const user = await currentUser()
  if (!user || !user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const structures = await FeeService.getFeeStructures(user.tenantId)
    return NextResponse.json(structures)
  } catch (error) {
    console.error("Fee Structure API GET Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user || !user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { academicYearId, ...data } = body
    
    if (!academicYearId) {
      return NextResponse.json({ error: "Academic Year ID is required" }, { status: 400 })
    }

    const structure = await FeeService.createFeeStructure(user.tenantId, academicYearId, data)
    return NextResponse.json(structure)
  } catch (error) {
    console.error("Fee Structure API POST Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const user = await currentUser()
  if (!user || !user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, ...data } = body
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const structure = await FeeService.updateFeeStructure(user.tenantId, id, data)
    return NextResponse.json(structure)
  } catch (error) {
    console.error("Fee Structure API PUT Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const user = await currentUser()
  if (!user || !user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }

  try {
    await FeeService.deleteFeeStructure(user.tenantId, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Fee Structure API DELETE Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
