import { NextRequest, NextResponse } from "next/server"
import { InventoryService } from "@/services/inventory.service"
import { createItemSchema, recordPurchaseSchema } from "@/lib/validation"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"

// GET /api/inventory - Get categories, items, stores, or statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get("tenantId")
    const stats = searchParams.get("stats")
    const type = searchParams.get("type") // category, item, store

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    if (stats === "true") {
      const result = await InventoryService.getInventoryStatistics(tenantId)
      return NextResponse.json(result)
    }

    switch (type) {
      case "category":
        const categories = await InventoryService.getCategories(tenantId)
        return NextResponse.json(categories)

      case "item":
        const categoryId = searchParams.get("categoryId")
        const items = await InventoryService.getItems(tenantId, categoryId ? { categoryId } : undefined)
        return NextResponse.json(items)

      case "store":
        const stores = await InventoryService.getStores(tenantId)
        return NextResponse.json(stores)

      default:
        const allCategories = await InventoryService.getCategories(tenantId)
        return NextResponse.json(allCategories)
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/inventory - Create category, item, store, purchase, transfer, or adjustment
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const limitId = forwarded ? forwarded.split(",")[0]?.trim() : (realIp ?? "anonymous")
    const limitResult = rateLimit(limitId)

    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(limitResult),
        }
      )
    }

    const body = await request.json()
    const { tenantId, action, ...data } = body

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    switch (action) {
      case "createCategory":
        const category = await InventoryService.createCategory(tenantId, data)
        return NextResponse.json(category)

      case "createItem":
        const validatedItem = createItemSchema.parse(body)
        const item = await InventoryService.createItem(tenantId, data)
        return NextResponse.json(item)

      case "createStore":
        const store = await InventoryService.createStore(tenantId, data)
        return NextResponse.json(store)

      case "recordPurchase":
        const validatedPurchase = recordPurchaseSchema.parse(body)
        const purchase = await InventoryService.recordPurchase(tenantId, data)
        return NextResponse.json(purchase)

      case "createTransfer":
        const transfer = await InventoryService.createTransfer(tenantId, data)
        return NextResponse.json(transfer)

      case "createAdjustment":
        const adjustment = await InventoryService.createAdjustment(tenantId, data)
        return NextResponse.json(adjustment)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/inventory - Approve stock transfer
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const limitId = forwarded ? forwarded.split(",")[0]?.trim() : (realIp ?? "anonymous")
    const limitResult = rateLimit(limitId)

    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(limitResult),
        }
      )
    }

    const body = await request.json()
    const { tenantId, transferId } = body

    if (!tenantId || !transferId) {
      return NextResponse.json({ error: "Tenant ID and transfer ID are required" }, { status: 400 })
    }

    const result = await InventoryService.approveTransfer(tenantId, transferId)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
