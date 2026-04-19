import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

// ─── Chat Service ─────────────────────────────────────────────────────

export class ChatService {
  /**
   * Create a new conversation
   */
  static async createConversation(tenantId: string, data: {
    name?: string
    type: "DIRECT" | "GROUP"
    participantIds: string[]
  }) {
    try {
      const conversation = await prisma.chatConversation.create({
        data: {
          name: data.name,
          type: data.type,
          tenantId,
          participants: {
            create: data.participantIds.map((userId) => ({
              userId,
              role: data.type === "GROUP" && userId === data.participantIds[0] ? "ADMIN" : "MEMBER",
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
        module: "CHAT",
        entityType: "ChatConversation",
        entityId: conversation.id,
        summary: `Created ${data.type} conversation`,
      })

      return {
        success: true,
        conversation,
      }
    } catch (error: any) {
      console.error("Conversation creation failed:", error)
      throw new Error(`Failed to create conversation: ${error.message}`)
    }
  }

  /**
   * Get conversations for a user
   */
  static async getUserConversations(tenantId: string, userId: string) {
    try {
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
          participants: {
            include: {
              tenantUser: {
                include: {
                  user: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          _count: {
            select: {
              messages: {
                where: {
                  isRead: false,
                  NOT: {
                    senderId: userId,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return {
        success: true,
        conversations,
      }
    } catch (error: any) {
      console.error("Failed to fetch conversations:", error)
      throw new Error(`Failed to fetch conversations: ${error.message}`)
    }
  }

  /**
   * Get conversation by ID
   */
  static async getConversation(tenantId: string, conversationId: string) {
    try {
      const conversation = await prisma.chatConversation.findUnique({
        where: {
          id: conversationId,
          tenantId,
        },
        include: {
          participants: {
            include: {
              tenantUser: {
                include: {
                  user: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })

      if (!conversation) {
        throw new Error("Conversation not found")
      }

      return {
        success: true,
        conversation,
      }
    } catch (error: any) {
      console.error("Failed to fetch conversation:", error)
      throw new Error(`Failed to fetch conversation: ${error.message}`)
    }
  }

  /**
   * Send a message
   */
  static async sendMessage(tenantId: string, data: {
    conversationId: string
    senderId: string
    content: string
    messageType?: string
  }) {
    try {
      const message = await prisma.chatMessage.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
          messageType: data.messageType || "TEXT",
          tenantId,
        },
        include: {
          conversation: true,
        },
      })

      // Update participant's last read time
      await prisma.chatParticipant.updateMany({
        where: {
          conversationId: data.conversationId,
          userId: data.senderId,
        },
        data: {
          lastReadAt: new Date(),
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "CHAT",
        entityType: "ChatMessage",
        entityId: message.id,
        summary: `Sent message in conversation`,
      })

      return {
        success: true,
        message,
      }
    } catch (error: any) {
      console.error("Message sending failed:", error)
      throw new Error(`Failed to send message: ${error.message}`)
    }
  }

  /**
   * Get messages for a conversation
   */
  static async getMessages(tenantId: string, conversationId: string, limit = 50, offset = 0) {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: {
          conversationId,
          tenantId,
        },
        include: {
          conversation: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      })

      return {
        success: true,
        messages: messages.reverse(),
      }
    } catch (error: any) {
      console.error("Failed to fetch messages:", error)
      throw new Error(`Failed to fetch messages: ${error.message}`)
    }
  }

  /**
   * Mark messages as read
   */
  static async markAsRead(tenantId: string, conversationId: string, userId: string) {
    try {
      await prisma.chatMessage.updateMany({
        where: {
          conversationId,
          tenantId,
          NOT: {
            senderId: userId,
          },
        },
        data: {
          isRead: true,
        },
      })

      await prisma.chatParticipant.updateMany({
        where: {
          conversationId,
          userId,
        },
        data: {
          lastReadAt: new Date(),
        },
      })

      return {
        success: true,
      }
    } catch (error: any) {
      console.error("Mark as read failed:", error)
      throw new Error(`Failed to mark as read: ${error.message}`)
    }
  }

  /**
   * Add participant to conversation
   */
  static async addParticipant(tenantId: string, conversationId: string, userId: string) {
    try {
      const participant = await prisma.chatParticipant.create({
        data: {
          conversationId,
          userId,
          tenantId,
          role: "MEMBER",
        },
      })

      await AuditService.log({
        tenantId,
        action: "CREATE",
        module: "CHAT",
        entityType: "ChatParticipant",
        entityId: participant.id,
        summary: `Added participant to conversation`,
      })

      return {
        success: true,
        participant,
      }
    } catch (error: any) {
      console.error("Add participant failed:", error)
      throw new Error(`Failed to add participant: ${error.message}`)
    }
  }

  /**
   * Remove participant from conversation
   */
  static async removeParticipant(tenantId: string, conversationId: string, userId: string) {
    try {
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
        module: "CHAT",
        entityType: "ChatParticipant",
        summary: `Removed participant from conversation`,
      })

      return {
        success: true,
      }
    } catch (error: any) {
      console.error("Remove participant failed:", error)
      throw new Error(`Failed to remove participant: ${error.message}`)
    }
  }

  /**
   * Get unread message count
   */
  static async getUnreadCount(tenantId: string, userId: string) {
    try {
      const count = await prisma.chatMessage.count({
        where: {
          tenantId,
          isRead: false,
          NOT: {
            senderId: userId,
          },
          conversation: {
            participants: {
              some: {
                userId,
              },
            },
          },
        },
      })

      return {
        success: true,
        count,
      }
    } catch (error: any) {
      console.error("Failed to fetch unread count:", error)
      throw new Error(`Failed to fetch unread count: ${error.message}`)
    }
  }

  /**
   * Delete conversation
   */
  static async deleteConversation(tenantId: string, conversationId: string) {
    try {
      await prisma.chatMessage.deleteMany({
        where: {
          conversationId,
          tenantId,
        },
      })

      await prisma.chatParticipant.deleteMany({
        where: {
          conversationId,
          tenantId,
        },
      })

      await prisma.chatConversation.delete({
        where: {
          id: conversationId,
          tenantId,
        },
      })

      await AuditService.log({
        tenantId,
        action: "DELETE",
        module: "CHAT",
        entityType: "ChatConversation",
        entityId: conversationId,
        summary: `Deleted conversation`,
      })

      return {
        success: true,
      }
    } catch (error: any) {
      console.error("Delete conversation failed:", error)
      throw new Error(`Failed to delete conversation: ${error.message}`)
    }
  }
}
