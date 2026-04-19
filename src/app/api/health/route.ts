import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { HealthService } from "@/services/health.service"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const tenantSlug = session.user.tenantSlug
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

    // Analytics
    if (searchParams.get("analytics")) {
      const analytics = await HealthService.getAnalytics(tenant.id)
      return NextResponse.json(analytics)
    }

    // Student profile
    if (searchParams.get("studentId")) {
      const profile = await HealthService.getStudentHealthProfile(tenant.id, searchParams.get("studentId")!)
      return NextResponse.json(profile)
    }

    // List records
    const result = await HealthService.getRecords(tenant.id, {
      studentId: searchParams.get("studentId") || undefined,
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("pageSize") || "20"),
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Health GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch health records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tenantSlug = session.user.tenantSlug
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

    const body = await request.json()
    const { action, ...data } = body

    if (action === "create") {
      const record = await HealthService.createRecord(tenant.id, session.user.id, {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      })
      return NextResponse.json(record, { status: 201 })
    }

    if (action === "update") {
      const record = await HealthService.updateRecord(tenant.id, session.user.id, data.recordId, {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      })
      return NextResponse.json(record)
    }

    if (action === "delete") {
      await HealthService.deleteRecord(tenant.id, data.recordId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Health POST Error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
