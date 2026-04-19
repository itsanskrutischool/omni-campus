import { prisma } from "@/lib/prisma"

export class CommunicationService {
  static async getNotices(tenantId: string, audience?: string) {
    const whereClause: Record<string, unknown> = { tenantId }
    if (audience) {
      whereClause.audience = audience
    }
    
    return await prisma.notice.findMany({
      where: whereClause,
      orderBy: { publishedAt: 'desc' }
    })
  }

  static async createNotice(tenantId: string, data: { title: string; body: string; audience: string }) {
    return await prisma.notice.create({
      data: {
        tenantId,
        title: data.title,
        body: data.body,
        audience: data.audience,
        publishedAt: new Date()
      }
    })
  }

  static async deleteNotice(tenantId: string, noticeId: string) {
    return await prisma.notice.delete({
      where: { id: noticeId, tenantId }
    })
  }
}
