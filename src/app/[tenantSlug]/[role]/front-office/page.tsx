"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import {
   Users,
   PhoneIncoming,
   UserPlus,
   Search,
   Plus,
   Filter,
   ArrowUpRight,
   AlertCircle,
   Clock,
   CheckCircle2,
   Building2,
   BookOpen,
   User,
   Phone,
   Mail,
   FileText,
   MoreVertical,
   Calendar,
   X,
   ShieldCheck,
   Key,
   CheckSquare
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────

interface Visitor {
   id: string
   name: string
   phone: string
   purpose: string
   personToMeet: string
   checkIn: string
   checkOut: string | null
   status: string
}

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
   nextFollowUp: string | null
   notes: string | null
   assignedTo: { name: string } | null
   followUps: any[]
}

interface GatePass {
   id: string
   studentName: string
   parentName: string
   parentPhone: string
   reason: string
   status: string
   otp: string
   otpExpiresAt: string
   requestedAt: string
   verifiedAt: string | null
   exitTime: string | null
}

// ─── Component ─────────────────────────────

export default function FrontOfficePage() {
   const params = useParams()
   const tenantSlug = params.tenantSlug as string
   const role = params.role as string

   // Tab state
   const [activeTab, setActiveTab] = useState<"visitors" | "enquiries" | "gatepass">("visitors")

   // Visitors state
   const [visitors, setVisitors] = useState<Visitor[]>([])
   const [visitorSearch, setVisitorSearch] = useState("")
   const [isVisitorInOpen, setIsVisitorInOpen] = useState(false)
   const [visitorForm, setVisitorForm] = useState({ name: "", phone: "", purpose: "", personToMeet: "" })

   // Enquiries state
   const [enquiries, setEnquiries] = useState<Enquiry[]>([])
   const [enquiryStats, setEnquiryStats] = useState<any>(null)
   const [enquirySearch, setEnquirySearch] = useState("")
   const [enquiryStatusFilter, setEnquiryStatusFilter] = useState("ALL")
   const [isEnquiryOpen, setIsEnquiryOpen] = useState(false)
   const [enquiryForm, setEnquiryForm] = useState({ studentName: "", parentName: "", phone: "", email: "", source: "Walk-in", notes: "" })

   // Gate Pass state
   const [gatePasses, setGatePasses] = useState<GatePass[]>([])
   const [gatePassStats, setGatePassStats] = useState<any>({ total: 0, verified: 0, active: 0 })
   const [isGatePassOpen, setIsGatePassOpen] = useState(false)
   const [gatePassForm, setGatePassForm] = useState({ studentId: "", parentName: "", parentPhone: "", reason: "Early Pickup" })
   const [otpVerify, setOtpVerify] = useState({ open: false, gatePassId: "", otp: "" })

   // Loading
   const [loading, setLoading] = useState(true)

   // Fetch data
   const fetchData = useCallback(async () => {
      setLoading(true)
      try {
         const [visitorsRes, enquiriesRes, statsRes, gatepassListRes, gatepassStatsRes] = await Promise.all([
            fetch("/api/visitors"),
            fetch("/api/enquiries"),
            fetch("/api/enquiries?stats=true"),
            fetch("/api/gatepass"),
            fetch("/api/gatepass/stats"),
         ])

         if (visitorsRes.ok) {
            const data = await visitorsRes.json()
            setVisitors(data.data || [])
         }
         if (enquiriesRes.ok) {
            const data = await enquiriesRes.json()
            setEnquiries(data.enquiries || [])
         }
         if (statsRes.ok) {
            const data = await statsRes.json()
            setEnquiryStats(data)
         }
         if (gatepassListRes.ok) {
            const data = await gatepassListRes.json()
            setGatePasses(data.data || [])
         }
         if (gatepassStatsRes.ok) {
            const stats = await gatepassStatsRes.json()
            setGatePassStats(stats)
         }
      } catch (error) {
         console.error("Front Office fetch error:", error)
      } finally {
         setLoading(false)
      }
   }, [])

   useEffect(() => {
      fetchData()
   }, [fetchData])

   // Visitor check-in
   const handleVisitorCheckIn = async () => {
      try {
         const res = await fetch("/api/visitors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(visitorForm),
         })
         if (res.ok) {
            setIsVisitorInOpen(false)
            setVisitorForm({ name: "", phone: "", purpose: "", personToMeet: "" })
            fetchData()
         }
      } catch (error) {
         console.error("Visitor check-in error:", error)
      }
   }

   // Visitor check-out
   const handleVisitorCheckOut = async (visitorId: string) => {
      try {
         const res = await fetch(`/api/visitors/${visitorId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "CHECKED_OUT" }),
         })
         if (res.ok) fetchData()
      } catch (error) {
         console.error("Visitor check-out error:", error)
      }
   }

   // Create enquiry
   const handleCreateEnquiry = async () => {
      try {
         const res = await fetch("/api/enquiries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(enquiryForm),
         })
         if (res.ok) {
            setIsEnquiryOpen(false)
            setEnquiryForm({ studentName: "", parentName: "", phone: "", email: "", source: "Walk-in", notes: "" })
            fetchData()
         }
      } catch (error) {
         console.error("Create enquiry error:", error)
      }
   }

   // Request gate pass
   const handleRequestGatePass = async () => {
      try {
         const res = await fetch("/api/gatepass", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gatePassForm),
         })
         if (res.ok) {
            setIsGatePassOpen(false)
            setGatePassForm({ studentId: "", parentName: "", parentPhone: "", reason: "Early Pickup" })
            fetchData()
         }
      } catch (error) {
         console.error("Gate pass request error:", error)
      }
   }

   // Verify OTP
   const handleVerifyOTP = async () => {
      try {
         const res = await fetch("/api/gatepass/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ otp: otpVerify.otp }),
         })
         if (res.ok) {
            setOtpVerify({ open: false, gatePassId: "", otp: "" })
            fetchData()
         }
      } catch (error) {
         console.error("OTP verification error:", error)
      }
   }

   // Filtered visitors
   const filteredVisitors = visitors.filter(v =>
      !visitorSearch || v.name.toLowerCase().includes(visitorSearch.toLowerCase()) || v.phone.includes(visitorSearch)
   )

   // Filtered enquiries
   const filteredEnquiries = enquiries.filter(e => {
      const matchSearch = !enquirySearch || e.studentName.toLowerCase().includes(enquirySearch.toLowerCase()) || e.enquiryNo.toLowerCase().includes(enquirySearch.toLowerCase())
      const matchStatus = enquiryStatusFilter === "ALL" || e.status === enquiryStatusFilter
      return matchSearch && matchStatus
   })

   return (
      <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">

         {/* Header */}
         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                     Command Center
                  </div>
               </div>
               <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">
                  Front Office <span className="text-emerald-600">Terminal</span>
               </h1>
               <p className="text-muted-foreground font-semibold max-w-xl text-lg">
                  Visitor management, enquiry handling, and gate pass operations.
               </p>
            </div>
         </div>

         {/* Tabs */}
         <div className="flex items-center gap-4 px-2">
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl">
               {(["visitors", "enquiries", "gatepass"] as const).map(tab => (
                  <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={cn(
                        "px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-widest transition-all flex items-center gap-2",
                        activeTab === tab
                           ? "bg-white dark:bg-zinc-800 text-emerald-900 dark:text-white shadow-sm"
                           : "text-muted-foreground hover:text-foreground"
                     )}
                  >
                     {tab === "visitors" && <Users className="w-4 h-4" />}
                     {tab === "enquiries" && <PhoneIncoming className="w-4 h-4" />}
                     {tab === "gatepass" && <ShieldCheck className="w-4 h-4" />}
                     {tab === "visitors" ? "Visitors" : tab === "enquiries" ? "Enquiries" : "Gate Pass"}
                  </button>
               ))}
            </div>
         </div>

         {/* ═══════════════════════════════════════ VISITORS TAB ═══════════════════════════════════════ */}
         {activeTab === "visitors" && (
            <>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                  <StatCard label="Checked In" value={visitors.filter(v => v.status === "CHECKED_IN").length.toString()} icon={Users} description="Currently on campus" variant="blue" />
                  <StatCard label="Checked Out" value={visitors.filter(v => v.status === "CHECKED_OUT").length.toString()} icon={CheckCircle2} description="Completed visits today" variant="emerald" />
                  <StatCard label="Total Today" value={visitors.length.toString()} icon={Clock} description="All visitor logs" variant="amber" />
               </div>

               <Card variant="glass" className="border-emerald-500/5 shadow-2xl overflow-hidden">
                  <div className="p-8 border-b border-emerald-500/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                           <Building2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black tracking-tight">Visitor Registry</h3>
                           <p className="text-sm font-semibold text-muted-foreground">All visitor check-ins and check-outs.</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                           <Input placeholder="Search visitors..." value={visitorSearch} onChange={(e) => setVisitorSearch(e.target.value)} className="h-14 pl-12 bg-muted/50 border-none rounded-2xl font-bold" />
                        </div>
                        <Button onClick={() => setIsVisitorInOpen(true)} className="h-14 px-6 rounded-2xl bg-emerald-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-xl">
                           <Plus className="w-4 h-4 mr-2" /> Check In
                        </Button>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <Table>
                        <TableHeader>
                           <TableRow className="bg-emerald-500/[0.02] border-none">
                              <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Visitor</TableHead>
                              <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Purpose</TableHead>
                              <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Person to Meet</TableHead>
                              <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Check In</TableHead>
                              <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Status</TableHead>
                              <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400 text-right">Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {filteredVisitors.length === 0 ? (
                              <TableRow className="border-none">
                                 <TableCell colSpan={6} className="py-32 text-center text-muted-foreground font-bold">
                                    No visitors recorded today.
                                 </TableCell>
                              </TableRow>
                           ) : (
                              filteredVisitors.map((v) => (
                                 <TableRow key={v.id} className="group/row hover:bg-emerald-500/[0.02] transition-all border-b border-emerald-500/5">
                                    <TableCell className="px-8 py-6">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-500/10 flex items-center justify-center shadow-sm">
                                             <User className="w-5 h-5 text-emerald-600" />
                                          </div>
                                          <div>
                                             <p className="font-black text-lg tracking-tight">{v.name}</p>
                                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {v.phone}
                                             </p>
                                          </div>
                                       </div>
                                    </TableCell>
                                    <TableCell className="text-sm font-bold">{v.purpose}</TableCell>
                                    <TableCell className="text-sm font-bold">{v.personToMeet}</TableCell>
                                    <TableCell className="text-sm font-bold">{new Date(v.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                    <TableCell>
                                       <Badge className={cn(
                                          "rounded-xl font-black text-[10px] uppercase tracking-widest",
                                          v.status === "CHECKED_IN" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                       )}>
                                          {v.status}
                                       </Badge>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-right">
                                       {v.status === "CHECKED_IN" && (
                                          <Button onClick={() => handleVisitorCheckOut(v.id)} variant="outline" size="sm" className="rounded-xl border-emerald-500/10 hover:bg-emerald-500/10 hover:text-emerald-700 font-bold">
                                             <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Check Out
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
            </>
         )}

         {/* ═══════════════════════════════════════ ENQUIRIES TAB ═══════════════════════════════════════ */}
         {activeTab === "enquiries" && (
            <>
               {enquiryStats && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 px-2">
                     <StatCard label="Total" value={enquiryStats.total.toString()} icon={FileText} description="All enquiries" variant="blue" />
                     <StatCard label="Open" value={enquiryStats.open.toString()} icon={AlertCircle} description="Pending follow-up" variant="amber" />
                     <StatCard label="Called" value={enquiryStats.called.toString()} icon={Phone} description="Telephonic contact" variant="emerald" />
                     <StatCard label="Visited" value={enquiryStats.visited.toString()} icon={Building2} description="Campus visit done" variant="emerald" />
                     <StatCard label="Admitted" value={enquiryStats.admitted.toString()} icon={CheckCircle2} description="Conversion successful" variant="emerald" />
                  </div>
               )}

               <Card variant="glass" className="border-emerald-500/5 shadow-2xl overflow-hidden">
                  <div className="p-8 border-b border-emerald-500/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                           <PhoneIncoming className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black tracking-tight">Enquiry CRM</h3>
                           <p className="text-sm font-semibold text-muted-foreground">Lead tracking and follow-up management.</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 w-full md:w-auto">
                        <Select value={enquiryStatusFilter} onValueChange={(v) => { if (v) setEnquiryStatusFilter(v) }}>
                           <SelectTrigger className="h-14 w-44 rounded-2xl font-bold bg-muted/50 border-none">
                              <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-emerald-500" /><SelectValue /></div>
                           </SelectTrigger>
                           <SelectContent className="rounded-2xl">
                              <SelectItem value="ALL">All Statuses</SelectItem>
                              <SelectItem value="OPEN">Open</SelectItem>
                              <SelectItem value="CALLED">Called</SelectItem>
                              <SelectItem value="VISITED">Visited</SelectItem>
                              <SelectItem value="ADMISSION_TAKEN">Admitted</SelectItem>
                              <SelectItem value="CLOSED">Closed</SelectItem>
                           </SelectContent>
                        </Select>
                        <div className="relative w-full md:w-64">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                           <Input placeholder="Search enquiries..." value={enquirySearch} onChange={(e) => setEnquirySearch(e.target.value)} className="h-14 pl-12 bg-muted/50 border-none rounded-2xl font-bold" />
                        </div>
                        <Button onClick={() => setIsEnquiryOpen(true)} className="h-14 px-6 rounded-2xl bg-emerald-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-xl">
                           <Plus className="w-4 h-4 mr-2" /> New Enquiry
                        </Button>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <Table>
                        <TableHeader>
                           <TableRow className="bg-emerald-500/[0.02] border-none">
                              <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Enquiry No</TableHead>
                              <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Student / Parent</TableHead>
                              <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Contact</TableHead>
                              <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Source</TableHead>
                              <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Status</TableHead>
                              <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Follow Up</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {filteredEnquiries.length === 0 ? (
                              <TableRow className="border-none">
                                 <TableCell colSpan={6} className="py-32 text-center text-muted-foreground font-bold">
                                    No enquiries found.
                                 </TableCell>
                              </TableRow>
                           ) : (
                              filteredEnquiries.map((e) => (
                                 <TableRow key={e.id} className="group/row hover:bg-emerald-500/[0.02] transition-all border-b border-emerald-500/5">
                                    <TableCell className="px-8 py-6">
                                       <p className="font-mono font-black text-sm">{e.enquiryNo}</p>
                                       <p className="text-[9px] text-muted-foreground font-bold">{new Date(e.date).toLocaleDateString()}</p>
                                    </TableCell>
                                    <TableCell>
                                       <p className="font-black text-sm">{e.studentName}</p>
                                       <p className="text-[10px] text-muted-foreground font-bold">{e.parentName}</p>
                                    </TableCell>
                                    <TableCell>
                                       <div className="space-y-1">
                                          <p className="text-xs font-bold flex items-center gap-1"><Phone className="w-3 h-3" /> {e.phone}</p>
                                          {e.email && <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1"><Mail className="w-3 h-3" /> {e.email}</p>}
                                       </div>
                                    </TableCell>
                                    <TableCell className="text-sm font-bold">{e.source || "—"}</TableCell>
                                    <TableCell>
                                       <Badge className={cn(
                                          "rounded-xl font-black text-[10px] uppercase tracking-widest",
                                          e.status === "OPEN" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                             e.status === "VISITED" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                                e.status === "ADMISSION_TAKEN" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                                   "bg-slate-500/10 text-slate-600 border-slate-500/20"
                                       )}>
                                          {e.status}
                                       </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm font-bold">
                                       {e.nextFollowUp ? (
                                          <div className="flex items-center gap-1">
                                             <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                             {new Date(e.nextFollowUp).toLocaleDateString()}
                                          </div>
                                       ) : "—"}
                                    </TableCell>
                                 </TableRow>
                              ))
                           )}
                        </TableBody>
                     </Table>
                  </div>
               </Card>
            </>
         )}

         {/* ═══════════════════════════════════════ GATE PASS TAB ═══════════════════════════════════════ */}
         {activeTab === "gatepass" && (
            <>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                  <StatCard label="Total Requests" value={gatePassStats.total.toString()} icon={FileText} description="Today's gate passes" variant="blue" />
                  <StatCard label="Verified / Exited" value={gatePassStats.verified.toString()} icon={CheckCircle2} description="Completed exits" variant="emerald" />
                  <StatCard label="Pending OTP" value={gatePassStats.active.toString()} icon={Key} description="Awaiting verification" variant="amber" />
               </div>

               <Card variant="glass" className="border-emerald-500/5 shadow-2xl overflow-hidden">
                  <div className="p-8 border-b border-emerald-500/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                           <ShieldCheck className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black tracking-tight">Gate Pass Registry</h3>
                           <p className="text-sm font-semibold text-muted-foreground">Student early pickup and OTP verification.</p>
                        </div>
                     </div>
                     <Button onClick={() => setIsGatePassOpen(true)} className="h-14 px-6 rounded-2xl bg-emerald-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-xl">
                        <Plus className="w-4 h-4 mr-2" /> Request Gate Pass
                     </Button>
                  </div>
                  <div className="overflow-x-auto">
                     <Table>
                        <TableHeader>
                           <TableRow className="bg-emerald-500/[0.02] border-none">
                              <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Student</TableHead>
                              <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Parent / Guardian</TableHead>
                              <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Reason</TableHead>
                              <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Requested</TableHead>
                              <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Status</TableHead>
                              <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400 text-right">Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {gatePasses.length === 0 ? (
                              <TableRow className="border-none">
                                 <TableCell colSpan={6} className="py-32 text-center text-muted-foreground font-bold">
                                    No gate pass requests today.
                                 </TableCell>
                              </TableRow>
                           ) : (
                              gatePasses.map((gp) => (
                                 <TableRow key={gp.id} className="group/row hover:bg-emerald-500/[0.02] transition-all border-b border-emerald-500/5">
                                    <TableCell className="px-8 py-6">
                                       <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-500/10 flex items-center justify-center shadow-sm">
                                             <BookOpen className="w-5 h-5 text-emerald-600" />
                                          </div>
                                          <p className="font-black text-lg tracking-tight">{gp.studentName}</p>
                                       </div>
                                    </TableCell>
                                    <TableCell>
                                       <p className="text-sm font-black">{gp.parentName}</p>
                                       <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1"><Phone className="w-3 h-3" /> {gp.parentPhone}</p>
                                    </TableCell>
                                    <TableCell className="text-sm font-bold">{gp.reason}</TableCell>
                                    <TableCell className="text-sm font-bold">{new Date(gp.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                    <TableCell>
                                       <Badge className={cn(
                                          "rounded-xl font-black text-[10px] uppercase tracking-widest",
                                          gp.status === "REQUESTED" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                             gp.status === "VERIFIED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                                "bg-slate-500/10 text-slate-600 border-slate-500/20"
                                       )}>
                                          {gp.status}
                                       </Badge>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-right">
                                       {gp.status === "REQUESTED" && (
                                          <Button onClick={() => setOtpVerify({ open: true, gatePassId: gp.id, otp: "" })} variant="outline" size="sm" className="rounded-xl border-emerald-500/10 hover:bg-emerald-500/10 hover:text-emerald-700 font-bold">
                                             <Key className="w-3.5 h-3.5 mr-2" /> Verify OTP
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
            </>
         )}

         {/* ═══════════════════════════════════════ DIALOGS ═══════════════════════════════════════ */}

         {/* Visitor Check-In Dialog */}
         <Dialog open={isVisitorInOpen} onOpenChange={setIsVisitorInOpen}>
            <DialogContent className="max-w-lg rounded-3xl">
               <DialogHeader>
                  <DialogTitle>Visitor Check-In</DialogTitle>
                  <DialogDescription>Record a new visitor entry.</DialogDescription>
               </DialogHeader>
               <div className="grid gap-4 py-4">
                  <div><Label htmlFor="v-name">Name *</Label><Input id="v-name" value={visitorForm.name} onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })} className="rounded-xl mt-1" /></div>
                  <div><Label htmlFor="v-phone">Phone *</Label><Input id="v-phone" value={visitorForm.phone} onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })} className="rounded-xl mt-1" /></div>
                  <div><Label htmlFor="v-purpose">Purpose *</Label><Input id="v-purpose" value={visitorForm.purpose} onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })} className="rounded-xl mt-1" /></div>
                  <div><Label htmlFor="v-meet">Person to Meet *</Label><Input id="v-meet" value={visitorForm.personToMeet} onChange={(e) => setVisitorForm({ ...visitorForm, personToMeet: e.target.value })} className="rounded-xl mt-1" /></div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setIsVisitorInOpen(false)} className="rounded-xl">Cancel</Button>
                  <Button onClick={handleVisitorCheckIn} className="rounded-xl font-bold">Check In</Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* New Enquiry Dialog */}
         <Dialog open={isEnquiryOpen} onOpenChange={setIsEnquiryOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
               <DialogHeader>
                  <DialogTitle>New Enquiry</DialogTitle>
                  <DialogDescription>Register a new admission enquiry.</DialogDescription>
               </DialogHeader>
               <div className="grid grid-cols-2 gap-4 py-4">
                  <div><Label>Student Name *</Label><Input value={enquiryForm.studentName} onChange={(e) => setEnquiryForm({ ...enquiryForm, studentName: e.target.value })} className="rounded-xl mt-1" /></div>
                  <div><Label>Parent Name *</Label><Input value={enquiryForm.parentName} onChange={(e) => setEnquiryForm({ ...enquiryForm, parentName: e.target.value })} className="rounded-xl mt-1" /></div>
                  <div><Label>Phone *</Label><Input value={enquiryForm.phone} onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })} className="rounded-xl mt-1" /></div>
                  <div><Label>Email</Label><Input type="email" value={enquiryForm.email} onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })} className="rounded-xl mt-1" /></div>
                  <div className="col-span-2">
                     <Label>Source</Label>
                     <Select value={enquiryForm.source} onValueChange={(v) => { if (v) setEnquiryForm({ ...enquiryForm, source: v }) }}>
                        <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                           <SelectItem value="Walk-in">Walk-in</SelectItem>
                           <SelectItem value="Phone">Phone Call</SelectItem>
                           <SelectItem value="Website">Website</SelectItem>
                           <SelectItem value="Referral">Referral</SelectItem>
                           <SelectItem value="Social Media">Social Media</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="col-span-2"><Label>Notes</Label><Input value={enquiryForm.notes} onChange={(e) => setEnquiryForm({ ...enquiryForm, notes: e.target.value })} className="rounded-xl mt-1" /></div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEnquiryOpen(false)} className="rounded-xl">Cancel</Button>
                  <Button onClick={handleCreateEnquiry} className="rounded-xl font-bold">Create Enquiry</Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Gate Pass Request Dialog */}
         <Dialog open={isGatePassOpen} onOpenChange={setIsGatePassOpen}>
            <DialogContent className="max-w-lg rounded-3xl">
               <DialogHeader>
                  <DialogTitle>Request Gate Pass</DialogTitle>
                  <DialogDescription>Generate OTP for student early pickup.</DialogDescription>
               </DialogHeader>
               <div className="grid gap-4 py-4">
                  <div><Label>Student ID *</Label><Input value={gatePassForm.studentId} onChange={(e) => setGatePassForm({ ...gatePassForm, studentId: e.target.value })} className="rounded-xl mt-1" placeholder="Admission number" /></div>
                  <div><Label>Parent / Guardian Name *</Label><Input value={gatePassForm.parentName} onChange={(e) => setGatePassForm({ ...gatePassForm, parentName: e.target.value })} className="rounded-xl mt-1" /></div>
                  <div><Label>Parent Phone *</Label><Input value={gatePassForm.parentPhone} onChange={(e) => setGatePassForm({ ...gatePassForm, parentPhone: e.target.value })} className="rounded-xl mt-1" /></div>
                  <div>
                     <Label>Reason</Label>
                     <Select value={gatePassForm.reason} onValueChange={(v) => { if (v) setGatePassForm({ ...gatePassForm, reason: v }) }}>
                        <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                           <SelectItem value="Early Pickup">Early Pickup</SelectItem>
                           <SelectItem value="Medical">Medical Appointment</SelectItem>
                           <SelectItem value="Emergency">Emergency</SelectItem>
                           <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setIsGatePassOpen(false)} className="rounded-xl">Cancel</Button>
                  <Button onClick={handleRequestGatePass} className="rounded-xl font-bold">Generate OTP</Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* OTP Verification Dialog */}
         <Dialog open={otpVerify.open} onOpenChange={(open) => setOtpVerify({ open, gatePassId: "", otp: "" })}>
            <DialogContent className="max-w-sm rounded-3xl">
               <DialogHeader>
                  <DialogTitle>Verify OTP</DialogTitle>
                  <DialogDescription>Enter the 6-digit OTP from the parent.</DialogDescription>
               </DialogHeader>
               <div className="py-4">
                  <Input value={otpVerify.otp} onChange={(e) => setOtpVerify({ ...otpVerify, otp: e.target.value })} className="rounded-xl text-center text-2xl font-black tracking-[0.5em]" maxLength={6} placeholder="000000" />
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setOtpVerify({ open: false, gatePassId: "", otp: "" })} className="rounded-xl">Cancel</Button>
                  <Button onClick={handleVerifyOTP} className="rounded-xl font-bold">Verify & Release</Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   )
}
