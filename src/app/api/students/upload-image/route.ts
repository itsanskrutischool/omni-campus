import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import { mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const studentId = formData.get("studentId") as string

    if (!file || !studentId) {
      return NextResponse.json(
        { error: "File and studentId are required" },
        { status: 400 }
      )
    }

    // Verify student exists and belongs to tenant
    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId: session.user.tenantId },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      )
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const ext = path.extname(file.name) || ".jpg"
    const filename = `${uuidv4()}${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads", "students")

    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filepath = path.join(uploadDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Generate public URL
    const publicUrl = `/uploads/students/${filename}`

    // Update student record
    await prisma.student.update({
      where: { id: studentId },
      data: { profileImage: publicUrl },
    })

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error("[UPLOAD_IMAGE] Error:", error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}
