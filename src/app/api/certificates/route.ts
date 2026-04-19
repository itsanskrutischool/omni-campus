import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CertificateService } from "@/services/certificate.service"
import { AuditService } from "@/services/audit.service"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tenantSlug = session.user.tenantSlug
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

    const body = await request.json()
    const { certificateType, studentId } = body

    if (!certificateType || !studentId) {
      return NextResponse.json({ error: "certificateType and studentId are required" }, { status: 400 })
    }

    let pdfBuffer: Buffer
    let certName: string

    switch (certificateType) {
      case "BONAFIDE":
        pdfBuffer = await CertificateService.generateBonafideCertificate(tenant.id, studentId)
        certName = "Bonafide_Certificate"
        break
      case "CHARACTER":
        pdfBuffer = await CertificateService.generateCharacterCertificate(tenant.id, studentId)
        certName = "Character_Certificate"
        break
      case "TC":
        pdfBuffer = await CertificateService.generateTCCertificate(tenant.id, studentId)
        certName = "Transfer_Certificate"
        break
      default:
        return NextResponse.json({ error: "Invalid certificate type" }, { status: 400 })
    }

    // Audit log
    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { name: true, admissionNumber: true } })
    await AuditService.log({
      tenantId: tenant.id,
      userId: session.user.id,
      action: "EXPORT",
      module: "certificates",
      entityType: certificateType,
      entityId: studentId,
      summary: `Generated ${certificateType} certificate for ${student?.name} (${student?.admissionNumber})`,
    })

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${certName}_${student?.admissionNumber || studentId}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Certificate Generation Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate certificate" },
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

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 400 })

    const student = await prisma.student.findUnique({
      where: { id: studentId, tenantId: tenant.id },
      select: { id: true, name: true, admissionNumber: true, classroom: true, section: true },
    })

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })

    return NextResponse.json({ student })
  } catch (error) {
    console.error("Certificate GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch student data" }, { status: 500 })
  }
}
