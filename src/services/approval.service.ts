import { prisma } from "@/lib/prisma"

/**
 * Approval Service
 * ────────────────
 * Data access for the Approval Engine: templates, steps, and requests.
 */

// ─── Workflow Templates ─────────────────────

export async function listWorkflowTemplates(tenantId: string) {
  return prisma.workflowTemplate.findMany({
    where: { tenantId },
    include: {
      steps: { orderBy: { stepOrder: "asc" } },
      _count: { select: { requests: true } },
    },
    orderBy: { name: "asc" },
  })
}

export async function createWorkflowTemplate(data: {
  tenantId: string
  name: string
  description?: string
  module: string
  steps: { stepOrder: number; approverRole: string; approverId?: string; isFinal: boolean }[]
}) {
  const { steps, ...templateData } = data
  return prisma.workflowTemplate.create({
    data: {
      ...templateData,
      steps: { create: steps },
    },
    include: { steps: true },
  })
}

export async function deleteWorkflowTemplate(id: string) {
  // Delete steps first, then template
  await prisma.approvalStep.deleteMany({ where: { templateId: id } })
  return prisma.workflowTemplate.delete({ where: { id } })
}

// ─── Approval Requests ──────────────────────

export async function listApprovalRequests(filters: {
  tenantId: string
  status?: string
  page?: number
  pageSize?: number
}) {
  const { tenantId, status, page = 1, pageSize = 20 } = filters

  const where: Record<string, unknown> = { tenantId }
  if (status && status !== "ALL") where.status = status

  const [requests, total] = await Promise.all([
    prisma.approvalRequest.findMany({
      where,
      include: {
        template: { select: { id: true, name: true, module: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.approvalRequest.count({ where }),
  ])

  return { requests, total, page, pageSize }
}

export async function createApprovalRequest(data: {
  tenantId: string
  templateId: string
  requesterId: string
  requesterType: string
  entityId: string
  entityType: string
}) {
  return prisma.approvalRequest.create({
    data: { ...data, status: "PENDING", currentStep: 1 },
  })
}

export async function updateApprovalRequest(
  id: string,
  data: { status?: string; currentStep?: number; comments?: string }
) {
  return prisma.approvalRequest.update({ where: { id }, data })
}

// ─── Stats ──────────────────────────────────
export async function getApprovalStats(tenantId: string) {
  const [total, pending, approved, rejected] = await Promise.all([
    prisma.approvalRequest.count({ where: { tenantId } }),
    prisma.approvalRequest.count({ where: { tenantId, status: "PENDING" } }),
    prisma.approvalRequest.count({ where: { tenantId, status: "APPROVED" } }),
    prisma.approvalRequest.count({ where: { tenantId, status: "REJECTED" } }),
  ])
  return { total, pending, approved, rejected }
}
