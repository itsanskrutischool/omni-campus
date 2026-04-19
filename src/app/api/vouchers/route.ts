import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { VoucherService } from "@/services/voucher.service"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tenant = await prisma.tenant.findUnique({ where: { slug: session.user.tenantSlug } })
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

    const { searchParams } = new URL(request.url)

    if (searchParams.get("analytics")) {
      return NextResponse.json(await VoucherService.getAnalytics(tenant.id))
    }

    return NextResponse.json(await VoucherService.getVouchers(tenant.id, {
      type: searchParams.get("type") || undefined,
      category: searchParams.get("category") || undefined,
      status: searchParams.get("status") || undefined,
    }))
  } catch (error) {
    console.error("Voucher GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch vouchers" }, { status: 500 })
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
      return NextResponse.json(await VoucherService.createVoucher(tenant.id, session.user.id, body), { status: 201 })
    }

    if (action === "approve") {
      return NextResponse.json(await VoucherService.approveVoucher(tenant.id, session.user.id, body.voucherId, body.status))
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Voucher POST Error:", error)
    return NextResponse.json({ error: "Failed to process" }, { status: 500 })
  }
}
