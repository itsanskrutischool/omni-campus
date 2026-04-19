"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { FileText, Plus, Calendar, Clock, CheckCircle2, AlertCircle, Search, Filter, Eye, Award } from "lucide-react"
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

export default function HomeworkPage() {
  const params = useParams()
  const [homeworks, setHomeworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", classRoomId: "", subjectId: "", dueDate: "", assignedBy: "", maxMarks: "100" })
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/homework`)
      if (res.ok) {
        const data = await res.json()
        setHomeworks(data.homeworks || [])
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...form, maxMarks: parseFloat(form.maxMarks) || 100 }),
      })
      if (res.ok) {
        setIsAddOpen(false)
        setForm({ title: "", description: "", classRoomId: "", subjectId: "", dueDate: "", assignedBy: "", maxMarks: "100" })
        fetchData()
      }
    } catch (err) { console.error(err) }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-4">
          <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-widest inline-block">Assignments</div>
          <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">Homework <span className="text-amber-600">Manager</span></h1>
          <p className="text-muted-foreground font-semibold max-w-xl text-lg">Create, assign, and grade homework. Track submission deadlines and student progress.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="h-14 px-8 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl">
          <Plus className="w-4 h-4 mr-3" /> Assign Homework
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
        <StatCard label="Total Assignments" value={homeworks.length.toString()} icon={FileText} description="All homework assigned" variant="amber" />
        <StatCard label="Active" value={homeworks.filter(h => new Date(h.dueDate) > new Date()).length.toString()} icon={Clock} description="Pending submissions" variant="blue" />
        <StatCard label="Overdue" value={homeworks.filter(h => new Date(h.dueDate) < new Date()).length.toString()} icon={AlertCircle} description="Past deadline" variant="rose" />
        <StatCard label="With Submissions" value={homeworks.filter(h => h._count?.submissions > 0).length.toString()} icon={CheckCircle2} description="Received work" variant="emerald" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-2">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" /><Input placeholder="Search homework..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 pl-12 bg-muted/50 border-none rounded-2xl font-bold" /></div>
      </div>

      {/* Homework Table */}
      <Card className="border-amber-500/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-amber-500/[0.02] border-none">
                <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400">Assignment</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400">Class / Subject</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400">Assigned By</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400">Due Date</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400">Max Marks</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400">Status</TableHead>
                <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {homeworks.length === 0 ? (
                <TableRow className="border-none"><TableCell colSpan={7} className="py-32 text-center text-muted-foreground font-bold">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">No homework assigned yet.</p>
                  <Button onClick={() => setIsAddOpen(true)} variant="outline" className="mt-4 rounded-xl font-bold">Create First Assignment</Button>
                </TableCell></TableRow>
              ) : (
                homeworks.map(h => (
                  <TableRow key={h.id} className="group/row hover:bg-amber-500/[0.02] transition-all border-b border-amber-500/5">
                    <TableCell className="px-8 py-6">
                      <div><p className="font-black text-sm tracking-tight">{h.title}</p><p className="text-[10px] text-muted-foreground font-bold truncate max-w-[200px]">{h.description}</p></div>
                    </TableCell>
                    <TableCell className="text-sm font-bold">{h.classRoomId ? `Class ${h.classRoomId.slice(0, 8)}` : "All"}{h.subjectId ? ` · ${h.subjectId.slice(0, 8)}` : ""}</TableCell>
                    <TableCell className="text-sm font-bold">{h.assignedBy}</TableCell>
                    <TableCell className={cn("text-sm font-bold", new Date(h.dueDate) < new Date() ? "text-rose-600" : "text-emerald-600")}>{new Date(h.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm font-black">{h.maxMarks}</TableCell>
                    <TableCell><Badge className={cn("rounded-xl font-black text-[10px] uppercase", new Date(h.dueDate) < new Date() ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20")}>{new Date(h.dueDate) < new Date() ? "Overdue" : "Active"}</Badge></TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <span className="text-xs font-bold text-muted-foreground">{h._count?.submissions || 0} submissions</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add Homework Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader><DialogTitle>Assign Homework</DialogTitle><DialogDescription>Create a new assignment for students.</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="rounded-xl mt-1" /></div>
            <div className="col-span-2"><Label>Description *</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="rounded-xl mt-1" rows={3} /></div>
            <div><Label>Class</Label><Input value={form.classRoomId} onChange={e => setForm({ ...form, classRoomId: e.target.value })} className="rounded-xl mt-1" placeholder="Class ID" /></div>
            <div><Label>Subject</Label><Input value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} className="rounded-xl mt-1" placeholder="Subject ID" /></div>
            <div><Label>Assigned By</Label><Input value={form.assignedBy} onChange={e => setForm({ ...form, assignedBy: e.target.value })} className="rounded-xl mt-1" /></div>
            <div><Label>Due Date *</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="rounded-xl mt-1" /></div>
            <div><Label>Max Marks</Label><Input type="number" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })} className="rounded-xl mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button><Button onClick={handleCreate} className="rounded-xl font-bold">Assign Homework</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
