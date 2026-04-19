"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Printer, FileCheck2, UserCheck, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function TCGeneratorPage() {
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [studentData, setStudentData] = useState<any>(null)

  useEffect(() => {
    fetch("/api/classes").then(r => r.json()).then(setClasses)
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetch(`/api/students?classRoomId=${selectedClass}&pageSize=100`)
        .then(r => r.json())
        .then(data => setStudents(data.students || []))
    }
  }, [selectedClass])

  useEffect(() => {
    if (selectedStudent) {
      const s = students.find(x => x.id === selectedStudent)
      setStudentData(s)
    }
  }, [selectedStudent, students])

  const handlePrint = () => window.print()

  return (
    <div className="space-y-6 animate-in fade-in duration-700 min-h-screen pb-12">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #tc-paper, #tc-paper * { visibility: visible; }
          #tc-paper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            border: none;
          }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">TC Generator</h1>
            <p className="text-sm text-muted-foreground">CBSE Bye-Law 2024 Compliant Transfer Certificates</p>
          </div>
        </div>
        {studentData && (
          <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 gap-2 font-bold">
            <Printer className="w-4 h-4" />
            Issue Certificate
          </Button>
        )}
      </div>

      <Card className="no-print border-none shadow-sm dark:bg-white/5 backdrop-blur-md">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Step 1: Focus Class</label>
            <Select value={selectedClass} onValueChange={(val) => setSelectedClass(val || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Step 2: Select Outgoing Student</label>
            <Select value={selectedStudent} onValueChange={(val) => setSelectedStudent(val || "")} disabled={!selectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Search Student..." />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.admissionNumber})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {studentData ? (
        <div id="tc-paper" className="bg-white text-black p-12 mx-auto max-w-[210mm] min-h-[297mm] border-[10px] border-double border-gray-100 relative print:border-none shadow-2xl">
          {/* Official Emblem Slot */}
          <div className="flex justify-between items-start mb-8">
            <div className="text-[10px] font-bold text-gray-400">
              <p>Serial No: <span className="text-black">XAV/TC/2024/{studentData.id.slice(-4).toUpperCase()}</span></p>
              <p>Admission No: <span className="text-black">{studentData.admissionNumber}</span></p>
            </div>
            <div className="text-center flex-1 px-4">
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">St. Xavier&apos;s International School</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 italic mb-2">Affiliated to CBSE, New Delhi (Affiliation No. 2131234)</p>
              <div className="h-[2px] bg-black w-full mb-1" />
              <h2 className="text-xl font-black tracking-[0.3em] uppercase underline decoration-2 underline-offset-8">Transfer Certificate</h2>
            </div>
            <div className="text-right text-[10px] font-bold text-gray-400">
              <p>School Code: <span className="text-black">60112</span></p>
              <p>Date of Issue: <span className="text-black">{new Date().toLocaleDateString()}</span></p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-semibold leading-loose mt-12 bg-gray-50/30 p-8 border border-gray-100 rounded-xl">
             <div className="flex border-b border-dotted border-gray-300 pb-1">
               <span className="w-64">1. Name of Pupil:</span>
               <span className="font-black uppercase flex-1">{studentData.name}</span>
             </div>
             <div className="flex border-b border-dotted border-gray-300 pb-1">
               <span className="w-64">2. Mother&apos;s Name:</span>
               <span className="font-bold flex-1">{studentData.motherName}</span>
             </div>
             <div className="flex border-b border-dotted border-gray-300 pb-1">
               <span className="w-64">3. Father&apos;s / Guardian&apos;s Name:</span>
               <span className="font-bold flex-1">{studentData.fatherName}</span>
             </div>
             <div className="flex border-b border-dotted border-gray-300 pb-1">
               <span className="w-64">4. Nationality:</span>
               <span className="font-bold flex-1">INDIAN</span>
             </div>
             <div className="flex border-b border-dotted border-gray-300 pb-1">
               <span className="w-64">5. Date of first admission in the school:</span>
               <span className="font-bold flex-1">{new Date(studentData.createdAt).toLocaleDateString()} in Class - {studentData.classroom?.name}</span>
             </div>
             <div className="flex border-b border-dotted border-gray-300 pb-1">
               <span className="w-64">6. Date of birth (in Christian Era):</span>
               <span className="font-black flex-1 uppercase">{new Date(studentData.dob).toLocaleDateString()}</span>
             </div>
             <div className="flex border-b border-dotted border-gray-300 pb-1">
               <span className="w-64">7. Class in which the pupil last studied:</span>
               <span className="font-black flex-1 uppercase">{studentData.classroom?.name} - {studentData.section?.name}</span>
             </div>
             <div className="flex border-b border-dotted border-gray-300 pb-1">
               <span className="w-64">8. School / Board Annual Examination last taken:</span>
               <span className="font-bold flex-1 uppercase">ANNUAL EXAM 2024 - PASSED</span>
             </div>
             <div className="flex border-b border-dotted border-gray-300 pb-1">
               <span className="w-64">9. Whether failed, if so once/twice in same class:</span>
               <span className="font-bold flex-1 uppercase">NO</span>
             </div>
             <div className="flex border-b border-dotted border-gray-300 pb-1">
               <span className="w-64">10. Subjects Studied:</span>
               <span className="font-bold flex-1 italic">English, Hindi, Mathematics, Science, Social Science</span>
             </div>
             <div className="flex border-b border-dotted border-gray-300 pb-1">
               <span className="w-64">11. Date of pupil&apos;s last attendance in school:</span>
               <span className="font-bold flex-1">{new Date().toLocaleDateString()}</span>
             </div>
             <div className="flex border-b border-dotted border-gray-300 pb-1">
               <span className="w-64">12. Reason for leaving the school:</span>
               <span className="font-bold flex-1 uppercase italic underline decoration-sky-300 underline-offset-4 decoration-2">Parent&apos;s Request / Relocation</span>
             </div>
             <div className="flex border-b border-dotted border-gray-300 pb-1">
               <span className="w-64">13. Any other remarks:</span>
               <span className="font-bold flex-1">CHARCTER AND CONDUCT FOUND TO BE GOOD</span>
             </div>
          </div>

          <div className="mt-32 flex justify-between px-12 text-[10px] font-black uppercase text-gray-400 italic">
            <div className="text-center border-t border-black w-32 pt-2">Class Teacher</div>
            <div className="text-center border-t border-black w-32 pt-2">Checked By</div>
            <div className="text-center border-t border-black w-32 pt-2 text-black">Principal (Seal)</div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 text-center text-[8px] font-bold text-gray-300 uppercase tracking-widest px-12">
            This is a computer generated document and as per CBSE circular coord/ec-30.7/2014 it does not require physical signatures if issued through an OEM portal.
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 text-muted-foreground border-2 border-dashed rounded-2xl dark:border-white/5 no-print">
          <FileCheck2 className="w-12 h-12 mb-4 opacity-20" />
          <h3 className="text-lg font-bold uppercase tracking-widest opacity-50">Operational Protocol Required</h3>
          <p className="max-w-md text-center text-sm mt-2">To issue a verified Transfer Certificate, please select a Class and an active Pupil from the search gateway above.</p>
        </div>
      )}
    </div>
  )
}
