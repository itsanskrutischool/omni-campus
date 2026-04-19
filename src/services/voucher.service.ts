import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

export class VoucherService {
  static async getVouchers(tenantId: string, filters?: { type?: string; category?: string; status?: string; fromDate?: Date; toDate?: Date }) {
    const where: Record<string, unknown> = { tenantId }
    if (filters?.type && filters.type !== "ALL") where.type = filters.type
    if (filters?.category && filters.category !== "ALL") where.category = filters.category
    if (filters?.status && filters.status !== "ALL") where.status = filters.status
    if (filters?.fromDate || filters?.toDate) {
      const dateWhere: Record<string, unknown> = {}
      if (filters.fromDate) dateWhere.gte = filters.fromDate
      if (filters.toDate) dateWhere.lte = filters.toDate
      where.date = dateWhere
    }

    return prisma.voucher.findMany({ where, orderBy: { date: "desc" } })
  }

  static async createVoucher(tenantId: string, userId: string | undefined, payload: {
    type: string; category: string; amount: number; description: string;
    paidBy?: string; receiptNo?: string; remarks?: string;
  }) {
    const count = await prisma.voucher.count({ where: { tenantId } })
    const voucherNo = `VCH-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`

    const voucher = await prisma.voucher.create({
      data: { tenantId, voucherNo, ...payload },
    })

    await AuditService.log({
      tenantId, userId, action: "CREATE", module: "accounts",
      entityType: "Voucher", entityId: voucher.id,
      summary: `${voucher.type} voucher #${voucherNo} created for ₹${voucher.amount}`,
    })

    return voucher
  }

  static async approveVoucher(tenantId: string, userId: string | undefined, voucherId: string, status: "APPROVED" | "REJECTED") {
    const voucher = await prisma.voucher.update({
      where: { id: voucherId, tenantId },
      data: { status, approvedBy: userId },
    })

    await AuditService.log({
      tenantId, userId, action: "UPDATE", module: "accounts",
      entityType: "Voucher", entityId: voucherId,
      summary: `Voucher #${voucher.voucherNo} ${status}`,
    })

    return voucher
  }

  static async getAnalytics(tenantId: string) {
    const [total, totalAmount, pending, approved, byCategory] = await Promise.all([
      prisma.voucher.count({ where: { tenantId } }),
      prisma.voucher.aggregate({ where: { tenantId, status: "APPROVED" }, _sum: { amount: true } }),
      prisma.voucher.count({ where: { tenantId, status: "PENDING" } }),
      prisma.voucher.count({ where: { tenantId, status: "APPROVED" } }),
      prisma.voucher.groupBy({ by: ["category"], where: { tenantId, status: "APPROVED" }, _sum: { amount: true }, _count: { _all: true } }),
    ])

    return { total, totalAmount: totalAmount._sum.amount || 0, pending, approved, byCategory }
  }
}
