import { prisma } from "@/lib/prisma"

type StudentListFilters = {
  tenantId: string
  classRoomId?: string
  sectionId?: string
  status?: string
  admissionStatus?: string
  search?: string
  page?: number
  pageSize?: number
}

type CreateStudentInput = {
  tenantId: string
  campusId?: string | null
  name: string
  gender: string
  dob: string | Date
  bloodGroup?: string
  category?: string
  religion?: string
  aadhaar?: string
  pen?: string
  fatherName: string
  motherName: string
  guardianName?: string
  guardianPhone?: string
  phone: string
  emergencyContact?: string
  classRoomId?: string
  sectionId?: string
  previousSchool?: string
  admissionStatus?: string
  address?: string
  notes?: string
}

type PromoteStudentInput = {
  newClassRoomId: string
  newSectionId?: string | null
  newBatchId?: string | null
  academicYearId?: string | null
}

type BulkPromoteStudentsInput = {
  fromClassRoomId: string
  fromSectionId?: string | null
  toClassRoomId: string
  toSectionId?: string | null
  batchId?: string | null
  studentIds?: string[]
}

type TransferStudentInput = {
  targetTenantId: string
  newClassRoomId?: string | null
  newSectionId?: string | null
  reason?: string
}

async function ensureClassAccess(tenantId: string, classRoomId?: string | null) {
  if (!classRoomId) return null

  const classroom = await prisma.classRoom.findFirst({
    where: { id: classRoomId, tenantId },
    select: { id: true, name: true, numeric: true },
  })

  if (!classroom) {
    throw new Error("Classroom not found")
  }

  return classroom
}

async function ensureSectionAccess(classRoomId?: string | null, sectionId?: string | null) {
  if (!sectionId) return null
  if (!classRoomId) {
    throw new Error("Section requires a classroom")
  }

  const section = await prisma.section.findFirst({
    where: { id: sectionId, classRoomId },
    select: { id: true, name: true },
  })

  if (!section) {
    throw new Error("Section not found for the selected classroom")
  }

  return section
}

async function ensureBatchAccess(tenantId: string, batchId?: string | null) {
  if (!batchId) return null

  const batch = await prisma.batch.findFirst({
    where: { id: batchId, tenantId },
    select: { id: true, name: true },
  })

  if (!batch) {
    throw new Error("Batch not found")
  }

  return batch
}

async function generateAdmissionNumber(tenantId: string) {
  const total = await prisma.student.count({ where: { tenantId } })
  return `OCS${String(total + 1).padStart(4, "0")}`
}

export async function getStudentById(id: string, tenantId: string) {
  return prisma.student.findFirst({
    where: { id, tenantId },
    include: {
      classroom: true,
      section: true,
      batch: true,
    },
  })
}

export async function getStudentFullProfile(id: string, tenantId: string) {
  return prisma.student.findFirst({
    where: { id, tenantId },
    include: {
      classroom: true,
      section: true,
      batch: true,
      feeRecords: {
        include: {
          feeStructure: true,
        },
        orderBy: {
          dueDate: "desc",
        },
      },
      attendance: {
        orderBy: {
          date: "desc",
        },
        take: 30,
      },
      documents: {
        orderBy: {
          uploadedAt: "desc",
        },
      },
      markEntries: {
        include: {
          exam: true,
          subject: true,
        },
        orderBy: {
          exam: {
            startDate: "desc",
          },
        },
      },
    },
  })
}

export async function createStudent(input: CreateStudentInput) {
  await ensureClassAccess(input.tenantId, input.classRoomId)
  await ensureSectionAccess(input.classRoomId, input.sectionId)

  const admissionNumber = await generateAdmissionNumber(input.tenantId)

  return prisma.student.create({
    data: {
      admissionNumber,
      tenantId: input.tenantId,
      campusId: input.campusId || null,
      name: input.name.trim(),
      gender: input.gender,
      dob: new Date(input.dob),
      bloodGroup: input.bloodGroup || null,
      category: input.category || "GENERAL",
      religion: input.religion || null,
      aadhaar: input.aadhaar || null,
      pen: input.pen || null,
      fatherName: input.fatherName.trim(),
      motherName: input.motherName.trim(),
      guardianName: input.guardianName || null,
      guardianPhone: input.guardianPhone || null,
      phone: input.phone.trim(),
      emergencyContact: input.emergencyContact || null,
      classRoomId: input.classRoomId || null,
      sectionId: input.sectionId || null,
      previousSchool: input.previousSchool || null,
      admissionStatus: input.admissionStatus || "ADMITTED",
      address: input.address || null,
      notes: input.notes || null,
    },
    include: {
      classroom: true,
      section: true,
    },
  })
}

export async function updateStudent(id: string, tenantId: string, data: Record<string, unknown>) {
  const existing = await prisma.student.findFirst({
    where: { id, tenantId },
    select: { id: true, classRoomId: true },
  })

  if (!existing) {
    throw new Error("Student not found")
  }

  const nextClassRoomId = (data.classRoomId as string | undefined) ?? existing.classRoomId
  const nextSectionId = data.sectionId as string | undefined

  if ("classRoomId" in data) {
    await ensureClassAccess(tenantId, nextClassRoomId)
  }

  if ("sectionId" in data) {
    await ensureSectionAccess(nextClassRoomId, nextSectionId)
  }

  const normalized: Record<string, unknown> = { ...data }

  if (typeof normalized.dob === "string" || normalized.dob instanceof Date) {
    normalized.dob = new Date(normalized.dob)
  }

  return prisma.student.update({
    where: { id },
    data: normalized,
    include: {
      classroom: true,
      section: true,
      batch: true,
    },
  })
}

export async function deleteStudent(id: string, tenantId: string) {
  const existing = await prisma.student.findFirst({
    where: { id, tenantId },
    select: { id: true },
  })

  if (!existing) {
    throw new Error("Student not found")
  }

  return prisma.student.update({
    where: { id },
    data: { status: "INACTIVE" },
  })
}

export async function listStudents(filters: StudentListFilters) {
  const page = Math.max(filters.page || 1, 1)
  const pageSize = Math.min(Math.max(filters.pageSize || 20, 1), 100)

  const where = {
    tenantId: filters.tenantId,
    classRoomId: filters.classRoomId,
    sectionId: filters.sectionId,
    status: filters.status,
    admissionStatus: filters.admissionStatus,
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" as const } },
            { admissionNumber: { contains: filters.search, mode: "insensitive" as const } },
            { phone: { contains: filters.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        classroom: { select: { id: true, name: true, numeric: true } },
        section: { select: { id: true, name: true } },
      },
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.student.count({ where }),
  ])

  return {
    students,
    total,
    page,
    pageSize,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  }
}

export async function getAdmissionStats(tenantId: string) {
  const [total, active, enquiry, applied, admitted] = await Promise.all([
    prisma.student.count({ where: { tenantId } }),
    prisma.student.count({ where: { tenantId, status: "ACTIVE" } }),
    prisma.student.count({ where: { tenantId, admissionStatus: "ENQUIRY" } }),
    prisma.student.count({ where: { tenantId, admissionStatus: "APPLIED" } }),
    prisma.student.count({ where: { tenantId, admissionStatus: "ADMITTED" } }),
  ])

  return { total, active, enquiry, applied, admitted }
}

export async function promoteStudent(tenantId: string, studentId: string, input: PromoteStudentInput) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, tenantId },
    include: {
      classroom: true,
      section: true,
      batch: true,
    },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  await ensureClassAccess(tenantId, input.newClassRoomId)
  await ensureSectionAccess(input.newClassRoomId, input.newSectionId)
  await ensureBatchAccess(tenantId, input.newBatchId)

  const previous = {
    classRoomId: student.classRoomId,
    sectionId: student.sectionId,
    batchId: student.batchId,
  }

  const updatedStudent = await prisma.student.update({
    where: { id: student.id },
    data: {
      classRoomId: input.newClassRoomId,
      sectionId: input.newSectionId || null,
      batchId: input.newBatchId || null,
      admissionStatus: "ADMITTED",
      notes: student.notes
        ? `${student.notes}\nPromoted via system workflow.`
        : "Promoted via system workflow.",
    },
    include: {
      classroom: true,
      section: true,
      batch: true,
    },
  })

  return {
    student: updatedStudent,
    previous,
    academicYearId: input.academicYearId || null,
  }
}

export async function bulkPromoteStudents(tenantId: string, input: BulkPromoteStudentsInput) {
  await ensureClassAccess(tenantId, input.fromClassRoomId)
  await ensureClassAccess(tenantId, input.toClassRoomId)
  await ensureSectionAccess(input.fromClassRoomId, input.fromSectionId)
  await ensureSectionAccess(input.toClassRoomId, input.toSectionId)
  await ensureBatchAccess(tenantId, input.batchId)

  const students = await prisma.student.findMany({
    where: {
      tenantId,
      classRoomId: input.fromClassRoomId,
      sectionId: input.fromSectionId || undefined,
      status: "ACTIVE",
      ...(input.studentIds?.length ? { id: { in: input.studentIds } } : {}),
    },
    select: { id: true },
  })

  if (students.length === 0) {
    return { promoted: 0, students: [] }
  }

  await prisma.student.updateMany({
    where: { id: { in: students.map((student) => student.id) } },
    data: {
      classRoomId: input.toClassRoomId,
      sectionId: input.toSectionId || null,
      batchId: input.batchId || null,
      admissionStatus: "ADMITTED",
    },
  })

  return {
    promoted: students.length,
    students: students.map((student) => student.id),
  }
}

export async function transferStudent(fromTenantId: string, studentId: string, input: TransferStudentInput) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, tenantId: fromTenantId },
    include: {
      classroom: true,
      section: true,
    },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  const targetTenant = await prisma.tenant.findUnique({
    where: { id: input.targetTenantId },
    select: { id: true, name: true },
  })

  if (!targetTenant) {
    throw new Error("Target tenant not found")
  }

  await ensureClassAccess(input.targetTenantId, input.newClassRoomId)
  await ensureSectionAccess(input.newClassRoomId, input.newSectionId)

  const transferredStudent = await prisma.student.update({
    where: { id: student.id },
    data: {
      tenantId: input.targetTenantId,
      classRoomId: input.newClassRoomId || null,
      sectionId: input.newSectionId || null,
      status: "TRANSFERRED",
      notes: [student.notes, input.reason ? `Transfer reason: ${input.reason}` : null]
        .filter(Boolean)
        .join("\n"),
    },
    include: {
      classroom: true,
      section: true,
      tenant: true,
    },
  })

  return {
    student: transferredStudent,
    targetTenant,
  }
}
