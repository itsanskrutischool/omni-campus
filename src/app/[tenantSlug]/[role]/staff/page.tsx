"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Calendar,
  MoreVertical,
  LayoutGrid,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  CreditCard,
  Building2,
  FileSpreadsheet
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────

interface StaffMember {
  id: string
  name: string
  role: string
  department: string
  email: string
  phone: string
  status: "ACTIVE" | "ON_LEAVE" | "TERMINATED"
}

// ─── Demo Data ─────────────────────────────

const DEMO_STAFF: StaffMember[] = [
  { id: "STF001", name: "Dr. Sarah Mitchell", role: "Principal", department: "Administration", email: "sarah.m@omnicampus.edu", phone: "+91 98765 43210", status: "ACTIVE" },
  { id: "STF002", name: "Robert Wilson", role: "Senior Coordinator", department: "Academic", email: "robert.w@omnicampus.edu", phone: "+91 98765 43211", status: "ACTIVE" },
  { id: "STF003", name: "Elena Rodriguez", role: "Science HOD", department: "Faculty", email: "elena.r@omnicampus.edu", phone: "+91 98765 43212", status: "ACTIVE" },
  { id: "STF004", name: "Marcus Thorne", role: "Accounts Manager", department: "Finance", email: "marcus.t@omnicampus.edu", phone: "+91 98765 43213", status: "ON_LEAVE" },
  { id: "STF005", name: "Jennifer Gates", role: "Librarian", department: "Operations", email: "jennifer.g@omnicampus.edu", phone: "+91 98765 43214", status: "ACTIVE" },
]

// ─── Component ─────────────────────────────

export default function StaffDirectoryTerminal() {
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  const filteredStaff = DEMO_STAFF.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      
      {/* Personnel Intelligence Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                Human Capital Management
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" />
                Verified Personnel
              </div>
           </div>
           <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">
              Personnel <span className="text-emerald-600">Directory</span>
           </h1>
           <p className="text-muted-foreground font-semibold max-w-xl text-lg">
              Strategic oversight of the institution's workforce, pedagogical faculty, and operational staff.
           </p>
        </div>

        <div className="flex items-center gap-4">
           <Button
            variant="outline"
            onClick={() => router.push(`/${tenantSlug}/${role}/staff/import`)}
            className="h-14 px-6 rounded-2xl border-blue-500/20 hover:bg-blue-50 font-black text-xs uppercase tracking-[0.15em]"
           >
              <FileSpreadsheet className="w-4 h-4 mr-3 text-blue-600" />
              Import Center
           </Button>
           <Button className="h-14 px-8 rounded-2xl bg-emerald-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 group">
              <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform duration-500" />
              Onboard Personnel
           </Button>
        </div>
      </div>

      {/* Workforce Analytics Hub */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
        <StatCard 
          label="Total Workforce" 
          value="142" 
          icon={Users} 
          trend={[130, 135, 132, 138, 140, 141, 142]} 
          description="Active and contracted staff"
          variant="emerald"
        />
        <StatCard 
          label="Present Today" 
          value="98.5%" 
          icon={Clock} 
          trend={[95, 96, 94, 98, 97, 99, 98.5]} 
          description="Real-time attendance shift"
          variant="blue"
        />
        <StatCard 
          label="Payroll Status" 
          value="Synchronized" 
          icon={CreditCard} 
          trend={[100, 100, 100, 100, 100, 100, 100]} 
          description="Global financial settlement"
          variant="amber"
        />
        <StatCard 
          label="Certifications" 
          value="42" 
          icon={GraduationCap} 
          trend={[10, 15, 20, 25, 30, 38, 42]} 
          description="Advanced faculty credentials"
          variant="emerald"
        />
      </div>

      {/* Main Personnel Terminal */}
      <div className="grid grid-cols-1 gap-8">
        <Card variant="glass" className="border-emerald-500/5 shadow-2xl overflow-hidden group/card relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/card:opacity-[0.07] transition-opacity duration-1000 pointer-events-none">
             <Building2 className="w-64 h-64 scale-150 rotate-12" />
          </div>

          <div className="p-8 border-b border-emerald-500/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                  <Briefcase className="w-6 h-6 text-emerald-600" />
               </div>
               <div>
                  <h3 className="text-xl font-black tracking-tight">Active Duty Registry</h3>
                  <p className="text-sm font-semibold text-muted-foreground">Comprehensive log of Institutional personnel assets.</p>
               </div>
            </div>
            
            <div className="relative w-full md:w-96 group/search">
               <div className="absolute -inset-1 bg-emerald-500/10 rounded-2xl blur opacity-0 group-hover/search:opacity-100 transition duration-500"></div>
               <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                 <Input
                   placeholder="Filter personnel by name or role..."
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="h-14 pl-12 bg-muted/50 border-none rounded-2xl font-bold focus-visible:ring-emerald-500"
                 />
               </div>
            </div>
          </div>

          <div className="overflow-x-auto relative z-10">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-500/[0.02] border-none">
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Staff Profile</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Strategic Role</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Communication</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Duty State</TableHead>
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400 text-right">Directives</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse border-none">
                       <TableCell colSpan={5} className="h-20 bg-muted/10" />
                    </TableRow>
                  ))
                ) : filteredStaff.length === 0 ? (
                  <TableRow className="border-none">
                    <TableCell colSpan={5} className="py-32 text-center text-muted-foreground font-bold">
                       No personnel entities found within current synchronization.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((staff) => (
                    <TableRow key={staff.id} className="group/row hover:bg-emerald-500/[0.02] transition-all border-b border-emerald-500/5">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/10 flex items-center justify-center shadow-sm group-hover/row:scale-110 transition-transform overflow-hidden">
                              <img className="h-full w-full object-cover" src={`https://i.pravatar.cc/256?u=${staff.id}`} alt="" />
                           </div>
                           <div>
                              <p className="font-black text-lg group-hover/row:text-emerald-600 transition-colors uppercase tracking-tight">{staff.name}</p>
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{staff.id}</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                           <p className="text-sm font-black dark:text-white uppercase tracking-tight">{staff.role}</p>
                           <p className="text-[10px] font-bold text-muted-foreground">{staff.department} Sector</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                              <Mail className="w-3.5 h-3.5 text-blue-500" /> {staff.email}
                           </div>
                           <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                              <Phone className="w-3.5 h-3.5 text-emerald-500" /> {staff.phone}
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              staff.status === "ACTIVE" ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                              staff.status === "ON_LEAVE" ? "bg-amber-500" : "bg-red-500"
                            )} />
                            <span className="text-[10px] font-black tracking-[0.1em] uppercase">
                              {staff.status.replace("_", " ")}
                            </span>
                         </div>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-xl border-emerald-500/10 hover:bg-emerald-500/10 hover:text-emerald-700 font-bold"
                            >
                              <Zap className="w-3.5 h-3.5 mr-2" /> View Intel
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
                               <MoreVertical className="w-4 h-4" />
                            </Button>
                         </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Decorative Matrix Lattice */}
      <div className="fixed bottom-0 left-0 p-10 opacity-[0.02] pointer-events-none">
         <LayoutGrid className="w-96 h-96 -translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  )
}
