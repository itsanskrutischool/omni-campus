"use client"

import React from "react"
import { Printer, Download, GraduationCap, Calendar, User, MapPin, Award } from "lucide-react"

interface ScholasticResult {
  name: string
  code: string
  term1: { pt: number | null, exam: number | null, total: number }
  term2: { pt: number | null, exam: number | null, total: number }
  total: number
  grade: string
}

interface CoScholasticResult {
  name: string
  grade: string
}

interface CBSEData {
  student: any
  tenant: any
  attendance: { workingDays: number, presentDays: number }
  results: {
    scholastic: ScholasticResult[]
    coScholastic: CoScholasticResult[]
    rank: number
    totalStudents: number
  }
  academicYear: string
  promotionStatus: string
}

export const CBSEReportCard = ({ data }: { data: CBSEData }) => {
  const { student, tenant, attendance, results, academicYear, promotionStatus } = data

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-5xl mx-auto my-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Action Header - Hidden on Print */}
      <div className="flex justify-between items-center print:hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Award className="text-indigo-500" />
            Academic Transcript Preview
          </h2>
          <p className="text-sm text-slate-500">Draft for Session {academicYear}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg active:scale-95"
          >
            <Printer size={18} />
            Print Report
          </button>
        </div>
      </div>

      {/* Main Report Card Container */}
      <div className="bg-white text-slate-900 p-8 md:p-12 border shadow-2xl rounded-sm print:shadow-none print:border-none print:m-0 print:p-4 print:w-full" id="report-card">
        
        {/* School Header */}
        <div className="text-center border-b-2 border-slate-900 pb-6 mb-8 relative">
          {tenant.logo && (
            <img 
              src={tenant.logo} 
              alt="School Logo" 
              className="absolute left-0 top-0 w-24 h-24 object-contain hidden md:block print:block"
            />
          )}
          <h1 className="text-3xl font-black uppercase tracking-tight">{tenant.name}</h1>
          <p className="text-sm mt-1">{tenant.address}</p>
          <div className="flex justify-center gap-4 mt-2 text-xs font-semibold uppercase">
            <span>Affiliation No: {tenant.affiliationNo || "N/A"}</span>
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full my-auto" />
            <span>School Code: {tenant.schoolCode || "N/A"}</span>
          </div>
          <div className="mt-4 bg-slate-900 text-white px-6 py-1.5 rounded-full inline-block text-sm font-bold tracking-widest uppercase">
            Report Card: {academicYear}
          </div>
        </div>

        {/* Student Profile Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-sm border p-6 rounded-lg bg-slate-50/50 mb-8">
          <DetailItem label="Student Name" value={student.name} icon={<User size={14} />} />
          <DetailItem label="Admission No" value={student.admissionNumber} />
          <DetailItem label="Roll Number" value={student.rollNumber || "N/A"} />
          <DetailItem label="Class & Section" value={`${student.classroom?.name || ""} - ${student.section?.name || ""}`} icon={<GraduationCap size={14} />} />
          <DetailItem label="Date of Birth" value={new Date(student.dob).toLocaleDateString()} icon={<Calendar size={14} />} />
          <DetailItem label="Father's Name" value={student.fatherName} />
          <DetailItem label="Mother's Name" value={student.motherName} />
          <DetailItem label="Attendance" value={`${attendance.presentDays}/${attendance.workingDays} Days`} />
        </div>

        {/* Scholastic Areas */}
        <div className="space-y-4 mb-8">
          <h3 className="font-bold uppercase tracking-wider text-sm border-b pb-1">Scholastic Areas</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-900 text-[13px]">
              <thead>
                <tr className="bg-slate-100">
                  <th rowSpan={2} className="border border-slate-900 p-2 text-left">Subject Name</th>
                  <th colSpan={3} className="border border-slate-900 p-1">Term 1 (100)</th>
                  <th colSpan={3} className="border border-slate-900 p-1">Term 2 (100)</th>
                  <th rowSpan={2} className="border border-slate-900 p-2">Total (200)</th>
                  <th rowSpan={2} className="border border-slate-900 p-2">Grade</th>
                </tr>
                <tr className="bg-slate-50 text-[11px]">
                  <th className="border border-slate-900 p-1">PT</th>
                  <th className="border border-slate-900 p-1">Exam</th>
                  <th className="border border-slate-900 p-1">Total</th>
                  <th className="border border-slate-900 p-1">PT</th>
                  <th className="border border-slate-900 p-1">Exam</th>
                  <th className="border border-slate-900 p-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {results.scholastic.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-900 p-2 font-medium">{sub.name}</td>
                    <td className="border border-slate-900 p-2 text-center italic text-slate-500">{sub.term1.pt ?? "-"}</td>
                    <td className="border border-slate-900 p-2 text-center text-slate-500 italic">{sub.term1.exam ?? "-"}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold bg-slate-50/50">{sub.term1.total}</td>
                    <td className="border border-slate-900 p-2 text-center italic text-slate-500">{sub.term2.pt ?? "-"}</td>
                    <td className="border border-slate-900 p-2 text-center italic text-slate-500">{sub.term2.exam ?? "-"}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold bg-slate-50/50">{sub.term2.total}</td>
                    <td className="border border-slate-900 p-2 text-center font-black">{sub.total}</td>
                    <td className="border border-slate-900 p-2 text-center font-black text-indigo-700">{sub.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Co-Scholastic & Results Footer */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Co-Scholastic Table */}
          <div className="space-y-4">
            <h3 className="font-bold uppercase tracking-wider text-sm border-b pb-1">Co-Scholastic Activities</h3>
            <table className="w-full border-collapse border border-slate-900 text-sm">
              <thead>
                <tr className="bg-slate-100 italic">
                  <th className="border border-slate-900 p-2 text-left">Activity</th>
                  <th className="border border-slate-900 p-2 text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.coScholastic.map((cs, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-900 p-2">{cs.name}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold">{cs.grade}</td>
                  </tr>
                ))}
                {results.coScholastic.length === 0 && (
                  <tr>
                    <td colSpan={2} className="border border-slate-900 p-4 text-center text-slate-400 italic">No co-scholastic data updated</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Promotion & Rank */}
          <div className="flex flex-col justify-end gap-6 text-right">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Result Summary</span>
              <p className="text-2xl font-black text-slate-900 italic underline decoration-indigo-500 decoration-4 underline-offset-4 tracking-tight">
                {promotionStatus}
              </p>
            </div>
            <div className="flex justify-end gap-8">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase text-slate-500">Class Rank</p>
                <p className="text-xl font-black">{results.rank} / {results.totalStudents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Signatures */}
        <div className="mt-16 pt-12 border-t flex justify-between items-end gap-4 text-center">
          <div className="flex flex-col items-center">
            <div className="h-16 flex items-end">
               {/* Space for dynamic teacher signature if needed */}
               <div className="w-32 h-px bg-slate-300 mb-2" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest italic">Class Teacher</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="h-16 flex items-end overflow-hidden">
               {tenant.principalSignature ? (
                 <img src={tenant.principalSignature} alt="Principal Signature" className="max-w-[120px] max-h-[60px]" />
               ) : (
                 <div className="w-32 h-px bg-slate-300 mb-2" />
               )}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest italic">Principal</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-16 flex items-end">
               <div className="w-32 h-px bg-slate-300 mb-2" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest italic">Parent Signature</span>
          </div>
        </div>

        {/* Date of Issue */}
        <div className="mt-8 text-[10px] text-slate-400 italic">
          Generated on: {new Date().toLocaleDateString()} by OmniCampus Engine.
        </div>
      </div>

      {/* Grading Key - Footnote */}
      <div className="bg-slate-50 p-4 rounded-xl text-[10px] text-slate-500 print:hidden">
        <p className="font-bold mb-1">CBSE GRADING SCALE:</p>
        <div className="grid grid-cols-4 gap-2">
          <span>91-100: A1</span>
          <span>81-90: A2</span>
          <span>71-80: B1</span>
          <span>61-70: B2</span>
          <span>51-60: C1</span>
          <span>41-50: C2</span>
          <span>33-40: D</span>
          <span>Below 33: E</span>
        </div>
      </div>
    </div>
  )
}

const DetailItem = ({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
      {icon} {label}
    </span>
    <span className="text-[13px] font-semibold text-slate-900 border-b border-dotted border-slate-300 pb-0.5">
      {value || "---"}
    </span>
  </div>
)
