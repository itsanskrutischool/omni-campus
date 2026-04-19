import { NextRequest, NextResponse } from "next/server"
import { TwoFactorService } from "@/services/two-factor.service"

// GET /api/auth/2fa - Check 2FA status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const result = await TwoFactorService.check2FAStatus(userId)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/auth/2fa - Generate secret, enable 2FA, verify token, regenerate backup codes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case "generateSecret":
        const secret = await TwoFactorService.generateSecret(data.userId)
        return NextResponse.json(secret)

      case "enable2FA":
        const enabled = await TwoFactorService.enable2FA(data.userId, data.token)
        return NextResponse.json(enabled)

      case "verifyToken":
        const verified = await TwoFactorService.verifyToken(data.userId, data.token)
        return NextResponse.json(verified)

      case "regenerateBackupCodes":
        const backupCodes = await TwoFactorService.regenerateBackupCodes(data.userId, data.token)
        return NextResponse.json(backupCodes)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/auth/2fa - Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, token } = body

    if (!userId || !token) {
      return NextResponse.json({ error: "User ID and token are required" }, { status: 400 })
    }

    const result = await TwoFactorService.disable2FA(userId, token)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
