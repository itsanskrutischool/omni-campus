"use client"

import { useState, useCallback } from "react"
import {
  FileText,
  BarChart3,
  Download,
  Calendar,
  IndianRupee,
  Users,
  TrendingUp,
  Clock,
  ShieldAlert,
  Filter,
  Search,
  LayoutGrid,
  ChevronRight,
  Loader2,
  BookOpen,
  Heart,
  Briefcase,
  Bus,
  Receipt,
  GraduationCap,
  PhoneCall,
  X,
  ArrowLeft,
  Eye,
  FileDown,
  CalendarDays,
  ChevronsUpDown,
  Table as TableIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────

type ReportModule =
  | "fees"
  | "attendance"
  | "academics"
  | "library"
  | "health"
  | "hr"
  | "transport"
  | "vouchers"
  | "students"
  | "enquiries"

type ViewMode = "catalog" | "builder" | "drilldown"

interface ReportResult {
  title: string
  module: ReportModule
  generatedAt: string
  rowCount: number
  columns: string[]
  data: Record<string, string | number | null>[]
  summary?: Record<string, string | number>
}

interface DrillDownFee {
  student: any
  records: any[]
  summary: { totalDue: number; totalPaid: number; totalWaiver: number; outstanding: number }
}

interface DrillDownAttendance {
  student: any
  records: { date: string; status: string; remarks: string | null }[]
  summary: { totalDays: number; present: number; absent: number; attendanceRate: string }
}

interface DrillDownAcademics {
  student: any
  examGroups: {
    exam: { name: string; type: string; term: number }
    subjects: any[]
    totalMarks: number
    totalMaxMarks: number
    percentage: string
  }[]
}

type DrillDownResult = DrillDownFee | DrillDownAttendance | DrillDownAcademics

// ─── Module Config ───────────────────────────────────────────────────

const MODULE_CONFIG: Record<
  ReportModule,
  { label: string; icon: any; variant: string; description: string }
> = {
  fees: { label: "Fees", icon: IndianRupee, variant: "emerald", description: "Fee collection, defaulters, ledgers" },
  attendance: { label: "Attendance", icon: CalendarDays, variant: "blue", description: "Daily attendance, absentee trends" },
  academics: { label: "Academics", icon: GraduationCap, variant: "indigo", description: "Exam results, grade distributions" },
  library: { label: "Library", icon: BookOpen, variant: "amber", description: "Book issues, overdue, fines" },
  health: { label: "Health", icon: Heart, variant: "red", description: "Medical records, visits" },
  hr: { label: "HR / Staff", icon: Briefcase, variant: "pink", description: "Staff directory, payroll summary" },
  transport: { label: "Transport", icon: Bus, variant: "blue", description: "Route logistics, vehicle data" },
  vouchers: { label: "Vouchers", icon: Receipt, variant: "amber", description: "Petty cash, expenses" },
  students: { label: "Students", icon: Users, variant: "emerald", description: "Student directory, demographics" },
  enquiries: { label: "Enquiries", icon: PhoneCall, variant: "indigo", description: "Admission enquiries, follow-ups" },
}

const REPORT_GROUPS = [
  {
    title: "Operational Intelligence",
    description: "Daily snapshots of campus performance",
    reports: [
      { id: "daily-attendance", name: "Daily Attendance Matrix", icon: Users, variant: "blue", size: "1.2 MB" },
      { id: "absentee-trend", name: "Absentee Risk Analysis", icon: ShieldAlert, variant: "amber", size: "850 KB" },
      { id: "staff-logs", name: "Staff Operational Latency", icon: Clock, variant: "indigo", size: "2.1 MB" },
    ],
  },
  {
    title: "Fiscal Analytics",
    description: "Revenue pathways and outstanding vectors",
    reports: [
      { id: "fee-defaulters", name: "Defaulter Risk Profile", icon: IndianRupee, variant: "red", size: "540 KB" },
      { id: "collection-summary", name: "Daily Collection Ledger", icon: TrendingUp, variant: "emerald", size: "1.8 MB" },
      { id: "transport-costs", name: "Transport Logistics ROI", icon: BarChart3, variant: "pink", size: "3.2 MB" },
    ],
  },
  {
    title: "Academic Outcomes",
    description: "Scholastic performance and grade distribution",
    reports: [
      { id: "marksheet-bulk", name: "Bulk Marksheet Export", icon: FileText, variant: "indigo", size: "12.4 MB" },
      { id: "subject-grades", name: "Grade Distribution Curves", icon: BarChart3, variant: "emerald", size: "4.1 MB" },
      { id: "exam-attendance", name: "Examination Entry Stats", icon: Calendar, variant: "blue", size: "900 KB" },
    ],
  },
]

// ─── Utility ─────────────────────────────────────────────────────────

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

function formatValue(val: string | number | null): string {
  if (val === null || val === undefined) return "-"
  if (typeof val === "number") return val.toLocaleString("en-IN")
  return String(val)
}

// ─── Main Component ──────────────────────────────────────────────────

export default function ReportsHub() {
  const [viewMode, setViewMode] = useState<ViewMode>("catalog")
  const [downloading, setDownloading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Builder state
  const [selectedModule, setSelectedModule] = useState<ReportModule>("fees")
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode] = useState<"all" | "custom">("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [generating, setGenerating] = useState(false)
  const [reportResult, setReportResult] = useState<ReportResult | null>(null)
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx" | "pdf">("csv")
  const [exporting, setExporting] = useState(false)
  const [availableFields, setAvailableFields] = useState<string[]>([])

  // Drill-down state
  const [drillModule, setDrillModule] = useState<ReportModule | null>(null)
  const [drillStudentId, setDrillStudentId] = useState("")
  const [drillLoading, setDrillLoading] = useState(false)
  const [drillResult, setDrillResult] = useState<DrillDownResult | null>(null)
  const [drillError, setDrillError] = useState("")

  // Fetch available fields when module changes
  const fetchFields = useCallback(async (module: ReportModule) => {
    try {
      const res = await fetch(`/api/reports/generate?module=${module}`)
      if (res.ok) {
        const data = await res.json()
        setAvailableFields(data.fields)
        setSelectedFields(new Set(data.fields))
      }
    } catch {
      // fallback to defaults
    }
  }, [])

  const handleModuleChange = (module: ReportModule) => {
    setSelectedModule(module)
    setSelectMode("all")
    fetchFields(module)
  }

  const toggleField = (field: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev)
      if (next.has(field)) next.delete(field)
      else next.add(field)
      return next
    })
  }

  const selectAllFields = () => setSelectedFields(new Set(availableFields))
  const deselectAllFields = () => setSelectedFields(new Set())

  const handleGenerateReport = async () => {
    setGenerating(true)
    try {
      const payload: any = {
        module: selectedModule,
        customFields: selectMode === "custom" ? Array.from(selectedFields) : undefined,
      }
      if (dateFrom) payload.dateFrom = dateFrom
      if (dateTo) payload.dateTo = dateTo
      if (statusFilter) payload.statusFilter = statusFilter

      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to generate report")
      }

      const result = await res.json()
      setReportResult(result)
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const payload: any = {
        module: selectedModule,
        format: exportFormat,
        customFields: selectMode === "custom" ? Array.from(selectedFields) : undefined,
      }
      if (dateFrom) payload.dateFrom = dateFrom
      if (dateTo) payload.dateTo = dateTo
      if (statusFilter) payload.statusFilter = statusFilter

      const res = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Export failed")
      }

      const blob = await res.blob()
      const contentDisposition = res.headers.get("Content-Disposition")
      let fileName = `${selectedModule}_report`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+?)"?(;|$)/)
        if (match) fileName = match[1]
      }
      const ext = exportFormat === "xlsx" ? "xlsx" : exportFormat === "pdf" ? "pdf" : "csv"
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${fileName}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  const handleDrillDown = async (module: ReportModule, studentId: string) => {
    setDrillModule(module)
    setDrillStudentId(studentId)
    setDrillLoading(true)
    setDrillResult(null)
    setDrillError("")
    setViewMode("drilldown")

    try {
      const params = new URLSearchParams({ module, studentId })
      if (dateFrom) params.set("dateFrom", dateFrom)
      if (dateTo) params.set("dateTo", dateTo)

      const res = await fetch(`/api/reports/drilldown?${params.toString()}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Drill-down failed")
      }
      const data = await res.json()
      setDrillResult(data)
    } catch (err) {
      setDrillError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setDrillLoading(false)
    }
  }

  const handleDownload = (id: string) => {
    setDownloading(id)
    setTimeout(() => setDownloading(null), 1500)
  }

  // ─── Drill-down render helpers ───────────────────────────────────

  const renderDrillDown = () => {
    if (!drillModule) return null

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Back button */}
        <Button
          variant="ghost"
          className="h-10 rounded-xl font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-emerald-600"
          onClick={() => {
            setViewMode(reportResult ? "builder" : "catalog")
            setDrillResult(null)
            setDrillModule(null)
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            Drill-Down
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {MODULE_CONFIG[drillModule].label} Detail
          </h2>
        </div>

        {drillLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        )}

        {drillError && (
          <Card className="rounded-[2rem] border-red-500/20 bg-red-500/5">
            <CardContent className="p-8 text-center text-red-600 font-bold">{drillError}</CardContent>
          </Card>
        )}

        {drillResult && drillModule === "fees" && (() => {
          const dd = drillResult as DrillDownFee
          const student = dd.student
          return (
            <div className="space-y-6">
              {/* Student Header */}
              <Card className="rounded-[2rem] border-muted/20 bg-white/50 dark:bg-zinc-900/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl font-black">
                      {student.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {student.admissionNumber} &middot; {student.classroom?.name} / {student.section?.name}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-black text-emerald-600">
                        {dd.summary.outstanding.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Outstanding
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fee Records Table */}
              <Card className="rounded-[2rem] border-muted/20 bg-white/50 dark:bg-zinc-900/50 overflow-hidden">
                <CardHeader className="px-8 pt-8">
                  <CardTitle className="text-sm font-black uppercase tracking-tight">Fee Ledger</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fee</TableHead>
                        <TableHead className="text-right">Due</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Waiver</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dd.records.map((r: any) => (
                        <TableRow
                          key={r.id}
                          className="cursor-pointer hover:bg-emerald-500/5"
                          onClick={() => {
                            // Could expand transactions here
                          }}
                        >
                          <TableCell className="font-bold">{r.feeName}</TableCell>
                          <TableCell className="text-right">{r.amountDue.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right text-emerald-600">{r.amountPaid.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right">{r.waiver.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="text-right font-black">{r.balance.toLocaleString("en-IN")}</TableCell>
                          <TableCell>
                            <StatusBadge status={r.status} />
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">{r.dueDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className="font-black">Total</TableCell>
                        <TableCell className="text-right font-black">{dd.summary.totalDue.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right font-black text-emerald-600">{dd.summary.totalPaid.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right font-black">{dd.summary.totalWaiver.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right font-black text-red-600">{dd.summary.outstanding.toLocaleString("en-IN")}</TableCell>
                        <TableCell colSpan={2} />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )
        })()}

        {drillResult && drillModule === "attendance" && (() => {
          const dd = drillResult as DrillDownAttendance
          const student = dd.student
          return (
            <div className="space-y-6">
              <Card className="rounded-[2rem] border-muted/20 bg-white/50 dark:bg-zinc-900/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-2xl font-black">
                      {student.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {student.admissionNumber} &middot; {student.classroom?.name} / {student.section?.name}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-black text-blue-600">{dd.summary.attendanceRate}%</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Attendance Rate
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-muted/20 bg-white/50 dark:bg-zinc-900/50 overflow-hidden">
                <CardHeader className="px-8 pt-8">
                  <CardTitle className="text-sm font-black uppercase tracking-tight">Attendance Log</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dd.records.map((r: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs">{r.date}</TableCell>
                          <TableCell><StatusBadge status={r.status} /></TableCell>
                          <TableCell className="text-muted-foreground text-xs">{r.remarks || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )
        })()}

        {drillResult && drillModule === "academics" && (() => {
          const dd = drillResult as DrillDownAcademics
          const student = dd.student
          return (
            <div className="space-y-6">
              <Card className="rounded-[2rem] border-muted/20 bg-white/50 dark:bg-zinc-900/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-2xl font-black">
                      {student.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {student.admissionNumber} &middot; {student.classroom?.name} / {student.section?.name}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {dd.examGroups.map((group: any, idx: number) => (
                <Card key={idx} className="rounded-[2rem] border-muted/20 bg-white/50 dark:bg-zinc-900/50 overflow-hidden">
                  <CardHeader className="px-8 pt-8">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-black uppercase tracking-tight">
                        {group.exam.name} (Term {group.exam.term})
                      </CardTitle>
                      <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 font-black">
                        {group.percentage}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead className="text-right">Marks</TableHead>
                          <TableHead className="text-right">Max</TableHead>
                          <TableHead className="text-right">%</TableHead>
                          <TableHead>Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.subjects.map((s: any, si: number) => (
                          <TableRow key={si}>
                            <TableCell className="font-bold">{s.subjectName}</TableCell>
                            <TableCell className="font-mono text-xs">{s.subjectCode}</TableCell>
                            <TableCell className="text-right font-bold">{s.marks}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{s.maxMarks}</TableCell>
                            <TableCell className="text-right font-black">{s.maxMarks > 0 ? ((s.marks / s.maxMarks) * 100).toFixed(1) : 0}%</TableCell>
                            <TableCell><GradeBadge grade={s.grade} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={2} className="font-black">Total</TableCell>
                          <TableCell className="text-right font-black">{group.totalMarks}</TableCell>
                          <TableCell className="text-right font-black">{group.totalMaxMarks}</TableCell>
                          <TableCell className="text-right font-black text-indigo-600">{group.percentage}%</TableCell>
                          <TableCell />
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        })()}
      </div>
    )
  }

  // ─── Report Builder View ─────────────────────────────────────────

  const renderBuilder = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              Custom Builder
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight dark:text-white leading-none">
            Report <span className="text-emerald-600">Builder</span>
          </h1>
          <p className="text-muted-foreground font-semibold">
            Configure module, filters, and export format to generate custom reports.
          </p>
        </div>
        <Button
          variant="ghost"
          className="h-10 rounded-xl font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-emerald-600"
          onClick={() => setViewMode("catalog")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Catalog
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Config Panel */}
        <div className="xl:col-span-1 space-y-6">
          {/* Module Selection */}
          <Card className="rounded-[2rem] border-muted/20 bg-white/50 dark:bg-zinc-900/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest">Module</CardTitle>
              <CardDescription>Select the data source</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(Object.entries(MODULE_CONFIG) as [ReportModule, typeof MODULE_CONFIG[ReportModule]][]).map(
                ([key, cfg]) => {
                  const Icon = cfg.icon
                  const isActive = selectedModule === key
                  return (
                    <button
                      key={key}
                      onClick={() => handleModuleChange(key)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all",
                        isActive
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-muted-foreground")} />
                      <span className={cn("text-xs font-black uppercase tracking-tight", isActive ? "text-white" : "")}>
                        {cfg.label}
                      </span>
                    </button>
                  )
                }
              )}
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="rounded-[2rem] border-muted/20 bg-white/50 dark:bg-zinc-900/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest">Filters</CardTitle>
              <CardDescription>Narrow down the data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-10 rounded-xl bg-muted/30 border-none text-xs font-bold"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-10 rounded-xl bg-muted/30 border-none text-xs font-bold"
                  />
                </div>
              </div>

              {(selectedModule === "fees" || selectedModule === "attendance" || selectedModule === "library" || selectedModule === "health" || selectedModule === "hr" || selectedModule === "vouchers" || selectedModule === "students" || selectedModule === "enquiries") && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Status Filter
                  </label>
                  <Input
                    placeholder="e.g. PENDING, PAID, ACTIVE..."
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 rounded-xl bg-muted/30 border-none text-xs font-bold"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Field Selection */}
          <Card className="rounded-[2rem] border-muted/20 bg-white/50 dark:bg-zinc-900/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-widest">Fields</CardTitle>
                <Switch
                  checked={selectMode === "custom"}
                  onCheckedChange={(checked) => {
                    setSelectMode(checked ? "custom" : "all")
                    if (checked) setSelectedFields(new Set())
                    else setSelectedFields(new Set(availableFields))
                  }}
                />
              </div>
              <CardDescription>
                {selectMode === "all" ? "All fields included" : "Select specific fields"}
              </CardDescription>
            </CardHeader>
            {selectMode === "custom" && (
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 rounded-lg text-[10px] font-black uppercase"
                    onClick={selectAllFields}
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 rounded-lg text-[10px] font-black uppercase"
                    onClick={deselectAllFields}
                  >
                    Clear
                  </Button>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {availableFields.map((field) => (
                    <label
                      key={field}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all",
                        selectedFields.has(field)
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFields.has(field)}
                        onChange={() => toggleField(field)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "w-4 h-4 rounded border transition-all flex items-center justify-center",
                          selectedFields.has(field)
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {selectedFields.has(field) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {formatLabel(field)}
                    </label>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Export Settings */}
          <Card className="rounded-[2rem] border-muted/20 bg-white/50 dark:bg-zinc-900/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest">Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(["csv", "xlsx", "pdf"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all",
                    exportFormat === fmt
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "hover:bg-muted/50"
                  )}
                >
                  <FileDown className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-tight">{fmt.toUpperCase()}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            className="w-full h-14 rounded-[1.5rem] bg-black text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            onClick={handleGenerateReport}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <TableIcon className="w-4 h-4 mr-3" />
                Generate Report
              </>
            )}
          </Button>
        </div>

        {/* Results Panel */}
        <div className="xl:col-span-3 space-y-6">
          {!reportResult && (
            <Card className="rounded-[2rem] border-muted/20 bg-white/50 dark:bg-zinc-900/50">
              <CardContent className="p-20 flex flex-col items-center justify-center text-center">
                <BarChart3 className="w-16 h-16 text-muted-foreground/20 mb-6" />
                <h3 className="text-lg font-black text-muted-foreground mb-2">No Report Generated</h3>
                <p className="text-sm text-muted-foreground/60 max-w-md">
                  Configure the module and filters on the left, then click Generate Report to preview your data here.
                </p>
              </CardContent>
            </Card>
          )}

          {reportResult && (
            <>
              {/* Export Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-black">{reportResult.title}</h2>
                  <Badge className="bg-muted/50 font-bold text-xs">{reportResult.rowCount} rows</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-10 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700"
                    onClick={handleExport}
                    disabled={exporting}
                  >
                    {exporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export {exportFormat.toUpperCase()}
                  </Button>
                </div>
              </div>

              {/* Summary Cards */}
              {reportResult.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(reportResult.summary).map(([key, val]) => (
                    <Card key={key} className="rounded-[1.5rem] border-muted/20 bg-white/50 dark:bg-zinc-900/50">
                      <CardContent className="p-5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          {formatLabel(key)}
                        </div>
                        <div className="text-xl font-black">
                          {typeof val === "number" ? val.toLocaleString("en-IN") : val}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Data Table */}
              <Card className="rounded-[2rem] border-muted/20 bg-white/50 dark:bg-zinc-900/50 overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {reportResult.columns.map((col) => (
                            <TableHead key={col} className="font-black text-[10px] uppercase tracking-widest">
                              {formatLabel(col)}
                            </TableHead>
                          ))}
                          {(reportResult.module === "fees" || reportResult.module === "attendance" || reportResult.module === "academics") && (
                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Actions</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportResult.data.slice(0, 50).map((row, idx) => {
                          const studentId = (row as any).studentId || (row as any).id
                          const hasDrillDown =
                            (reportResult.module === "fees" ||
                              reportResult.module === "attendance" ||
                              reportResult.module === "academics") &&
                            (row as any).admissionNumber

                          // For drill-down we need the student ID - we may not have it in the flat data
                          // So we use the admission number as a proxy for display only
                          return (
                            <TableRow key={idx}>
                              {reportResult.columns.map((col) => (
                                <TableCell key={col} className="text-xs font-medium">
                                  {col === "status" ? (
                                    <StatusBadge status={String(row[col] ?? "")} />
                                  ) : col === "grade" ? (
                                    <GradeBadge grade={String(row[col] ?? "")} />
                                  ) : (
                                    formatValue(row[col])
                                  )}
                                </TableCell>
                              ))}
                              {hasDrillDown && (
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 rounded-lg"
                                    onClick={() => {
                                      // We need a student ID for drill-down - use a placeholder approach
                                      // In practice, the generate API should include student IDs in data
                                    }}
                                    disabled
                                    title="Drill-down requires student ID from summary view"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {reportResult.data.length > 50 && (
                    <div className="px-8 py-4 text-xs font-bold text-muted-foreground text-center border-t border-muted/20">
                      Showing 50 of {reportResult.data.length} rows. Export for full data.
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )

  // ─── Catalog View (existing) ─────────────────────────────────────

  const renderCatalog = () => (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              Intelligence Hub
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              <BarChart3 className="w-3 h-3" />
              Live Data Index
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">
            Global <span className="text-emerald-600">Analytics</span>
          </h1>
          <p className="text-muted-foreground font-semibold max-w-xl text-lg">
            Unified reporting engine for exported intelligence across all campus modules.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-72 group/search">
            <div className="absolute -inset-1 bg-emerald-500/10 rounded-2xl blur opacity-0 group-hover/search:opacity-100 transition duration-500"></div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 bg-muted/30 border-none rounded-2xl font-bold focus-visible:ring-emerald-500"
              />
            </div>
          </div>
          <Button
            className="h-14 px-8 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 group"
            onClick={() => setViewMode("builder")}
          >
            <ChevronsUpDown className="w-4 h-4 mr-3" />
            Report Builder
          </Button>
        </div>
      </div>

      {/* Reports Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 px-2">
        {REPORT_GROUPS.map((group) => {
          const filteredReports = group.reports.filter((r) =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          if (filteredReports.length === 0) return null

          return (
            <div key={group.title} className="space-y-6">
              <div className="px-4">
                <h2 className="text-xl font-black tracking-tight">{group.title}</h2>
                <p className="text-sm font-semibold text-muted-foreground">{group.description}</p>
              </div>

              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <Card
                    key={report.id}
                    className="group rounded-[2rem] border-muted/20 bg-white/50 dark:bg-zinc-900/50 hover:border-emerald-500/20 transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:shadow-emerald-500/5"
                  >
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div
                          className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                            report.variant === "blue" &&
                              "bg-blue-500/10 text-blue-600 shadow-xl shadow-blue-500/10",
                            report.variant === "amber" &&
                              "bg-amber-500/10 text-amber-600 shadow-xl shadow-amber-500/10",
                            report.variant === "indigo" &&
                              "bg-indigo-500/10 text-indigo-600 shadow-xl shadow-indigo-500/10",
                            report.variant === "red" &&
                              "bg-red-500/10 text-red-600 shadow-xl shadow-red-500/10",
                            report.variant === "emerald" &&
                              "bg-emerald-500/10 text-emerald-600 shadow-xl shadow-emerald-500/10",
                            report.variant === "pink" &&
                              "bg-pink-500/10 text-pink-600 shadow-xl shadow-pink-500/10"
                          )}
                        >
                          <report.icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-black group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                            {report.name}
                          </h3>
                          <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-2">
                            FILE SIZE: {report.size}
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            SECURE PDF
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-xl text-muted-foreground group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner"
                        onClick={() => handleDownload(report.id)}
                        disabled={downloading === report.id}
                      >
                        {downloading === report.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                variant="ghost"
                className="w-full h-12 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-emerald-500/5 hover:text-emerald-600"
                onClick={() => setViewMode("builder")}
              >
                Build Custom Report <ChevronRight className="w-3 h-3 ml-2" />
              </Button>
            </div>
          )
        })}
      </div>

      {/* Quick Analytics - Module Summary Cards */}
      <div className="px-2">
        <h2 className="text-2xl font-black tracking-tight mb-6 px-4">Quick Analytics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(Object.entries(MODULE_CONFIG) as [ReportModule, typeof MODULE_CONFIG[ReportModule]][]).map(
            ([key, cfg]) => {
              const Icon = cfg.icon
              return (
                <Card
                  key={key}
                  className="group rounded-[2rem] border-muted/20 bg-white/50 dark:bg-zinc-900/50 hover:border-emerald-500/20 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-emerald-500/5"
                  onClick={() => {
                    handleModuleChange(key)
                    setReportResult(null)
                    setViewMode("builder")
                  }}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                        cfg.variant === "blue" && "bg-blue-500/10 text-blue-600",
                        cfg.variant === "amber" && "bg-amber-500/10 text-amber-600",
                        cfg.variant === "indigo" && "bg-indigo-500/10 text-indigo-600",
                        cfg.variant === "red" && "bg-red-500/10 text-red-600",
                        cfg.variant === "emerald" && "bg-emerald-500/10 text-emerald-600",
                        cfg.variant === "pink" && "bg-pink-500/10 text-pink-600"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                        {cfg.label}
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{cfg.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            }
          )}
        </div>
      </div>

      {/* Decorative Hub Lattice */}
      <div className="fixed bottom-0 left-0 p-10 opacity-[0.03] pointer-events-none">
        <LayoutGrid className="w-96 h-96 -translate-x-1/2 translate-y-1/2 -rotate-12" />
      </div>
    </div>
  )

  // ─── Main Render ─────────────────────────────────────────────────

  return (
    <div className="pb-20">
      {viewMode === "catalog" && renderCatalog()}
      {viewMode === "builder" && renderBuilder()}
      {viewMode === "drilldown" && renderDrillDown()}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    PAID: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
    PENDING: { bg: "bg-amber-500/10", text: "text-amber-600" },
    PARTIAL: { bg: "bg-blue-500/10", text: "text-blue-600" },
    PRESENT: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
    ABSENT: { bg: "bg-red-500/10", text: "text-red-600" },
    LATE: { bg: "bg-amber-500/10", text: "text-amber-600" },
    ISSUED: { bg: "bg-blue-500/10", text: "text-blue-600" },
    RETURNED: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
    OVERDUE: { bg: "bg-red-500/10", text: "text-red-600" },
    LOST: { bg: "bg-red-500/10", text: "text-red-600" },
    ACTIVE: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
    RESOLVED: { bg: "bg-blue-500/10", text: "text-blue-600" },
    CHRONIC: { bg: "bg-red-500/10", text: "text-red-600" },
    OPEN: { bg: "bg-amber-500/10", text: "text-amber-600" },
    CONVERTED: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
    CLOSED: { bg: "bg-muted/50", text: "text-muted-foreground" },
    APPROVED: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
    REJECTED: { bg: "bg-red-500/10", text: "text-red-600" },
    RECEIPT: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
    PAYMENT: { bg: "bg-red-500/10", text: "text-red-600" },
    JOURNAL: { bg: "bg-blue-500/10", text: "text-blue-600" },
  }
  const c = config[status] || { bg: "bg-muted/50", text: "text-muted-foreground" }
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider", c.bg, c.text)}>
      {status}
    </span>
  )
}

function GradeBadge({ grade }: { grade: string }) {
  if (!grade || grade === "N/A") return <span className="text-muted-foreground text-xs">-</span>
  const gradeNum = parseFloat(grade)
  let color = "text-muted-foreground"
  if (!isNaN(gradeNum)) {
    if (gradeNum >= 90) color = "text-emerald-600"
    else if (gradeNum >= 70) color = "text-blue-600"
    else if (gradeNum >= 50) color = "text-amber-600"
    else color = "text-red-600"
  } else if (["A+", "A", "A1"].includes(grade)) color = "text-emerald-600"
  else if (["B+", "B", "B1", "A2"].includes(grade)) color = "text-blue-600"
  else if (["C+", "C", "C1", "B2"].includes(grade)) color = "text-amber-600"
  else if (["D", "E", "F"].includes(grade)) color = "text-red-600"

  return (
    <span className={cn("font-black text-xs", color)}>{grade}</span>
  )
}
