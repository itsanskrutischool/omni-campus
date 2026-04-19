import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { AuditService } from "@/services/audit.service"

// GET /api/admission/leads - List admission leads
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(req.url)
    const tenantId = searchParams.get("tenantId") || auth.user.tenants[0]?.id
    
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const skip = (page - 1) * pageSize

    const where: Record<string, unknown> = { tenantId }
    if (searchParams.get("status")) where.status = searchParams.get("status")
    if (searchParams.get("priority")) where.priority = searchParams.get("priority")
    if (searchParams.get("source")) where.source = searchParams.get("source")
    if (searchParams.get("assignedTo")) where.assignedTo = searchParams.get("assignedTo")
    if (searchParams.get("search")) {
      where.OR = [
        { name: { contains: searchParams.get("search")!, mode: "insensitive" } },
        { phone: { contains: searchParams.get("search")!, mode: "insensitive" } },
        { email: { contains: searchParams.get("search")!, mode: "insensitive" } },
      ]
    }

    const [leads, total] = await Promise.all([
      prisma.admissionLead.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.admissionLead.count({ where }),
    ])

    return NextResponse.json({ leads, total, page, pageCount: Math.ceil(total / pageSize) })
  } catch (error) {
    console.error("[LEADS_GET_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch leads" },
      { status: 500 }
    )
  }
}

// POST /api/admission/leads - Create admission lead
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const tenantId = body.tenantId || auth.user.tenants[0]?.id
    
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const lead = await prisma.admissionLead.create({
      data: {
        tenantId,
        name: body.name,
        phone: body.phone,
        email: body.email,
        address: body.address,
        source: body.source,
        sourceDetail: body.sourceDetail,
        gradeApplying: body.gradeApplying,
        academicYear: body.academicYear,
        parentName: body.parentName,
        parentPhone: body.parentPhone,
        previousSchool: body.previousSchool,
        notes: body.notes,
        status: body.status || "NEW",
        priority: body.priority || "MEDIUM",
        assignedTo: body.assignedTo,
      },
    })

    await AuditService.log({
      tenantId,
      userId: auth.user.id,
      action: "CREATE",
      module: "admissions",
      entityType: "AdmissionLead",
      entityId: lead.id,
      summary: `New admission lead created: ${lead.name} (${body.source})`,
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error("[LEADS_POST_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create lead" },
      { status: 500 }
    )
  }
}
