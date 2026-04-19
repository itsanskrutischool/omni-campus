"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Plus, Search, Layers, Calendar, IndianRupee, Zap, BarChart3, Clock, Users, Trash2, Edit, Copy, ArrowUpRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type FeeStructure = {
  id: string
  name: string
  amount: number
  frequency: string
  classId: string | null
  category: string | null
}

const frequencyConfig: Record<string, { label: string; color: string; icon: string }> = {
  MONTHLY: { label: "Monthly", color: "bg-sky-100 text-sky-700", icon: "📅" },
  TERM: { label: "Term-wise", color: "bg-violet-100 text-violet-700", icon: "📊" },
  ANNUAL: { label: "Annual", color: "bg-amber-100 text-amber-700", icon: "🎓" },
  ONE_TIME: { label: "One Time", color: "bg-emerald-100 text-emerald-700", icon: "⚡" },
}

export default function FeeStructuresPage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  const [structures, setStructures] = useState<FeeStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterFrequency, setFilterFrequency] = useState<string>("ALL")
  
  // Form State
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [frequency, setFrequency] = useState("MONTHLY")
  const [category, setCategory] = useState("")
  
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStructures()
  }, [])

  const fetchStructures = async () => {
    try {
      const res = await fetch('/api/fees')
      if (res.ok) {
        const data = await res.json()
        setStructures(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          amount: parseFloat(amount),
          frequency,
          category: category || undefined
        })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create fee structure")
      }

      await fetchStructures()
      setIsDialogOpen(false)
      setName("")
      setAmount("")
      setCategory("")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const filteredStructures = structures.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFrequency = filterFrequency === "ALL" || s.frequency === filterFrequency
    return matchesSearch && matchesFrequency
  })

  const totalRevenuePotential = structures.reduce((a, s) => a + s.amount, 0)
  const frequencyBreakdown = structures.reduce((acc, s) => {
    acc[s.frequency] = (acc[s.frequency] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const formatCurrency = (val: number) => "₹" + val.toLocaleString("en-IN")

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 pb-2 border-b border-emerald-900/5">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-emerald-950 dark:text-white mb-2 leading-none">
            Fee Architecture
          </h1>
          <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Pricing Templates · Revenue Configuration · Billing Cycles
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger 
          render={
            <Button className="h-12 px-6 rounded-xl bg-emerald-900 font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 active:scale-95 transition-all gap-2">
              <Plus className="w-4 h-4" />
              New Structure
            </Button>
          }
        />
          <DialogContent className="sm:max-w-[480px] rounded-[2rem] border-emerald-900/5">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-emerald-950 tracking-tight">Define Fee Parameter</DialogTitle>
              <DialogDescription className="text-xs font-bold text-emerald-900/40 uppercase tracking-widest">
                Create a standard cost structure for institutional mapping
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 py-4">
              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-bold">Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40">Structure Name</Label>
                <Input 
                  placeholder="e.g. Annual Transport Fee" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="h-12 rounded-xl border-emerald-900/5 font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40">Amount Base (₹)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="2500" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    required 
                    className="h-12 rounded-xl border-emerald-900/5 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40">Category</Label>
                  <Input 
                    placeholder="e.g. Transport, Tuition" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="h-12 rounded-xl border-emerald-900/5 font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40">Frequency Mode</Label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(frequencyConfig).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFrequency(key)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        frequency === key 
                          ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10" 
                          : "border-emerald-900/5 hover:border-emerald-200"
                      }`}
                    >
                      <span className="text-lg block mb-1">{config.icon}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-900/60">{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-900 font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20">
                  Save Definition
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-[2rem] border-emerald-900/5 bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <Layers className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-950">{structures.length}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-900/40">Active Templates</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-emerald-900/5 bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-950">{formatCurrency(totalRevenuePotential)}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-900/40">Total Value</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-emerald-900/5 bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-950">{Object.keys(frequencyBreakdown).length}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-900/40">Billing Cycles</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-emerald-900/5 bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-950">{formatCurrency(structures.length > 0 ? Math.round(totalRevenuePotential / structures.length) : 0)}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-900/40">Avg Per Template</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="rounded-[2rem] border-emerald-900/5 bg-emerald-900/[0.02] shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-900/30 group-focus-within:text-emerald-500" />
              <Input 
                placeholder="Search fee structures..." 
                className="h-12 pl-12 rounded-xl border-emerald-900/5 bg-white font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {["ALL", ...Object.keys(frequencyConfig)].map(key => (
                <button
                  key={key}
                  onClick={() => setFilterFrequency(key)}
                  className={`px-4 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filterFrequency === key 
                      ? "bg-emerald-900 text-white shadow-lg shadow-emerald-900/20" 
                      : "bg-white border border-emerald-900/5 text-emerald-900/60 hover:bg-emerald-50"
                  }`}
                >
                  {key === "ALL" ? "All" : frequencyConfig[key].label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Structure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-[2rem] bg-emerald-900/[0.02] animate-pulse" />
          ))
        ) : filteredStructures.length === 0 ? (
          <Card className="col-span-full rounded-[2rem] border-emerald-900/5 py-16 flex flex-col items-center justify-center text-center bg-emerald-900/[0.01]">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-900/10 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-emerald-900/20" />
            </div>
            <h3 className="text-sm font-black text-emerald-900/30 uppercase tracking-widest mb-1">No Templates Found</h3>
            <p className="text-xs text-emerald-900/20 max-w-sm">Create standard fee parameters to assign across classrooms and billing periods.</p>
          </Card>
        ) : (
          filteredStructures.map(row => {
            const freq = frequencyConfig[row.frequency] || { label: row.frequency, color: "bg-gray-100 text-gray-700", icon: "📋" }
            return (
              <Card key={row.id} className="rounded-[2rem] border-emerald-900/5 bg-white shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-300 w-full" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg">
                        {freq.icon}
                      </div>
                      <div>
                        <h3 className="font-black text-emerald-950 text-sm tracking-tight">{row.name}</h3>
                        {row.category && (
                          <p className="text-[9px] font-bold text-emerald-900/30 uppercase tracking-widest">{row.category}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-emerald-900/5">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-900/30 mb-1">Base Amount</p>
                      <p className="text-xl font-black text-emerald-950">{formatCurrency(row.amount)}</p>
                    </div>
                    <Badge className={`${freq.color} border-none px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest`}>
                      <Calendar className="w-3 h-3 mr-1 inline" />
                      {freq.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
