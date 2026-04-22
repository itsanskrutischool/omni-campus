import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/streams - List all streams
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get("tenantId")
    const classRoomId = searchParams.get("classRoomId")

    const where: any = {}
    if (tenantId) where.tenantId = tenantId
    if (classRoomId) where.classRoomId = classRoomId

    const streams = await prisma.stream.findMany({
      where,
      include: {
        classRoom: { select: { id: true, name: true, numeric: true } },
        sections: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(streams)
  } catch (error) {
    console.error("Failed to fetch streams:", error)
    return NextResponse.json(
      { error: "Failed to fetch streams" },
      { status: 500 }
    )
  }
}

// POST /api/streams - Create a new stream
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, code, description, classRoomId, tenantId } = body

    if (!name || !classRoomId || !tenantId) {
      return NextResponse.json(
        { error: "Name, classRoomId, and tenantId are required" },
        { status: 400 }
      )
    }

    // Verify the classRoom exists and belongs to the tenant
    const classRoom = await prisma.classRoom.findFirst({
      where: { id: classRoomId, tenantId },
    })

    if (!classRoom) {
      return NextResponse.json(
        { error: "Class not found or does not belong to tenant" },
        { status: 404 }
      )
    }

    const stream = await prisma.stream.create({
      data: {
        name,
        code,
        description,
        classRoomId,
        tenantId,
      },
      include: {
        classRoom: { select: { id: true, name: true, numeric: true } },
        sections: true,
      },
    })

    return NextResponse.json(stream, { status: 201 })
  } catch (error) {
    console.error("Failed to create stream:", error)
    return NextResponse.json(
      { error: "Failed to create stream" },
      { status: 500 }
    )
  }
}

// PUT /api/streams - Update a stream
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, name, code, description } = body

    if (!id) {
      return NextResponse.json(
        { error: "Stream ID is required" },
        { status: 400 }
      )
    }

    const stream = await prisma.stream.update({
      where: { id },
      data: {
        name,
        code,
        description,
      },
      include: {
        classRoom: { select: { id: true, name: true, numeric: true } },
        sections: true,
      },
    })

    return NextResponse.json(stream)
  } catch (error) {
    console.error("Failed to update stream:", error)
    return NextResponse.json(
      { error: "Failed to update stream" },
      { status: 500 }
    )
  }
}

// DELETE /api/streams?id=<id> - Delete a stream
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Stream ID is required" },
        { status: 400 }
      )
    }

    // Check if stream has sections
    const streamWithSections = await prisma.stream.findUnique({
      where: { id },
      include: { sections: { select: { id: true } } },
    })

    if (streamWithSections?.sections.length) {
      return NextResponse.json(
        { error: "Cannot delete stream with sections. Remove sections first." },
        { status: 400 }
      )
    }

    await prisma.stream.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete stream:", error)
    return NextResponse.json(
      { error: "Failed to delete stream" },
      { status: 500 }
    )
  }
}
