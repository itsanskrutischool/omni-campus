import { auth } from "@/lib/auth"
import { cache } from "react"
import { UserRole } from "./permissions"

/**
 * Session Helpers
 * ───────────────
 * Optimized and type-safe session retrieval for server components.
 */

/**
 * Returns the current authenticated user from the session.
 * Uses react.cache to deduplicate calls within a single request.
 */
export const currentUser = cache(async () => {
  const session = await auth()
  return session?.user
})

/**
 * Returns the current user's role.
 */
export const currentRole = cache(async () => {
  const user = await currentUser()
  return user?.role as UserRole | undefined
})

/**
 * Returns the current tenant context.
 */
export const currentTenant = cache(async () => {
  const user = await currentUser()
  if (!user) return null
  
  return {
    id: user.tenantId,
    slug: user.tenantSlug,
    campusId: user.campusId,
  }
})

/**
 * Helper to check if the current user has a specific role.
 */
export async function hasRole(role: UserRole | UserRole[]): Promise<boolean> {
  const userRole = await currentRole()
  if (!userRole) return false
  
  const roles = Array.isArray(role) ? role : [role]
  return roles.includes(userRole)
}
