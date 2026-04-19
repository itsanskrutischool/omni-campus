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
    const type = searchParams.get("type") || undefined
    const search = searchParams.get("search") || undefined

    const where: any = { tenantId: tenant.id, isActive: true }
    if (type && type !== "ALL") where.type = type
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { chapter: { contains: search, mode: "insensitive" } },
      ]
    }

    const [contents, total] = await Promise.all([
      prisma.lMSContent.findMany({ where, orderBy: { createdAt: "desc" } }),
      prisma.lMSContent.count({ where }),
    ])

    // Analytics
    const [byType, totalResources] = await Promise.all([
      prisma.lMSContent.groupBy({ by: ["type"], where, _count: { _all: true } }),
      prisma.lMSContent.count({ where: { tenantId: tenant.id } }),
    ])

    return NextResponse.json({ contents, total, byType, totalResources })
  } catch (error) {
    console.error("LMS GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch LMS content" }, { status: 500 })
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
      const content = await prisma.lMSContent.create({
        data: {
          tenantId: tenant.id,
          uploadedBy: session.user.name || session.user.email,
          ...data,
        },
      })

      await AuditService.log({
        tenantId: tenant.id,
        userId: session.user.id,
        action: "CREATE",
        module: "lms",
        entityType: "LMSContent",
        entityId: content.id,
        summary: `Uploaded LMS content: ${content.title} (${content.type})`,
      })

      return NextResponse.json(content, { status: 201 })
    }

    if (action === "delete") {
      await prisma.lMSContent.delete({ where: { id: data.id, tenantId: tenant.id } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("LMS POST Error:", error)
    return NextResponse.json({ error: "Failed to process" }, { status: 500 })
  }
}
