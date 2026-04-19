"use client"

import { useCallback, useMemo, useRef, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, FileUp, Save, Loader2, Info } from "lucide-react"
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

type SubjectOption = {
  id: string
  name: string
  code: string
}

type ClassOption = {
  id: string
  name: string
  subjects?: SubjectOption[]
}

type StudentRow = {
  student: {
    id: string
    admissionNumber: string
    rollNumber?: string | null
    name: string
  }
  markEntry: {
    marks: number
    maxMarks: number
    remarks?: string | null
  } | null
}

export default function MarksEntryPage() {
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string
  const examId = params.examId as string

  const [classes, setClasses] = useState<ClassOption[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")

  const [students, setStudents] = useState<StudentRow[]>([])
  const [entries, setEntries] = useState<Record<string, { marks: number, maxMarks: number, remarks: string }>>({})

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Max marks for this batch
  const [maxMarks, setMaxMarks] = useState<number>(100)

  useEffect(() => {
    fetch("/api/classes").then(r => r.json()).then(setClasses)
  }, [])

  const selectedClassOption = useMemo(
    () => classes.find((classItem) => classItem.id === selectedClass) || null,
    [classes, selectedClass]
  )

  useEffect(() => {
    setSubjects(selectedClassOption?.subjects || [])
  }, [selectedClassOption])

  const loadGrid = useCallback(async () => {
    if (!selectedClass || !selectedSubject) return
    setLoading(true)
    const res = await fetch(`/api/exams/${examId}/marks?classRoomId=${selectedClass}&subjectId=${selectedSubject}`)
    if (res.ok) {
      const data = await res.json() as StudentRow[]
      setStudents(data)
      // Pre-fill entries
      const initEntries: Record<string, { marks: number; maxMarks: number; remarks: string }> = {}
      let defaultMax = 100
      data.forEach((row) => {
        initEntries[row.student.id] = {
          marks: row.markEntry?.marks || 0,
          maxMarks: row.markEntry?.maxMarks || defaultMax,
          remarks: row.markEntry?.remarks || ""
        }
        if (row.markEntry?.maxMarks) defaultMax = row.markEntry.maxMarks
      })
      setMaxMarks(defaultMax)
      setEntries(initEntries)
    }
    setLoading(false)
  }, [examId, selectedClass, selectedSubject])

  useEffect(() => {
    void loadGrid()
  }, [loadGrid])

  const handleMarksChange = (studentId: string, val: string) => {
    const num = val ? parseFloat(val) : 0
    setEntries(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks: num,
        maxMarks
      }
    }))
  }

  const handleMaxMarksChange = (val: string) => {
    const num = val ? parseFloat(val) : 100
    setMaxMarks(num)
    // Update all entries to use new max marks
    setEntries(prev => {
      const next: Record<string, { marks: number; maxMarks: number; remarks: string }> = {}
      Object.keys(prev).forEach(key => {
        next[key] = { ...prev[key], maxMarks: num }
      })
      return next
    })
  }

  const getGrade = (marks: number, max: number) => {
    if (max <= 0) return ""
    const pct = (marks / max) * 100
    if (pct >= 91) return "A1"
    if (pct >= 81) return "A2"
    if (pct >= 71) return "B1"
    if (pct >= 61) return "B2"
    if (pct >= 51) return "C1"
    if (pct >= 41) return "C2"
    if (pct >= 33) return "D"
    if (pct >= 21) return "E1"
    return "E2"
  }

  const saveEntries = async () => {
    setSaving(true)
    const payload = {
      classRoomId: selectedClass,
      subjectId: selectedSubject,
      entries: Object.entries(entries).map(([studentId, data]) => ({
        studentId,
        marks: data.marks,
        maxMarks: data.maxMarks,
        remarks: data.remarks
      }))
    }

    await fetch(`/api/exams/${examId}/marks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    setSaving(false)
  }

  const exportGrid = async () => {
    const rows = students.map((row) => ({
      AdmissionNumber: row.student.admissionNumber,
      RollNumber: row.student.rollNumber || "",
      StudentName: row.student.name,
      Marks: entries[row.student.id]?.marks ?? "",
      MaxMarks: maxMarks,
      Grade: getGrade(entries[row.student.id]?.marks || 0, maxMarks),
      Remarks: entries[row.student.id]?.remarks || "",
    }))

    const XLSX = await import("xlsx")
    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "MarksEntry")
    XLSX.writeFile(workbook, `MarksEntry_${examId}.xlsx`)
  }

  const importGrid = async (file: File) => {
    const XLSX = await import("xlsx")
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet, { defval: "" })

    const studentLookup = new Map(
      students.map((row) => [
        row.student.admissionNumber,
        row.student.id,
      ])
    )

    const importedEntries: Record<string, { marks: number; maxMarks: number; remarks: string }> = { ...entries }
    rows.forEach((row) => {
      const admissionNumber = String(row.AdmissionNumber || row.admissionNumber || "").trim()
      const studentId = studentLookup.get(admissionNumber)
      if (!studentId) return

      importedEntries[studentId] = {
        marks: Number(row.Marks || row.marks || 0),
        maxMarks: Number(row.MaxMarks || row.maxMarks || maxMarks),
        remarks: String(row.Remarks || row.remarks || ""),
      }
    })

    setEntries(importedEntries)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/${tenantSlug}/${role}/exams`)}>
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">Bulk Marks Entry</h1>
            <p className="text-sm text-gray-500">Record scores for students</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              await importGrid(file)
              e.currentTarget.value = ""
            }}
          />
          <Button
            variant="outline"
            disabled={!selectedClass || !selectedSubject || students.length === 0}
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <FileUp className="w-4 h-4" />
            Import Excel
          </Button>
          <Button
            variant="outline"
            disabled={!selectedClass || !selectedSubject || students.length === 0}
            onClick={exportGrid}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
          <Button 
            disabled={!selectedClass || !selectedSubject || students.length === 0 || saving} 
            onClick={saveEntries}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Entries
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm dark:bg-white/5 backdrop-blur-md">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Class</label>
            <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Subject</label>
            <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v ?? "")} disabled={!selectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Max Marks</label>
            <Input 
              type="number" 
              value={maxMarks} 
              onChange={(e) => handleMaxMarksChange(e.target.value)} 
              disabled={!selectedClass || !selectedSubject}
            />
          </div>
        </CardContent>
      </Card>

      {selectedClass && selectedSubject ? (
        <Card className="border-none shadow-sm dark:bg-white/5 backdrop-blur-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-white/5">
                <TableHead className="w-32 font-bold text-xs uppercase">Roll/Adm No</TableHead>
                <TableHead className="font-bold text-xs uppercase">Student Name</TableHead>
                <TableHead className="w-48 font-bold text-xs uppercase">Marks Obtained</TableHead>
                <TableHead className="w-32 font-bold text-xs uppercase">CBSE Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow><TableCell colSpan={4} className="text-center py-8">Loading students...</TableCell></TableRow>
              ) : students.length === 0 ? (
                 <TableRow><TableCell colSpan={4} className="text-center py-8">No students found in this class.</TableCell></TableRow>
              ) : (
                students.map((row) => (
                  <TableRow key={row.student.id}>
                    <TableCell className="font-mono text-xs">{row.student.rollNumber || row.student.admissionNumber}</TableCell>
                    <TableCell className="font-medium text-sm">{row.student.name}</TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        min="0"
                        max={maxMarks}
                        value={entries[row.student.id]?.marks ?? ""}
                        onChange={(e) => handleMarksChange(row.student.id, e.target.value)}
                        className="w-full bg-white dark:bg-black/20"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                        {getGrade(entries[row.student.id]?.marks || 0, maxMarks)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-gray-400 border border-dashed rounded-xl dark:border-white/10">
          <Info className="w-8 h-8 mb-3 opacity-50" />
          <p>Please select a Class and Subject to begin entry.</p>
        </div>
      )}
    </div>
  )
}
