import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { addFollowUp } from "@/services/enquiry.service"

/**
 * POST /api/enquiries/:id/follow-up
 * Add a follow-up log entry to an enquiry.
 */
export async function POST(
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
    const followUp = await addFollowUp({
      enquiryId: id,
      staffId: body.staffId || session.user.id || "",
      status: body.status,
      notes: body.notes,
      nextFollowUp: body.nextFollowUp,
    })
    return NextResponse.json(followUp, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add follow-up" },
      { status: 500 }
    )
  }
}
