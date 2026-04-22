"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, MoreHorizontal, Eye, Edit, Trash2, UserCheck, UserPlus, GraduationCap, Users, X, Phone, Mail, MapPin, Calendar, Clock, ShieldCheck, ArrowUpRight, Target, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Student {
  id: string
  admissionNumber: string
  name: string
  gender: string
  phone: string
  fatherName: string
  status: string
  admissionStatus: string
  profileImage?: string | null
  classroom?: { name: string } | null
  section?: { name: string } | null
}

interface StudentListProps {
  tenantSlug: string
  role: string
}

export function StudentList({ tenantSlug, role }: StudentListProps) {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // Advanced Preview State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [analyzingProfile, setAnalyzingProfile] = useState(false)
  const [aiInsight, setAiInsight] = useState<string | null>(null)

  const handleRowClick = (student: Student) => {
    router.push(`/${tenantSlug}/${role}/students/${student.id}`)
  }

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (classFilter !== "all") params.set("classRoomId", classFilter)
      params.set("page", String(page))
      params.set("pageSize", "10")

      const res = await fetch(`/api/students?${params}`)
      if (res.ok) {
        const data = await res.json()
        setStudents(data.students || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error("Failed to fetch students", error)
    } finally {
      setLoading(false)
    }
  }, [search, classFilter, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchStudents])

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then((data) => setClasses(data || []))
      .catch(() => {})
  }, [])

  const statusColor = (s: string) => {
    switch (s) {
      case "ACTIVE": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "INACTIVE": return "bg-rose-500/10 text-rose-600 border-rose-500/20"
      case "PENDING": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      default: return "bg-slate-500/10 text-slate-600 border-slate-500/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* ═══ MISSION CONTROL SEARCH & FILTERS ═══ */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-indigo-500 transition-colors" />
            <Input 
              placeholder="Search by student name or admission ID..." 
              className="pl-11 h-14 rounded-2xl border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl focus:bg-white dark:focus:bg-zinc-900 transition-all font-medium text-foreground placeholder:text-muted-foreground/40 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={classFilter} onValueChange={(v) => setClassFilter(v || "all")}>
            <SelectTrigger className="h-14 w-full md:w-56 rounded-2xl border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl font-bold text-muted-foreground shadow-sm">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-500" />
                <SelectValue placeholder="Academic Class" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-white/10 backdrop-blur-2xl">
              <SelectItem value="all" className="font-bold">All Divisions</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id} className="font-bold">{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ═══ MAIN DATA TABLE ═══ */}
      <Card className="rounded-[2.5rem] border-white/5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent bg-muted/20">
                <TableHead className="py-6 px-8 font-black text-muted-foreground/40 text-[10px] uppercase tracking-[0.25em]">Manifest ID</TableHead>
                <TableHead className="py-6 font-black text-muted-foreground/40 text-[10px] uppercase tracking-[0.25em]">Individual Identity</TableHead>
                <TableHead className="py-6 font-black text-muted-foreground/40 text-[10px] uppercase tracking-[0.25em]">Academic Status</TableHead>
                <TableHead className="py-6 font-black text-muted-foreground/40 text-[10px] uppercase tracking-[0.25em]">Parental Context</TableHead>
                <TableHead className="py-6 font-black text-muted-foreground/40 text-[10px] uppercase tracking-[0.25em]">Lifespan</TableHead>
                <TableHead className="py-6 px-8 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-[500px] bg-white/5">
                    <TableSkeleton columns={6} rows={8} />
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-[500px] text-center">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-6"
                    >
                      <div className="w-20 h-20 rounded-[2.5rem] bg-muted/30 flex items-center justify-center">
                        <Users className="w-10 h-10 text-muted-foreground/30" strokeWidth={1} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-foreground uppercase tracking-[0.2em] text-sm">Empty Registry</p>
                        <p className="text-muted-foreground text-xs font-bold">No student records found matching this criteria.</p>
                      </div>
                      <Button variant="link" className="text-indigo-500 font-black uppercase tracking-widest text-[10px]" onClick={() => router.push(`/${tenantSlug}/${role}/admissions`)}>
                        Initialize First Record
                      </Button>
                    </motion.div>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence mode="popLayout">
                  {students.map((stu, idx) => (
                    <TableRow 
                      key={stu.id} 
                      onClick={() => handleRowClick(stu)}
                      className="group border-white/5 hover:bg-indigo-500/[0.03] transition-all duration-300 cursor-pointer"
                    >
                      <TableCell className="px-8 font-mono font-black text-muted-foreground/30 text-xs text-center">
                        {stu.admissionNumber}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/${tenantSlug}/${role}/students/${stu.id}`}
                          className="flex items-center gap-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-muted border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 overflow-hidden">
                            {stu.profileImage ? (
                              <img src={stu.profileImage} className="w-full h-full object-cover" alt={stu.name} />
                            ) : (
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stu.id}`} className="w-full h-full object-cover p-1" alt={stu.name} />
                            )}
                          </div>
                          <div>
                            <p className="font-black text-foreground text-base tracking-tight leading-none mb-1 group-hover:text-indigo-600 transition-colors uppercase">{stu.name}</p>
                            <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] flex items-center gap-1.5">
                              {stu.gender} <span className="w-1 h-1 rounded-full bg-muted-foreground/20" /> {stu.phone}
                            </p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <p className="font-black text-foreground/80 text-sm tracking-tight">{stu.classroom?.name || "UNASSIGNED"}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-500/80 uppercase tracking-widest">{stu.section?.name || "NONE"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-muted-foreground/70 text-sm uppercase italic">
                        {stu.fatherName}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "rounded-xl py-1 px-4 text-[10px] font-black uppercase tracking-[0.1em] border-none shadow-sm",
                          statusColor(stu.status)
                        )}>
                          {stu.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger 
                            className="inline-flex items-center justify-center h-10 w-10 p-0 rounded-xl hover:bg-indigo-500/10 transition-all cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-5 h-5 text-muted-foreground/40" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-2xl border-white/10 p-2 backdrop-blur-2xl shadow-2xl">
                            <DropdownMenuItem 
                              className="rounded-xl flex items-center gap-3 p-3 font-black text-[10px] uppercase tracking-widest cursor-pointer focus:bg-indigo-500 focus:text-white transition-all"
                              onClick={() => handleRowClick(stu)}
                            >
                              <Eye className="w-4 h-4" /> View Context
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 font-black text-[10px] uppercase tracking-widest cursor-pointer focus:bg-indigo-500 focus:text-white transition-all">
                              <Edit className="w-4 h-4" /> Modify Record
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 font-black text-[10px] uppercase tracking-widest text-rose-500 cursor-pointer focus:bg-rose-500 focus:text-white transition-all">
                              <Trash2 className="w-4 h-4" /> Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ═══ GLOSS INTERFACE FOOTER ═══ */}
        {totalPages > 1 && (
          <div className="p-8 border-t border-white/5 flex items-center justify-between bg-muted/10 backdrop-blur-sm">
            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.25em]">
              Showing <span className="text-foreground">{(page - 1) * 10 + 1}</span> – <span className="text-foreground">{Math.min(page * 10, total)}</span> of <span className="text-foreground">{total}</span> Manifestations
            </p>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="h-12 px-6 rounded-2xl border-white/5 font-black text-[10px] uppercase tracking-widest text-foreground hover:bg-white hover:text-black transition-all disabled:opacity-20 shadow-sm"
              >
                Previous
              </Button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <div key={p} className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500",
                    p === page ? "bg-indigo-500 w-6 shadow-[0_0_10px_rgba(79,70,229,0.5)]" : "bg-muted-foreground/20 hover:bg-muted-foreground/40 cursor-pointer"
                  )} onClick={() => setPage(p)} />
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="h-12 px-6 rounded-2xl border-white/5 font-black text-[10px] uppercase tracking-widest text-foreground hover:bg-white hover:text-black transition-all disabled:opacity-20 shadow-sm"
              >
                Forward
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
