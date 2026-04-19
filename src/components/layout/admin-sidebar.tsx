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
} from "@/components/ui/sidebar"
import { LayoutDashboard, GraduationCap, DollarSign, UserPlus } from "lucide-react"

export function AdminSidebar() {
  return (
    <Sidebar className="border-r border-gray-100 bg-white">
      <SidebarHeader className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold tracking-tighter text-black">OmniCampus.</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-gray-400">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Overview">
                  <LayoutDashboard className="w-4 h-4 mr-2" /><span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Academics">
                  <GraduationCap className="w-4 h-4 mr-2" /><span>Academics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Finance">
                  <DollarSign className="w-4 h-4 mr-2" /><span>Finance</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Admissions">
                  <UserPlus className="w-4 h-4 mr-2" /><span>Admissions</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
