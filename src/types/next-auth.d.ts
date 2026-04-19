import "next-auth"
import "next-auth/jwt"

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    tenantId: string
    tenantSlug: string
    role: string
    campusId: string | null
  }
}
