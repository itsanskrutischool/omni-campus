"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Phone,
  UserPlus,
  Users,
  PhoneCall,
  MapPin,
  GraduationCap,
  XCircle,
  Clock,
  Search,
  Plus,
  MessageSquare,
  CalendarDays,
  ArrowRight,
  Loader2,
  Sparkles,
  Eye,
  ChevronDown,
  LayoutGrid,
  Zap,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────

interface Enquiry {
  id: string
  enquiryNo: string
  studentName: string
  parentName: string
  phone: string
  email: string | null
  source: string | null
  status: string
  date: string
  lastFollowUp: string | null
  nextFollowUp: string | null
  notes: string | null
  assignedTo: { id: string; name: string } | null
  followUps: { id: string; date: string; status: string; notes: string | null; staff: { name: string } }[]
}

interface Stats {
  total: number
  open: number
  called: number
  visited: number
  admitted: number
  closed: number
}

const STATUS_OPTIONS = ["ALL", "OPEN", "CALLED", "VISITED", "ADMISSION_TAKEN", "CLOSED"]
const SOURCE_OPTIONS = ["Walk-in", "Website", "Referral", "Advertisement", "Social Media", "Phone Call", "Other"]
const FOLLOW_UP_OUTCOMES = ["Called", "Not Reachable", "Interested", "Not Interested", "Callback Requested", "Visited Campus", "Documents Pending"]

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  OPEN: { bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" },
  CALLED: { bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
  VISITED: { bg: "bg-purple-500/10", text: "text-purple-600", dot: "bg-purple-500" },
  ADMISSION_TAKEN: { bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
  CLOSED: { bg: "bg-zinc-500/10", text: "text-zinc-500", dot: "bg-zinc-400" },
}

// ─── Component ─────────────────────────────

export default function ReceptionCRMPage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string

  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, open: 0, called: 0, visited: 0, admitted: 0, closed: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [search, setSearch] = useState("")

  // Modals
  const [showNewEnquiry, setShowNewEnquiry] = useState(false)
  const [showDetail, setShowDetail] = useState<Enquiry | null>(null)
  const [showFollowUp, setShowFollowUp] = useState(false)

  // New enquiry form
  const [newForm, setNewForm] = useState({
    studentName: "", parentName: "", phone: "", email: "", source: "", notes: "",
  })
  const [submitting, setSubmitting] = useState(false)

  // Follow-up form
  const [followUpForm, setFollowUpForm] = useState({
    status: "", notes: "", nextFollowUp: "",
  })

  // ─── Data Loading ─────────────────────────
  const fetchData = async () => {
    setLoading(true)
    try {
      const [enqRes, statsRes] = await Promise.all([
        fetch(`/api/enquiries?status=${statusFilter}&search=${search}`),
        fetch("/api/enquiries?stats=true"),
      ])
      const enqData = await enqRes.json()
      const statsData = await statsRes.json()
      setEnquiries(enqData.enquiries || [])
      setStats(statsData)
    } catch (e) {
      console.error("Failed to fetch enquiries:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [statusFilter, search])

  // ─── Create Enquiry ───────────────────────
  const handleCreateEnquiry = async () => {
    if (!newForm.studentName || !newForm.parentName || !newForm.phone) return
    setSubmitting(true)
    try {
      await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      })
      setShowNewEnquiry(false)
      setNewForm({ studentName: "", parentName: "", phone: "", email: "", source: "", notes: "" })
      fetchData()
    } catch (e) {
      console.error("Create failed:", e)
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Add Follow-Up ───────────────────────
  const handleAddFollowUp = async () => {
    if (!showDetail || !followUpForm.status) return
    setSubmitting(true)
    try {
      await fetch(`/api/enquiries/${showDetail.id}/follow-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(followUpForm),
      })
      setShowFollowUp(false)
      setFollowUpForm({ status: "", notes: "", nextFollowUp: "" })
      // Refresh detail
      const res = await fetch(`/api/enquiries/${showDetail.id}`)
      const updated = await res.json()
      setShowDetail(updated)
      fetchData()
    } catch (e) {
      console.error("Follow-up failed:", e)
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Update Status ────────────────────────
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchData()
      if (showDetail?.id === id) {
        setShowDetail((prev) => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (e) {
      console.error("Status update failed:", e)
    }
  }

  const formatDate = (d: string | null) => {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  }

  const formatRelative = (d: string | null) => {
    if (!d) return null
    const diff = Math.floor((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return "Today"
    if (diff === 1) return "Tomorrow"
    if (diff === -1) return "Yesterday"
    if (diff < -1) return `${Math.abs(diff)}d ago`
    return `In ${diff}d`
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* ─── Command Header ─────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
              CRM Operational
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              <Clock className="w-3 h-3" />
              Live Pipeline
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight dark:text-white leading-[1.1]">
            Reception <span className="text-blue-600">Hub</span>
          </h1>
          <p className="text-muted-foreground font-semibold mt-3 text-lg">
            Enquiry pipeline management for {tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)} Academy.
          </p>
        </div>

        <Button
          onClick={() => setShowNewEnquiry(true)}
          className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 gap-2"
        >
          <Plus className="w-4 h-4" />
          New Enquiry
        </Button>
      </div>

      {/* ─── Strategic Metrics ──────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Leads", value: stats.total, icon: Users, variant: "blue" as const },
          { label: "Open", value: stats.open, icon: Clock, variant: "blue" as const },
          { label: "Called", value: stats.called, icon: PhoneCall, variant: "amber" as const },
          { label: "Visited", value: stats.visited, icon: MapPin, variant: "purple" as const },
          { label: "Admitted", value: stats.admitted, icon: GraduationCap, variant: "emerald" as const },
          { label: "Closed", value: stats.closed, icon: XCircle, variant: "rose" as const },
        ].map((s, i) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} variant={s.variant} index={i} />
        ))}
      </div>

      {/* ─── Filter Bar ─────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or enquiry no..."
            className="pl-11 h-12 bg-muted/30 border-none rounded-2xl font-bold"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                statusFilter === s
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                  : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
              )}
            >
              {s === "ALL" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Enquiry Pipeline Table ──────────── */}
      <Card variant="glass" className="border-blue-500/5 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <LayoutGrid className="w-40 h-40 scale-150 rotate-12" />
        </div>

        <CardHeader className="p-8 border-b border-blue-500/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black tracking-tight">Enquiry Pipeline</CardTitle>
              <CardDescription className="text-sm font-medium">
                {enquiries.length} record{enquiries.length !== 1 ? "s" : ""} in current view
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : enquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-6">
                <Phone className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-black dark:text-white mb-2">No Enquiries Found</h3>
              <p className="text-muted-foreground font-medium text-sm max-w-md">
                {search || statusFilter !== "ALL"
                  ? "Try adjusting your filters or search term."
                  : "Start by creating your first enquiry to build the pipeline."}
              </p>
              {!search && statusFilter === "ALL" && (
                <Button
                  onClick={() => setShowNewEnquiry(true)}
                  className="mt-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
                >
                  <Plus className="w-4 h-4" /> Create First Enquiry
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-blue-500/5">
              {enquiries.map((enq, idx) => {
                const sc = STATUS_COLORS[enq.status] || STATUS_COLORS.OPEN
                const nextRel = formatRelative(enq.nextFollowUp)
                return (
                  <motion.div
                    key={enq.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center gap-6 px-8 py-5 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all cursor-pointer group"
                    onClick={() => {
                      fetch(`/api/enquiries/${enq.id}`).then(r => r.json()).then(setShowDetail)
                    }}
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-blue-500/20 shrink-0">
                      {enq.studentName.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-black dark:text-white truncate">{enq.studentName}</span>
                        <span className="text-[10px] font-bold text-muted-foreground font-mono">{enq.enquiryNo}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {enq.parentName}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {enq.phone}</span>
                        {enq.source && <span className="text-muted-foreground/50">{enq.source}</span>}
                      </div>
                    </div>

                    {/* Next Follow-up */}
                    {nextRel && (
                      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/10 text-amber-600 text-[10px] font-black shrink-0">
                        <CalendarDays className="w-3 h-3" />
                        {nextRel}
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className={cn("px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0", sc.bg, sc.text)}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
                      {enq.status.replace("_", " ")}
                    </div>

                    {/* Date */}
                    <span className="hidden lg:block text-[10px] font-bold text-muted-foreground/40 shrink-0 w-20 text-right">
                      {formatDate(enq.date)}
                    </span>

                    <ArrowRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-blue-500 transition-colors shrink-0" />
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════ */}
      {/* NEW ENQUIRY MODAL                       */}
      {/* ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showNewEnquiry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowNewEnquiry(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-blue-500/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-blue-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black dark:text-white">New Enquiry</h2>
                      <p className="text-sm text-muted-foreground font-medium">Register a new prospective lead</p>
                    </div>
                  </div>
                  <button onClick={() => setShowNewEnquiry(false)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900/60 dark:text-blue-400/60">Student Name</Label>
                    <Input value={newForm.studentName} onChange={(e) => setNewForm(f => ({ ...f, studentName: e.target.value }))} placeholder="e.g. ARJUN KAPOOR" className="h-12 bg-muted/30 border-none rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900/60 dark:text-blue-400/60">Parent Name</Label>
                    <Input value={newForm.parentName} onChange={(e) => setNewForm(f => ({ ...f, parentName: e.target.value }))} placeholder="Father or Mother" className="h-12 bg-muted/30 border-none rounded-2xl font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900/60 dark:text-blue-400/60">Phone</Label>
                    <Input value={newForm.phone} onChange={(e) => setNewForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91-XXXXXXXXXX" className="h-12 bg-muted/30 border-none rounded-2xl font-bold tracking-widest" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900/60 dark:text-blue-400/60">Email (Optional)</Label>
                    <Input value={newForm.email} onChange={(e) => setNewForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className="h-12 bg-muted/30 border-none rounded-2xl font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900/60 dark:text-blue-400/60">Lead Source</Label>
                  <Select value={newForm.source} onValueChange={(v) => setNewForm(f => ({ ...f, source: v || "" }))}>
                    <SelectTrigger className="h-12 bg-muted/30 border-none rounded-2xl font-bold"><SelectValue placeholder="How did they find us?" /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {SOURCE_OPTIONS.map(s => (<SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900/60 dark:text-blue-400/60">Notes</Label>
                  <Textarea value={newForm.notes} onChange={(e) => setNewForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any initial remarks..." rows={3} className="bg-muted/30 border-none rounded-2xl font-bold p-4" />
                </div>
              </div>

              <div className="p-8 border-t border-blue-500/5 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowNewEnquiry(false)} className="rounded-2xl font-bold">Cancel</Button>
                <Button
                  onClick={handleCreateEnquiry}
                  disabled={submitting || !newForm.studentName || !newForm.parentName || !newForm.phone}
                  className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black px-8 shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Create Enquiry
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════ */}
      {/* ENQUIRY DETAIL SLIDE-OVER               */}
      {/* ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetail(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 shadow-2xl h-full overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Detail Header */}
              <div className="sticky top-0 z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-blue-500/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest font-mono">{showDetail.enquiryNo}</span>
                  <button onClick={() => setShowDetail(null)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <h2 className="text-2xl font-black dark:text-white mb-1">{showDetail.studentName}</h2>
                <p className="text-sm text-muted-foreground font-medium">{showDetail.parentName} · {showDetail.phone}</p>
                
                {/* Status selector */}
                <div className="mt-4">
                  <Select value={showDetail.status} onValueChange={(v) => handleStatusChange(showDetail.id, v || "")}>
                    <SelectTrigger className="h-10 rounded-xl font-black text-xs border-blue-500/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {STATUS_OPTIONS.filter(s => s !== "ALL").map(s => (
                        <SelectItem key={s} value={s} className="font-bold text-xs">{s.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Detail Body */}
              <div className="p-6 space-y-8">
                {/* Meta */}
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Date", value: formatDate(showDetail.date) },
                    { label: "Source", value: showDetail.source || "—" },
                    { label: "Last Follow-Up", value: formatDate(showDetail.lastFollowUp) },
                    { label: "Next Follow-Up", value: showDetail.nextFollowUp ? `${formatDate(showDetail.nextFollowUp)} (${formatRelative(showDetail.nextFollowUp)})` : "—" },
                  ].map(f => (
                    <div key={f.label}>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{f.label}</p>
                      <p className="text-sm font-bold dark:text-white">{f.value}</p>
                    </div>
                  ))}
                </div>

                {showDetail.notes && (
                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-500/10">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">Notes</p>
                    <p className="text-sm font-medium dark:text-white leading-relaxed">{showDetail.notes}</p>
                  </div>
                )}

                {/* Add Follow-Up Button */}
                <Button
                  onClick={() => setShowFollowUp(!showFollowUp)}
                  variant="outline"
                  className="w-full rounded-2xl h-12 font-black text-xs uppercase tracking-widest border-blue-500/20 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/5 gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {showFollowUp ? "Cancel Follow-Up" : "Log Follow-Up"}
                </Button>

                {/* Follow-Up Form */}
                <AnimatePresence>
                  {showFollowUp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 p-6 rounded-2xl bg-muted/20 border border-blue-500/5">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900/60 dark:text-blue-400/60">Outcome</Label>
                          <Select value={followUpForm.status} onValueChange={(v) => setFollowUpForm(f => ({ ...f, status: v || "" }))}>
                            <SelectTrigger className="h-11 bg-white dark:bg-zinc-800 border-none rounded-xl font-bold"><SelectValue placeholder="Select outcome..." /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {FOLLOW_UP_OUTCOMES.map(o => (<SelectItem key={o} value={o} className="font-bold">{o}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900/60 dark:text-blue-400/60">Remarks</Label>
                          <Textarea value={followUpForm.notes} onChange={(e) => setFollowUpForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="bg-white dark:bg-zinc-800 border-none rounded-xl font-bold p-3" placeholder="Call details..." />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900/60 dark:text-blue-400/60">Next Follow-Up</Label>
                          <Input type="date" value={followUpForm.nextFollowUp} onChange={(e) => setFollowUpForm(f => ({ ...f, nextFollowUp: e.target.value }))} className="h-11 bg-white dark:bg-zinc-800 border-none rounded-xl font-bold" />
                        </div>
                        <Button
                          onClick={handleAddFollowUp}
                          disabled={submitting || !followUpForm.status}
                          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black h-11"
                        >
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Submit Follow-Up
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Follow-Up Timeline */}
                <div>
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 pl-2 border-l-4 border-blue-600">
                    Activity Timeline
                  </h3>
                  {(!showDetail.followUps || showDetail.followUps.length === 0) ? (
                    <p className="text-sm text-muted-foreground font-medium pl-6">No follow-ups logged yet.</p>
                  ) : (
                    <div className="space-y-0 pl-4">
                      {showDetail.followUps.map((fu, i) => (
                        <div key={fu.id} className="relative pl-6 pb-6 border-l-2 border-blue-500/10 last:border-transparent">
                          <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-zinc-900" />
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black dark:text-white">{fu.status}</span>
                            <span className="text-[9px] text-muted-foreground font-bold">{formatDate(fu.date)}</span>
                          </div>
                          {fu.notes && <p className="text-xs text-muted-foreground font-medium">{fu.notes}</p>}
                          {fu.staff && <p className="text-[9px] text-muted-foreground/50 font-bold mt-1">— {fu.staff.name}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
