import { prisma } from "@/lib/prisma"

/**
 * Enquiry Service
 * ───────────────
 * Data access for Reception CRM: enquiries, follow-ups, and stats.
 */

// ─── Generate Enquiry Number ────────────────
async function generateEnquiryNo(tenantId: string): Promise<string> {
  const count = await prisma.enquiry.count({ where: { tenantId } })
  const seq = (count + 1).toString().padStart(4, "0")
  return `ENQ-${new Date().getFullYear()}-${seq}`
}

// ─── Create Enquiry ─────────────────────────
export async function createEnquiry(data: {
  tenantId: string
  studentName: string
  parentName: string
  phone: string
  email?: string
  source?: string
  notes?: string
  assignedToId?: string
}) {
  const enquiryNo = await generateEnquiryNo(data.tenantId)
  return prisma.enquiry.create({
    data: {
      ...data,
      enquiryNo,
      status: "OPEN",
    },
  })
}

// ─── List Enquiries ─────────────────────────
export async function listEnquiries(filters: {
  tenantId: string
  status?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  const { tenantId, status, search, page = 1, pageSize = 20 } = filters

  const where: Record<string, unknown> = { tenantId }
  if (status && status !== "ALL") where.status = status
  if (search) {
    where.OR = [
      { studentName: { contains: search, mode: "insensitive" } },
      { parentName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { enquiryNo: { contains: search, mode: "insensitive" } },
    ]
  }

  const [enquiries, total] = await Promise.all([
    prisma.enquiry.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true } },
        followUps: { orderBy: { date: "desc" }, take: 1 },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.enquiry.count({ where }),
  ])

  return { enquiries, total, page, pageSize }
}

// ─── Get Single Enquiry ─────────────────────
export async function getEnquiry(id: string) {
  return prisma.enquiry.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      followUps: {
        include: { staff: { select: { id: true, name: true } } },
        orderBy: { date: "desc" },
      },
    },
  })
}

// ─── Update Enquiry ─────────────────────────
export async function updateEnquiry(
  id: string,
  data: {
    status?: string
    notes?: string
    assignedToId?: string
    nextFollowUp?: string
  }
) {
  return prisma.enquiry.update({
    where: { id },
    data: {
      ...data,
      nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : undefined,
    },
  })
}

// ─── Add Follow-Up Log ──────────────────────
export async function addFollowUp(data: {
  enquiryId: string
  staffId: string
  status: string
  notes?: string
  nextFollowUp?: string
}) {
  const nextDate = data.nextFollowUp ? new Date(data.nextFollowUp) : null

  const [followUp] = await Promise.all([
    prisma.followUpLog.create({
      data: {
        enquiryId: data.enquiryId,
        staffId: data.staffId,
        status: data.status,
        notes: data.notes,
        nextFollowUp: nextDate,
      },
    }),
    prisma.enquiry.update({
      where: { id: data.enquiryId },
      data: {
        lastFollowUp: new Date(),
        nextFollowUp: nextDate,
        status: data.status === "Interested" ? "VISITED" : undefined,
      },
    }),
  ])

  return followUp
}

// ─── Stats ──────────────────────────────────
export async function getEnquiryStats(tenantId: string) {
  const [total, open, called, visited, admitted, closed] = await Promise.all([
    prisma.enquiry.count({ where: { tenantId } }),
    prisma.enquiry.count({ where: { tenantId, status: "OPEN" } }),
    prisma.enquiry.count({ where: { tenantId, status: "CALLED" } }),
    prisma.enquiry.count({ where: { tenantId, status: "VISITED" } }),
    prisma.enquiry.count({ where: { tenantId, status: "ADMISSION_TAKEN" } }),
    prisma.enquiry.count({ where: { tenantId, status: "CLOSED" } }),
  ])

  return { total, open, called, visited, admitted, closed }
}
