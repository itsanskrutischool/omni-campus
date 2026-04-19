import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ScholarshipService } from "@/services/scholarship.service"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tenant = await prisma.tenant.findUnique({ where: { slug: session.user.tenantSlug } })
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

    const { searchParams } = new URL(request.url)

    if (searchParams.get("analytics")) {
      return NextResponse.json(await ScholarshipService.getAnalytics(tenant.id))
    }

    if (searchParams.get("applications")) {
      return NextResponse.json(await ScholarshipService.getApplications(tenant.id, searchParams.get("status") || undefined))
    }

    return NextResponse.json(await ScholarshipService.getScholarships(tenant.id))
  } catch (error) {
    console.error("Scholarship GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch scholarships" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tenant = await prisma.tenant.findUnique({ where: { slug: session.user.tenantSlug } })
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

    const body = await request.json()
    const { action } = body

    if (action === "create") {
      return NextResponse.json(await ScholarshipService.createScholarship(tenant.id, body), { status: 201 })
    }

    if (action === "apply") {
      return NextResponse.json(await ScholarshipService.applyForScholarship(tenant.id, session.user.id, body), { status: 201 })
    }

    if (action === "review") {
      return NextResponse.json(await ScholarshipService.reviewApplication(tenant.id, session.user.id, body.applicationId, body))
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Scholarship POST Error:", error)
    return NextResponse.json({ error: "Failed to process" }, { status: 500 })
  }
}
