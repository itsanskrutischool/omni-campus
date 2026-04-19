import { NextRequest, NextResponse } from "next/server"
import { ChatService } from "@/services/chat.service"

// GET /api/chat - Get conversations, messages, or unread count
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get("tenantId")
    const userId = searchParams.get("userId")
    const type = searchParams.get("type") // conversations, messages, unread
    const conversationId = searchParams.get("conversationId")

    if (!tenantId || !userId) {
      return NextResponse.json({ error: "Tenant ID and user ID are required" }, { status: 400 })
    }

    switch (type) {
      case "conversations":
        const conversations = await ChatService.getUserConversations(tenantId, userId)
        return NextResponse.json(conversations)

      case "messages":
        if (!conversationId) {
          return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
        }
        const limit = parseInt(searchParams.get("limit") || "50")
        const offset = parseInt(searchParams.get("offset") || "0")
        const messages = await ChatService.getMessages(tenantId, conversationId, limit, offset)
        return NextResponse.json(messages)

      case "unread":
        const unread = await ChatService.getUnreadCount(tenantId, userId)
        return NextResponse.json(unread)

      default:
        const allConversations = await ChatService.getUserConversations(tenantId, userId)
        return NextResponse.json(allConversations)
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/chat - Create conversation, send message, add/remove participant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, action, ...data } = body

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    switch (action) {
      case "createConversation":
        const conversation = await ChatService.createConversation(tenantId, data)
        return NextResponse.json(conversation)

      case "sendMessage":
        const message = await ChatService.sendMessage(tenantId, data)
        return NextResponse.json(message)

      case "addParticipant":
        const participant = await ChatService.addParticipant(tenantId, data.conversationId, data.userId)
        return NextResponse.json(participant)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/chat - Mark as read, delete conversation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, action, ...data } = body

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    switch (action) {
      case "markAsRead":
        const marked = await ChatService.markAsRead(tenantId, data.conversationId, data.userId)
        return NextResponse.json(marked)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/chat - Delete conversation, remove participant
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get("tenantId")
    const action = searchParams.get("action")
    const conversationId = searchParams.get("conversationId")
    const userId = searchParams.get("userId")

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    switch (action) {
      case "deleteConversation":
        if (!conversationId) {
          return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
        }
        await ChatService.deleteConversation(tenantId, conversationId)
        return NextResponse.json({ success: true })

      case "removeParticipant":
        if (!conversationId || !userId) {
          return NextResponse.json({ error: "Conversation ID and user ID are required" }, { status: 400 })
        }
        await ChatService.removeParticipant(tenantId, conversationId, userId)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
