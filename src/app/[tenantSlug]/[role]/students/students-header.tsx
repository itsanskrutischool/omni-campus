"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, UserCheck, GraduationCap, Download, Plus, Sparkles, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/dashboard/stat-card"
import { useRouter } from "next/navigation"

export function StudentsHeader({ tenantSlug, role }: { tenantSlug: string, role: string }) {
  const router = useRouter()
  const [stats, setStats] = useState({ total: 0, active: 0, enquiry: 0, admitted: 0 })

  useEffect(() => {
    fetch("/api/students?stats=true")
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
  }, [])

  return (
    <div className="space-y-8">
      {/* ═══ HEADER SECTION ═══ */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-1">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              Student Information System
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Academic Year 2026-27
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none font-heading">
            Student <span className="text-emerald-600">Directory</span>
          </h1>
          <p className="text-muted-foreground font-semibold max-w-xl text-lg">
            Manage student life cycles from initial enquiry to alumni status with unified academic records.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/${tenantSlug}/${role}/students/import`)}
            className="h-14 px-6 rounded-2xl border-blue-500/20 hover:bg-blue-50 dark:hover:bg-blue-500/10 font-black text-xs uppercase tracking-[0.15em] group transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 mr-3 text-blue-600 group-hover:-translate-y-0.5 transition-transform" />
            Bulk Import
          </Button>
          <Button variant="outline" className="h-14 px-6 rounded-2xl border-emerald-500/20 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 font-black text-xs uppercase tracking-[0.15em] group transition-all">
            <Download className="w-4 h-4 mr-3 text-emerald-600 group-hover:-translate-y-0.5 transition-transform" />
            Export Records
          </Button>
          <Button 
            onClick={() => router.push(`/${tenantSlug}/${role}/admissions`)}
            className="h-14 px-8 rounded-2xl bg-emerald-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 group"
          >
            <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform duration-500" />
            New Admission
          </Button>
        </div>
      </div>

      {/* ═══ KPI BENTO GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Strength" 
          value={stats.total} 
          icon={Users} 
          description="Gross active registrations"
          variant="emerald"
          index={0}
        />
        <StatCard 
          label="Active Students" 
          value={stats.active} 
          icon={UserCheck} 
          description="Currently on roll"
          variant="blue"
          index={1}
        />
        <StatCard 
          label="New Enquiries" 
          value={stats.enquiry} 
          icon={UserPlus} 
          description="Last 30 days"
          variant="amber"
          index={2}
        />
        <StatCard 
          label="Adm. Confirmed" 
          value={stats.admitted} 
          icon={GraduationCap} 
          description="Pending onboarding"
          variant="violet"
          index={3}
        />
      </div>
    </div>
  )
}
