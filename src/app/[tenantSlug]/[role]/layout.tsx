import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { getTenantBySlug } from "@/services/tenant.service"
import { UserRole, isValidRole } from "@/lib/permissions"

interface RoleLayoutProps {
  children: React.ReactNode
  params: Promise<{
    tenantSlug: string
    role: string
  }>
}

import { GlobalHeader } from "@/components/layout/header"
import { CommandMenu } from "@/components/CommandMenu"
import { PageWrapper } from "@/components/layout/PageWrapper"

export default async function RoleLayout({ children, params }: RoleLayoutProps) {
  const { tenantSlug, role } = await params
  const session = await auth()
  // 1. Verify existence and permissions (Redundancy check for middleware)

  if (!session || !session.user) {
    console.error("DASHBOARD LAYOUT - Session Error: Session is null even though middleware passed.")
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-8 rounded-2xl text-center backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Authenticating...</h2>
          <p className="text-slate-400 mb-8">We found your session but couldn't verify it in the dashboard. This might be a temporary connection issue.</p>
          <div className="space-y-3">
            <a
              href="."
              className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Retry Connection
            </a>
            <a
              href="/login"
              className="block w-full text-slate-500 hover:text-white text-sm font-medium transition-colors"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    )
  }

  const normalizedRole = role.toUpperCase() as UserRole
  const sessionRole = session.user.role?.toUpperCase()

  if (
    session.user.tenantSlug !== tenantSlug ||
    sessionRole !== normalizedRole ||
    !isValidRole(normalizedRole)
  ) {
    // If mismatch, send back to their own dashboard
    redirect(`/${session.user.tenantSlug}/${session.user.role.toLowerCase()}/dashboard`)
  }

  // 2. Fetch tenant metadata for branding
  const tenant = await getTenantBySlug(tenantSlug)
  if (!tenant) {
    console.log("DASHBOARD LAYOUT - Tenant Not Found:", tenantSlug)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-8 rounded-2xl text-center backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Tenant Not Found</h2>
          <p className="text-slate-400 mb-8">The school or organization "{tenantSlug}" could not be located in our system. Please check the URL or contact support.</p>
          <div className="space-y-3">
            <a
              href="/login"
              className="block w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95"
            >
              Sign Out & Try Again
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-gray-50/50 dark:bg-[#060606]">
        <AppSidebar
          user={{
            name: session.user.name,
            email: session.user.email,
            role: normalizedRole,
            tenantName: tenant.name,
            tenantSlug: tenantSlug,
          }}
        />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden relative bg-[#FDFEFE] dark:bg-[#0A0C0A]">
          <GlobalHeader />
          <CommandMenu />
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto p-6 md:p-10 space-y-10">
              <PageWrapper>
                {children}
              </PageWrapper>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
