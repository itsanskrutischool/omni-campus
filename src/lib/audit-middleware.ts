import { NextRequest } from "next/server"
import { AuditService, AuditEntry } from "@/services/audit.service"

/**
 * Audit Middleware Helper
 * ──────────────────────
 * Drop-in utility for API routes to log mutations.
 * Usage:
 *   await auditAction(request, {
 *     tenantId, action: "UPDATE", module: "exams",
 *     entityType: "MarkEntry", entityId: "mk-001",
 *     summary: "Changed marks for Aman in Math: 85 → 92",
 *     oldValue: { marks: 85 }, newValue: { marks: 92 }
 *   })
 */

export async function auditAction(
  request: NextRequest | null,
  entry: Omit<AuditEntry, "ipAddress" | "userAgent"> & {
    ipAddress?: string
    userAgent?: string
  }
) {
  const ipAddress =
    entry.ipAddress ||
    request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request?.headers.get("x-real-ip") ||
    "unknown"

  const userAgent =
    entry.userAgent ||
    request?.headers.get("user-agent") ||
    "unknown"

  return AuditService.log({
    ...entry,
    ipAddress,
    userAgent,
  })
}

/**
 * Build a human-readable summary of changes between old and new values.
 * Example output: "Changed marks from 85 to 92, changed grade from B to A"
 */
export function buildChangeSummary(
  entityLabel: string,
  oldVal: Record<string, unknown>,
  newVal: Record<string, unknown>,
  fieldLabels?: Record<string, string>
): string {
  const changes: string[] = []

  for (const key of Object.keys(newVal)) {
    if (oldVal[key] !== undefined && oldVal[key] !== newVal[key]) {
      const label = fieldLabels?.[key] || key
      changes.push(`${label}: ${oldVal[key]} → ${newVal[key]}`)
    }
  }

  if (changes.length === 0) return `Updated ${entityLabel} (no field changes detected)`
  return `Updated ${entityLabel} — ${changes.join(", ")}`
}
