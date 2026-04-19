import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getEnquiry, updateEnquiry, addFollowUp } from "@/services/enquiry.service"

/**
 * GET /api/enquiries/:id
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const enquiry = await getEnquiry(id)
  if (!enquiry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(enquiry)
}

/**
 * PATCH /api/enquiries/:id
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  try {
    const updated = await updateEnquiry(id, body)
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Update failed" },
      { status: 500 }
    )
  }
}
