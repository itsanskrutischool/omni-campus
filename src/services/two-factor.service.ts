const { authenticator } = require("otplib")
import { prisma } from "@/lib/prisma"
import { AuditService } from "./audit.service"

// ─── Two-Factor Authentication Service ───────────────────────────────────

export class TwoFactorService {
  /**
   * Generate TOTP secret for a user
   */
  static async generateSecret(userId: string) {
    try {
      const secret = authenticator.generateSecret()

      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorSecret: secret,
        },
      })

      return {
        success: true,
        secret,
        otpauthUrl: authenticator.keyuri(
          process.env.APP_NAME || "OmniCampus",
          userId,
          secret
        ),
      }
    } catch (error: any) {
      console.error("Failed to generate 2FA secret:", error)
      throw new Error(`Failed to generate 2FA secret: ${error.message}`)
    }
  }

  /**
   * Enable 2FA for a user
   */
  static async enable2FA(userId: string, token: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user || !user.twoFactorSecret) {
        throw new Error("2FA secret not found. Please generate a secret first.")
      }

      // Verify the token
      const isValid = authenticator.verify({
        token,
        secret: user.twoFactorSecret,
      })

      if (!isValid) {
        throw new Error("Invalid token")
      }

      // Generate backup codes
      const backupCodes = this.generateBackupCodes()

      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: true,
          backupCodes,
        },
      })

      await AuditService.log({
        tenantId: "SYSTEM",
        action: "UPDATE",
        module: "SECURITY",
        entityType: "User",
        entityId: userId,
        summary: `Enabled 2FA for user ${userId}`,
      })

      return {
        success: true,
        message: "2FA enabled successfully",
        backupCodes,
      }
    } catch (error: any) {
      console.error("Failed to enable 2FA:", error)
      throw new Error(`Failed to enable 2FA: ${error.message}`)
    }
  }

  /**
   * Disable 2FA for a user
   */
  static async disable2FA(userId: string, token: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user || !user.twoFactorSecret) {
        throw new Error("2FA not enabled for this user")
      }

      // Verify the token
      const isValid = authenticator.verify({
        token,
        secret: user.twoFactorSecret,
      })

      if (!isValid) {
        throw new Error("Invalid token")
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: [],
        },
      })

      await AuditService.log({
        tenantId: "SYSTEM",
        action: "UPDATE",
        module: "SECURITY",
        entityType: "User",
        entityId: userId,
        summary: `Disabled 2FA for user ${userId}`,
      })

      return {
        success: true,
        message: "2FA disabled successfully",
      }
    } catch (error: any) {
      console.error("Failed to disable 2FA:", error)
      throw new Error(`Failed to disable 2FA: ${error.message}`)
    }
  }

  /**
   * Verify 2FA token
   */
  static async verifyToken(userId: string, token: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new Error("2FA not enabled for this user")
      }

      // Check if token is a backup code
      if (user.backupCodes.includes(token)) {
        // Remove used backup code
        await prisma.user.update({
          where: { id: userId },
          data: {
            backupCodes: user.backupCodes.filter((code) => code !== token),
          },
        })

        return {
          success: true,
          message: "Backup code used successfully",
        }
      }

      // Verify TOTP token
      const isValid = authenticator.verify({
        token,
        secret: user.twoFactorSecret,
      })

      if (!isValid) {
        throw new Error("Invalid token")
      }

      return {
        success: true,
        message: "Token verified successfully",
      }
    } catch (error: any) {
      console.error("Failed to verify 2FA token:", error)
      throw new Error(`Failed to verify 2FA token: ${error.message}`)
    }
  }

  /**
   * Check if user has 2FA enabled
   */
  static async check2FAStatus(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          twoFactorEnabled: true,
        },
      })

      return {
        success: true,
        enabled: user?.twoFactorEnabled || false,
      }
    } catch (error: any) {
      console.error("Failed to check 2FA status:", error)
      throw new Error(`Failed to check 2FA status: ${error.message}`)
    }
  }

  /**
   * Generate backup codes
   */
  private static generateBackupCodes(count = 10): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      codes.push(authenticator.generateSecret().slice(0, 8).toUpperCase())
    }
    return codes
  }

  /**
   * Regenerate backup codes
   */
  static async regenerateBackupCodes(userId: string, token: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user || !user.twoFactorSecret) {
        throw new Error("2FA not enabled for this user")
      }

      // Verify the token
      const isValid = authenticator.verify({
        token,
        secret: user.twoFactorSecret,
      })

      if (!isValid) {
        throw new Error("Invalid token")
      }

      const newBackupCodes = this.generateBackupCodes()

      await prisma.user.update({
        where: { id: userId },
        data: {
          backupCodes: newBackupCodes,
        },
      })

      await AuditService.log({
        tenantId: "SYSTEM",
        action: "UPDATE",
        module: "SECURITY",
        entityType: "User",
        entityId: userId,
        summary: `Regenerated backup codes for user ${userId}`,
      })

      return {
        success: true,
        backupCodes: newBackupCodes,
      }
    } catch (error: any) {
      console.error("Failed to regenerate backup codes:", error)
      throw new Error(`Failed to regenerate backup codes: ${error.message}`)
    }
  }
}
