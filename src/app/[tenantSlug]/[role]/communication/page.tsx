"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  Megaphone,
  Search,
  Plus,
  Clock,
  Trash2,
  Users,
  Send,
  Sparkles,
  LayoutGrid,
  Bell,
  Eye,
  MessageSquare,
  ShieldAlert,
  Loader2,
  Filter,
  CheckCircle2,
  Share2,
  Type,
  ZapIcon
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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

interface Notice {
  id: string
  title: string
  body: string
  audience: string
  publishedAt: string
}

// ─── Component ─────────────────────────────

export default function CommunicationPlatinumHub() {
  const params = useParams()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newNotice, setNewNotice] = useState({ title: "", body: "", audience: "ALL" })
  const [submitting, setSubmitting] = useState(false)
  const [isDrafting, setIsDrafting] = useState(false)
  const [draftTone, setDraftTone] = useState("FORMAL")

  const TONES = [
    { id: "FORMAL", label: "Strategic", icon: ShieldAlert, color: "text-blue-500" },
    { id: "URGENT", label: "Tactical", icon: ZapIcon, color: "text-amber-500" },
    { id: "INSPIRING", label: "Visionary", icon: Sparkles, color: "text-pink-500" }
  ]

  const fetchNotices = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/communication")
      if (res.ok) setNotices(await res.json())
    } catch (e) {
      console.error("Communication sync failed", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotices()
  }, [])

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/communication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotice)
      })
      if (res.ok) {
        setIsDialogOpen(false)
        fetchNotices()
        setNewNotice({ title: "", body: "", audience: "ALL" })
      }
    } catch (e) {
      console.error("Broadcast error", e)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAIDraft = async () => {
    if (!newNotice.body) return
    setIsDrafting(true)
    
    // Simulate AI transformation logic
    setTimeout(() => {
      const tonePrefix = draftTone === "FORMAL" ? "[STRATEGIC UPDATE] " : draftTone === "URGENT" ? "[CRITICAL ALERT] " : "[VISIONARY SYNC] "
      setNewNotice(prev => ({
        ...prev,
        body: `${tonePrefix}${prev.body.charAt(0).toUpperCase()}${prev.body.slice(1)}. Unified operational response is mandated across all active vectors.`
      }))
      setIsDrafting(false)
    }, 1500)
  }

  const handleDelete = (id: string) => {
    setNotices(n => n.filter(x => x.id !== id))
  }

  const filteredNotices = notices.filter(n => n.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      
      {/* Broadcast Intelligence Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400 text-[10px] font-black uppercase tracking-widest">
                 Information Flow
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                <Bell className="w-3 h-3" />
                Multi-Channel Reach
              </div>
           </div>
           <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">
              Communication <span className="text-pink-600">Hub</span>
           </h1>
           <p className="text-muted-foreground font-semibold max-w-xl text-lg">
              Strategic announcement distribution and notification management for the academic ecosystem.
           </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button className="h-14 px-8 rounded-2xl bg-pink-600 hover:bg-black text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-pink-900/20 transition-all hover:scale-105 active:scale-95 group">
              <Send className="w-4 h-4 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Initialize Broadcast
            </Button>
          } />
          <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-pink-500/10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl">
            <DialogHeader className="p-4">
              <DialogTitle className="text-3xl font-black tracking-tighter">Broadcast Payload</DialogTitle>
              <CardDescription className="text-sm font-bold">Configure the deployment of a new school-wide announcement.</CardDescription>
            </DialogHeader>
            <div className="grid gap-8 py-6 px-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-pink-600">Broadcast Title</label>
                <Input value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})} placeholder="e.g. MISSION ACCOMPLISHED: FINALS COMPLETED" className="h-14 text-lg font-black bg-muted/50 border-none rounded-2xl" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-pink-600">Target Audience Vector</label>
                <Select value={newNotice.audience} onValueChange={v => setNewNotice({...newNotice, audience: v ?? "ALL"})}>
                  <SelectTrigger className="h-14 bg-muted/50 border-none rounded-2xl font-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-pink-500/10">
                    <SelectItem value="ALL" className="font-bold">Global Broadcast (Everyone)</SelectItem>
                    <SelectItem value="STUDENTS" className="font-bold">Students & Guardians</SelectItem>
                    <SelectItem value="STAFF" className="font-bold">Staff & Faculty Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <label className="text-[10px] font-black uppercase tracking-widest text-pink-600">Payload Content</label>
                   <div className="flex items-center gap-2">
                     {TONES.map(t => (
                       <Button 
                         key={t.id} 
                         variant="ghost" 
                         size="sm"
                         onClick={() => setDraftTone(t.id)}
                         className={cn(
                           "h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all",
                           draftTone === t.id ? "bg-white dark:bg-zinc-800 shadow-md ring-1 ring-pink-500/20" : "opacity-40"
                         )}
                       >
                         <t.icon className={cn("w-3 h-3 mr-1.5", draftTone === t.id && t.color)} />
                         {t.label}
                       </Button>
                     ))}
                   </div>
                </div>
                
                <div className="relative group/textarea">
                   <textarea 
                     className="min-h-[160px] w-full rounded-2xl border-none bg-muted/50 px-6 py-4 text-lg font-semibold placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 transition-all"
                     value={newNotice.body} 
                     onChange={e => setNewNotice({...newNotice, body: e.target.value})} 
                     placeholder="Draft your mission statement here..."
                   />
                   <div className="absolute bottom-4 right-4">
                      <Button 
                        size="sm" 
                        onClick={handleAIDraft}
                        disabled={isDrafting || !newNotice.body}
                        className={cn(
                          "h-10 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95",
                          isDrafting && "animate-pulse"
                        )}
                      >
                         {isDrafting ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3.5 h-3.5 mr-2" />}
                         AI Rewrite
                      </Button>
                   </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4">
              <Button variant="ghost" className="h-12 rounded-2xl font-bold" onClick={() => setIsDialogOpen(false)}>Discard</Button>
              <Button onClick={handleCreate} disabled={submitting} className="h-12 px-10 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-pink-600/20">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize Broadcast"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Engagement Intelligence Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
        <StatCard 
          label="Total Broadcasts" 
          value={String(notices.length || 0)} 
          icon={Megaphone} 
          trend={[20, 25, 22, 28, 30, 32, 35]} 
          description="Total archived announcements"
          variant="pink"
          className="border-pink-500/10"
        />
        <StatCard 
          label="Avg. Reach Index" 
          value="92.1%" 
          icon={Eye} 
          trend={[85, 88, 86, 90, 93, 91, 92]} 
          description="Percentage of confirmed reads"
          variant="blue"
        />
        <StatCard 
          label="Active Alerts" 
          value="3" 
          icon={ShieldAlert} 
          trend={[1, 0, 2, 4, 3, 2, 3]} 
          description="Current high-priority notifications"
          variant="amber"
        />
      </div>

      {/* Broadcast Feed Terminal */}
      <div className="space-y-8 relative px-2">
         <div className="flex items-center justify-between pb-4 border-b border-pink-500/5">
            <div className="flex items-center gap-2">
               <Filter className="w-4 h-4 text-pink-600" />
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Filter: Latest Intelligence</span>
            </div>
            <div className="relative w-96 group/search">
               <div className="absolute -inset-1 bg-pink-500/10 rounded-2xl blur opacity-0 group-hover/search:opacity-100 transition duration-500"></div>
               <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-600" />
                 <Input
                   placeholder="Search secure communications..."
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="h-12 pl-12 bg-muted/30 border-none rounded-2xl font-bold focus-visible:ring-pink-500 text-sm"
                 />
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-64 animate-pulse bg-muted/10 border-none rounded-[2rem]" />
              ))
            ) : filteredNotices.length === 0 ? (
              <div className="col-span-full py-40 flex flex-col items-center gap-6 opacity-20 grayscale">
                 <MessageSquare className="w-24 h-24" />
                 <p className="text-xl font-black tracking-tight">Zero Intelligence Hits</p>
              </div>
            ) : (
              filteredNotices.map((notice) => (
                <Card key={notice.id} variant="glass" className="group rounded-[2rem] border-pink-500/5 shadow-xl hover:shadow-pink-500/5 transition-all duration-500 overflow-hidden relative">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-pink-500 to-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                   
                   <CardContent className="p-8 space-y-6">
                      <div className="flex justify-between items-start">
                         <Badge variant="outline" className="h-6 px-3 rounded-lg border-pink-500/10 bg-pink-500/5 text-pink-600 font-black text-[9px] tracking-[0.1em] uppercase">
                            <Users className="w-3 h-3 mr-1.5" />
                            {notice.audience} VECTOR
                         </Badge>
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-pink-50 text-pink-600">
                               <Share2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-50 text-red-500" onClick={() => handleDelete(notice.id)}>
                               <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <h3 className="text-xl font-black tracking-tight leading-tight group-hover:text-pink-600 transition-colors line-clamp-2">
                           {notice.title}
                         </h3>
                         <p className="text-sm font-semibold text-muted-foreground/80 leading-relaxed line-clamp-3">
                           {notice.body}
                         </p>
                      </div>

                      <div className="pt-6 border-t border-pink-500/5 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5 text-pink-500" />
                            {new Date(notice.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                         </div>
                         <div className="flex items-center gap-1.5 text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                         </div>
                      </div>
                   </CardContent>
                </Card>
              ))
            )}
         </div>
      </div>

      {/* Decorative Matrix Lattice */}
      <div className="fixed bottom-0 right-0 p-10 opacity-[0.03] pointer-events-none">
         <LayoutGrid className="w-96 h-96 translate-x-1/2 translate-y-1/2 rotate-12" />
      </div>
    </div>
  )
}
