"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Map,
  Bus,
  User,
  Trash2,
  Navigation,
  ShieldCheck,
  Fuel,
  Settings2,
  MoreVertical,
  Clock,
  Sparkles,
  Route,
  Loader2,
  MapPin,
  TrendingDown,
  Activity,
  FileSpreadsheet
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────

interface TransportRoute {
  id: string
  name: string
  stops: string
  vehicle: string
  driver: string
}

// ─── Component ─────────────────────────────

export default function TransportLogisticsConsole() {
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  const [routes, setRoutes] = useState<TransportRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newRoute, setNewRoute] = useState({ name: "", stops: "", vehicle: "", driver: "" })
  const [submitting, setSubmitting] = useState(false)

  const fetchRoutes = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/transport")
      if (res.ok) setRoutes(await res.json())
    } catch (e) {
      console.error("Transport sync failed", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [])

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/transport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoute)
      })
      if (res.ok) {
        setIsDialogOpen(false)
        fetchRoutes()
        setNewRoute({ name: "", stops: "", vehicle: "", driver: "" })
      }
    } catch (e) {
      console.error("Registration error", e)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    // Demo deletion logic
    setRoutes(r => r.filter(x => x.id !== id))
  }

  const filteredRoutes = routes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Logistics Intelligence Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest">
                Mobility Services
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                <Navigation className="w-3 h-3" />
                GPS Synchronized
              </div>
           </div>
           <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">
              Transport <span className="text-amber-600">Logistics</span>
           </h1>
           <p className="text-muted-foreground font-semibold max-w-xl text-lg">
              Manage school fleets, route networks, and driver schedules with real-time operational oversight.
           </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/${tenantSlug}/${role}/transport/setup`)}
            className="h-14 px-6 rounded-2xl border-amber-500/20 hover:bg-amber-50 font-black text-xs uppercase tracking-[0.15em]"
          >
            <FileSpreadsheet className="mr-3 h-4 w-4 text-amber-600" />
            Migration Setup
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button className="h-14 px-8 rounded-2xl bg-amber-600 hover:bg-black text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-900/20 transition-all hover:scale-105 active:scale-95 group">
              <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform duration-500" />
              Register Route
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-amber-500/10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl">
            <DialogHeader className="p-4">
              <DialogTitle className="text-3xl font-black tracking-tighter">Route Initialization</DialogTitle>
              <CardDescription className="text-sm font-bold">Configure the parameters for a new transport route vector.</CardDescription>
            </DialogHeader>
            <div className="grid gap-8 py-6 px-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-amber-600">Route Identity</label>
                <Input value={newRoute.name} onChange={e => setNewRoute({...newRoute, name: e.target.value})} placeholder="e.g. VECTOR-X / ROUTE 42" className="h-14 text-lg font-black bg-muted/50 border-none rounded-2xl" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-amber-600">Stop Sequence (Comma Separated)</label>
                <Input value={newRoute.stops} onChange={e => setNewRoute({...newRoute, stops: e.target.value})} placeholder="Main Gate, Hospital Square, West End..." className="h-14 font-bold bg-muted/50 border-none rounded-2xl" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amber-600">Vehicle Registry No.</label>
                  <Input value={newRoute.vehicle} onChange={e => setNewRoute({...newRoute, vehicle: e.target.value})} placeholder="UP-16-XX-XXXX" className="h-14 font-mono font-black bg-muted/50 border-none rounded-2xl" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amber-600">Lead Driver</label>
                  <Input value={newRoute.driver} onChange={e => setNewRoute({...newRoute, driver: e.target.value})} placeholder="Operator Name" className="h-14 font-bold bg-muted/50 border-none rounded-2xl" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4">
              <Button variant="ghost" className="h-12 rounded-2xl font-bold" onClick={() => setIsDialogOpen(false)}>Discard</Button>
              <Button onClick={handleCreate} disabled={submitting} className="h-12 px-8 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-widest">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize Route"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Mobility Metrics Hub */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
        <StatCard 
          label="Active Routes" 
          value={String(routes.length || 0)} 
          icon={Route} 
          trend={[12, 14, 13, 15, 16, 17, 18]} 
          description="Operational transport corridors"
          variant="amber"
          className="border-amber-500/10"
        />
        <StatCard 
          label="Fleet Readiness" 
          value="98.4%" 
          icon={Bus} 
          trend={[95, 96, 94, 98, 97, 99, 98]} 
          description="Vehicles cleared for service"
          variant="blue"
        />
        <StatCard 
          label="Fuel Dynamics" 
          value="4.2L/km" 
          icon={Fuel} 
          trend={[4.5, 4.4, 4.3, 4.2, 4.2, 4.1, 4.2]} 
          description="AI Optimized consumption index"
          variant="amber"
          className="group hover:border-blue-500/20"
        />
        <StatCard 
          label="Safety Index" 
          value="A+" 
          icon={ShieldCheck} 
          trend={[100, 100, 100, 100, 100, 100, 100]} 
          description="Compliance and incident status"
          variant="emerald"
        />
      </div>

      {/* Logistics Registry Table */}
      <div className="grid grid-cols-1 gap-8">
        <Card variant="glass" className="border-amber-500/5 shadow-2xl overflow-hidden group/card relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/card:opacity-[0.07] transition-opacity duration-1000 pointer-events-none">
             <Map className="w-64 h-64 scale-150 -rotate-12" />
          </div>

          <div className="p-8 border-b border-amber-500/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/10">
                  <Navigation className="w-6 h-6 text-amber-600" />
               </div>
               <div>
                  <h3 className="text-xl font-black tracking-tight">Fleet Network Registry</h3>
                  <p className="text-sm font-semibold text-muted-foreground">Strategic map of all student mobility routes.</p>
               </div>
            </div>
            
            <div className="relative w-full md:w-96 group/search">
               <div className="absolute -inset-1 bg-amber-500/10 rounded-2xl blur opacity-0 group-hover/search:opacity-100 transition duration-500"></div>
               <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600" />
                 <Input
                   placeholder="Filter logistics by route or driver..."
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="h-14 pl-12 bg-muted/50 border-none rounded-2xl font-bold focus-visible:ring-amber-500"
                 />
               </div>
            </div>
          </div>

          <div className="overflow-x-auto relative z-10">
            <Table>
              <TableHeader>
                <TableRow className="bg-amber-500/[0.02] border-none">
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400">Route Identification</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400">Stop Sequence</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400">Crew & Fleet</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400">Health State</TableHead>
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400 text-right">Directives</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse border-none">
                       <TableCell colSpan={5} className="h-20 bg-muted/10" />
                    </TableRow>
                  ))
                ) : filteredRoutes.length === 0 ? (
                  <TableRow className="border-none">
                    <TableCell colSpan={5} className="py-32 text-center text-muted-foreground font-bold">
                       Zero mobility vectors detected in current search space.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoutes.map((route) => (
                    <TableRow key={route.id} className="group/row hover:bg-amber-500/[0.02] transition-all border-b border-amber-500/5">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-amber-500/10 flex items-center justify-center shadow-sm group-hover/row:scale-110 transition-transform">
                              <Sparkles className="w-5 h-5 text-amber-600" />
                           </div>
                           <div>
                              <p className="font-black text-lg group-hover/row:text-amber-600 transition-colors uppercase tracking-tight">{route.name}</p>
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Mobility Vector</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex flex-wrap gap-2">
                          {route.stops.split(",").slice(0, 3).map((s, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight text-muted-foreground border border-black/5 dark:border-white/5">
                              <MapPin className="w-2.5 h-2.5 text-amber-500" /> {s.trim()}
                            </span>
                          ))}
                          {route.stops.split(",").length > 3 && (
                            <span className="text-[9px] font-black text-muted-foreground opacity-40">+{route.stops.split(",").length - 3} More</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 text-xs font-bold dark:text-white">
                              <User className="w-3.5 h-3.5 text-blue-500" /> {route.driver || "Unassigned"}
                           </div>
                           <div className="flex items-center gap-2 text-[11px] font-black text-muted-foreground font-mono">
                              <Bus className="w-3.5 h-3.5 text-amber-500" /> {route.vehicle || "N/A"}
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                               <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
                               <Clock className="w-4 h-4 text-blue-600" />
                            </div>
                         </div>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-xl border-amber-500/10 hover:bg-amber-500/10 hover:text-amber-700 font-bold"
                            >
                              <Navigation className="w-3.5 h-3.5 mr-2" /> Track GPS
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-xl border-amber-500/10 hover:bg-amber-500/10 hover:text-amber-700 font-bold"
                            >
                              <Fuel className="w-3.5 h-3.5 mr-2" /> Log Fuel
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9" onClick={() => handleDelete(route.id, route.name)}>
                               <Trash2 className="w-4 h-4 text-red-500" />
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

      {/* Decorative Mobility Lattice */}
      <div className="fixed top-0 right-0 p-20 opacity-[0.02] pointer-events-none">
         <Settings2 className="w-[500px] h-[500_px] translate-x-1/2 -translate-y-1/2 animate-spin-slow" />
      </div>
    </div>
  )
}
