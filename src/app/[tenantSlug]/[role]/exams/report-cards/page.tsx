"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Printer, Info, Award, Download, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CBSEReportCard } from "@/components/exams/CBSE_ReportCard"

type ClassOption = {
  id: string
  name: string
}

type StudentOption = {
  id: string
  name: string
  admissionNumber: string
  rollNumber?: string | null
}

type ApiError = {
  error?: string
}

export default function ReportCardsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string
  const examId = searchParams.get("examId") || ""

  const [classes, setClasses] = useState<ClassOption[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [students, setStudents] = useState<StudentOption[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>("")

  const [report, setReport] = useState<Parameters<typeof CBSEReportCard>[0]["data"] | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [bulkDownloading, setBulkDownloading] = useState<"pdf" | "xlsx" | null>(null)
  const selectedClassOption = classes.find((classroom) => classroom.id === selectedClass)
  const selectedStudentOption = students.find((student) => student.id === selectedStudent)

  // Fetch initial classes on mount
  useEffect(() => {
    let isMounted = true

    const loadClasses = async () => {
      try {
        const res = await fetch("/api/classes")
        const data = await res.json() as ClassOption[]
        if (!isMounted) return

        setClasses(data)
        setSelectedClass((current) => current || data[0]?.id || "")
      } catch (error) {
        console.error("Failed to load classes:", error)
      } finally {
        if (isMounted) {
          setLoadingClasses(false)
        }
      }
    }

    void loadClasses()

    return () => {
      isMounted = false
    }
  }, [])

  // In a real app we would have an endpoint /api/classes/[id]/students to get only active class students
  // Let's use the marks endpoint without subject to fetch all students, or fallback to the standard students endpoint.
  useEffect(() => {
    if (!selectedClass) {
      setStudents([])
      setSelectedStudent("")
      setReport(null)
      setLoadingStudents(false)
      return
    }

    let isMounted = true
    const controller = new AbortController()

    const loadStudents = async () => {
      setLoadingStudents(true)
      try {
        const res = await fetch(`/api/students?classRoomId=${selectedClass}&pageSize=100`, {
          signal: controller.signal,
        })
        const data = await res.json() as { students?: StudentOption[] }
        if (!isMounted) return

        const nextStudents = data.students || []
        setStudents(nextStudents)
        setSelectedStudent((current) => {
          if (current && nextStudents.some((student) => student.id === current)) {
            return current
          }

          return nextStudents[0]?.id || ""
        })
        if (nextStudents.length === 0) {
          setReport(null)
        }
      } catch (error) {
        if (
          controller.signal.aborted ||
          !isMounted ||
          (error instanceof DOMException && error.name === "AbortError") ||
          (error instanceof TypeError && error.message === "Failed to fetch")
        ) {
          return
        }

        console.error("Failed to load students:", error)
        if (isMounted) {
          setStudents([])
          setSelectedStudent("")
          setReport(null)
        }
      } finally {
        if (isMounted) {
          setLoadingStudents(false)
        }
      }
    }

    void loadStudents()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [selectedClass])

  // Fetch detailed report card data for the student
  useEffect(() => {
    if (!selectedStudent) {
      setReport(null)
      setLoading(false)
      return
    }

    let isMounted = true
    const controller = new AbortController()

    const loadReport = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/reports/cbse-card/data?studentId=${selectedStudent}`, {
          cache: "no-store",
          signal: controller.signal,
        })

        if (!res.ok) {
          const err = await res.json() as ApiError
          throw new Error(err.error || "Failed to fetch report data")
        }

        const data = await res.json() as Parameters<typeof CBSEReportCard>[0]["data"]
        if (isMounted) {
          setReport(data)
        }
      } catch (error) {
        if (
          controller.signal.aborted ||
          !isMounted ||
          (error instanceof DOMException && error.name === "AbortError") ||
          (error instanceof TypeError && error.message === "Failed to fetch")
        ) {
          return
        }

        if (isMounted) {
          setReport(null)
        }
        console.error("Failed to fetch detailed report:", error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadReport()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [selectedStudent])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    if (!selectedStudent) return;
    
    try {
      setDownloading(true);
      const res = await fetch(`/api/reports/cbse-card?studentId=${selectedStudent}`);
      
      if (!res.ok) {
        const err = await res.json() as ApiError;
        throw new Error(err.error || "Failed to generate PDF");
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ReportCard_${report?.student?.name?.replace(/\s+/g, '_') || selectedStudent}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error generating PDF. Please try again."
      console.error(error);
      alert(message);
    } finally {
      setDownloading(false);
    }
  };

  const handleBulkPdfDownload = async () => {
    if (!selectedClass) return

    try {
      setBulkDownloading("pdf")
      const res = await fetch(`/api/reports/cbse-card/bulk?classRoomId=${selectedClass}`)
      if (!res.ok) {
        const err = await res.json() as ApiError
        throw new Error(err.error || "Failed to generate class PDF")
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Class_${selectedClass}_ReportCards.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to export class PDF"
      alert(message)
    } finally {
      setBulkDownloading(null)
    }
  }

  const handleBulkExcelDownload = async () => {
    if (!selectedClass || !examId) return

    try {
      setBulkDownloading("xlsx")
      const res = await fetch(`/api/exams/${examId}/marks/export?classRoomId=${selectedClass}&format=xlsx`)
      if (!res.ok) {
        const err = await res.json() as ApiError
        throw new Error(err.error || "Failed to export marks workbook")
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Exam_${examId}_Class_${selectedClass}_Marks.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to export Excel workbook"
      alert(message)
    } finally {
      setBulkDownloading(null)
    }
  }

  // Common UI styles specifically strictly designed for Print media querying
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen pb-12">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #report-card-container, #report-card-container * {
            visibility: visible;
          }
          #report-card-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-hidden {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
        }
      `}} />

      {/* Screen Controls */}
      <div className="flex items-center justify-between print-hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/${tenantSlug}/${role}/exams`)}>
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">Report Cards</h1>
            <p className="text-sm text-gray-500">Generate and print Term Reports</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {selectedClass && examId && (
            <>
              <Button
                onClick={handleBulkExcelDownload}
                disabled={bulkDownloading !== null}
                variant="outline"
                className="border-slate-200 gap-2"
              >
                {bulkDownloading === "xlsx" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Class Excel
              </Button>
              <Button
                onClick={handleBulkPdfDownload}
                disabled={bulkDownloading !== null}
                variant="outline"
                className="border-slate-200 gap-2"
              >
                {bulkDownloading === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                Class PDF
              </Button>
            </>
          )}

        {report && (
          <div className="flex gap-2">
            <Button 
              onClick={handleDownload} 
              disabled={downloading}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 gap-2"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {downloading ? "Generating..." : "Download PDF"}
            </Button>
            <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Printer className="w-4 h-4" />
              Print Report
            </Button>
          </div>
        )}
        </div>
      </div>

      <Card className="border-none shadow-sm dark:bg-white/5 backdrop-blur-md print-hidden">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Select Class</label>
            <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v ?? "")} disabled={loadingClasses || classes.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class">
                  {selectedClassOption?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs text-gray-500">
              {loadingClasses ? "Loading classes..." : `${classes.length} demo classes ready`}
            </p>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Select Student</label>
            <Select value={selectedStudent} onValueChange={(v) => setSelectedStudent(v ?? "")} disabled={!selectedClass || loadingStudents || students.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Search Student...">
                  {selectedStudentOption ? `${selectedStudentOption.name} (${selectedStudentOption.rollNumber || selectedStudentOption.admissionNumber})` : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.rollNumber || s.admissionNumber})</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs text-gray-500">
              {!selectedClass
                ? "Choose a class to load its students"
                : loadingStudents
                  ? "Loading students..."
                  : `${students.length} students available in this class`}
            </p>
          </div>
        </CardContent>
      </Card>

      {loadingClasses || loadingStudents ? (
        <div className="flex flex-col items-center justify-center p-20 text-gray-400 print-hidden">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
          <p className="animate-pulse">Preparing demo report-card data...</p>
        </div>
      ) : !selectedClass ? (
         <div className="flex flex-col items-center justify-center p-12 text-blue-500 border border-dashed rounded-xl border-blue-200 bg-blue-50/30 print-hidden">
           <Info className="w-8 h-8 mb-3 opacity-50" />
           <p className="font-medium">No class is available yet. Refresh after the demo seed completes.</p>
         </div>
      ) : students.length === 0 ? (
         <div className="flex flex-col items-center justify-center p-12 text-blue-500 border border-dashed rounded-xl border-blue-200 bg-blue-50/30 print-hidden">
           <Info className="w-8 h-8 mb-3 opacity-50" />
           <p className="font-medium">No students were found for the selected class.</p>
         </div>
      ) : !selectedStudent ? (
         <div className="flex flex-col items-center justify-center p-12 text-blue-500 border border-dashed rounded-xl border-blue-200 bg-blue-50/30 print-hidden">
           <Info className="w-8 h-8 mb-3 opacity-50" />
           <p className="font-medium">Please select a student to generate their comprehensive Term Report.</p>
         </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-gray-400 print-hidden">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
          <p className="animate-pulse">Synthesizing Comprehensive Assessment Data...</p>
          <p className="mt-2 text-sm text-gray-500 text-center max-w-md">
            First-load report assembly can take around 10-15 seconds with the demo dataset.
          </p>
        </div>
      ) : report ? (
        <div className="animate-in zoom-in-95 duration-500">
          <CBSEReportCard data={report} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-gray-400 border border-dashed rounded-xl dark:border-white/10 print-hidden">
          <Info className="w-8 h-8 mb-3 opacity-50" />
          <p>Unable to generate report layout. Please check if marks are published for this student.</p>
        </div>
      )}
    </div>
  )
}
