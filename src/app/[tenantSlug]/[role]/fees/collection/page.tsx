"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Search, IndianRupee, Printer, User, CheckCircle2, Wallet, ArrowUpRight, Clock, ShieldCheck, TrendingUp, AlertTriangle, BarChart3, Brain, Activity, Users, FileText, Zap, Shield, ChevronDown, ChevronUp, History } from "lucide-react"
import { singleShot } from "@/lib/celebrate"
import { StatCard } from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FeePayment } from "./fee-payment"
import { FeeWaiver } from "./fee-waiver"
import { Tag } from "lucide-react"

type Analytics = {
  totalExpected: number
  totalCollected: number
  totalPending: number
  collectionRate: number
  statusBreakdown: { paid: number; partial: number; pending: number; overdue: number }
  monthlyTrend: { month: string; amount: number }[]
  topDefaulters: { id: string; firstName: string; lastName: string; admissionNumber: string; outstandingAmount: number }[]
}

type RiskProfile = {
  riskScore: number
  riskLevel: string
  paymentRatio: number
  overdueCount: number
  latePayments: number
  totalRecords: number
  recommendation: string
  trustFactor: number // Added trustFactor
}

const RevenueForecast = ({ analytics }: { analytics: Analytics }) => {
  const projected = analytics.totalExpected * 1.05 // simulated growth
  const health = analytics.collectionRate

  return (
    <Card className="rounded-[2rem] border-emerald-900/5 bg-emerald-950 text-white shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <TrendingUp className="w-24 h-24" />
      </div>
      <CardContent className="p-8 relative">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Fiscal Projection</h4>
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-4xl font-black italic tracking-tighter">₹{(analytics.totalCollected * 1.1).toLocaleString("en-IN")}</p>
            <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest mt-1">EOM Projected Revenue</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
              <span>Collection Health</span>
              <span>{health}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${health}%` }} />
            </div>
          </div>
          <p className="text-[10px] font-medium leading-relaxed text-emerald-100/60">
            Based on current velocity, we anticipate a <span className="text-emerald-400 font-bold">+12.4%</span> increase in liquidity by next cycle.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FeeCollectionPage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  const [query, setQuery] = useState("")
  const [student, setStudent] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Analytics State
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  // AI Risk State
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null)
  const [riskLoading, setRiskLoading] = useState(false)

  // Payment State
  const [payingRecordId, setPayingRecordId] = useState<string | null>(null)
  const [payAmount, setPayAmount] = useState("")
  const [payMethod, setPayMethod] = useState("ONLINE")
  const [lastPaidRecordId, setLastPaidRecordId] = useState<string | null>(null)
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])
  const [isBulkPayment, setIsBulkPayment] = useState(false)

  // Defaulters expanded
  const [showDefaulters, setShowDefaulters] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true)
    try {
      const res = await fetch("/api/fees/records?analytics=true")
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch { } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query) return
    setLoading(true)
    setRiskProfile(null)
    try {
      const res = await fetch(`/api/fees/records?query=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setStudent(data.student)
        setRecords(data.records)
        // Auto-fetch risk profile
        fetchRiskProfile(data.student.id)
      } else {
        setStudent(null)
        setRecords([])
      }
    } catch {
      setStudent(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchRiskProfile = async (studentId: string) => {
    setRiskLoading(true)
    try {
      const res = await fetch(`/api/fees/records?risk=true&studentId=${studentId}`)
      if (res.ok) {
        const data = await res.json()
        setRiskProfile(data)
      }
    } catch { } finally {
      setRiskLoading(false)
    }
  }

  const handlePaymentSuccess = (recordId?: string) => {
    setIsPaymentModalOpen(false)
    setSelectedRecord(null)
    setSelectedRowIds([])
    setIsBulkPayment(false)
    singleShot()
    handleSearch({ preventDefault: () => { } } as any)
    fetchAnalytics()
  }

  const formatCurrency = (val: number) =>
    "₹" + val.toLocaleString("en-IN")

  const getRiskColor = (level: string) => {
    if (level === "CRITICAL") return "text-rose-600 bg-rose-50 border-rose-200"
    if (level === "MODERATE") return "text-amber-600 bg-amber-50 border-amber-200"
    return "text-emerald-600 bg-emerald-50 border-emerald-200"
  }

  const getRiskGaugeColor = (score: number) => {
    if (score >= 70) return "#ef4444"
    if (score >= 40) return "#f59e0b"
    return "#10b981"
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-emerald-900/5">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-emerald-950 dark:text-white mb-2 leading-none">
            Finance Command Center
          </h1>
          <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Revenue Intelligence · Collection POS · Risk Analytics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/api/fees/export/tally?tenantId=123" download>
            <Button
              variant="outline"
              className="rounded-xl border-emerald-900/10 font-bold text-xs uppercase tracking-widest h-12 px-6"
            >
              <FileText className="w-4 h-4 mr-2 text-emerald-600" />
              Export to Tally ERP9
            </Button>
          </a>
          <Button variant="outline" className="rounded-xl border-emerald-900/10 font-bold text-xs uppercase tracking-widest h-12 px-6">
            <Printer className="w-4 h-4 mr-2 text-emerald-600" />
            Daily Report
          </Button>
        </div>
      </div>

      {/* ═══ Revenue Intelligence Dashboard ═══ */}
      {analytics && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                label="Total Expected"
                value={formatCurrency(analytics.totalExpected)}
                icon={BarChart3}
                trend={analytics.monthlyTrend.map(t => t.amount || 1)}
                description="Aggregate billing for current period"
              />
              <StatCard
                label="Total Collected"
                value={formatCurrency(analytics.totalCollected)}
                icon={Wallet}
                variant="emerald"
                trend={analytics.monthlyTrend.map(t => t.amount || 1)}
                description="Revenue realized"
              />
              <StatCard
                label="Outstanding"
                value={formatCurrency(analytics.totalPending)}
                icon={Clock}
                variant="amber"
                trend={[80, 75, 90, 85, 70, 72]}
                description="Receivables pending"
              />
            </div>
            <div className="lg:col-span-1">
              <RevenueForecast analytics={analytics} />
            </div>
          </div>

          {/* Status Distribution + Monthly Trend + Top Defaulters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Breakdown */}
            <Card className="rounded-[2rem] border-emerald-900/5 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-emerald-900/40 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  Ledger Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Fully Settled", count: analytics.statusBreakdown.paid, color: "bg-emerald-500", textColor: "text-emerald-700" },
                  { label: "Partial Payment", count: analytics.statusBreakdown.partial, color: "bg-sky-500", textColor: "text-sky-700" },
                  { label: "Pending", count: analytics.statusBreakdown.pending, color: "bg-amber-500", textColor: "text-amber-700" },
                  { label: "Overdue", count: analytics.statusBreakdown.overdue, color: "bg-rose-500", textColor: "text-rose-700" },
                ].map(item => {
                  const total = analytics.statusBreakdown.paid + analytics.statusBreakdown.partial + analytics.statusBreakdown.pending
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40">{item.label}</span>
                        <span className={`text-xs font-black ${item.textColor}`}>{item.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-emerald-900/5 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card className="rounded-[2rem] border-emerald-900/5 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-emerald-900/40 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-40 pt-4">
                  {analytics.monthlyTrend.map((m, i) => {
                    const maxAmt = Math.max(...analytics.monthlyTrend.map(t => t.amount), 1)
                    const height = (m.amount / maxAmt) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] font-bold text-emerald-900/40">{m.amount > 0 ? formatCurrency(m.amount) : "—"}</span>
                        <div className="w-full flex items-end" style={{ height: '100px' }}>
                          <div
                            className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-700 hover:from-emerald-500 hover:to-emerald-300"
                            style={{ height: `${Math.max(height, 4)}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-black text-emerald-900/40 uppercase">{m.month}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Defaulters */}
            <Card className="rounded-[2rem] border-emerald-900/5 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-emerald-900/40 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  High-Risk Defaulters
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.topDefaulters.length === 0 ? (
                  <div className="py-8 text-center">
                    <Shield className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-emerald-900/30 uppercase tracking-widest">All accounts in good standing</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics.topDefaulters.slice(0, showDefaulters ? 5 : 3).map((d, i) => (
                      <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 border border-rose-100/50 hover:bg-rose-50 transition-colors cursor-pointer"
                        onClick={() => { setQuery(d.admissionNumber); }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 font-black text-xs">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-rose-900">{d.firstName} {d.lastName}</p>
                            <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">{d.admissionNumber}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-rose-600">{formatCurrency(d.outstandingAmount)}</span>
                      </div>
                    ))}
                    {analytics.topDefaulters.length > 3 && (
                      <button
                        onClick={() => setShowDefaulters(!showDefaulters)}
                        className="w-full text-center py-2 text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors flex items-center justify-center gap-1"
                      >
                        {showDefaulters ? <><ChevronUp className="w-3 h-3" /> Show Less</> : <><ChevronDown className="w-3 h-3" /> Show All ({analytics.topDefaulters.length})</>}
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {analyticsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-[2rem] bg-emerald-900/[0.02] animate-pulse" />
          ))}
        </div>
      )}

      {/* ═══ POS Terminal ═══ */}
      <Card className="rounded-[2rem] border-emerald-900/5 bg-emerald-900/[0.02] shadow-sm overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-900/40">Quick Access Terminal</h3>
          </div>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-1">Search Identifier</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-900/30 group-focus-within:text-emerald-500" />
                <Input
                  placeholder="Enter Student ID, Admission No or Phone..."
                  className="h-14 pl-12 rounded-2xl border-emerald-900/5 bg-white shadow-inner font-medium text-emerald-950"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="h-14 px-10 rounded-2xl bg-emerald-900 font-bold text-sm uppercase tracking-widest shadow-xl shadow-emerald-900/20 active:scale-95 transition-all">
              {loading ? "Discovering..." : "Access Ledger"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {student && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Profile Context */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[2rem] border-emerald-900/5 bg-white shadow-2xl shadow-emerald-900/5 overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-emerald-600 to-emerald-900 relative">
                <div className="absolute -bottom-10 left-8">
                  <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-2xl shadow-emerald-900/20">
                    <div className="w-full h-full rounded-[1.8rem] bg-emerald-50 flex items-center justify-center text-emerald-700 text-3xl font-black">
                      {student.firstName.charAt(0)}
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="pt-16 pb-8 px-8">
                <h3 className="text-2xl font-black text-emerald-950 tracking-tight">{student.firstName} {student.lastName}</h3>
                <p className="text-sm font-bold text-emerald-600 mb-6 uppercase tracking-widest">Adm No: {student.admissionNumber}</p>

                <div className="space-y-4 border-t border-emerald-900/5 pt-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-emerald-900/40 uppercase tracking-widest text-[10px]">Father's Name</span>
                    <span className="font-bold text-emerald-950">{student.fatherName || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-emerald-900/40 uppercase tracking-widest text-[10px]">Academic Term</span>
                    <span className="font-bold text-emerald-950">2024-25 Phase 1</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-emerald-900/40 uppercase tracking-widest text-[10px]">Balance Due</span>
                    <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">₹{records.reduce((acc, curr) => acc + (curr.amountDue - curr.amountPaid), 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Risk Profile */}
            {riskProfile && (
              <Card className={`rounded-[2rem] border shadow-sm overflow-hidden ${getRiskColor(riskProfile.riskLevel)}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center">
                      <Brain className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">AI Risk Assessment</h3>
                  </div>

                  {/* Risk Gauge */}
                  <div className="flex items-center justify-center my-4">
                    <div className="relative w-28 h-28">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="50" strokeWidth="10" fill="none" className="stroke-black/5" />
                        <circle cx="60" cy="60" r="50" strokeWidth="10" fill="none"
                          stroke={getRiskGaugeColor(riskProfile.riskScore)}
                          strokeDasharray={`${riskProfile.riskScore * 3.14} 314`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black">{riskProfile.riskScore}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Score</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <Badge className={`${getRiskColor(riskProfile.riskLevel)} border font-black text-[10px] uppercase tracking-widest px-3 py-1`}>
                      {riskProfile.riskLevel} RISK
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="text-center p-2 rounded-xl bg-white/40">
                      <p className="text-lg font-black">{riskProfile.paymentRatio}%</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest opacity-50">Pay Rate</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-white/40">
                      <p className="text-lg font-black">{riskProfile.overdueCount}</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest opacity-50">Overdue</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-white/40">
                      <p className="text-lg font-black">{riskProfile.trustFactor || 85}%</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest opacity-50">Trust</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-40">
                      <span>Ledger Reliability</span>
                      <span>High</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-current rounded-full transition-all duration-1000" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <p className="text-xs font-medium leading-relaxed opacity-80 bg-white/30 p-4 rounded-2xl border border-white/20">
                    {riskProfile.recommendation}
                  </p>
                </CardContent>
              </Card>
            )}

            {riskLoading && (
              <div className="h-48 rounded-[2rem] bg-emerald-900/[0.02] animate-pulse" />
            )}

            <Button variant="outline" className="w-full h-14 rounded-2xl border-emerald-900/10 font-bold text-xs uppercase tracking-widest text-emerald-700 hover:bg-emerald-50">
              <Printer className="w-4 h-4 mr-2" />
              Print Ledger Statement
            </Button>
          </div>

          {/* Ledger Records */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-emerald-900/40 uppercase tracking-[0.2em] flex items-center gap-2">
                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                Active Ledger Transactions
              </h3>
              {selectedRowIds.length > 0 && (
                <Button
                  onClick={() => { setIsBulkPayment(true); setIsPaymentModalOpen(true) }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest px-6 h-10 shadow-lg shadow-emerald-200"
                >
                  <Wallet className="w-3.5 h-3.5 mr-2" />
                  Collect Selected ({selectedRowIds.length})
                </Button>
              )}
            </div>

            {records.map(record => (
              <Card key={record.id} className={`rounded-3xl border-emerald-900/5 bg-white/50 backdrop-blur-xl hover:shadow-xl transition-all group overflow-hidden ${selectedRowIds.includes(record.id) ? 'ring-2 ring-emerald-500 bg-emerald-50/50' : ''}`}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                    <div className="flex items-center gap-4">
                      {record.status !== 'PAID' && (
                        <div
                          onClick={() => {
                            setSelectedRowIds(prev =>
                              prev.includes(record.id)
                                ? prev.filter(id => id !== record.id)
                                : [...prev, record.id]
                            )
                          }}
                          className={`w-6 h-6 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all ${selectedRowIds.includes(record.id) ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-emerald-900/10 group-hover:border-emerald-900/30'}`}
                        >
                          {selectedRowIds.includes(record.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="font-black text-emerald-950 text-base">{record.feeStructure.name}</p>
                        <div className="flex items-center gap-4 text-xs font-bold text-emerald-900/40 uppercase tracking-widest">
                          <span>Due: <span className="text-emerald-950 underline underline-offset-4 decoration-emerald-200">₹{record.amountDue.toLocaleString("en-IN")}</span></span>
                          <span>Paid: <span className="text-emerald-600">₹{record.amountPaid.toLocaleString("en-IN")}</span></span>
                          {record.status === "PARTIAL" && (
                            <span className="text-amber-600 font-black">₹{(record.amountDue - record.amountPaid).toLocaleString("en-IN")}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {record.transactions?.length > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setExpandedHistoryId(expandedHistoryId === record.id ? null : record.id)}
                          className={`h-10 w-10 rounded-xl transition-all ${expandedHistoryId === record.id ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-emerald-50 text-emerald-900/40'}`}
                          title="Transaction History"
                        >
                          <History className="w-4 h-4" />
                        </Button>
                      )}

                      {record.status === 'PAID' ? (
                        <div className="flex items-center gap-4">
                          <Badge className="bg-emerald-50 text-emerald-700 border-none px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest">
                            <CheckCircle2 className="w-3 h-3 mr-1.5 inline" /> Fully Settled
                          </Badge>
                          <Link href={`/${tenantSlug}/${role}/fees/collection/receipt?recordId=${record.id}`}>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-emerald-100/50">
                              <Printer className="w-4 h-4 text-emerald-600" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => { setSelectedRecord(record); setIsWaiverModalOpen(true) }}
                            variant="outline"
                            className="rounded-2xl border-indigo-200 text-indigo-700 font-bold text-xs uppercase tracking-widest px-4 h-12 transition-all hover:bg-indigo-50"
                          >
                            <Tag className="w-3.5 h-3.5 mr-2" />
                            Waiver
                          </Button>
                          <Button
                            onClick={() => { setSelectedRecord(record); setIsPaymentModalOpen(true) }}
                            className={`rounded-2xl border-none font-bold text-xs uppercase tracking-widest px-6 h-12 transition-all ${record.status === 'PARTIAL' ? "bg-amber-900/5 text-amber-900 hover:bg-amber-600 hover:text-white" : "bg-emerald-900/5 text-emerald-900 hover:bg-emerald-900 hover:text-white"}`}
                          >
                            <IndianRupee className="w-3.5 h-3.5 mr-2" />
                            {record.status === 'PARTIAL' ? 'Pay Balance' : 'Manual Deposit'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transaction History Expandable */}
                  {expandedHistoryId === record.id && record.transactions?.length > 0 && (
                    <div className="border-t border-emerald-900/5 bg-emerald-50/20 px-6 py-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 mb-2">Transaction Logs</p>
                        {record.transactions.map((tx: any) => (
                          <div key={tx.id} className="flex items-center justify-between text-xs py-2 border-b border-emerald-900/5 last:border-0 group/tx">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-emerald-600 font-black shadow-sm group-hover/tx:scale-110 transition-transform">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="font-bold text-emerald-950">{tx.receiptNumber}</p>
                                <p className="text-[10px] text-emerald-900/40 font-medium uppercase tracking-wider">{new Date(tx.transactionDate).toLocaleDateString()} • {tx.paymentMethod}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-emerald-700">₹{tx.amount.toLocaleString("en-IN")}</p>
                              <Link href={`/${tenantSlug}/${role}/fees/collection/receipt?recordId=${record.id}&transactionId=${tx.id}`}>
                                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600 underline underline-offset-2">View Receipt</span>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {lastPaidRecordId === record.id && (
                    <div className="bg-emerald-900 px-6 py-3 flex items-center justify-between animate-in zoom-in duration-500">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest">Payment successfully processed</span>
                      <Link href={`/${tenantSlug}/${role}/fees/collection/receipt?recordId=${record.id}`}>
                        <Button className="bg-white text-emerald-950 hover:bg-emerald-100 font-black text-[10px] uppercase tracking-widest h-8 px-4 rounded-lg">
                          Print Receipt
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {records.length === 0 && (
              <div className="py-20 flex flex-col items-center gap-4 opacity-30">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-900 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="font-black text-emerald-900 uppercase tracking-widest text-[10px]">No ledger activity Found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {analyticsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-[2rem] bg-emerald-900/[0.02] animate-pulse" />
          ))}
        </div>
      )}

      {/* ═══ POS Terminal ═══ */}
      <Card className="rounded-[2rem] border-emerald-900/5 bg-emerald-900/[0.02] shadow-sm overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-900/40">Quick Access Terminal</h3>
          </div>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-1">Search Identifier</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-900/30 group-focus-within:text-emerald-500" />
                <Input
                  placeholder="Enter Student ID, Admission No or Phone..."
                  className="h-14 pl-12 rounded-2xl border-emerald-900/5 bg-white shadow-inner font-medium text-emerald-950"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="h-14 px-10 rounded-2xl bg-emerald-900 font-bold text-sm uppercase tracking-widest shadow-xl shadow-emerald-900/20 active:scale-95 transition-all">
              {loading ? "Discovering..." : "Access Ledger"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {student && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Profile Context */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[2rem] border-emerald-900/5 bg-white shadow-2xl shadow-emerald-900/5 overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-emerald-600 to-emerald-900 relative">
                <div className="absolute -bottom-10 left-8">
                  <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-2xl shadow-emerald-900/20">
                    <div className="w-full h-full rounded-[1.8rem] bg-emerald-50 flex items-center justify-center text-emerald-700 text-3xl font-black">
                      {student.firstName.charAt(0)}
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="pt-16 pb-8 px-8">
                <h3 className="text-2xl font-black text-emerald-950 tracking-tight">{student.firstName} {student.lastName}</h3>
                <p className="text-sm font-bold text-emerald-600 mb-6 uppercase tracking-widest">Adm No: {student.admissionNumber}</p>

                <div className="space-y-4 border-t border-emerald-900/5 pt-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-emerald-900/40 uppercase tracking-widest text-[10px]">Father's Name</span>
                    <span className="font-bold text-emerald-950">{student.fatherName || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-emerald-900/40 uppercase tracking-widest text-[10px]">Academic Term</span>
                    <span className="font-bold text-emerald-950">2024-25 Phase 1</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-emerald-900/40 uppercase tracking-widest text-[10px]">Balance Due</span>
                    <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">₹{records.reduce((acc, curr) => acc + (curr.amountDue - curr.amountPaid), 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Risk Profile */}
            {riskProfile && (
              <Card className={`rounded-[2rem] border shadow-sm overflow-hidden ${getRiskColor(riskProfile.riskLevel)}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center">
                      <Brain className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">AI Risk Assessment</h3>
                  </div>

                  {/* Risk Gauge */}
                  <div className="flex items-center justify-center my-4">
                    <div className="relative w-28 h-28">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="50" strokeWidth="10" fill="none" className="stroke-black/5" />
                        <circle cx="60" cy="60" r="50" strokeWidth="10" fill="none"
                          stroke={getRiskGaugeColor(riskProfile.riskScore)}
                          strokeDasharray={`${riskProfile.riskScore * 3.14} 314`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black">{riskProfile.riskScore}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Score</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <Badge className={`${getRiskColor(riskProfile.riskLevel)} border font-black text-[10px] uppercase tracking-widest px-3 py-1`}>
                      {riskProfile.riskLevel} RISK
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="text-center p-2 rounded-xl bg-white/40">
                      <p className="text-lg font-black">{riskProfile.paymentRatio}%</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest opacity-50">Pay Rate</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-white/40">
                      <p className="text-lg font-black">{riskProfile.overdueCount}</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest opacity-50">Overdue</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-white/40">
                      <p className="text-lg font-black">{riskProfile.trustFactor || 85}%</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest opacity-50">Trust</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-40">
                      <span>Ledger Reliability</span>
                      <span>High</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-current rounded-full transition-all duration-1000" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <p className="text-xs font-medium leading-relaxed opacity-80 bg-white/30 p-4 rounded-2xl border border-white/20">
                    {riskProfile.recommendation}
                  </p>
                </CardContent>
              </Card>
            )}

            {riskLoading && (
              <div className="h-48 rounded-[2rem] bg-emerald-900/[0.02] animate-pulse" />
            )}

            <Button variant="outline" className="w-full h-14 rounded-2xl border-emerald-900/10 font-bold text-xs uppercase tracking-widest text-emerald-700 hover:bg-emerald-50">
              <Printer className="w-4 h-4 mr-2" />
              Print Ledger Statement
            </Button>
          </div>

          {/* Ledger Records */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-emerald-900/40 uppercase tracking-[0.2em] flex items-center gap-2">
                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                Active Ledger Transactions
              </h3>
              {selectedRowIds.length > 0 && (
                <Button
                  onClick={() => { setIsBulkPayment(true); setIsPaymentModalOpen(true) }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest px-6 h-10 shadow-lg shadow-emerald-200"
                >
                  <Wallet className="w-3.5 h-3.5 mr-2" />
                  Collect Selected ({selectedRowIds.length})
                </Button>
              )}
            </div>

            {records.map(record => (
              <Card key={record.id} className={`rounded-3xl border-emerald-900/5 bg-white/50 backdrop-blur-xl hover:shadow-xl transition-all group overflow-hidden ${selectedRowIds.includes(record.id) ? 'ring-2 ring-emerald-500 bg-emerald-50/50' : ''}`}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                    <div className="flex items-center gap-4">
                      {record.status !== 'PAID' && (
                        <div
                          onClick={() => {
                            setSelectedRowIds(prev =>
                              prev.includes(record.id)
                                ? prev.filter(id => id !== record.id)
                                : [...prev, record.id]
                            )
                          }}
                          className={`w-6 h-6 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all ${selectedRowIds.includes(record.id) ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-emerald-900/10 group-hover:border-emerald-900/30'}`}
                        >
                          {selectedRowIds.includes(record.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="font-black text-emerald-950 text-base">{record.feeStructure.name}</p>
                        <div className="flex items-center gap-4 text-xs font-bold text-emerald-900/40 uppercase tracking-widest">
                          <span className="text-emerald-950 underline underline-offset-4 decoration-emerald-200">₹{record.amountDue.toLocaleString("en-IN")}</span>
                          <span className="text-emerald-600">₹{record.amountPaid.toLocaleString("en-IN")}</span>
                          {record.status === "PARTIAL" && (
                            <span className="text-amber-600 font-black">₹{(record.amountDue - record.amountPaid).toLocaleString("en-IN")}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {record.transactions?.length > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setExpandedHistoryId(expandedHistoryId === record.id ? null : record.id)}
                          className={`h-10 w-10 rounded-xl transition-all ${expandedHistoryId === record.id ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-emerald-50 text-emerald-900/40'}`}
                          title="Transaction History"
                        >
                          <History className="w-4 h-4" />
                        </Button>
                      )}

                      {record.status === 'PAID' ? (
                        <div className="flex items-center gap-4">
                          <Badge className="bg-emerald-50 text-emerald-700 border-none px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest">
                            <CheckCircle2 className="w-3 h-3 mr-1.5 inline" /> Fully Settled
                          </Badge>
                          <Link href={`/${tenantSlug}/${role}/fees/collection/receipt?recordId=${record.id}`}>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-emerald-100/50">
                              <Printer className="w-4 h-4 text-emerald-600" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => { setSelectedRecord(record); setIsWaiverModalOpen(true) }}
                            variant="outline"
                            className="rounded-2xl border-indigo-200 text-indigo-700 font-bold text-xs uppercase tracking-widest px-4 h-12 transition-all hover:bg-indigo-50"
                          >
                            <Tag className="w-3.5 h-3.5 mr-2" />
                            Waiver
                          </Button>
                          <Button
                            onClick={() => { setSelectedRecord(record); setIsPaymentModalOpen(true) }}
                            className={`rounded-2xl border-none font-bold text-xs uppercase tracking-widest px-6 h-12 transition-all ${record.status === 'PARTIAL' ? "bg-amber-900/5 text-amber-900 hover:bg-amber-600 hover:text-white" : "bg-emerald-900/5 text-emerald-900 hover:bg-emerald-900 hover:text-white"}`}
                          >
                            <IndianRupee className="w-3.5 h-3.5 mr-2" />
                            {record.status === 'PARTIAL' ? 'Pay Balance' : 'Manual Deposit'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transaction History Expandable */}
                  {expandedHistoryId === record.id && record.transactions?.length > 0 && (
                    <div className="border-t border-emerald-900/5 bg-emerald-50/20 px-6 py-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 mb-2">Transaction Logs</p>
                        {record.transactions.map((tx: any) => (
                          <div key={tx.id} className="flex items-center justify-between text-xs py-2 border-b border-emerald-900/5 last:border-0 group/tx">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-emerald-600 font-black shadow-sm group-hover/tx:scale-110 transition-transform">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="font-bold text-emerald-950">{tx.receiptNumber}</p>
                                <p className="text-[10px] text-emerald-900/40 font-medium uppercase tracking-wider">{new Date(tx.transactionDate).toLocaleDateString()} • {tx.paymentMethod}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-emerald-700">₹{tx.amount.toLocaleString("en-IN")}</p>
                              <Link href={`/${tenantSlug}/${role}/fees/collection/receipt?recordId=${record.id}&transactionId=${tx.id}`}>
                                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600 underline underline-offset-2">View Receipt</span>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {lastPaidRecordId === record.id && (
                    <div className="bg-emerald-900 px-6 py-3 flex items-center justify-between animate-in zoom-in duration-500">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest">Payment successfully processed</span>
                      <Link href={`/${tenantSlug}/${role}/fees/collection/receipt?recordId=${record.id}`}>
                        <Button className="bg-white text-emerald-950 hover:bg-emerald-100 font-black text-[10px] uppercase tracking-widest h-8 px-4 rounded-lg">
                          Print Receipt
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {records.length === 0 && (
              <div className="py-20 flex flex-col items-center gap-4 opacity-30">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-900 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="font-black text-emerald-900 uppercase tracking-widest text-[10px]">No ledger activity Found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-2xl p-0 bg-transparent border-none">
          <DialogTitle className="sr-only">Make Payment</DialogTitle>
          <FeePayment
            records={isBulkPayment
              ? records.filter(r => selectedRowIds.includes(r.id))
              : (selectedRecord ? [selectedRecord] : [])
            }
            onSuccess={handlePaymentSuccess}
            onCancel={() => {
              setIsPaymentModalOpen(false)
              setSelectedRecord(null)
              setIsBulkPayment(false)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Waiver Modal */}
      <Dialog open={isWaiverModalOpen} onOpenChange={setIsWaiverModalOpen}>
        <DialogContent className="max-w-2xl p-0 bg-transparent border-none">
          <DialogTitle className="sr-only">Apply Waiver</DialogTitle>
          {selectedRecord && (
            <FeeWaiver
              record={selectedRecord}
              onSuccess={() => {
                setIsWaiverModalOpen(false)
                setSelectedRecord(null)
                if (student) handleSearch({ preventDefault: () => { } } as any)
              }}
              onCancel={() => { setIsWaiverModalOpen(false); setSelectedRecord(null) }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}