"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Heart,
  Activity,
  Pill,
  ShieldAlert,
  Syringe,
  Search,
  Plus,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Thermometer,
  Stethoscope,
  TrendingUp,
  X
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

interface HealthRecord {
  id: string
  studentId: string
  type: string
  date: string
  title: string
  description: string | null
  severity: string | null
  diagnosedBy: string | null
  treatment: string | null
  medication: string | null
  dosage: string | null
  followUpDate: string | null
  status: string
  notes: string | null
  student: { name: string; admissionNumber: string; classroom: { name: string } | null }
}

interface Analytics {
  totalRecords: number
  activeRecords: number
  byType: { type: string; _count: { _all: number } }[]
  bySeverity: { severity: string; _count: { _all: number } }[]
  recentVisits: HealthRecord[]
  topMeds: { medication: string; count: number }[]
}

export default function HealthPage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  const [activeTab, setActiveTab] = useState<"records" | "visits" | "allergies">("records")
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState({
    studentId: "", type: "VISIT", title: "", description: "",
    severity: "LOW", diagnosedBy: "", treatment: "", medication: "",
    dosage: "", followUpDate: "", notes: "",
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [recordsRes, analyticsRes] = await Promise.all([
        fetch(`/api/health?type=${typeFilter !== "ALL" ? typeFilter : ""}&status=${statusFilter !== "ALL" ? statusFilter : ""}&search=${encodeURIComponent(search)}`),
        fetch(`/api/health?analytics=true`),
      ])
      if (recordsRes.ok) setRecords((await recordsRes.json()).records || [])
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
    } catch (err) {
      console.error("Health fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAdd = async () => {
    try {
      const res = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...form, followUpDate: form.followUpDate || undefined }),
      })
      if (res.ok) {
        setIsAddOpen(false)
        setForm({ studentId: "", type: "VISIT", title: "", description: "", severity: "LOW", diagnosedBy: "", treatment: "", medication: "", dosage: "", followUpDate: "", notes: "" })
        fetchData()
      }
    } catch (err) { console.error(err) }
  }

  const handleStatusChange = async (recordId: string, status: string) => {
    try {
      await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", recordId, status }),
      })
      fetchData()
    } catch (err) { console.error(err) }
  }

  const filteredRecords = records.filter(r => {
    if (activeTab === "visits") return r.type === "VISIT"
    if (activeTab === "allergies") return r.type === "ALLERGY"
    return true
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ALLERGY": return <ShieldAlert className="w-4 h-4 text-rose-500" />
      case "VACCINATION": return <Syringe className="w-4 h-4 text-blue-500" />
      case "VISIT": return <Stethoscope className="w-4 h-4 text-emerald-500" />
      case "MEDICATION": return <Pill className="w-4 h-4 text-amber-500" />
      case "INCIDENT": return <AlertTriangle className="w-4 h-4 text-red-500" />
      default: return <Activity className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getSeverityColor = (s: string) => {
    switch (s) {
      case "CRITICAL": return "bg-red-500/10 text-red-600 border-red-500/20"
      case "HIGH": return "bg-orange-500/10 text-orange-600 border-orange-500/20"
      case "MEDIUM": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      default: return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-4">
          <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-black uppercase tracking-widest inline-block">Infirmary</div>
          <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">Health <span className="text-rose-600">Records</span></h1>
          <p className="text-muted-foreground font-semibold max-w-xl text-lg">Student health monitoring: allergies, vaccinations, infirmary visits, and medication tracking.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="h-14 px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-600/20">
          <Plus className="w-4 h-4 mr-3" /> Add Record
        </Button>
      </div>

      {/* Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
          <StatCard label="Total Records" value={analytics.totalRecords.toString()} icon={Heart} description="All health records" variant="rose" />
          <StatCard label="Active Cases" value={analytics.activeRecords.toString()} icon={Activity} description="Currently active" variant="amber" />
          <StatCard label="Allergies" value={(analytics.byType.find(t => t.type === "ALLERGY")?._count._all || 0).toString()} icon={ShieldAlert} description="Documented allergies" variant="rose" />
          <StatCard label="Vaccinations" value={(analytics.byType.find(t => t.type === "VACCINATION")?._count._all || 0).toString()} icon={Syringe} description="Vaccination records" variant="blue" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 px-2">
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl">
          {(["records", "visits", "allergies"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-widest transition-all", activeTab === tab ? "bg-white dark:bg-zinc-800 text-rose-900 dark:text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {tab === "records" ? "All Records" : tab === "visits" ? "Infirmary Visits" : "Allergies"}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-2">
        <div className="relative w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
          <Input placeholder="Search records..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 pl-12 bg-muted/50 border-none rounded-2xl font-bold" />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { if (v) setTypeFilter(v) }}>
          <SelectTrigger className="h-12 w-44 rounded-2xl font-bold bg-muted/50 border-none"><div className="flex items-center gap-2"><Filter className="w-4 h-4 text-rose-500" /><SelectValue /></div></SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="ALLERGY">Allergy</SelectItem>
            <SelectItem value="VACCINATION">Vaccination</SelectItem>
            <SelectItem value="VISIT">Infirmary Visit</SelectItem>
            <SelectItem value="MEDICATION">Medication</SelectItem>
            <SelectItem value="INCIDENT">Incident</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { if (v) setStatusFilter(v) }}>
          <SelectTrigger className="h-12 w-44 rounded-2xl font-bold bg-muted/50 border-none"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CHRONIC">Chronic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records Table */}
      <Card className="border-rose-500/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-rose-500/[0.02] border-none">
                <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-rose-800 dark:text-rose-400">Student</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-rose-800 dark:text-rose-400">Type</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-rose-800 dark:text-rose-400">Title</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-rose-800 dark:text-rose-400">Severity</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-rose-800 dark:text-rose-400">Date</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-rose-800 dark:text-rose-400">Status</TableHead>
                <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-rose-800 dark:text-rose-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow className="border-none"><TableCell colSpan={7} className="py-32 text-center text-muted-foreground font-bold">No health records found.</TableCell></TableRow>
              ) : (
                filteredRecords.map((r) => (
                  <TableRow key={r.id} className="group/row hover:bg-rose-500/[0.02] transition-all border-b border-rose-500/5">
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-rose-500/10 flex items-center justify-center shadow-sm">{getTypeIcon(r.type)}</div>
                        <div>
                          <p className="font-black text-sm tracking-tight">{r.student.name}</p>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{r.student.admissionNumber} · {r.student.classroom?.name || "N/A"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="rounded-xl font-bold text-[10px] uppercase">{r.type}</Badge></TableCell>
                    <TableCell className="text-sm font-bold max-w-[200px] truncate">{r.title}</TableCell>
                    <TableCell>
                      {r.severity && <Badge className={cn("rounded-xl font-black text-[10px] uppercase tracking-widest", getSeverityColor(r.severity))}>{r.severity}</Badge>}
                    </TableCell>
                    <TableCell className="text-sm font-bold">{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-xl font-black text-[10px] uppercase tracking-widest",
                        r.status === "ACTIVE" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                          r.status === "RESOLVED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                            "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      )}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      {r.status === "ACTIVE" && (
                        <Button onClick={() => handleStatusChange(r.id, "RESOLVED")} variant="outline" size="sm" className="rounded-xl border-emerald-500/10 hover:bg-emerald-500/10 hover:text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Top Medications */}
      {analytics?.topMeds && analytics.topMeds.length > 0 && (
        <Card className="border-rose-500/5 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-2"><Pill className="w-5 h-5 text-amber-500" /> Common Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {analytics.topMeds.map((med, i) => (
                <div key={i} className="p-4 bg-muted/50 rounded-2xl text-center">
                  <p className="font-black text-lg text-amber-600">{med.count}</p>
                  <p className="text-xs font-bold text-muted-foreground mt-1">{med.medication}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Record Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader><DialogTitle>Add Health Record</DialogTitle><DialogDescription>Record a new health event for a student.</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div><Label>Student ID *</Label><Input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="rounded-xl mt-1" placeholder="Admission number" /></div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => { if (v) setForm({ ...form, type: v }) }}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="VISIT">Infirmary Visit</SelectItem>
                  <SelectItem value="ALLERGY">Allergy</SelectItem>
                  <SelectItem value="VACCINATION">Vaccination</SelectItem>
                  <SelectItem value="MEDICATION">Medication</SelectItem>
                  <SelectItem value="INCIDENT">Incident</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl mt-1" /></div>
            <div className="col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl mt-1" rows={3} /></div>
            <div>
              <Label>Severity</Label>
              <Select value={form.severity} onValueChange={(v) => { if (v) setForm({ ...form, severity: v }) }}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Diagnosed By</Label><Input value={form.diagnosedBy} onChange={(e) => setForm({ ...form, diagnosedBy: e.target.value })} className="rounded-xl mt-1" /></div>
            <div><Label>Medication</Label><Input value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })} className="rounded-xl mt-1" /></div>
            <div><Label>Dosage</Label><Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} className="rounded-xl mt-1" /></div>
            <div><Label>Follow-Up Date</Label><Input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} className="rounded-xl mt-1" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl mt-1" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleAdd} className="rounded-xl font-bold">Add Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
