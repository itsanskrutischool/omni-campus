import { prisma } from "@/lib/prisma"

/**
 * Program & Batch Service
 * ───────────────────────
 * Data access for Academic Structure: Programs (streams) and Batches.
 */

// ─── Programs ───────────────────────────────

export async function listPrograms(tenantId: string) {
  return prisma.program.findMany({
    where: { tenantId },
    include: { batches: true },
    orderBy: { name: "asc" },
  })
}

export async function createProgram(data: {
  tenantId: string
  name: string
  code?: string
  description?: string
}) {
  return prisma.program.create({ data })
}

export async function updateProgram(
  id: string,
  data: { name?: string; code?: string; description?: string }
) {
  return prisma.program.update({ where: { id }, data })
}

export async function deleteProgram(id: string) {
  return prisma.program.delete({ where: { id } })
}

// ─── Batches ────────────────────────────────

export async function listBatches(tenantId: string) {
  return prisma.batch.findMany({
    where: { tenantId },
    include: {
      program: { select: { id: true, name: true } },
      academicYear: { select: { id: true, name: true } },
    },
    orderBy: { name: "desc" },
  })
}

export async function createBatch(data: {
  tenantId: string
  name: string
  programId: string
  academicYearId: string
}) {
  return prisma.batch.create({ data })
}

export async function updateBatch(
  id: string,
  data: { name?: string; programId?: string; academicYearId?: string }
) {
  return prisma.batch.update({ where: { id }, data })
}

export async function deleteBatch(id: string) {
  return prisma.batch.delete({ where: { id } })
}
