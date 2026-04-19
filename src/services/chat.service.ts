import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

export class ChatService {
  // ─── Create Conversation ───────────────────────────────────

  static async createConversation(tenantId: string, data: {
    name?: string
    type: "DIRECT" | "GROUP"
    participantIds: string[]
  }) {
    const conversation = await prisma.chatConversation.create({
      data: {
        name: data.name,
        type: data.type,
        tenantId,
        participants: {
          create: data.participantIds.map((userId) => ({
            userId,
            role: data.type === "GROUP" && userId === data.participantIds[0] ? "ADMIN" : "MEMBER",
            tenantId,
          })),
        },
      },
      include: {
        participants: true,
      },
    })

    await AuditService.log({
      tenantId,
      action: "CREATE",
      module: "communication",
      entityType: "ChatConversation",
      entityId: conversation.id,
      summary: `Created ${data.type} chat conversation`,
    })

    return conversation
  }

  // ─── Get User Conversations ────────────────────────────────

  static async getUserConversations(tenantId: string, userId: string) {
    const conversations = await prisma.chatConversation.findMany({
      where: {
        tenantId,
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: true,
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            participants: true,
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return conversations
  }

  // ─── Send Message ─────────────────────────────────────────

  static async sendMessage(tenantId: string, data: {
    conversationId: string
    senderId: string
    content: string
    messageType?: string
  }) {
    const message = await prisma.chatMessage.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
        messageType: data.messageType || "TEXT",
        tenantId,
      },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    })

    await AuditService.log({
      tenantId,
      action: "CREATE",
      module: "communication",
      entityType: "ChatMessage",
      entityId: message.id,
      summary: `Sent message in conversation ${data.conversationId}`,
    })

    return message
  }

  // ─── Get Messages ─────────────────────────────────────────

  static async getMessages(tenantId: string, conversationId: string, limit = 50, offset = 0) {
    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId,
        tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    })

    return messages.reverse()
  }

  // ─── Add Participant ─────────────────────────────────────

  static async addParticipant(tenantId: string, conversationId: string, userId: string) {
    const participant = await prisma.chatParticipant.create({
      data: {
        conversationId,
        userId,
        role: "MEMBER",
        tenantId,
      },
    })

    await AuditService.log({
      tenantId,
      action: "CREATE",
      module: "communication",
      entityType: "ChatParticipant",
      entityId: participant.id,
      summary: `Added user ${userId} to conversation ${conversationId}`,
    })

    return participant
  }

  // ─── Remove Participant ───────────────────────────────────

  static async removeParticipant(tenantId: string, conversationId: string, userId: string) {
    await prisma.chatParticipant.deleteMany({
      where: {
        conversationId,
        userId,
        tenantId,
      },
    })

    await AuditService.log({
      tenantId,
      action: "DELETE",
      module: "communication",
      entityType: "ChatParticipant",
      entityId: `${conversationId}-${userId}`,
      summary: `Removed user ${userId} from conversation ${conversationId}`,
    })

    return { success: true }
  }

  // ─── Mark as Read ─────────────────────────────────────────

  static async markAsRead(tenantId: string, conversationId: string, userId: string) {
    await prisma.chatParticipant.updateMany({
      where: {
        conversationId,
        userId,
        tenantId,
      },
      data: {
        lastReadAt: new Date(),
      },
    })

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        tenantId,
      },
      data: {
        isRead: true,
      },
    })

    return { success: true }
  }

  // ─── Delete Conversation ───────────────────────────────────

  static async deleteConversation(tenantId: string, conversationId: string) {
    await prisma.chatConversation.delete({
      where: {
        id: conversationId,
        tenantId,
      },
    })

    await AuditService.log({
      tenantId,
      action: "DELETE",
      module: "communication",
      entityType: "ChatConversation",
      entityId: conversationId,
      summary: `Deleted conversation ${conversationId}`,
    })

    return { success: true }
  }

  // ─── Get Unread Count ─────────────────────────────────────

  static async getUnreadCount(tenantId: string, userId: string) {
    const unreadCount = await prisma.chatMessage.count({
      where: {
        tenantId,
        conversation: {
          participants: {
            some: {
              userId,
            },
          },
        },
        senderId: { not: userId },
        isRead: false,
      },
    })

    return { unreadCount }
  }
}
