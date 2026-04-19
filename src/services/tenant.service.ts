import { prisma } from "@/lib/prisma"
import { cache } from "react"

/**
 * Tenant Service
 * ──────────────
 * Data access layer for tenant-specific configuration.
 * v3.0: Settings (primaryColor, boardMode) are now columns on the Tenant model itself.
 */

/**
 * Resolves a tenant by its unique slug.
 * Used primarily for login and middleware validation.
 */
export const getTenantBySlug = cache(async (slug: string) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
    })

    if (!tenant) return null

    return tenant
  } catch (error) {
    console.error(`[TENANT_SERVICE]: Error fetching tenant by slug ${slug}`, error)
    return null
  }
})

/**
 * Fetches the active academic year for a tenant.
 */
export const getActiveAcademicYear = cache(async (tenantId: string) => {
  try {
    const academicYear = await prisma.academicYear.findFirst({
      where: { tenantId, isCurrent: true },
    })

    return academicYear
  } catch (error) {
    console.error(`[TENANT_SERVICE]: Error fetching active academic year for tenant ${tenantId}`, error)
    return null
  }
})

/**
 * Gets tenant branding configuration.
 * In v3.0 the branding fields live directly on the Tenant row.
 */
export const getTenantBranding = cache(async (tenantId: string) => {
  const tenant = await getTenantById(tenantId)
  if (!tenant) return null
  return {
    primaryColor: tenant.primaryColor,
    logo: tenant.logo,
    name: tenant.name,
  }
})

export const getTenantById = cache(async (id: string) => {
  return prisma.tenant.findUnique({
    where: { id },
  })
})
