import { prisma } from "@/lib/prisma"
import { PDFService } from "./pdf.service"
import crypto from "crypto"

// ─── Gate Pass OTP Service ───────────────────────────────────────────────────

export class GatePassOTPService {
  /**
   * Generate OTP for gate pass request
   */
  static async generateOTP(tenantId: string, studentId: string, parentPhone: string, reason: string = "Early Pickup") {
    try {
      // Get student details
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      })

      if (!student) {
        throw new Error("Student not found")
      }

      // Generate 6-digit OTP
      const otp = crypto.randomInt(100000, 999999).toString()
      
      // OTP expires in 15 minutes
      const otpExpiresAt = new Date()
      otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 15)

      // Create gate pass request
      const gatePass = await prisma.gatePass.create({
        data: {
          tenantId,
          studentId,
          studentName: student.name,
          parentName: student.fatherName, // Using father's name as parent name
          parentPhone,
          otp,
          otpExpiresAt,
          reason,
          status: "REQUESTED",
        },
      })

      return {
        success: true,
        gatePassId: gatePass.id,
        otp, // In production, send this via SMS/WhatsApp, don't return to client
        expiresAt: otpExpiresAt,
      }
    } catch (error: any) {
      console.error("OTP generation failed:", error)
      throw new Error(`Failed to generate OTP: ${error.message}`)
    }
  }

  /**
   * Verify OTP and approve gate pass
   */
  static async verifyOTP(tenantId: string, gatePassId: string, otp: string, verifiedBy: string) {
    try {
      // Get gate pass
      const gatePass = await prisma.gatePass.findUnique({
        where: { id: gatePassId },
      })

      if (!gatePass) {
        throw new Error("Gate pass not found")
      }

      if (gatePass.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      // Check if OTP is expired
      if (new Date() > gatePass.otpExpiresAt) {
        await prisma.gatePass.update({
          where: { id: gatePassId },
          data: { status: "EXPIRED" },
        })
        throw new Error("OTP has expired")
      }

      // Verify OTP
      if (gatePass.otp !== otp) {
        throw new Error("Invalid OTP")
      }

      // Approve gate pass
      const updated = await prisma.gatePass.update({
        where: { id: gatePassId },
        data: {
          status: "APPROVED",
          verifiedAt: new Date(),
          verifiedBy,
        },
      })

      return {
        success: true,
        gatePass: updated,
        message: "Gate pass approved successfully",
      }
    } catch (error: any) {
      console.error("OTP verification failed:", error)
      throw new Error(`Failed to verify OTP: ${error.message}`)
    }
  }

  /**
   * Record exit time
   */
  static async recordExit(tenantId: string, gatePassId: string) {
    try {
      const gatePass = await prisma.gatePass.findUnique({
        where: { id: gatePassId },
      })

      if (!gatePass) {
        throw new Error("Gate pass not found")
      }

      if (gatePass.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      if (gatePass.status !== "APPROVED") {
        throw new Error("Gate pass is not approved")
      }

      const updated = await prisma.gatePass.update({
        where: { id: gatePassId },
        data: {
          status: "EXITED",
          exitTime: new Date(),
        },
      })

      return {
        success: true,
        gatePass: updated,
      }
    } catch (error: any) {
      console.error("Exit recording failed:", error)
      throw new Error(`Failed to record exit: ${error.message}`)
    }
  }

  /**
   * Generate QR code for gate pass
   */
  static async generateQRCode(tenantId: string, gatePassId: string) {
    try {
      const gatePass = await prisma.gatePass.findUnique({
        where: { id: gatePassId },
      })

      if (!gatePass) {
        throw new Error("Gate pass not found")
      }

      if (gatePass.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      // Generate QR code data
      const qrData = JSON.stringify({
        gatePassId: gatePass.id,
        studentId: gatePass.studentId,
        studentName: gatePass.studentName,
        otp: gatePass.otp,
        expiresAt: gatePass.otpExpiresAt,
      })

      const qrCode = await PDFService.generateQRCode(qrData)

      return {
        success: true,
        qrCode,
        expiresAt: gatePass.otpExpiresAt,
      }
    } catch (error: any) {
      console.error("QR code generation failed:", error)
      throw new Error(`Failed to generate QR code: ${error.message}`)
    }
  }

  /**
   * Get pending gate passes
   */
  static async getPendingGatePasses(tenantId: string) {
    try {
      const pendingPasses = await prisma.gatePass.findMany({
        where: {
          tenantId,
          status: "REQUESTED",
          otpExpiresAt: {
            gte: new Date(),
          },
        },
        orderBy: {
          requestedAt: "desc",
        },
      })

      return {
        success: true,
        passes: pendingPasses,
      }
    } catch (error: any) {
      console.error("Failed to get pending gate passes:", error)
      throw new Error(`Failed to get pending gate passes: ${error.message}`)
    }
  }

  /**
   * Get gate pass history
   */
  static async getGatePassHistory(tenantId: string, studentId?: string) {
    try {
      const where: any = {
        tenantId,
      }

      if (studentId) {
        where.studentId = studentId
      }

      const history = await prisma.gatePass.findMany({
        where,
        orderBy: {
          requestedAt: "desc",
        },
        take: 50,
      })

      return {
        success: true,
        history,
      }
    } catch (error: any) {
      console.error("Failed to get gate pass history:", error)
      throw new Error(`Failed to get gate pass history: ${error.message}`)
    }
  }

  /**
   * Cancel gate pass
   */
  static async cancelGatePass(tenantId: string, gatePassId: string) {
    try {
      const gatePass = await prisma.gatePass.findUnique({
        where: { id: gatePassId },
      })

      if (!gatePass) {
        throw new Error("Gate pass not found")
      }

      if (gatePass.tenantId !== tenantId) {
        throw new Error("Unauthorized access")
      }

      if (gatePass.status === "EXITED" || gatePass.status === "CANCELLED") {
        throw new Error("Cannot cancel an already processed gate pass")
      }

      const updated = await prisma.gatePass.update({
        where: { id: gatePassId },
        data: {
          status: "CANCELLED",
        },
      })

      return {
        success: true,
        gatePass: updated,
      }
    } catch (error: any) {
      console.error("Gate pass cancellation failed:", error)
      throw new Error(`Failed to cancel gate pass: ${error.message}`)
    }
  }
}
