import { getTenantBySlug } from "@/services/tenant.service"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { StudentProfile } from "./student-profile"

export default async function StudentProfilePage({
  params
}: {
  params: Promise<{ tenantSlug: string; role: string; id: string }>
}) {
  const { tenantSlug, role, id } = await params

  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) notFound()

  // Fetch full student record with relations
  const student = await prisma.student.findUnique({
    where: { 
      id,
      tenantId: tenant.id
    },
    include: {
      classroom: true,
      section: true,
      batch: true,
      feeRecords: {
        include: {
          feeStructure: true
        },
        orderBy: {
          dueDate: "desc"
        }
      },
      attendance: {
        orderBy: {
          date: "desc"
        },
        take: 30 // Last 30 days
      },
      documents: true,
      markEntries: {
        include: {
          exam: true,
          subject: true
        }
      }
    }
  })

  if (!student) notFound()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <StudentProfile 
        student={student} 
        tenantSlug={tenantSlug}
        role={role}
      />
    </div>
  )
}
