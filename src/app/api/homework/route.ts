import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AuditService } from "@/services/audit.service"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tenant = await prisma.tenant.findUnique({ where: { slug: session.user.tenantSlug } })
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const classRoomId = searchParams.get("classRoomId") || undefined
    const search = searchParams.get("search") || undefined

    const where: any = { tenantId: tenant.id }
    if (classRoomId) where.classRoomId = classRoomId
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const [homeworks, total] = await Promise.all([
      prisma.homework.findMany({
        where,
        include: {
          _count: { select: { submissions: true } },
        },
        orderBy: { dueDate: "desc" },
      }),
      prisma.homework.count({ where }),
    ])

    // Analytics
    const [active, overdue, withSubmissions] = await Promise.all([
      prisma.homework.count({ where: { tenantId: tenant.id, dueDate: { gte: new Date() } } }),
      prisma.homework.count({ where: { tenantId: tenant.id, dueDate: { lt: new Date() } } }),
      prisma.homework.count({ where: { tenantId: tenant.id, submissions: { some: {} } } }),
    ])

    return NextResponse.json({ homeworks, total, analytics: { active, overdue, withSubmissions } })
  } catch (error) {
    console.error("Homework GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch homework" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tenant = await prisma.tenant.findUnique({ where: { slug: session.user.tenantSlug } })
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

    const body = await request.json()
    const { action, ...data } = body

    if (action === "create") {
      const homework = await prisma.homework.create({
        data: {
          tenantId: tenant.id,
          assignedBy: session.user.name || session.user.email,
          ...data,
          dueDate: new Date(data.dueDate),
          maxMarks: parseFloat(data.maxMarks) || 100,
        },
      })

      await AuditService.log({
        tenantId: tenant.id,
        userId: session.user.id,
        action: "CREATE",
        module: "homework",
        entityType: "Homework",
        entityId: homework.id,
        summary: `Created homework: ${homework.title} (Due: ${new Date(homework.dueDate).toLocaleDateString()})`,
      })

      return NextResponse.json(homework, { status: 201 })
    }

    if (action === "delete") {
      await prisma.homework.delete({ where: { id: data.id, tenantId: tenant.id } })
      return NextResponse.json({ success: true })
    }

    if (action === "grade") {
      const submission = await prisma.homeworkSubmission.update({
        where: { id: data.submissionId },
        data: {
          marks: parseFloat(data.marks),
          remarks: data.remarks || null,
          status: "GRADED",
        },
      })

      return NextResponse.json(submission)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Homework POST Error:", error)
    return NextResponse.json({ error: "Failed to process" }, { status: 500 })
  }
}
