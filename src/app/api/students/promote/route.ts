import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { promoteStudent, bulkPromoteStudents, transferStudent } from "@/services/student.service"
import { AuditService } from "@/services/audit.service"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tenantSlug = session.user.tenantSlug
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

    const body = await request.json()
    const { action } = body

    if (action === "promote") {
      const result = await promoteStudent(tenant.id, body.studentId, {
        newClassRoomId: body.newClassRoomId,
        newSectionId: body.newSectionId,
        newBatchId: body.newBatchId,
        academicYearId: body.academicYearId,
      })

      await AuditService.log({
        tenantId: tenant.id,
        userId: session.user.id,
        action: "UPDATE",
        module: "students",
        entityType: "Student",
        entityId: body.studentId,
        summary: `Student promoted: ${result.student.name} from Class ${result.previous.classRoomId} to ${body.newClassRoomId}`,
      })

      return NextResponse.json(result)
    }

    if (action === "bulk-promote") {
      const result = await bulkPromoteStudents(tenant.id, {
        fromClassRoomId: body.fromClassRoomId,
        fromSectionId: body.fromSectionId,
        toClassRoomId: body.toClassRoomId,
        toSectionId: body.toSectionId,
        batchId: body.batchId,
        studentIds: body.studentIds,
      })

      await AuditService.log({
        tenantId: tenant.id,
        userId: session.user.id,
        action: "UPDATE",
        module: "students",
        entityType: "Student",
        summary: `Bulk promoted ${result.promoted} students from ${body.fromClassRoomId} to ${body.toClassRoomId}`,
      })

      return NextResponse.json(result)
    }

    if (action === "transfer") {
      const result = await transferStudent(tenant.id, body.studentId, {
        targetTenantId: body.targetTenantId,
        newClassRoomId: body.newClassRoomId,
        newSectionId: body.newSectionId,
        reason: body.reason,
      })

      await AuditService.log({
        tenantId: tenant.id,
        userId: session.user.id,
        action: "UPDATE",
        module: "students",
        entityType: "Student",
        entityId: body.studentId,
        summary: `Student transferred to ${body.targetTenantId}. Reason: ${body.reason}`,
      })

      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Student Promotion Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process promotion" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tenantSlug = session.user.tenantSlug
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

    // Get all classes for promotion dropdown
    const classes = await prisma.classRoom.findMany({
      where: { tenantId: tenant.id },
      include: { sections: true },
      orderBy: { numeric: "asc" },
    })

    // Get transferred students
    const transferred = await prisma.student.findMany({
      where: { tenantId: tenant.id, status: "TRANSFERRED" },
      select: { id: true, name: true, admissionNumber: true, previousSchool: true, notes: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
    })

    return NextResponse.json({ classes, transferred })
  } catch (error) {
    console.error("Student Promotion GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch promotion data" }, { status: 500 })
  }
}
