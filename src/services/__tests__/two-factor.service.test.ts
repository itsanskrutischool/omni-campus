import { TwoFactorService } from "../two-factor.service"

// Mock Prisma client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

// Mock otplib
jest.mock("otplib", () => ({
  authenticator: {
    generateSecret: jest.fn(() => "test-secret"),
    keyuri: jest.fn(() => "otpauth://totp/test"),
    verify: jest.fn(() => true),
  },
}))

// Mock AuditService
jest.mock("../audit.service", () => ({
  AuditService: {
    logAction: jest.fn(),
  },
}))

describe("TwoFactorService", () => {
  const userId = "test-user-id"
  const tenantId = "test-tenant"

  describe("generateSecret", () => {
    it("should generate a TOTP secret for a user", async () => {
      const mockUser = { id: userId, email: "test@example.com", name: "Test User" }

      const { prisma } = require("@/lib/prisma")
      prisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await TwoFactorService.generateSecret(userId)

      expect(result).toHaveProperty("secret")
      expect(result).toHaveProperty("qrCodeUri")
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      })
    })
  })

  describe("enable2FA", () => {
    it("should enable 2FA for a user with valid token", async () => {
      const mockUser = { id: userId, twoFactorSecret: "test-secret" }
      const updatedUser = { id: userId, twoFactorEnabled: true }

      const { prisma } = require("@/lib/prisma")
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.user.update.mockResolvedValue(updatedUser)

      const result = await TwoFactorService.enable2FA(userId, "123456")

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          twoFactorEnabled: true,
          backupCodes: expect.any(Array),
        },
      })
      expect(result).toHaveProperty("success", true)
    })
  })

  describe("verifyToken", () => {
    it("should verify a TOTP token", async () => {
      const mockUser = { id: userId, twoFactorSecret: "test-secret", twoFactorEnabled: true }

      const { prisma } = require("@/lib/prisma")
      prisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await TwoFactorService.verifyToken(userId, "123456")

      expect(result).toHaveProperty("valid")
    })
  })

  describe("check2FAStatus", () => {
    it("should return 2FA status for a user", async () => {
      const mockUser = { id: userId, twoFactorEnabled: true }

      const { prisma } = require("@/lib/prisma")
      prisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await TwoFactorService.check2FAStatus(userId)

      expect(result).toHaveProperty("enabled", true)
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { twoFactorEnabled: true },
      })
    })
  })

  describe("disable2FA", () => {
    it("should disable 2FA for a user with valid token", async () => {
      const mockUser = { id: userId, twoFactorSecret: "test-secret", twoFactorEnabled: true }
      const updatedUser = { id: userId, twoFactorEnabled: false }

      const { prisma } = require("@/lib/prisma")
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.user.update.mockResolvedValue(updatedUser)

      const result = await TwoFactorService.disable2FA(userId, "123456")

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: [],
        },
      })
      expect(result).toHaveProperty("success", true)
    })
  })

  describe("regenerateBackupCodes", () => {
    it("should regenerate backup codes for a user", async () => {
      const mockUser = { id: userId, twoFactorSecret: "test-secret", twoFactorEnabled: true }
      const updatedUser = { id: userId, backupCodes: expect.any(Array) }

      const { prisma } = require("@/lib/prisma")
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.user.update.mockResolvedValue(updatedUser)

      const result = await TwoFactorService.regenerateBackupCodes(userId, "123456")

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          backupCodes: expect.any(Array),
        },
      })
      expect(result).toHaveProperty("backupCodes")
    })
  })
})
