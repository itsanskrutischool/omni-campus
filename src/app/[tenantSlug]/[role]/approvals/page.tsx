"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Loader2,
  Workflow,
  ArrowRight,
  AlertTriangle,
  Hash,
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
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────

interface WorkflowTemplate {
  id: string
  name: string
  description: string | null
  module: string
  steps: { id: string; stepOrder: number; approverRole: string; isFinal: boolean }[]
  _count: { requests: number }
}

interface ApprovalRequest {
  id: string
  status: string
  currentStep: number
  entityType: string
  entityId: string
  requesterType: string
  requesterId: string
  comments: string | null
  createdAt: string
  template: { id: string; name: string; module: string }
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
}

const MODULE_OPTIONS = [
  "ADMISSION", "FEE_WAIVER", "LEAVE", "TRANSFER", "CERTIFICATE", "GATE_PASS",
  "REFUND", "SCHOLARSHIP", "SALARY_ADVANCE", "PURCHASE",
]

const ROLE_OPTIONS = ["ADMIN", "PRINCIPAL", "HOD", "COORDINATOR", "ACCOUNTANT", "RECEPTION"]

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }>; dot: string }> = {
  PENDING: { bg: "bg-amber-500/10", text: "text-amber-600", icon: Clock, dot: "bg-amber-500" },
  APPROVED: { bg: "bg-emerald-500/10", text: "text-emerald-600", icon: CheckCircle2, dot: "bg-emerald-500" },
  REJECTED: { bg: "bg-rose-500/10", text: "text-rose-600", icon: XCircle, dot: "bg-rose-500" },
  ESCALATED: { bg: "bg-orange-500/10", text: "text-orange-600", icon: AlertTriangle, dot: "bg-orange-500" },
}

// ─── Component ─────────────────────────────

export default function ApprovalsPage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string

  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"requests" | "templates">("requests")
  const [statusFilter, setStatusFilter] = useState("ALL")

  // Modal
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Template form
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    module: "",
    steps: [{ stepOrder: 1, approverRole: "", isFinal: true }] as { stepOrder: number; approverRole: string; isFinal: boolean }[],
  })

  // ─── Data Loading ─────────────────────────
  const fetchData = async () => {
    setLoading(true)
    try {
      const [tplRes, reqRes, statsRes] = await Promise.all([
        fetch("/api/approvals?type=templates"),
        fetch(`/api/approvals?type=requests&status=${statusFilter}`),
        fetch("/api/approvals?type=stats"),
      ])
      setTemplates(await tplRes.json())
      const reqData = await reqRes.json()
      setRequests(reqData.requests || [])
      setStats(await statsRes.json())
    } catch (e) {
      console.error("Failed to fetch approvals:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [statusFilter])

  // ─── Create Template ──────────────────────
  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.module || !templateForm.steps[0]?.approverRole) return
    setSubmitting(true)
    try {
      // Mark only the last step as final
      const steps = templateForm.steps.map((s, i) => ({
        ...s,
        isFinal: i === templateForm.steps.length - 1,
      }))
      await fetch("/api/approvals?type=template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...templateForm, steps }),
      })
      setShowNewTemplate(false)
      setTemplateForm({ name: "", description: "", module: "", steps: [{ stepOrder: 1, approverRole: "", isFinal: true }] })
      fetchData()
    } catch (e) {
      console.error("Create template failed:", e)
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Approve / Reject ─────────────────────
  const handleAction = async (reqId: string, action: "APPROVED" | "REJECTED") => {
    try {
      await fetch("/api/approvals?type=action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reqId, status: action }),
      })
      fetchData()
    } catch (e) {
      console.error("Action failed:", e)
    }
  }

  // ─── Delete Template ──────────────────────
  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Delete this workflow template?")) return
    try {
      await fetch(`/api/approvals?id=${id}`, { method: "DELETE" })
      fetchData()
    } catch (e) {
      console.error("Delete failed:", e)
    }
  }

  // ─── Add/Remove Steps ────────────────────
  const addStep = () => {
    setTemplateForm(f => ({
      ...f,
      steps: [...f.steps, { stepOrder: f.steps.length + 1, approverRole: "", isFinal: false }],
    }))
  }

  const removeStep = (idx: number) => {
    if (templateForm.steps.length <= 1) return
    setTemplateForm(f => ({
      ...f,
      steps: f.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepOrder: i + 1 })),
    }))
  }

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  }

  const tabs = [
    { id: "requests" as const, label: "Requests", icon: Clock, count: stats.total },
    { id: "templates" as const, label: "Workflows", icon: Workflow, count: templates.length },
  ]

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* ─── Command Header ─────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              Engine Active
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              <Shield className="w-3 h-3" />
              Governance Layer
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight dark:text-white leading-[1.1]">
            Approval <span className="text-emerald-600">Engine</span>
          </h1>
          <p className="text-muted-foreground font-semibold mt-3 text-lg">
            Multi-step workflow governance for {tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)} Academy.
          </p>
        </div>

        {activeTab === "templates" && (
          <Button
            onClick={() => setShowNewTemplate(true)}
            className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 gap-2"
          >
            <Plus className="w-4 h-4" />
            New Workflow
          </Button>
        )}
      </div>

      {/* ─── Stats ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={stats.total} icon={Shield} variant="blue" index={0} />
        <StatCard label="Pending" value={stats.pending} icon={Clock} variant="amber" index={1} badge={stats.pending > 0 ? "Action Needed" : undefined} badgeColor="warning" />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} variant="emerald" index={2} />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} variant="rose" index={3} />
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
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20"
                  : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
              )}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
              <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black", isActive ? "bg-white/20" : "bg-muted")}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── Requests View ──────────────────── */}
      {activeTab === "requests" && (
        <>
          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  statusFilter === s
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20"
                    : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
                )}
              >
                {s === "ALL" ? "All" : s}
              </button>
            ))}
          </div>

          <Card variant="glass" className="border-emerald-500/5 overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-emerald-500/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight">Approval Queue</CardTitle>
                  <CardDescription className="text-sm font-medium">{requests.length} request{requests.length !== 1 ? "s" : ""} in queue</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-black dark:text-white mb-2">Queue Clear</h3>
                  <p className="text-muted-foreground font-medium text-sm">No approval requests match your filter.</p>
                </div>
              ) : (
                <div className="divide-y divide-emerald-500/5">
                  {requests.map((req, idx) => {
                    const ss = STATUS_STYLES[req.status] || STATUS_STYLES.PENDING
                    const StatusIcon = ss.icon
                    return (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-center gap-6 px-8 py-5 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all group"
                      >
                        <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border", ss.bg, ss.text)}>
                          <StatusIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-black dark:text-white">{req.template?.name || "Unknown Workflow"}</span>
                            <span className="px-2 py-0.5 rounded-lg bg-muted text-[9px] font-black text-muted-foreground uppercase tracking-widest">{req.template?.module}</span>
                          </div>
                          <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
                            <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {req.entityType}: {req.entityId.slice(0, 8)}</span>
                            <span>Step {req.currentStep}</span>
                          </div>
                        </div>

                        <div className={cn("px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0", ss.bg, ss.text)}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", ss.dot)} />
                          {req.status}
                        </div>

                        <span className="hidden lg:block text-[10px] font-bold text-muted-foreground/40 shrink-0 w-20 text-right">
                          {formatDate(req.createdAt)}
                        </span>

                        {/* Action Buttons */}
                        {req.status === "PENDING" && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => handleAction(req.id, "APPROVED")}
                              className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(req.id, "REJECTED")}
                              className="p-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-all"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ─── Templates View ─────────────────── */}
      {activeTab === "templates" && (
        <Card variant="glass" className="border-emerald-500/5 overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-emerald-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                <Workflow className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">Workflow Templates</CardTitle>
                <CardDescription className="text-sm font-medium">Define multi-step approval chains for different modules</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
            ) : templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-6">
                  <Workflow className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-xl font-black dark:text-white mb-2">No Workflows Configured</h3>
                <p className="text-muted-foreground font-medium text-sm max-w-md">
                  Create approval workflow templates to automate your governance processes.
                </p>
                <Button onClick={() => setShowNewTemplate(true)} className="mt-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
                  <Plus className="w-4 h-4" /> Create Workflow
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                {templates.map((tpl, idx) => (
                  <motion.div
                    key={tpl.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                    <div className="relative p-6 rounded-[2rem] bg-white/60 dark:bg-zinc-900/60 border border-emerald-500/10 backdrop-blur-xl hover:border-emerald-500/20 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                          <Workflow className="w-6 h-6 text-white" />
                        </div>
                        <button
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="p-2 rounded-xl text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="text-lg font-black dark:text-white mb-1 tracking-tight">{tpl.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest">{tpl.module}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">{tpl._count.requests} request{tpl._count.requests !== 1 ? "s" : ""}</span>
                      </div>
                      {tpl.description && (
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-4 line-clamp-2">{tpl.description}</p>
                      )}

                      {/* Steps Chain */}
                      <div className="flex items-center gap-2 pt-4 border-t border-emerald-500/5 flex-wrap">
                        {tpl.steps.map((step, i) => (
                          <div key={step.id} className="flex items-center gap-2">
                            <div className={cn(
                              "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                              step.isFinal
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-muted text-muted-foreground border-transparent"
                            )}>
                              {step.approverRole}
                            </div>
                            {i < tpl.steps.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-muted-foreground/30" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* NEW WORKFLOW TEMPLATE MODAL              */}
      {/* ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showNewTemplate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowNewTemplate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-emerald-500/10 overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 p-8 border-b border-emerald-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      <Workflow className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black dark:text-white">New Workflow</h2>
                      <p className="text-sm text-muted-foreground font-medium">Define a multi-step approval chain</p>
                    </div>
                  </div>
                  <button onClick={() => setShowNewTemplate(false)} className="p-2 rounded-xl hover:bg-muted/50"><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60">Workflow Name</Label>
                  <Input value={templateForm.name} onChange={(e) => setTemplateForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Fee Waiver Approval" className="h-14 bg-muted/30 border-none rounded-2xl font-black text-lg" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60">Module</Label>
                  <Select value={templateForm.module} onValueChange={(v) => setTemplateForm(f => ({ ...f, module: v || "" }))}>
                    <SelectTrigger className="h-12 bg-muted/30 border-none rounded-2xl font-bold"><SelectValue placeholder="Select module..." /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {MODULE_OPTIONS.map(m => (<SelectItem key={m} value={m} className="font-bold">{m.replace("_", " ")}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60">Description</Label>
                  <Textarea value={templateForm.description} onChange={(e) => setTemplateForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="What does this workflow handle?" className="bg-muted/30 border-none rounded-2xl font-bold p-4" />
                </div>

                {/* ── Approval Steps Builder ──── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60">Approval Chain</Label>
                    <button onClick={addStep} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Step
                    </button>
                  </div>

                  {templateForm.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-xs font-black shrink-0">
                        {step.stepOrder}
                      </div>
                      <Select
                        value={step.approverRole}
                        onValueChange={(v) => {
                          const newSteps = [...templateForm.steps]
                          newSteps[idx] = { ...newSteps[idx], approverRole: v || "" }
                          setTemplateForm(f => ({ ...f, steps: newSteps }))
                        }}
                      >
                        <SelectTrigger className="h-11 bg-white dark:bg-zinc-800 border-none rounded-xl font-bold flex-1">
                          <SelectValue placeholder="Select approver role..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {ROLE_OPTIONS.map(r => (<SelectItem key={r} value={r} className="font-bold">{r}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      {templateForm.steps.length > 1 && (
                        <button onClick={() => removeStep(idx)} className="p-2 rounded-xl text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Visual Chain Preview */}
                  {templateForm.steps.some(s => s.approverRole) && (
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-500/10 mt-3 flex-wrap">
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mr-2">Chain:</span>
                      {templateForm.steps.filter(s => s.approverRole).map((s, i, arr) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">{s.approverRole}</span>
                          {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-emerald-400" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 border-t border-emerald-500/5 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowNewTemplate(false)} className="rounded-2xl font-bold">Cancel</Button>
                <Button
                  onClick={handleCreateTemplate}
                  disabled={submitting || !templateForm.name || !templateForm.module || !templateForm.steps[0]?.approverRole}
                  className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Create Workflow
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
