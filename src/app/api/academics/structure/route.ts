import { NextResponse } from "next/server"
import { currentUser } from "@/lib/session"
import { AcademicsService } from "@/services/academics.service"

export async function GET(request: Request) {
  const user = await currentUser()
  if (!user || !user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") // 'all', 'years', 'classes', 'subjects'
  const classId = searchParams.get("classId")

  try {
    if (type === "years") {
      const years = await AcademicsService.getAcademicYears(user.tenantId)
      return NextResponse.json(years)
    }

    if (type === "classes") {
      const classes = await AcademicsService.getClassRooms(user.tenantId)
      return NextResponse.json(classes)
    }

    if (type === "sections" && classId) {
      const sections = await AcademicsService.getSections(classId)
      return NextResponse.json(sections)
    }

    if (type === "subjects") {
      const subjects = await AcademicsService.getSubjects(user.tenantId)
      return NextResponse.json(subjects)
    }

    // Default: fetch everything for the structure builder
    const years = await AcademicsService.getAcademicYears(user.tenantId)
    const classes = await AcademicsService.getClassRooms(user.tenantId)
    
    return NextResponse.json({ years, classes })
  } catch (error) {
    console.error("Structure API GET Error:", error)
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
    const { type, data } = body

    if (type === "year") {
      const year = await AcademicsService.createAcademicYear(user.tenantId, data)
      return NextResponse.json(year)
    }

    if (type === "class") {
      const classRoom = await AcademicsService.createClassRoom(user.tenantId, data)
      return NextResponse.json(classRoom)
    }

    if (type === "section") {
      const { classId, ...sectionData } = data
      const section = await AcademicsService.createSection(user.tenantId, classId, sectionData)
      return NextResponse.json(section)
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Structure API POST Error:", error)
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
    const { type, id, data } = body

    if (!id || !type) {
      return NextResponse.json({ error: "ID and type are required" }, { status: 400 })
    }

    if (type === "year") {
      const year = await AcademicsService.updateAcademicYear(user.tenantId, id, data)
      return NextResponse.json(year)
    }

    if (type === "class") {
      const classRoom = await AcademicsService.updateClassRoom(user.tenantId, id, data)
      return NextResponse.json(classRoom)
    }

    if (type === "section") {
      const section = await AcademicsService.updateSection(user.tenantId, id, data)
      return NextResponse.json(section)
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Structure API PUT Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const user = await currentUser()
  if (!user || !user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const id = searchParams.get("id")

  if (!id || !type) {
    return NextResponse.json({ error: "ID and type are required" }, { status: 400 })
  }

  try {
    if (type === "year") {
      await AcademicsService.deleteAcademicYear(user.tenantId, id)
      return NextResponse.json({ success: true })
    }

    if (type === "class") {
      await AcademicsService.deleteClassRoom(user.tenantId, id)
      return NextResponse.json({ success: true })
    }

    if (type === "section") {
      await AcademicsService.deleteSection(user.tenantId, id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Structure API DELETE Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
