import { prisma } from '@/lib/prisma';
import { AuditService } from './audit.service';

export interface CreateGatePassParams {
  tenantId: string;
  studentId: string;
  parentName: string;
  parentPhone: string;
  reason: string;
  userId?: string; // The user creating it (Receptionist)
}

export class GatePassService {
  /**
   * Generates a 6 digit secure static OTP or random OTP.
   */
  private static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Request a new Gate Pass and generate OTP
   */
  static async requestGatePass(params: CreateGatePassParams) {
    const student = await prisma.student.findFirst({
      where: {
        tenantId: params.tenantId,
        OR: [
          { id: params.studentId },
          { admissionNumber: params.studentId },
        ],
      }
    });

    if (!student) {
      throw new Error(`Student ${params.studentId} not found in this tenant`);
    }

    const otp = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 60);

    const gatePass = await prisma.gatePass.create({
      data: {
        tenantId: params.tenantId,
        studentId: student.id,
        studentName: student.name,
        parentName: params.parentName,
        parentPhone: params.parentPhone,
        reason: params.reason || "Early Pickup",
        status: "REQUESTED",
        otp: otp,
        otpExpiresAt: expiresAt
      }
    });

    await AuditService.log({
      tenantId: params.tenantId,
      userId: params.userId,
      module: 'front-office',
      action: 'CREATE',
      entityType: 'GatePass',
      entityId: gatePass.id,
      summary: `Gate pass requested for ${student.name} by ${params.parentName}. OTP Generated.`
    });

    return gatePass;
  }

  static async verifyOTP(tenantId: string, otp: string, guardUserId?: string) {
    const gatePass = await prisma.gatePass.findFirst({
      where: { 
        tenantId, 
        otp, 
        status: 'REQUESTED',
        otpExpiresAt: {
          gt: new Date()
        }
      }
    });

    if (!gatePass) {
      throw new Error("Invalid or Expired OTP");
    }

    const updated = await prisma.gatePass.update({
      where: { id: gatePass.id },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
        exitTime: new Date(),
        verifiedBy: guardUserId
      }
    });

    await AuditService.log({
      tenantId,
      userId: guardUserId,
      module: 'front-office',
      action: 'UPDATE',
      entityType: 'GatePass',
      entityId: gatePass.id,
      summary: `Gate pass OTP verified. ${gatePass.studentName} exited.`
    });

    return updated;
  }

  static async getGatePassesForToday(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.gatePass.findMany({
      where: {
        tenantId,
        requestedAt: {
          gte: today
        }
      },
      orderBy: { requestedAt: 'desc' }
    });
  }

  /**
   * Get basic stats for today
   */
  static async getTodayStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, verified, active] = await Promise.all([
      prisma.gatePass.count({
        where: { tenantId, requestedAt: { gte: today } }
      }),
      prisma.gatePass.count({
        where: { tenantId, verifiedAt: { gte: today } }
      }),
      prisma.gatePass.count({
        where: { tenantId, status: 'REQUESTED', otpExpiresAt: { gt: new Date() } }
      })
    ]);

    return { total, verified, active };
  }
}

export interface CreateVisitorParams {
  name: string;
  phone: string;
  purpose: string;
  personToMeet: string;
  userId?: string;
}

export class VisitorService {
  /**
   * Check-in a new visitor
   */
  static async checkIn(tenantId: string, params: CreateVisitorParams) {
    const visitor = await prisma.visitor.create({
      data: {
        tenantId,
        name: params.name,
        phone: params.phone,
        purpose: params.purpose,
        personToMeet: params.personToMeet,
        status: 'CHECKED_IN',
        checkIn: new Date()
      }
    });

    await AuditService.log({
      tenantId,
      userId: params.userId,
      module: 'front-office',
      action: 'CREATE',
      entityType: 'Visitor',
      entityId: visitor.id,
      summary: `Visitor ${params.name} checked in to meet ${params.personToMeet}.`
    });

    return visitor;
  }

  /**
   * Check-out a visitor
   */
  static async checkOut(tenantId: string, visitorId: string, userId?: string) {
    const visitor = await prisma.visitor.update({
      where: { id: visitorId, tenantId },
      data: {
        status: 'CHECKED_OUT',
        checkOut: new Date()
      }
    });

    await AuditService.log({
      tenantId,
      userId,
      module: 'front-office',
      action: 'UPDATE',
      entityType: 'Visitor',
      entityId: visitor.id,
      summary: `Visitor ${visitor.name} checked out.`
    });

    return visitor;
  }

  /**
   * List visitors with filters
   */
  static async list(tenantId: string, filters: { status?: string; date?: Date; search?: string; page?: number; pageSize?: number }) {
    const { status, date, search, page = 1, pageSize = 20 } = filters;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {
      tenantId,
      ...(status && { status }),
      ...(date && {
        checkIn: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999))
        }
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { personToMeet: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { checkIn: 'desc' }
      }),
      prisma.visitor.count({ where })
    ]);

    return {
      data: visitors,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }
}
