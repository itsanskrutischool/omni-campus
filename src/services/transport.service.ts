import { prisma } from "@/lib/prisma"

export class TransportService {
  static async getRoutes(tenantId: string) {
    return await prisma.transportRoute.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    })
  }

  static async createRoute(tenantId: string, data: { name: string; stops: string; vehicle?: string; driver?: string }) {
    return await prisma.transportRoute.create({
      data: {
        tenantId,
        name: data.name,
        stops: data.stops,
        vehicle: data.vehicle,
        driver: data.driver
      }
    })
  }

  static async updateRoute(tenantId: string, routeId: string, data: { name?: string; stops?: string; vehicle?: string; driver?: string }) {
    return await prisma.transportRoute.update({
      where: { id: routeId, tenantId },
      data
    })
  }

  static async deleteRoute(tenantId: string, routeId: string) {
    return await prisma.transportRoute.delete({
      where: { id: routeId, tenantId }
    })
  }
}
