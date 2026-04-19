import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { CommunicationService } from "@/services/communication.service"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const audience = searchParams.get("audience")

    const notices = await CommunicationService.getNotices(session.user.tenantId, audience || undefined)
    return NextResponse.json(notices)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, body: noticeBody, audience } = body

    if (!title || !noticeBody || !audience) {
      return NextResponse.json({ error: "title, body, and audience are required" }, { status: 400 })
    }

    const notice = await CommunicationService.createNotice(session.user.tenantId, {
      title,
      body: noticeBody,
      audience
    })
    return NextResponse.json(notice)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
