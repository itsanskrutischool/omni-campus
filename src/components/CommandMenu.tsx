"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  Users,
  Bus,
  FileText,
  Bell,
  Download,
  Plus
} from "lucide-react"
import { Command } from "cmdk"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const params = useParams()
  const tenantSlug = params?.tenantSlug as string
  const role = params?.role as string

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-2xl border-none glass-premium max-w-2xl">
          <DialogTitle className="sr-only">Command Menu</DialogTitle>
          <Command className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-14 [&_[cmdk-item]]:px-4 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
            <div className="flex items-center border-b border-slate-200/50 dark:border-slate-800/50 px-4" cmdk-input-wrapper="">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input
                placeholder="Type a command or search..."
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
              <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
              
              <Command.Group heading="Academics">
                <Command.Item 
                  className="flex items-center gap-2 rounded-lg py-2 px-3 text-sm cursor-pointer hover:bg-emerald-500/10 transition-colors"
                  onSelect={() => runCommand(() => router.push(`/${tenantSlug}/${role}/students`))}
                >
                  <Users className="h-4 w-4" />
                  <span>Student Directory</span>
                </Command.Item>
                <Command.Item 
                  className="flex items-center gap-2 rounded-lg py-2 px-3 text-sm cursor-pointer hover:bg-emerald-500/10 transition-colors"
                  onSelect={() => runCommand(() => router.push(`/${tenantSlug}/${role}/attendance`))}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Mark Attendance</span>
                </Command.Item>
                <Command.Item 
                  className="flex items-center gap-2 rounded-lg py-2 px-3 text-sm cursor-pointer hover:bg-emerald-500/10 transition-colors"
                  onSelect={() => runCommand(() => router.push(`/${tenantSlug}/${role}/exams`))}
                >
                  <FileText className="h-4 w-4" />
                  <span>Examinations</span>
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Finance & Operations">
                <Command.Item 
                   className="flex items-center gap-2 rounded-lg py-2 px-3 text-sm cursor-pointer hover:bg-emerald-500/10 transition-colors"
                  onSelect={() => runCommand(() => router.push(`/${tenantSlug}/${role}/fees/collection`))}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Collect Fees</span>
                </Command.Item>
                <Command.Item 
                  className="flex items-center gap-2 rounded-lg py-2 px-3 text-sm cursor-pointer hover:bg-emerald-500/10 transition-colors"
                  onSelect={() => runCommand(() => router.push(`/${tenantSlug}/${role}/transport`))}
                >
                  <Bus className="h-4 w-4" />
                  <span>Transport Routes</span>
                </Command.Item>
                <Command.Item 
                  className="flex items-center gap-2 rounded-lg py-2 px-3 text-sm cursor-pointer hover:bg-emerald-500/10 transition-colors"
                  onSelect={() => runCommand(() => router.push(`/${tenantSlug}/${role}/communication`))}
                >
                  <Bell className="h-4 w-4" />
                  <span>Send Announcements</span>
                </Command.Item>
              </Command.Group>

              <Command.Group heading="System">
                <Command.Item 
                   className="flex items-center gap-2 rounded-lg py-2 px-3 text-sm cursor-pointer hover:bg-emerald-500/10 transition-colors"
                  onSelect={() => runCommand(() => router.push(`/${tenantSlug}/${role}/utilities/export`))}
                >
                  <Download className="h-4 w-4" />
                  <span>Export Center</span>
                </Command.Item>
                <Command.Item 
                  className="flex items-center gap-2 rounded-lg py-2 px-3 text-sm cursor-pointer hover:bg-emerald-500/10 transition-colors"
                  onSelect={() => runCommand(() => router.push(`/${tenantSlug}/${role}/hr/leaves`))}
                >
                  <User className="h-4 w-4" />
                  <span>HR & Staff Leaves</span>
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
