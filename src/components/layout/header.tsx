"use client"

import React, { useEffect, useState } from "react"
import { Search, Bell, Globe, ChevronDown } from "lucide-react"
import { useAppStore } from "@/store/use-app-store"
import { Button } from "@/components/ui/button"
import { LiveClock } from "@/components/dashboard/live-clock"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function GlobalHeader() {
  const { academicYear, setAcademicYear, unreadCount, setLanguage } = useAppStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timeout)
  }, [])

  if (!mounted) return <header className="h-20 border-b border-slate-200 bg-white" />

  return (
    <header className="h-20 border-b border-slate-200 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between font-sans">
      {/* Search Bar - Global Search ⌘K */}
      <div className="flex-1 max-w-md hidden lg:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-hover:text-primary" />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
          <input 
            type="text" 
            placeholder="Search anything..."
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-11 pr-16 text-sm font-medium transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            onClick={() => {
              // Trigger command menu if needed
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Live Clock - Digital with Date */}
        <div className="hidden xl:block px-4 border-r border-slate-100 dark:border-white/5">
          <LiveClock />
        </div>

        {/* Academic Year Selector */}
        <div className="hidden md:flex flex-col items-end pr-2 border-r border-slate-100 dark:border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Academic Session</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-bold text-primary hover:opacity-80 transition-opacity">
              {academicYear}
              <ChevronDown className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-slate-200">
              {["2023-2024", "2024-2025", "2025-2026"].map((year) => (
                <DropdownMenuItem 
                  key={year} 
                  className="font-bold text-xs py-2 px-4 cursor-pointer"
                  onClick={() => setAcademicYear(year)}
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="size-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors outline-none cursor-pointer">
              <Globe className="w-5 h-5 text-slate-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => setLanguage("en")}>English (US)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("ar")}>Arabic (العربية)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors relative group">
              <Bell className="w-5 h-5 text-slate-500 group-hover:animate-bell-shake" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-oc-danger text-white text-[9px] font-black rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-100 dark:border-white/5">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none mb-1">Admin Panel</span>
            <span className="text-[10px] text-primary font-bold px-1.5 py-0.5 bg-primary/10 rounded uppercase">Super Admin</span>
          </div>
          <Avatar className="w-10 h-10 rounded-xl shadow-md border border-slate-200 dark:border-white/10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-white font-black text-sm">JS</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}

