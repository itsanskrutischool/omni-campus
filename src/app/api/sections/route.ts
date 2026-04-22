import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/sections - List all sections
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const classRoomId = searchParams.get("classRoomId")
    const streamId = searchParams.get("streamId")

    const where: any = {}
    if (classRoomId) where.classRoomId = classRoomId
    if (streamId) where.streamId = streamId

    const sections = await prisma.section.findMany({
      where,
      include: {
        classRoom: { select: { id: true, name: true, numeric: true } },
        stream: { select: { id: true, name: true, code: true } },
        students: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(sections)
  } catch (error) {
    console.error("Failed to fetch sections:", error)
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    )
  }
}

// POST /api/sections - Create a new section
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, classRoomId, streamId } = body

    if (!name || !classRoomId) {
      return NextResponse.json(
        { error: "Name and classRoomId are required" },
        { status: 400 }
      )
    }

    // Verify the classRoom exists
    const classRoom = await prisma.classRoom.findUnique({
      where: { id: classRoomId },
    })

    if (!classRoom) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      )
    }

    // If streamId provided, verify it exists and belongs to the same class
    if (streamId) {
      const stream = await prisma.stream.findFirst({
        where: { id: streamId, classRoomId },
      })
      if (!stream) {
        return NextResponse.json(
          { error: "Stream not found or does not belong to this class" },
          { status: 404 }
        )
      }
    }

    const section = await prisma.section.create({
      data: {
        name,
        classRoomId,
        streamId,
      },
      include: {
        classRoom: { select: { id: true, name: true, numeric: true } },
        stream: { select: { id: true, name: true, code: true } },
      },
    })

    return NextResponse.json(section, { status: 201 })
  } catch (error) {
    console.error("Failed to create section:", error)
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    )
  }
}

// PUT /api/sections - Update a section
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, name, streamId } = body

    if (!id) {
      return NextResponse.json(
        { error: "Section ID is required" },
        { status: 400 }
      )
    }

    const updateData: any = { name }
    if (streamId !== undefined) updateData.streamId = streamId

    const section = await prisma.section.update({
      where: { id },
      data: updateData,
      include: {
        classRoom: { select: { id: true, name: true, numeric: true } },
        stream: { select: { id: true, name: true, code: true } },
      },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error("Failed to update section:", error)
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    )
  }
}

// DELETE /api/sections?id=<id> - Delete a section
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
        { error: "Section ID is required" },
        { status: 400 }
      )
    }

    // Check if section has students
    const sectionWithStudents = await prisma.section.findUnique({
      where: { id },
      include: { students: { select: { id: true } } },
    })

    if (sectionWithStudents?.students.length) {
      return NextResponse.json(
        { error: "Cannot delete section with students. Transfer students first." },
        { status: 400 }
      )
    }

    await prisma.section.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete section:", error)
    return NextResponse.json(
      { error: "Failed to delete section" },
      { status: 500 }
    )
  }
}
