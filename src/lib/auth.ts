import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantSlug: { label: "School Code", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        const tenantSlug = credentials?.tenantSlug as string | undefined

        if (!email || !password || !tenantSlug) return null

        // 1. Resolve tenant from slug
        const tenant = await prisma.tenant.findUnique({
          where: { slug: tenantSlug },
        })
        if (!tenant) return null

        // 2. Find user by email (global identity)
        const user = await prisma.user.findUnique({
          where: { email },
        })
        if (!user || !user.isActive) return null

        // 3. Verify password
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        // 4. Find TenantUser mapping (role for this tenant)
        const tenantUser = await prisma.tenantUser.findFirst({
          where: {
            userId: user.id,
            tenantId: tenant.id,
          },
        })
        if (!tenantUser) return null

        // Return enriched user object → flows into jwt callback
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
          role: tenantUser.role,
          campusId: tenantUser.campusId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, user object is available
      if (user) {
        const u = user as { id: string; tenantId: string; tenantSlug: string; role: string; campusId?: string }
        token.id = u.id
        token.tenantId = u.tenantId
        token.tenantSlug = u.tenantSlug
        token.role = u.role
        token.campusId = u.campusId ?? null
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.tenantId = token.tenantId as string
        session.user.tenantSlug = token.tenantSlug as string
        session.user.role = token.role as string
        session.user.campusId = (token.campusId as string) ?? null
      }
      return session
    },
  },
})

// ─── Type Augmentation ───────────────────────
// JWT types are in src/types/next-auth.d.ts

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      tenantId: string
      tenantSlug: string
      role: string
      campusId: string | null
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
