import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface CreateAuditLogParams {
  tenantId: string;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT' | 'APPROVE' | 'REJECT' | 'OTHER';
  module: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  oldValue?: Prisma.InputJsonValue | null;
  newValue?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export type AuditEntry = CreateAuditLogParams;

export class AuditService {
  /**
   * Log an action to the AuditTrail
   */
  static async log(params: CreateAuditLogParams) {
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: params.tenantId,
          userId: params.userId,
          userName: params.userName,
          userRole: params.userRole,
          action: params.action,
          module: params.module,
          entityType: params.entityType,
          entityId: params.entityId,
          summary: params.summary,
          oldValue: params.oldValue ?? undefined,
          newValue: params.newValue ?? undefined,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      });
    } catch (error) {
      // We don't want audit log failures to break the main application flow
      console.error('[AuditService.log] Failed to create audit log:', error);
    }
  }

  /**
   * Fetch recent audit logs for a tenant
   */
  static async getLogs(
    tenantId: string,
    query?: {
      module?: string;
      action?: string;
      userId?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const limit = query?.limit || 50;
    const offset = query?.offset || 0;

    const where = {
      tenantId,
      ...(query?.module && { module: query.module }),
      ...(query?.action && { action: query.action }),
      ...(query?.userId && { userId: query.userId }),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get summarized audit statistics for a tenant
   */
  static async getStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalToday, topModule, topAction] = await Promise.all([
      prisma.auditLog.count({
        where: {
          tenantId,
          createdAt: { gte: today },
        },
      }),
      // Most active module today
      prisma.auditLog.groupBy({
        by: ['module'],
        where: { tenantId, createdAt: { gte: today } },
        _count: { _all: true },
        orderBy: { _count: { module: 'desc' } },
        take: 1,
      }),
      // Most common action today
      prisma.auditLog.groupBy({
        by: ['action'],
        where: { tenantId, createdAt: { gte: today } },
        _count: { _all: true },
        orderBy: { _count: { action: 'desc' } },
        take: 1,
      }),
    ]);

    return {
      totalToday,
      activeModule: topModule[0]?.module || 'None',
      topAction: topAction[0]?.action || 'None',
      lastUpdate: new Date().toISOString(),
    };
  }
}
