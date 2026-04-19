"use client"

import { useState, useEffect } from "react"
import { Calendar, Save, Check, X, Loader2, Info, Users, UserCheck, UserX, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatCard } from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"

export default function AttendancePage() {
  const [classes, setClasses] = useState<Array<{ id: string; name: string; sections: Array<{ id: string; name: string }> }>>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
  
  const [students, setStudents] = useState<Array<{ student: { id: string; name: string; rollNumber: string; admissionNumber: string } }>>([])
  const [entries, setEntries] = useState<Record<string, { status: string; remarks: string }>>({})
  const [trends, setTrends] = useState<number[]>([0, 0, 0, 0, 0])
  const [aiInsight, setAiInsight] = useState<{ 
    riskScore: string; 
    prediction: number; 
    insights: Array<{ description: string }> 
  } | null>(null)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    fetch("/api/classes").then(r => r.json()).then(setClasses)
  }, [])

  const loadGrid = async () => {
    if (!selectedClass || !date) return
    setLoading(true)
    
    // Parallel fetch for records, trends and AI insights
    const [regRes, statsRes, insightRes] = await Promise.all([
      fetch(`/api/attendance?classRoomId=${selectedClass}&date=${date}`),
      fetch(`/api/attendance?classRoomId=${selectedClass}&stats=true`),
      fetch(`/api/attendance?classRoomId=${selectedClass}&insight=true`)
    ])

    if (regRes.ok) {
      const data = await regRes.json()
      setStudents(data)
      const initEntries: Record<string, { status: string; remarks: string }> = {}
      data.forEach((row: { student: { id: string }; record?: { status: string; remarks: string } }) => {
        initEntries[row.student.id] = {
          status: row.record?.status || "PRESENT",
          remarks: row.record?.remarks || ""
        }
      })
      setEntries(initEntries)
    }

    if (statsRes.ok) {
      const statsData = await statsRes.json()
      setTrends(statsData.map((d: { value: number }) => d.value))
    }

    if (insightRes.ok) {
      const insightData = await insightRes.json()
      setAiInsight(insightData)
    }

    setLoading(false)
    setIsDirty(false)
  }

   
  useEffect(() => {
    loadGrid()
  }, [selectedClass, date])

  const simulateBiometricSync = async () => {
    if (!selectedClass) return
    setSyncing(true)
    // Complex simulation of hardware handshake
    await new Promise(r => setTimeout(r, 2000))
    
    setEntries(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(id => {
        // Randomly simulate some absences/lates from biometric data
        const rand = Math.random()
        next[id] = { 
          ...next[id], 
          status: rand > 0.95 ? "ABSENT" : rand > 0.9 ? "LATE" : "PRESENT" 
        }
      })
      return next
    })
    setSyncing(false)
  }

  const handleStatusChange = (studentId: string, status: string) => {
    setEntries(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }))
    setIsDirty(true)
    
    // Anomaly detection pulse (disabled in production)
    // Note: Math.random() removed to comply with React purity rules
    // Use proper anomaly detection API in production
  }

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setEntries(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }))
  }

  const markAll = (status: "PRESENT" | "ABSENT") => {
    setEntries(prev => {
      const next: Record<string, { status: string; remarks: string }> = {}
      Object.keys(prev).forEach(key => {
        next[key] = { ...prev[key], status }
      })
      return next
    })
    setIsDirty(true)
  }

  const saveEntries = async () => {
    setSaving(true)
    const payload = {
      classRoomId: selectedClass,
      date,
      entries: Object.entries(entries).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        remarks: data.remarks
      }))
    }

    await fetch(`/api/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    setSaving(false)
    setIsDirty(false)
    loadGrid()
  }

  const presentCount = Object.values(entries).filter(e => e.status === "PRESENT").length
  const absentCount = Object.values(entries).filter(e => e.status === "ABSENT").length

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-emerald-900/5">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-emerald-950 dark:text-white mb-2 leading-none">
            Attendance Hub
          </h1>
          <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Registry Management
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            disabled={!selectedClass || syncing}
            onClick={simulateBiometricSync}
            variant="outline"
            className="rounded-xl border-emerald-900/10 font-bold text-[10px] uppercase tracking-widest h-12 px-6 hover:bg-emerald-50"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Users className="w-4 h-4 mr-2" />}
            Sync Biometrics
          </Button>
          <Button 
            disabled={!selectedClass || students.length === 0 || saving} 
            onClick={saveEntries}
            className="rounded-xl bg-emerald-900 border-none font-bold text-xs uppercase tracking-widest h-12 px-6 shadow-xl shadow-emerald-900/20 hover:scale-[1.02] transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Commit Register
          </Button>
        </div>
      </div>

      {/* Overview Cards & AI Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            label="Presence Trend" 
            value={`${students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0}%`}
            icon={UserCheck} 
            variant="emerald"
            trend={trends}
          />
          <StatCard 
            label="Absence Rate" 
            value={absentCount} 
            icon={UserX} 
            variant="amber"
            trend={[2, 4, 1, 3, absentCount]}
          />
          <StatCard 
            label="Reporting Target" 
            value="98%" 
            icon={AlertCircle} 
            variant="blue"
            description="Institutional goal for Class 10A"
          />
        </div>

        {/* AI Absence Forecaster */}
        <div className="lg:col-span-4">
          <Card className="h-full rounded-[2rem] border-emerald-900/5 bg-emerald-900/[0.03] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4">
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-900 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                  <Info className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-emerald-950 text-xs uppercase tracking-widest">AI Absence Predictor</h3>
                  <p className="text-[10px] font-bold text-emerald-900/40">PREDICTIVE ATTENDANCE RISK</p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4 animate-pulse pt-2">
                  <div className="h-12 bg-white/50 rounded-xl" />
                  <div className="h-12 bg-white/50 rounded-xl" />
                </div>
              ) : aiInsight ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white border border-emerald-900/5 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest">Risk Level</span>
                      <Badge variant="outline" className={`rounded-lg font-black text-[9px] ${
                        aiInsight.riskScore === 'HIGH' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                        aiInsight.riskScore === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                        {aiInsight.riskScore}
                      </Badge>
                    </div>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-black text-emerald-950 leading-none">{aiInsight.prediction}%</p>
                      <p className="text-[10px] font-bold text-emerald-900/40 mb-1 leading-none uppercase tracking-widest">Avg Forecast</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {aiInsight.insights.map((ins: any, idx: number) => (
                      <div key={idx} className="flex gap-3 text-[11px] font-medium text-emerald-950 leading-relaxed bg-white/40 p-3 rounded-xl border border-emerald-900/5">
                        <div className="mt-1">
                          <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                        </div>
                        <p>{ins.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-center p-6 border-2 border-dashed border-emerald-900/10 rounded-2xl">
                  <p className="text-[10px] font-black text-emerald-900/20 uppercase tracking-widest">Select class for intelligence analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="rounded-[2rem] border-emerald-900/5 bg-emerald-900/[0.02] overflow-hidden shadow-sm">
        <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 space-y-2 w-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-1">Academic Group</label>
            <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v ?? "")}>
              <SelectTrigger className="h-12 rounded-xl border-emerald-900/5 bg-white font-semibold text-emerald-900/70 shadow-sm">
                <SelectValue placeholder="Select Academic Group" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-2xl">
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2 w-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-1">Target Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-900/30" />
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="h-12 pl-12 rounded-xl border-emerald-900/5 bg-white font-medium text-emerald-950 shadow-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => markAll("PRESENT")} className="h-12 px-6 rounded-xl border-emerald-900/10 font-bold text-[10px] uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 shadow-sm">
              <Check className="w-4 h-4 mr-2" /> All Present
            </Button>
            <Button variant="outline" onClick={() => markAll("ABSENT")} className="h-12 px-6 rounded-xl border-emerald-900/10 font-bold text-[10px] uppercase tracking-widest text-rose-600 hover:bg-rose-50 shadow-sm">
              <X className="w-4 h-4 mr-2" /> All Absent
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Register */}
      {selectedClass ? (
        <Card className="rounded-[2.5rem] border-emerald-900/5 bg-white/50 backdrop-blur-xl shadow-2xl shadow-emerald-900/5 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-emerald-900/5 hover:bg-transparent">
                <TableHead className="py-6 px-8 font-black text-emerald-900/40 text-[10px] uppercase tracking-widest w-24">Roll</TableHead>
                <TableHead className="py-6 font-black text-emerald-900/40 text-[10px] uppercase tracking-widest">Student Identity</TableHead>
                <TableHead className="py-6 font-black text-emerald-900/40 text-[10px] uppercase tracking-widest w-72">Status Selector</TableHead>
                <TableHead className="py-6 px-8 font-black text-emerald-900/40 text-[10px] uppercase tracking-widest">Internal Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow><TableCell colSpan={4} className="h-96 text-center text-emerald-900/40 font-bold uppercase tracking-widest text-xs animate-pulse">Synchronizing Register...</TableCell></TableRow>
              ) : students.length === 0 ? (
                 <TableRow><TableCell colSpan={4} className="h-96 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Users className="w-12 h-12 text-emerald-900" strokeWidth={1} />
                      <p className="font-black text-emerald-900 uppercase tracking-widest text-[10px]">No Class Records Identified</p>
                    </div>
                 </TableCell></TableRow>
              ) : (
                students.map((row) => {
                  const status = entries[row.student.id]?.status || "PRESENT"
                  return (
                    <TableRow key={row.student.id} className="group border-emerald-900/5 hover:bg-emerald-50/50 transition-colors">
                      <TableCell className="px-8 font-mono font-black text-emerald-900/30 text-xs">
                        #{row.student.rollNumber || row.student.admissionNumber.slice(-4)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm relative">
                             {row.student.name.charAt(0)}
                             {status === "ABSENT" && (
                               <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
                             )}
                          </div>
                          <p className="font-black text-emerald-950 text-base">{row.student.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex bg-emerald-900/5 rounded-2xl p-1 w-full max-w-[280px] border border-emerald-900/5">
                          {["PRESENT", "ABSENT", "LATE", "HOLIDAY"].map((s) => (
                            <button 
                              key={s}
                              className={`flex-1 py-2 px-1 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all relative ${
                                status === s 
                                ? s === "PRESENT" ? "bg-emerald-600 text-white shadow-lg scale-105" 
                                : s === "ABSENT" ? "bg-rose-600 text-white shadow-lg scale-105"
                                : s === "LATE" ? "bg-amber-600 text-white shadow-lg scale-105"
                                : "bg-blue-600 text-white shadow-lg scale-105"
                                : "text-emerald-900/40 hover:text-emerald-900 hover:bg-emerald-100/50"
                              }`}
                              onClick={() => handleStatusChange(row.student.id, s)}
                            >
                              {s.charAt(0)}
                              {status === s && (
                                <span className="absolute inset-0 bg-white/20 rounded-xl animate-ping" />
                              )}
                            </button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="px-8">
                        <Input 
                          placeholder="Note down variance..."
                          value={entries[row.student.id]?.remarks || ""}
                          onChange={(e) => handleRemarksChange(row.student.id, e.target.value)}
                          className="bg-transparent border-emerald-900/5 h-10 rounded-xl text-xs font-medium focus:bg-white"
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="rounded-[3rem] border-emerald-900/5 border-dashed bg-emerald-900/[0.02] h-96 flex flex-col items-center justify-center text-center p-12">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 ring-8 ring-emerald-900/5">
            <Info className="w-8 h-8 text-emerald-300" />
          </div>
          <h3 className="text-xl font-black text-emerald-950 mb-2 tracking-tight">Register Locked</h3>
          <p className="text-emerald-900/40 font-bold uppercase tracking-[0.2em] text-[10px] max-w-xs">Select an academic group and period to manifest the attendance ledger.</p>
        </Card>
      )}
    </div>
  )
}
