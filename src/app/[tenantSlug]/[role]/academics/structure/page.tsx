"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Layers,
  Plus,
  Trash2,
  Loader2,
  Clock,
  LayoutGrid,
  Sparkles,
  GraduationCap,
  Hash,
  FileText,
  Calendar,
  X,
  ChevronRight,
  Zap,
  FileSpreadsheet,
  GitBranchPlus,
  Settings2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────

interface Program {
  id: string
  name: string
  code: string | null
  description: string | null
  batches: Batch[]
}

interface Batch {
  id: string
  name: string
  program?: { id: string; name: string }
  academicYear?: { id: string; label: string }
}

// ─── Component ─────────────────────────────

export default function AcademicStructurePage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string

  const [programs, setPrograms] = useState<Program[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"programs" | "batches">("programs")

  // Modals
  const [showNewProgram, setShowNewProgram] = useState(false)
  const [showNewBatch, setShowNewBatch] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Forms
  const [programForm, setProgramForm] = useState({ name: "", code: "", description: "" })
  const [batchForm, setBatchForm] = useState({ name: "", programId: "", academicYearId: "" })

  // ─── Data Loading ─────────────────────────
  const fetchData = async () => {
    setLoading(true)
    try {
      const [progRes, batchRes] = await Promise.all([
        fetch("/api/programs"),
        fetch("/api/batches"),
      ])
      setPrograms(await progRes.json())
      setBatches(await batchRes.json())
    } catch (e) {
      console.error("Failed to fetch academic structure:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // ─── Create Program ───────────────────────
  const handleCreateProgram = async () => {
    if (!programForm.name) return
    setSubmitting(true)
    try {
      await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(programForm),
      })
      setShowNewProgram(false)
      setProgramForm({ name: "", code: "", description: "" })
      fetchData()
    } catch (e) {
      console.error("Create failed:", e)
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Create Batch ─────────────────────────
  const handleCreateBatch = async () => {
    if (!batchForm.name || !batchForm.programId) return
    setSubmitting(true)
    try {
      await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batchForm),
      })
      setShowNewBatch(false)
      setBatchForm({ name: "", programId: "", academicYearId: "" })
      fetchData()
    } catch (e) {
      console.error("Create failed:", e)
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Delete ───────────────────────────────
  const handleDelete = async (type: "programs" | "batches", id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return
    try {
      await fetch(`/api/${type}?id=${id}`, { method: "DELETE" })
      fetchData()
    } catch (e) {
      console.error("Delete failed:", e)
    }
  }

  const tabs = [
    { id: "programs" as const, label: "Programs", icon: BookOpen, count: programs.length },
    { id: "batches" as const, label: "Batches", icon: Layers, count: batches.length },
  ]

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* ─── Command Header ─────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-widest">
              Architecture Active
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              <Clock className="w-3 h-3" />
              Structure Config
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight dark:text-white leading-[1.1]">
            Academic <span className="text-violet-600">Structure</span>
          </h1>
          <p className="text-muted-foreground font-semibold mt-3 text-lg">
            Program &amp; batch architecture for {tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)} Academy.
          </p>
        </div>

        <Button
          onClick={() => activeTab === "programs" ? setShowNewProgram(true) : setShowNewBatch(true)}
          className="h-14 px-8 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-violet-600/20 transition-all hover:scale-105 active:scale-95 gap-2"
        >
          <Plus className="w-4 h-4" />
          New {activeTab === "programs" ? "Program" : "Batch"}
        </Button>
      </div>

      {/* ─── Stats ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Programs" value={programs.length} icon={BookOpen} variant="violet" index={0} description="Active academic programs" />
        <StatCard label="Batches" value={batches.length} icon={Layers} variant="purple" index={1} description="Student batch groups" />
        <StatCard label="Active Ratio" value={programs.length > 0 ? `${(batches.length / programs.length).toFixed(1)}x` : "0x"} icon={Zap} variant="blue" index={2} description="Batches per program average" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-[2rem] border-violet-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-black">
              <Settings2 className="h-5 w-5 text-violet-600" />
              Manage Structure
            </CardTitle>
            <CardDescription>
              Full admin control to create, edit, and delete Classes, Streams, and Sections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${tenantSlug}/${params.role as string}/academics/structure/manage`} className={buttonVariants({ className: "rounded-2xl font-black w-full" })}>
              <Settings2 className="h-4 w-4 mr-2" />
              Open Management
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-violet-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-black">
              <GitBranchPlus className="h-5 w-5 text-violet-600" />
              Class & Stream Setup
            </CardTitle>
            <CardDescription>
              Operator-facing setup flow for manual class creation and migration-time bulk intake.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${tenantSlug}/${params.role as string}/academics/structure/classes`} className={buttonVariants({ variant: "outline", className: "rounded-2xl font-black w-full" })}>
              Open Class Operations
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-blue-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-black">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              Migration Flow
            </CardTitle>
            <CardDescription>
              Recommended order for live school handover: structure first, students next, transactional data after that.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm font-semibold text-slate-600">
            <div>1. Classes and sections</div>
            <div>2. Student bulk import and mapping</div>
            <div>3. Fees, attendance, and exam history</div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Tab Switcher ───────────────────── */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const TabIcon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border",
                isActive
                  ? "bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-600/20"
                  : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
              )}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
              <span className={cn(
                "px-2 py-0.5 rounded-lg text-[9px] font-black",
                isActive ? "bg-white/20" : "bg-muted"
              )}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── Main Content ───────────────────── */}
      <Card variant="glass" className="border-violet-500/5 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <LayoutGrid className="w-40 h-40 scale-150 rotate-12" />
        </div>

        <CardHeader className="p-8 border-b border-violet-500/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/10">
              {activeTab === "programs" ? <BookOpen className="w-6 h-6 text-violet-600" /> : <Layers className="w-6 h-6 text-violet-600" />}
            </div>
            <div>
              <CardTitle className="text-2xl font-black tracking-tight">
                {activeTab === "programs" ? "Program Registry" : "Batch Directory"}
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                {activeTab === "programs"
                  ? "Academic programs (streams) offered by your institution"
                  : "Student batch groups organized by program and academic year"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : activeTab === "programs" ? (
            /* ─── Programs View ─────────────── */
            programs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center mb-6">
                  <BookOpen className="w-10 h-10 text-violet-400" />
                </div>
                <h3 className="text-xl font-black dark:text-white mb-2">No Programs Configured</h3>
                <p className="text-muted-foreground font-medium text-sm max-w-md">
                  Create your first academic program to organize classes, sections, and batches.
                </p>
                <Button onClick={() => setShowNewProgram(true)} className="mt-6 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold gap-2">
                  <Plus className="w-4 h-4" /> Create Program
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                {programs.map((prog, idx) => (
                  <motion.div
                    key={prog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                    <div className="relative p-6 rounded-[2rem] bg-white/60 dark:bg-zinc-900/60 border border-violet-500/10 backdrop-blur-xl hover:border-violet-500/20 transition-all">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <button
                          onClick={() => handleDelete("programs", prog.id)}
                          className="p-2 rounded-xl text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-black dark:text-white mb-1 tracking-tight">{prog.name}</h3>
                      {prog.code && (
                        <div className="flex items-center gap-1.5 mb-3">
                          <Hash className="w-3 h-3 text-violet-500" />
                          <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest font-mono">{prog.code}</span>
                        </div>
                      )}
                      {prog.description && (
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-4 line-clamp-2">{prog.description}</p>
                      )}

                      {/* Batch Count */}
                      <div className="flex items-center justify-between pt-4 border-t border-violet-500/5">
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-violet-500" />
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {prog.batches?.length || 0} Batch{(prog.batches?.length || 0) !== 1 ? "es" : ""}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-violet-500 transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            /* ─── Batches View ──────────────── */
            batches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center mb-6">
                  <Layers className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-black dark:text-white mb-2">No Batches Created</h3>
                <p className="text-muted-foreground font-medium text-sm max-w-md">
                  Create batches under programs to group students by academic year.
                </p>
                <Button onClick={() => setShowNewBatch(true)} className="mt-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2">
                  <Plus className="w-4 h-4" /> Create Batch
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-violet-500/5">
                {batches.map((batch, idx) => (
                  <motion.div
                    key={batch.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center gap-6 px-8 py-5 hover:bg-violet-50/50 dark:hover:bg-violet-500/5 transition-all group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-purple-500/20 shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-black dark:text-white">{batch.name}</span>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium mt-0.5">
                        {batch.program && (
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {batch.program.name}</span>
                        )}
                        {batch.academicYear && (
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {batch.academicYear.label}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete("batches", batch.id)}
                      className="p-2 rounded-xl text-muted-foreground/20 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════ */}
      {/* NEW PROGRAM MODAL                       */}
      {/* ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showNewProgram && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowNewProgram(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-violet-500/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-violet-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black dark:text-white">New Program</h2>
                      <p className="text-sm text-muted-foreground font-medium">Define an academic program or stream</p>
                    </div>
                  </div>
                  <button onClick={() => setShowNewProgram(false)} className="p-2 rounded-xl hover:bg-muted/50"><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-900/60 dark:text-violet-400/60">Program Name</Label>
                  <Input value={programForm.name} onChange={(e) => setProgramForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Science Stream" className="h-14 bg-muted/30 border-none rounded-2xl font-black text-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-900/60 dark:text-violet-400/60">Program Code</Label>
                  <Input value={programForm.code} onChange={(e) => setProgramForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. SCI" className="h-12 bg-muted/30 border-none rounded-2xl font-mono font-bold tracking-widest" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-900/60 dark:text-violet-400/60">Description</Label>
                  <Textarea value={programForm.description} onChange={(e) => setProgramForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief program overview..." rows={3} className="bg-muted/30 border-none rounded-2xl font-bold p-4" />
                </div>
              </div>

              <div className="p-8 border-t border-violet-500/5 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowNewProgram(false)} className="rounded-2xl font-bold">Cancel</Button>
                <Button
                  onClick={handleCreateProgram}
                  disabled={submitting || !programForm.name}
                  className="rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black px-8 shadow-xl shadow-violet-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Create Program
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════ */}
      {/* NEW BATCH MODAL                         */}
      {/* ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showNewBatch && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowNewBatch(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-violet-500/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-violet-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                      <Layers className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black dark:text-white">New Batch</h2>
                      <p className="text-sm text-muted-foreground font-medium">Create a student batch group</p>
                    </div>
                  </div>
                  <button onClick={() => setShowNewBatch(false)} className="p-2 rounded-xl hover:bg-muted/50"><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-900/60 dark:text-violet-400/60">Batch Name</Label>
                  <Input value={batchForm.name} onChange={(e) => setBatchForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. 2024-25 Batch A" className="h-14 bg-muted/30 border-none rounded-2xl font-black text-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-900/60 dark:text-violet-400/60">Program</Label>
                  <Select value={batchForm.programId} onValueChange={(v) => setBatchForm(f => ({ ...f, programId: v ?? "" }))}>
                    <SelectTrigger className="h-12 bg-muted/30 border-none rounded-2xl font-bold"><SelectValue placeholder="Select program..." /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {programs.map(p => (<SelectItem key={p.id} value={p.id} className="font-bold">{p.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-8 border-t border-violet-500/5 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowNewBatch(false)} className="rounded-2xl font-bold">Cancel</Button>
                <Button
                  onClick={handleCreateBatch}
                  disabled={submitting || !batchForm.name || !batchForm.programId}
                  className="rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black px-8 shadow-xl shadow-purple-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Create Batch
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
