"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ClipboardList,
  Search,
  Plus,
  Calendar,
  FileText,
  Clock,
  LayoutGrid,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Loader2,
  Sparkles,
  Zap,
  MoreVertical
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

interface Exam {
  id: string
  name: string
  type: string
  term: number
  startDate: string
  endDate: string
}

// ─── Component ─────────────────────────────

export default function ExamsCommandCenter() {
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  // Dashboard Metrics
  const [metrics] = useState({
    activeExams: 12,
    completionRate: 88,
    pendingMarks: 156,
  })

  // Creation State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newExam, setNewExam] = useState({
    name: "",
    type: "PERIODIC_TEST",
    term: 1,
    startDate: "",
    endDate: ""
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchExams = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/exams")
      if (res.ok) {
        setExams(await res.json())
      }
    } catch (e) {
      console.error("Failed to sync exams", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [])

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExam)
      })
      if (res.ok) {
        setIsDialogOpen(false)
        fetchExams()
        setNewExam({
           name: "", type: "PERIODIC_TEST", term: 1,
           startDate: "", endDate: ""
        })
      }
    } catch (e) {
      console.error("Sync error", e)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredExams = exams.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      
      {/* Strategic Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                Academic Intelligence
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                <BarChart3 className="w-3 h-3" />
                Live Performance Data
              </div>
           </div>
           <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">
              Examination <span className="text-emerald-600">Command</span>
           </h1>
           <p className="text-muted-foreground font-semibold max-w-xl text-lg">
              Manage academic assessments, grading schemes, and performance trajectories with precision.
           </p>
        </div>

        <div className="flex items-center gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
              <Button className="h-14 px-8 rounded-2xl bg-emerald-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 group">
                <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform duration-500" />
                New Examination
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-emerald-500/10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl">
              <DialogHeader className="p-4">
                <DialogTitle className="text-3xl font-black tracking-tighter">Initialize Session</DialogTitle>
                <CardDescription className="text-sm font-bold">Configure the parameters for a new academic assessment session.</CardDescription>
              </DialogHeader>
              <div className="grid gap-8 py-6 px-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Exam Title</label>
                  <Input 
                    value={newExam.name} 
                    onChange={(e) => setNewExam({...newExam, name: e.target.value})} 
                    placeholder="e.g. SEMESTER II FINALS"
                    className="h-14 text-lg font-black bg-muted/50 border-none rounded-2xl" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Assessment Type</label>
                    <Select value={newExam.type} onValueChange={(v) => setNewExam({...newExam, type: v ?? "PERIODIC_TEST"})}>
                      <SelectTrigger className="h-14 bg-muted/50 border-none rounded-2xl font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-emerald-500/10">
                        <SelectItem value="PERIODIC_TEST" className="font-bold">Periodic Test</SelectItem>
                        <SelectItem value="HALF_YEARLY" className="font-bold">Half Yearly</SelectItem>
                        <SelectItem value="ANNUAL" className="font-bold">Annual</SelectItem>
                        <SelectItem value="PRE_BOARD" className="font-bold">Pre-Board</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Academic Term</label>
                    <Select value={String(newExam.term)} onValueChange={(v) => setNewExam({...newExam, term: parseInt(v || "1")})}>
                      <SelectTrigger className="h-14 bg-muted/50 border-none rounded-2xl font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-emerald-500/10" >
                        <SelectItem value="1" className="font-bold">Term 1</SelectItem>
                        <SelectItem value="2" className="font-bold">Term 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Commencement</label>
                    <Input type="date" value={newExam.startDate} onChange={(e) => setNewExam({...newExam, startDate: e.target.value})} className="h-14 bg-muted/50 border-none rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Conclusion</label>
                    <Input type="date" value={newExam.endDate} onChange={(e) => setNewExam({...newExam, endDate: e.target.value})} className="h-14 bg-muted/50 border-none rounded-2xl font-bold" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4">
                <Button variant="ghost" className="h-12 rounded-2xl font-bold" onClick={() => setIsDialogOpen(false)}>Discard</Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={submitting}
                  className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deploy Session"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytical Intelligence Layer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
        <StatCard 
          label="Active Assessments" 
          value={String(metrics.activeExams)} 
          icon={Calendar} 
          trend={[10, 15, 12, 18, 20, 16, 12]} 
          description="Assessments currently in progress"
          variant="emerald"
        />
        <StatCard 
          label="Syllabus Completion" 
          value={`${metrics.completionRate}%`} 
          icon={TrendingUp} 
          trend={[60, 65, 72, 78, 82, 85, 88]} 
          description="Average vertical coverage across grades"
          variant="blue"
        />
        <StatCard 
          label="Pending Marks Entry" 
          value={String(metrics.pendingMarks)} 
          icon={AlertCircle} 
          trend={[200, 180, 190, 170, 165, 160, 156]} 
          description="Data points awaiting synchronization"
          variant="amber"
        />
      </div>

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 gap-8">
        <Card variant="glass" className="border-emerald-500/5 shadow-2xl overflow-hidden group/card relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/card:opacity-[0.07] transition-opacity duration-1000 pointer-events-none">
             <LayoutGrid className="w-64 h-64 scale-150 rotate-12" />
          </div>

          <div className="p-8 border-b border-emerald-500/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                  <ClipboardList className="w-6 h-6 text-emerald-600" />
               </div>
               <div>
                  <h3 className="text-xl font-black tracking-tight">Examination Master Registry</h3>
                  <p className="text-sm font-semibold text-muted-foreground">Comprehensive log of all academic assessments.</p>
               </div>
            </div>
            
            <div className="relative w-full md:w-96 group/search">
               <div className="absolute -inset-1 bg-emerald-500/10 rounded-2xl blur opacity-0 group-hover/search:opacity-100 transition duration-500"></div>
               <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                 <Input
                   placeholder="Filter sessions by ID or Title..."
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
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Exam Profile</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Classification</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Temporal Window</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Operational State</TableHead>
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
                ) : filteredExams.length === 0 ? (
                  <TableRow className="border-none">
                    <TableCell colSpan={5} className="py-32 text-center">
                       <div className="flex flex-col items-center gap-4 grayscale opacity-20">
                          <AlertCircle className="w-20 h-20" />
                          <p className="text-xl font-black">Null Data Detected</p>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExams.map((exam) => {
                    const status = new Date(exam.endDate) < new Date() ? "COMPLETED" : new Date(exam.startDate) > new Date() ? "SCHEDULED" : "ACTIVE"
                    
                    return (
                      <TableRow key={exam.id} className="group/row hover:bg-emerald-500/[0.02] transition-all border-b border-emerald-500/5">
                        <TableCell className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-500/10 flex items-center justify-center shadow-sm group-hover/row:scale-110 transition-transform">
                                 <Sparkles className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div>
                                 <p className="font-black text-lg group-hover/row:text-emerald-600 transition-colors">{exam.name}</p>
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">TERM {exam.term} ASSESSMENT</p>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className={cn(
                             "rounded-lg px-3 py-1 font-black text-[10px] tracking-widest",
                             "bg-blue-500/5 text-blue-600 border-blue-500/10"
                           )}>
                             {exam.type.replace("_", " ")}
                           </Badge>
                        </TableCell>
                        <TableCell>
                           <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                 <Clock className="w-3 h-3 text-emerald-500" />
                                 {new Date(exam.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(exam.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                              <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                                 <div className={cn(
                                   "h-full rounded-full transition-all duration-1000",
                                   status === "COMPLETED" ? "w-full bg-emerald-500" : status === "ACTIVE" ? "w-1/2 bg-blue-500" : "w-0 bg-zinc-300"
                                 )} />
                              </div>
                           </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                status === "ACTIVE" ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                                status === "SCHEDULED" ? "bg-blue-500" : "bg-zinc-400"
                              )} />
                              <span className="text-[10px] font-black tracking-[0.1em] uppercase">
                                {status}
                              </span>
                           </div>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl border-emerald-500/10 hover:bg-emerald-500/10 hover:text-emerald-700 font-bold"
                                onClick={() => router.push(`/${tenantSlug}/${role}/exams/${exam.id}/marks`)}
                              >
                                <Zap className="w-3.5 h-3.5 mr-2" /> Marks Entry
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl border-emerald-500/10 hover:bg-emerald-500/10 hover:text-emerald-700 font-bold"
                                onClick={() => router.push(`/${tenantSlug}/${role}/exams/report-cards?examId=${exam.id}`)}
                              >
                                <FileText className="w-3.5 h-3.5 mr-2" /> Reports
                              </Button>
                              <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
                                 <MoreVertical className="w-4 h-4" />
                              </Button>
                           </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Background Ambience Icons */}
      <div className="fixed bottom-0 left-0 p-10 opacity-[0.02] pointer-events-none">
         <LayoutGrid className="w-96 h-96 -translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  )
}
