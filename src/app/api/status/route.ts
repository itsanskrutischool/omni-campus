/**
 * System Health Check Endpoint
 * ─────────────────────────────
 * Returns system status, database connectivity, and version info.
 * Use this for load balancer health checks and monitoring.
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic" // Never cache

export async function GET() {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
  }

  try {
    // Test database connectivity
    await prisma.$queryRaw`SELECT 1`
    checks.database = true

    return NextResponse.json(
      {
        status: "healthy",
        ...checks,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    )
  } catch (error) {
    console.error("[HEALTH_CHECK] Database connection failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        ...checks,
        error: "Database connection failed",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    )
  }
}
