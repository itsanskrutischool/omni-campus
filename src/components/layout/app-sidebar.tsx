"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { getMenuForRole, UserRole } from "@/lib/permissions"
import { School, LogOut, User, ChevronRight, Zap, LayoutDashboard } from "lucide-react"
import { logoutAction } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    role: UserRole
    tenantName: string
    tenantSlug: string
  }
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const menuItems = getMenuForRole(user.role)
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-none bg-gradient-sidebar text-white selection:bg-white/20"
    >
      {/* Header — School Logo & Name */}
      <SidebarHeader className="p-5">
        <div className="flex items-center gap-3.5 overflow-hidden">
          <div className="flex-shrink-0 w-11 h-11 bg-white/10 backdrop-blur-md flex items-center justify-center rounded-xl border border-white/20 shadow-lg">
            <School className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-heading font-bold text-sm tracking-tight text-white leading-tight truncate">
                {user.tenantName}
              </span>
              <div className="flex items-center gap-1.5 font-bold text-[9px] text-primary-foreground bg-white/20 px-2 py-0.5 rounded-md w-fit uppercase tracking-wider mt-0.5">
                <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                {user.role} CORE
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 pt-4 custom-scrollbar">
        {/* Quick Launchpad Button */}
        {!isCollapsed && (
          <div className="mb-6 px-2">
            <Button className="w-full justify-start gap-2.5 bg-white text-primary hover:bg-white/90 font-black text-[11px] uppercase tracking-widest rounded-xl shadow-xl shadow-black/10 transition-all border-none h-11">
              <Zap className="w-4 h-4 fill-primary" />
              Quick Launch
            </Button>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3 font-heading">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const fullHref = `/${user.tenantSlug}/${user.role.toLowerCase()}${item.href}`
                const isActive = pathname === fullHref || (item.href !== "/dashboard" && pathname.startsWith(fullHref))

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      render={
                        <Link href={fullHref} className="flex items-center gap-3.5">
                          <item.icon 
                            className={cn(
                              "w-[18px] h-[18px] transition-all duration-300", 
                              isActive ? "text-white" : "text-white/60 group-hover:text-white"
                            )} 
                          />
                          <span className={cn(
                            "text-[12px] font-bold tracking-wide transition-colors", 
                            isActive ? "text-white" : "text-white/70 group-hover:text-white"
                          )}>
                            {item.label}
                          </span>
                          {isActive && !isCollapsed && (
                            <div className="ml-auto w-1 h-4 rounded-full bg-white/40" />
                          )}
                        </Link>
                      }
                      tooltip={item.label}
                      isActive={isActive}
                      className={cn(
                        "h-11 transition-all duration-300 rounded-xl group px-4",
                        isActive 
                          ? "bg-white/15 border border-white/10 shadow-sm" 
                          : "hover:bg-white/5 border border-transparent"
                      )}
                    />
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <div className="flex flex-col gap-3">
          {/* User Profile Mini-Card */}
          {!isCollapsed && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/10 border border-white/5 transition-all hover:bg-white/5 cursor-pointer group">
               <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 overflow-hidden shadow-inner">
                 <img src={`https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`} alt="Profile" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
               </div>
               <div className="flex flex-col min-w-0">
                 <span className="text-[11px] font-black truncate text-white uppercase tracking-tight">{user.name || "Administrator"}</span>
                 <span className="text-[9px] text-white/50 truncate font-medium">{user.email}</span>
               </div>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size={isCollapsed ? "icon" : "default"}
            onClick={() => logoutAction()}
            className="w-full justify-start text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-xl h-11 group"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!isCollapsed && <span className="ml-3 font-black text-[11px] uppercase tracking-widest">Sign Out</span>}
          </Button>

          {/* System Version Pin */}
          {!isCollapsed && (
            <div className="px-3 py-1 flex items-center justify-between opacity-30">
               <span className="text-[8px] font-black tracking-widest uppercase">Omni-V3.1-PRO</span>
               <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

