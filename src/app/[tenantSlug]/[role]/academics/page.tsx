"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Zap, 
  Search, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Play, 
  BarChart3, 
  Settings,
  FileText,
  MoreVertical,
  Bookmark,
  LayoutGrid,
  Sparkles,
  Target,
  TrendingUp,
  GraduationCap,
  ClipboardList,
  ChevronLeft,
  ArrowUpRight,
  Lightbulb,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Sheet, SheetContent } from "@/components/ui/sheet"

type SyllabusProgress = {
  id: string
  subject: string
  grade: string
  term: string
  completion: number
  status: string
  lastUpdated: string
  lastLesson: string
}

// ─── HELPER COMPONENTS ───
function StatCard({ label, value, icon: Icon, trend, description, variant = "emerald", className }: any) {
  return (
    <Card className={cn("p-6 rounded-3xl border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500", className)}>
      <div className="flex flex-col h-full justify-between relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6", 
            variant === "emerald" ? "bg-emerald-500/10 text-emerald-600" :
            variant === "blue" ? "bg-blue-500/10 text-blue-600" :
            "bg-amber-500/10 text-amber-600"
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
             <div className="flex gap-0.5 items-end h-3">
                {trend.map((h: number, i: number) => (
                   <div key={i} className={cn("w-1 rounded-full", variant === "emerald" ? "bg-emerald-500/40" : variant === "blue" ? "bg-blue-500/40" : "bg-amber-500/40")} style={{ height: `${(h/100) * 100}%` }} />
                ))}
             </div>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
        </div>
        <p className="text-[10px] text-slate-500 font-medium mt-4 line-clamp-1">{description}</p>
      </div>
      <div className={cn("absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-10 rounded-full transition-all duration-700 group-hover:scale-150", 
        variant === "emerald" ? "bg-emerald-500" : variant === "blue" ? "bg-blue-500" : "bg-amber-500"
      )} />
    </Card>
  )
}

export default function AcademicsPage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string
  
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ globalProgress: "74%", courseVectors: 124, syllabusAlerts: 3, qualityIndex: "9.2" })
  const [trajectory, setTrajectory] = useState<SyllabusProgress[]>([])
  
  // AI Trainer State
  const [designerOpen, setDesignerOpen] = useState(false)
  const [designing, setDesigning] = useState(false)
  const [distributing, setDistributing] = useState(false)
  const [lessonPlan, setLessonPlan] = useState<any>(null)
  
  const [showAdvisor, setShowAdvisor] = useState(true)
  
  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch("/api/academics?stats=true").then(r => r.json()),
      fetch("/api/academics").then(r => r.json())
    ]).then(([s, t]) => {
      setStats(s)
      setTrajectory(t)
    }).finally(() => setLoading(false))
  }, [])

  const filteredProgress = trajectory.filter(a => 
    a.subject.toLowerCase().includes(search.toLowerCase()) || 
    a.grade.toLowerCase().includes(search.toLowerCase())
  )

  const simulateDesign = () => {
    setDesigning(true)
    setLessonPlan(null)
    setDistributing(false)
    setTimeout(() => {
      setLessonPlan({
        objectives: ["Analyze core structures", "Optimizing flow states", "Strategic implementation patterns"],
        methodology: "Constructivist pedagogical framework",
        aiObservation: "Course vector aligns with premium architectural standards. Significant velocity in concepts identified."
      })
      setDesigning(false)
    }, 2800)
  }

  const simulateDistribution = () => {
    setDistributing(true)
    setTimeout(() => {
      setDistributing(false)
      setDesignerOpen(false)
      // Visual feedback via toast would be nice here but let's stick to state for now
    }, 2500)
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      
      {/* Pedagogical Intelligence Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                Curriculum Oversight
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                <Target className="w-3 h-3" />
                Strategic Alignment
              </div>
           </div>
           <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">
              Academic <span className="text-emerald-600">Command</span>
           </h1>
           <p className="text-muted-foreground font-semibold max-w-xl text-lg">
              Strategic oversight of pedagogical trajectories, curriculum deployment, and instructional quality assurance.
           </p>
        </div>

        <div className="flex items-center gap-4">
           <Button 
            onClick={() => setDesignerOpen(true)}
            className="h-14 px-8 rounded-2xl bg-emerald-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 group"
           >
              <Sparkles className="w-4 h-4 mr-3 group-hover:rotate-180 transition-transform duration-700" />
              AI Lesson Designer
           </Button>
        </div>
      </div>

      {/* Instructional Metrics Hub */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
        <StatCard 
          label="Global Progress" 
          value={stats.globalProgress} 
          icon={TrendingUp} 
          trend={[60, 62, 65, 68, 70, 71, 72.4]} 
          description="Average vertical syllabus coverage"
          variant="emerald"
        />
        <StatCard 
          label="Course Vectors" 
          value={stats.courseVectors.toString()} 
          icon={BookOpen} 
          trend={[80, 82, 84, 84, 84, 84, 84]} 
          description="Active instructional streams"
          variant="blue"
        />
        <StatCard 
          label="Syllabus Alerts" 
          value={stats.syllabusAlerts.toString()} 
          icon={AlertCircle} 
          trend={[5, 8, 4, 3, 5, 2, 4]} 
          description="Courses lagging behind schedule"
          variant="amber"
          className="border-amber-500/10"
        />
        <StatCard 
          label="Quality Index" 
          value={stats.qualityIndex} 
          icon={Sparkles} 
          trend={[9.2, 9.4, 9.5, 9.7, 9.8, 9.8, 9.8]} 
          description="Strategic instructional feedback"
          variant="emerald"
        />
      </div>

      {/* Curriculum Trajectory Table */}
      <div className="grid grid-cols-1 gap-8">
        <Card variant="glass" className="border-emerald-500/5 shadow-2xl overflow-hidden group/card relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/card:opacity-[0.07] transition-opacity duration-1000 pointer-events-none">
             <GraduationCap className="w-64 h-64 scale-150 rotate-12" />
          </div>

          <div className="p-8 border-b border-emerald-500/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                  <ClipboardList className="w-6 h-6 text-emerald-600" />
               </div>
               <div>
                  <h3 className="text-xl font-black tracking-tight">Academic Progress Registry</h3>
                  <p className="text-sm font-semibold text-muted-foreground">Comprehensive log of pedagogical advancement across all grades.</p>
               </div>
            </div>
            
            <div className="relative w-full md:w-96 group/search">
               <div className="absolute -inset-1 bg-emerald-500/10 rounded-2xl blur opacity-0 group-hover/search:opacity-100 transition duration-500"></div>
               <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                 <Input
                   placeholder="Filter academics by subject or grade..."
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
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Instructional Stream</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Temporal Coverage</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Current Objective</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Flow State</TableHead>
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400 text-right">Directives</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="animate-pulse border-none">
                       <TableCell colSpan={5} className="p-0">
                          <div className="h-16 w-full bg-muted/5" />
                       </TableCell>
                    </TableRow>
                  ))
                ) : filteredProgress.length === 0 ? (
                  <TableRow className="border-none">
                    <TableCell colSpan={5} className="py-32 text-center text-muted-foreground font-bold">
                       No pedagogical vectors detected in current search space.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProgress.map((item) => (
                    <TableRow key={item.id} className="group/row hover:bg-emerald-500/[0.02] transition-all border-b border-emerald-500/5">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-500/10 flex items-center justify-center shadow-sm group-hover/row:scale-110 transition-transform">
                              <BookOpen className="w-5 h-5 text-emerald-600" />
                           </div>
                           <div>
                              <p className="font-black text-lg group-hover/row:text-emerald-600 transition-colors tracking-tight uppercase">{item.subject}</p>
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.grade}</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                               <span>Coverage</span>
                               <span className="text-emerald-600">{item.completion}%</span>
                            </div>
                            <div className="w-40 h-1.5 bg-muted rounded-full overflow-hidden">
                               <div 
                                 className={cn(
                                   "h-full rounded-full transition-all duration-1000",
                                   item.status === "DELAYED" ? "bg-amber-500" : "bg-emerald-600"
                                 )} 
                                 style={{ width: `${item.completion}%` }}
                               />
                            </div>
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Bookmark className="w-3.5 h-3.5 text-blue-500" />
                           <span className="text-sm font-bold dark:text-white line-clamp-1">{item.lastLesson}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              item.status === "ON_TRACK" ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                              item.status === "COMPLETED" ? "bg-blue-500" : "bg-amber-500"
                            )} />
                            <span className="text-[10px] font-black tracking-[0.1em] uppercase">
                              {item.status.replace("_", " ")}
                            </span>
                         </div>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-xl border-emerald-500/10 hover:bg-emerald-500/10 hover:text-emerald-700 font-bold"
                              onClick={() => {
                                setDesignerOpen(true)
                                simulateDesign()
                              }}
                            >
                              <FileText className="w-3.5 h-3.5 mr-2" /> Planner
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

      {/* AI Lesson Designer Drawer */}
      <DesignerDrawer 
        open={designerOpen} 
        onOpenChange={setDesignerOpen}
        designing={designing}
        distributing={distributing}
        onDesign={simulateDesign}
        onDistribute={simulateDistribution}
        lesson={lessonPlan}
      />

      {/* Floating Pedagogical Advisor */}
      <AnimatePresence>
        {showAdvisor && (
          <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed bottom-10 right-10 w-80 z-50"
          >
            <div className="p-6 rounded-[2rem] bg-zinc-950 border border-emerald-500/20 shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none" />
               <button 
                 onClick={() => setShowAdvisor(false)}
                 className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors"
               >
                 <X className="w-4 h-4" />
               </button>
               
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                     <Lightbulb className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500">Pedagogical Probit</span>
               </div>
               
               <p className="text-sm font-bold text-zinc-300 leading-relaxed">
                 "Grade 11 Physics trajectory is showing a <span className="text-emerald-500">12% variance</span> in concept retention. Consider micro-assessment synthesis."
               </p>
               
               <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Confidence: 94%</span>
                  <Button variant="link" className="p-0 h-auto text-[9px] font-black uppercase tracking-widest text-emerald-500 group-hover:translate-x-1 transition-transform">
                    Tune Signal <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Pedagogical Lattice */}
      <div className="fixed bottom-0 right-0 p-10 opacity-[0.02] pointer-events-none">
         <BarChart3 className="w-[500px] h-[500px] translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  )
}

function DesignerDrawer({ open, onOpenChange, designing, distributing, onDesign, onDistribute, lesson }: any) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl bg-zinc-950 border-zinc-800 p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="p-8 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Curriculum Intelligence</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight leading-none">Pedagogical <span className="text-emerald-500">Architect</span></h2>
            <p className="text-zinc-500 text-sm font-medium mt-2 leading-relaxed">AI-driven lesson planning and strategic instructional alignment for vertical syllabus optimization.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-12">
            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Design Parameters</h4>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                     <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Global Topic</p>
                     <p className="text-sm font-bold text-white">Advanced Calculus</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1 text-right">
                     <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Instructional Cohort</p>
                     <p className="text-sm font-bold text-white">Grade 12-A</p>
                  </div>
               </div>
               
               <Button 
                onClick={onDesign}
                disabled={designing}
                className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 group"
               >
                 {designing ? (
                   <span className="flex items-center gap-4">
                     <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                     Orchestrating Pedagogical Vectors...
                   </span>
                 ) : (
                   <span className="flex items-center gap-3">
                     <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                     Initialize AI Generation
                   </span>
                 )}
               </Button>
            </div>

            {designing && (
              <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-4 w-full bg-zinc-900 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            )}

            {lesson && !designing && (
              <div className="space-y-12 animate-in fade-in zoom-in-95 duration-1000">
                <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-6">
                   <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                     <Target className="w-4 h-4" />
                     Instructional Objectives
                   </h4>
                   <div className="space-y-4">
                      {lesson.objectives.map((obj: string, i: number) => (
                        <div key={i} className="flex items-start gap-4 group">
                           <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                             0{i+1}
                           </div>
                           <p className="flex-1 text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{obj}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-6">
                   <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                     <LayoutGrid className="w-4 h-4" />
                     Methodology Blueprint
                   </h4>
                   <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800">
                      <p className="text-zinc-300 font-bold leading-relaxed">{lesson.methodology}</p>
                   </div>
                </div>

                <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                   <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
                     <Bookmark className="w-4 h-4" />
                     AI Observation Pulse
                   </h4>
                   <p className="text-sm font-bold text-zinc-300 italic leading-relaxed">
                     "{lesson.aiObservation}"
                   </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-8 border-t border-zinc-800 bg-zinc-900/50 flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1 h-14 rounded-2xl border-zinc-800 hover:bg-zinc-800 text-white font-black uppercase tracking-widest"
              onClick={() => onOpenChange(false)}
            >
              Discard
            </Button>
            {lesson ? (
              <Button 
                onClick={onDistribute}
                disabled={distributing}
                className="flex-1 h-14 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-widest"
              >
                {distributing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Syncing...
                  </div>
                ) : (
                  <>
                    Distribute <ArrowUpRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button disabled className="flex-1 h-14 rounded-2xl bg-white/20 text-white/40 font-black uppercase tracking-widest">
                Export Plan
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
