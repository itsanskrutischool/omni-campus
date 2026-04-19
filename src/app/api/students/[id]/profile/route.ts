import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getStudentFullProfile } from "@/services/student.service"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const tenantId = session.user.tenantId

  try {
    const profile = await getStudentFullProfile(id, tenantId)
    if (!profile) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Profile API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
