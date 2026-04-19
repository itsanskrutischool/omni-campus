"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Calendar, Plus, Clock, BookOpen, User, X, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
const PERIODS = [
  { start: "08:00", end: "08:45", label: "Period 1" },
  { start: "08:45", end: "09:30", label: "Period 2" },
  { start: "09:30", end: "10:15", label: "Period 3" },
  { start: "10:30", end: "11:15", label: "Period 4 (After Break)" },
  { start: "11:15", end: "12:00", label: "Period 5" },
  { start: "12:00", end: "12:45", label: "Period 6" },
  { start: "01:30", end: "02:15", label: "Period 7 (After Lunch)" },
  { start: "02:15", end: "03:00", label: "Period 8" },
]

// Mock timetable data
const MOCK_TIMETABLE: Record<string, Record<number, { subject: string; teacher: string; room: string }>> = {
  MONDAY: { 0: { subject: "Mathematics", teacher: "Mrs. Sharma", room: "101" }, 1: { subject: "English", teacher: "Mr. Singh", room: "101" }, 3: { subject: "Physics", teacher: "Dr. Verma", room: "Lab 2" }, 5: { subject: "Chemistry", teacher: "Mrs. Gupta", room: "Lab 1" } },
  TUESDAY: { 0: { subject: "English", teacher: "Mr. Singh", room: "101" }, 2: { subject: "Biology", teacher: "Dr. Patel", room: "Lab 3" }, 4: { subject: "Mathematics", teacher: "Mrs. Sharma", room: "101" } },
  WEDNESDAY: { 1: { subject: "Physics", teacher: "Dr. Verma", room: "Lab 2" }, 3: { subject: "History", teacher: "Mrs. Reddy", room: "202" }, 6: { subject: "Computer Science", teacher: "Mr. Kumar", room: "CS Lab" } },
  THURSDAY: { 0: { subject: "Chemistry", teacher: "Mrs. Gupta", room: "Lab 1" }, 2: { subject: "Mathematics", teacher: "Mrs. Sharma", room: "101" }, 5: { subject: "English", teacher: "Mr. Singh", room: "101" } },
  FRIDAY: { 1: { subject: "Biology", teacher: "Dr. Patel", room: "Lab 3" }, 4: { subject: "Physical Ed", teacher: "Mr. Yadav", room: "Ground" }, 7: { subject: "Art", teacher: "Mrs. Das", room: "Art Room" } },
  SATURDAY: { 0: { subject: "Mathematics", teacher: "Mrs. Sharma", room: "101" }, 2: { subject: "Science", teacher: "Dr. Verma", room: "Lab 2" } },
}

export default function TimetablePage() {
  const params = useParams()
  const [selectedClass, setSelectedClass] = useState("10-A")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({ day: "MONDAY", period: 0, subject: "", teacher: "", room: "" })
  const [timetable, setTimetable] = useState(MOCK_TIMETABLE)

  const handleAdd = () => {
    const { day, period, ...data } = addForm
    setTimetable(prev => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [period]: data }
    }))
    setIsAddOpen(false)
    setAddForm({ day: "MONDAY", period: 0, subject: "", teacher: "", room: "" })
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-4">
          <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-[10px] font-black uppercase tracking-widest inline-block">Schedule</div>
          <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">Timetable <span className="text-cyan-600">Manager</span></h1>
          <p className="text-muted-foreground font-semibold max-w-xl text-lg">Weekly class schedules, teacher assignments, and room allocations.</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedClass} onValueChange={(v) => { if (v) setSelectedClass(v) }}>
            <SelectTrigger className="h-14 w-48 rounded-2xl font-bold bg-white dark:bg-zinc-900 border"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-2xl">
              {["6-A", "7-A", "8-A", "9-A", "10-A", "11-Science", "12-Science"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddOpen(true)} className="h-14 px-8 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl">
            <Plus className="w-4 h-4 mr-3" /> Add Period
          </Button>
        </div>
      </div>

      {/* Timetable Grid */}
      <Card className="border-cyan-500/5 shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-cyan-500/5">
          <CardTitle className="text-lg font-black flex items-center gap-2"><Calendar className="w-5 h-5 text-cyan-500" /> Weekly Schedule — Class {selectedClass}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-cyan-500/[0.02]">
                <th className="px-4 py-4 font-black text-[10px] uppercase tracking-[0.2em] text-cyan-800 dark:text-cyan-400 w-32 border-b border-cyan-500/5">Period</th>
                {DAYS.map(day => (
                  <th key={day} className="px-4 py-4 font-black text-[10px] uppercase tracking-[0.2em] text-cyan-800 dark:text-cyan-400 border-b border-cyan-500/5 text-center">{day.slice(0, 3)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period, pIdx) => (
                <tr key={pIdx} className="border-b border-cyan-500/5 last:border-0">
                  <td className="px-4 py-3 text-center">
                    <p className="font-black text-xs text-cyan-800 dark:text-cyan-400">{period.label}</p>
                    <p className="text-[9px] text-muted-foreground font-bold flex items-center justify-center gap-1"><Clock className="w-2.5 h-2.5" />{period.start} - {period.end}</p>
                  </td>
                  {DAYS.map(day => {
                    const entry = timetable[day]?.[pIdx]
                    return (
                      <td key={`${day}-${pIdx}`} className="p-2 text-center">
                        {entry ? (
                          <div className="p-3 bg-cyan-50 dark:bg-cyan-900/10 rounded-xl border border-cyan-500/10 text-left group hover:border-cyan-500/30 transition-colors">
                            <p className="font-black text-xs text-cyan-800 dark:text-cyan-300 truncate">{entry.subject}</p>
                            <p className="text-[9px] text-muted-foreground font-bold flex items-center gap-1 mt-1"><User className="w-2.5 h-2.5" />{entry.teacher}</p>
                            <p className="text-[9px] text-muted-foreground font-bold flex items-center gap-1 mt-0.5"><BookOpen className="w-2.5 h-2.5" />{entry.room}</p>
                          </div>
                        ) : (
                          <div className="p-3 bg-muted/20 rounded-xl border border-dashed border-muted text-muted-foreground/30 text-[9px] font-bold">Free</div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Period Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader><DialogTitle>Add Period</DialogTitle><DialogDescription>Schedule a new class period.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Day</Label><Select value={addForm.day} onValueChange={v => { if (v) setAddForm({ ...addForm, day: v }) }}><SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl">{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Period</Label><Select value={String(addForm.period)} onValueChange={v => { if (v) setAddForm({ ...addForm, period: parseInt(v) }) }}><SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl">{PERIODS.map((p, i) => <SelectItem key={i} value={String(i)}>{p.label}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Subject</Label><Input value={addForm.subject} onChange={e => setAddForm({ ...addForm, subject: e.target.value })} className="rounded-xl mt-1" /></div>
            <div><Label>Teacher</Label><Input value={addForm.teacher} onChange={e => setAddForm({ ...addForm, teacher: e.target.value })} className="rounded-xl mt-1" /></div>
            <div><Label>Room No</Label><Input value={addForm.room} onChange={e => setAddForm({ ...addForm, room: e.target.value })} className="rounded-xl mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button><Button onClick={handleAdd} className="rounded-xl font-bold"><Save className="w-4 h-4 mr-2" /> Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
