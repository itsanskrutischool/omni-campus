"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  GraduationCap,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  TrendingUp,
  DollarSign,
  Users,
  FileText
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

export default function ScholarshipsPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState<"scholarships" | "applications">("scholarships")
  const [loading, setLoading] = useState(true)
  const [scholarships, setScholarships] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [reviewForm, setReviewForm] = useState({ status: "APPROVED", remarks: "" })
  const [form, setForm] = useState({ name: "", description: "", type: "Merit", discountPercent: "", maxAmount: "", deadline: "" })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [schRes, appRes, anaRes] = await Promise.all([
        fetch("/api/scholarships"),
        fetch(`/api/scholarships?applications=true&status=${statusFilter !== "ALL" ? statusFilter : ""}`),
        fetch("/api/scholarships?analytics=true"),
      ])
      if (schRes.ok) setScholarships(await schRes.json())
      if (appRes.ok) setApplications(await appRes.json())
      if (anaRes.ok) setAnalytics(await anaRes.json())
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async () => {
    try {
      await fetch("/api/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...form, discountPercent: parseFloat(form.discountPercent), maxAmount: form.maxAmount ? parseFloat(form.maxAmount) : undefined }),
      })
      setIsAddOpen(false)
      setForm({ name: "", description: "", type: "Merit", discountPercent: "", maxAmount: "", deadline: "" })
      fetchData()
    } catch (err) { console.error(err) }
  }

  const handleReview = async () => {
    if (!selectedApp) return
    try {
      await fetch("/api/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "review", applicationId: selectedApp.id, ...reviewForm }),
      })
      setIsReviewOpen(false)
      setSelectedApp(null)
      setReviewForm({ status: "APPROVED", remarks: "" })
      fetchData()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      <div className="space-y-4 px-2">
        <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-black uppercase tracking-widest inline-block">Financial Aid</div>
        <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">Scholarship <span className="text-blue-600">Management</span></h1>
        <p className="text-muted-foreground font-semibold max-w-xl text-lg">Manage scholarships, review applications, and approve financial aid.</p>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
          <StatCard label="Total Applications" value={analytics.total.toString()} icon={FileText} description="All submissions" variant="blue" />
          <StatCard label="Pending Review" value={analytics.pending.toString()} icon={Clock} description="Awaiting decision" variant="amber" />
          <StatCard label="Approved" value={analytics.approved.toString()} icon={CheckCircle2} description="Scholarships granted" variant="emerald" />
          <StatCard label="Rejected" value={analytics.rejected.toString()} icon={XCircle} description="Not eligible" variant="rose" />
        </div>
      )}

      <div className="flex items-center gap-4 px-2">
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl">
          {(["scholarships", "applications"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-widest transition-all", activeTab === tab ? "bg-white dark:bg-zinc-800 text-blue-900 dark:text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {tab === "scholarships" ? "Scholarships" : "Applications"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "scholarships" && (
        <>
          <div className="flex justify-end px-2">
            <Button onClick={() => setIsAddOpen(true)} className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl">
              <Plus className="w-4 h-4 mr-3" /> Add Scholarship
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
            {scholarships.map(s => (
              <Card key={s.id} className="border-blue-500/5 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-black">{s.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground font-bold">Type</span><Badge variant="outline" className="font-bold text-[10px] uppercase">{s.type}</Badge></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground font-bold">Discount</span><span className="font-black text-blue-600">{s.discountPercent}%</span></div>
                  {s.maxAmount && <div className="flex justify-between text-sm"><span className="text-muted-foreground font-bold">Max Amount</span><span className="font-black">{s.maxAmount.toLocaleString("en-IN")}</span></div>}
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground font-bold">Applications</span><span className="font-black">{s._count?.applications || 0}</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === "applications" && (
        <Card className="border-blue-500/5 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-blue-500/5 flex justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/10"><GraduationCap className="w-6 h-6 text-blue-600" /></div>
              <div><h3 className="text-xl font-black tracking-tight">Applications Queue</h3><p className="text-sm font-semibold text-muted-foreground">Review and approve scholarship requests.</p></div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => { if (v) setStatusFilter(v) }}>
              <SelectTrigger className="h-12 w-44 rounded-2xl font-bold bg-muted/50 border-none"><div className="flex items-center gap-2"><Filter className="w-4 h-4 text-blue-500" /><SelectValue /></div></SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-500/[0.02] border-none">
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-blue-800 dark:text-blue-400">Student</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-blue-800 dark:text-blue-400">Scholarship</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-blue-800 dark:text-blue-400">Parent Income</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-blue-800 dark:text-blue-400">Applied</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-blue-800 dark:text-blue-400">Status</TableHead>
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-blue-800 dark:text-blue-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow className="border-none"><TableCell colSpan={6} className="py-32 text-center text-muted-foreground font-bold">No applications found.</TableCell></TableRow>
                ) : (
                  applications.map(a => (
                    <TableRow key={a.id} className="group/row hover:bg-blue-500/[0.02] transition-all border-b border-blue-500/5">
                      <TableCell className="px-8 py-6"><div><p className="font-black text-sm">{a.student.name}</p><p className="text-[10px] font-black text-muted-foreground uppercase">{a.student.admissionNumber}</p></div></TableCell>
                      <TableCell><div><p className="font-bold text-sm">{a.scholarship.name}</p><Badge variant="outline" className="mt-1 font-bold text-[9px] uppercase">{a.scholarship.type} · {a.scholarship.discountPercent}%</Badge></div></TableCell>
                      <TableCell className="text-sm font-bold">{a.parentIncome ? `₹${a.parentIncome.toLocaleString("en-IN")}` : "—"}</TableCell>
                      <TableCell className="text-sm font-bold">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell><Badge className={cn("rounded-xl font-black text-[10px] uppercase", a.status === "PENDING" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : a.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20")}>{a.status}</Badge></TableCell>
                      <TableCell className="px-8 py-6 text-right">
                        {a.status === "PENDING" && (
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => { setSelectedApp(a); setReviewForm({ status: "APPROVED", remarks: "" }); setIsReviewOpen(true) }} variant="outline" size="sm" className="rounded-xl border-blue-500/10 hover:bg-blue-500/10 font-bold"><Eye className="w-3.5 h-3.5 mr-2" /> Review</Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add Scholarship Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader><DialogTitle>Add Scholarship</DialogTitle><DialogDescription>Create a new scholarship program.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-xl mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="rounded-xl mt-1" rows={2} /></div>
            <div><Label>Type</Label><Select value={form.type} onValueChange={v => { if (v) setForm({ ...form, type: v }) }}><SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="Merit">Merit</SelectItem><SelectItem value="Need-Based">Need-Based</SelectItem><SelectItem value="Sports">Sports</SelectItem><SelectItem value="Arts">Arts</SelectItem><SelectItem value="Minority">Minority</SelectItem></SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Discount % *</Label><Input type="number" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} className="rounded-xl mt-1" /></div>
              <div><Label>Max Amount</Label><Input type="number" value={form.maxAmount} onChange={e => setForm({ ...form, maxAmount: e.target.value })} className="rounded-xl mt-1" /></div>
            </div>
            <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="rounded-xl mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button><Button onClick={handleCreate} className="rounded-xl font-bold">Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Application Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader><DialogTitle>Review Application</DialogTitle><DialogDescription>{selectedApp?.student.name} — {selectedApp?.scholarship.name}</DialogDescription></DialogHeader>
          <div className="p-4 bg-muted/50 rounded-2xl space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground font-bold">Parent Income</span><span className="font-black">{selectedApp?.parentIncome ? `₹${selectedApp.parentIncome.toLocaleString("en-IN")}` : "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground font-bold">Discount</span><span className="font-black text-blue-600">{selectedApp?.scholarship.discountPercent}%</span></div>
          </div>
          <div className="grid gap-4 py-4">
            <div><Label>Decision</Label><Select value={reviewForm.status} onValueChange={v => { if (v) setReviewForm({ ...reviewForm, status: v }) }}><SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="APPROVED">Approve</SelectItem><SelectItem value="REJECTED">Reject</SelectItem></SelectContent></Select></div>
            <div><Label>Remarks</Label><Textarea value={reviewForm.remarks} onChange={e => setReviewForm({ ...reviewForm, remarks: e.target.value })} className="rounded-xl mt-1" rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsReviewOpen(false)} className="rounded-xl">Cancel</Button><Button onClick={handleReview} className="rounded-xl font-bold">Submit Review</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
