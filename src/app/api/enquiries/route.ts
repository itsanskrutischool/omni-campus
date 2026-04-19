import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  createEnquiry,
  listEnquiries,
  getEnquiryStats,
} from "@/services/enquiry.service"

/**
 * GET /api/enquiries
 * List enquiries with filters. ?stats=true for stats only.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)

    if (searchParams.get("stats") === "true") {
      const stats = await getEnquiryStats(session.user.tenantId)
      return NextResponse.json(stats)
    }

    const result = await listEnquiries({
      tenantId: session.user.tenantId,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("pageSize") || "20"),
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[API_ENQUIRIES] GET error:", error)
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 })
  }
}

/**
 * POST /api/enquiries
 * Create a new enquiry.
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const enquiry = await createEnquiry({
      ...body,
      tenantId: session.user.tenantId,
    })
    return NextResponse.json(enquiry, { status: 201 })
  } catch (error: any) {
    console.error("[API_ENQUIRIES] Create error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create enquiry" },
      { status: 500 }
    )
  }
}
