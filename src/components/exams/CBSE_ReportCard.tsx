"use client"

import React from "react"
import { Award, Calendar, GraduationCap, Printer, ShieldCheck, User } from "lucide-react"

type TermBreakdown = {
  periodicTest: number | null
  notebook: number | null
  subjectEnrichment: number | null
  exam: number | null
  total: number
  maxMarks: number
}

type ReportData = {
  student: {
    name: string
    admissionNumber: string
    rollNumber?: string | null
    dob?: string | Date | null
    fatherName?: string | null
    motherName?: string | null
    classroom?: { name?: string | null } | null
    section?: { name?: string | null } | null
  }
  tenant: {
    name?: string | null
    logo?: string | null
    address?: string | null
    affiliationNo?: string | null
    schoolCode?: string | null
  } | null
  attendance: {
    workingDays: number
    presentDays: number
    percentage: number
  }
  results: {
    scholastic: Array<{
      name: string
      code: string
      term1: TermBreakdown
      term2: TermBreakdown
      total: number
      maxMarks: number
      percentage: number
      grade: string
    }>
    coScholastic: Array<{ name: string; grade: string }>
    discipline: Array<{ name: string; grade: string }>
    rank: number
    totalStudents: number
    totalMarksObtained: number
    totalMaxMarks: number
    overallPercentage: number
    overallGrade: string
    remarks: string
  }
  academicYear: string
  promotionStatus: string
}

const cellClass = "border border-slate-900 px-2 py-2 text-center align-middle"

const ScoreCell = ({ value }: { value: number | null }) => (
  <td className={`${cellClass} font-semibold`}>{value ?? "-"}</td>
)

const MiniDetail = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-sm font-bold text-slate-900">{value || "---"}</div>
  </div>
)

export const CBSEReportCard: React.FC<{ data: ReportData }> = ({ data }) => {
  if (!data) return null

  const { student, tenant, attendance, results, academicYear, promotionStatus } = data

  return (
    <div className="mx-auto max-w-6xl space-y-6 print:space-y-0">
      <div className="print-hidden flex items-center justify-between rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-700">CBSE Format Preview</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Scholastic & Co-Scholastic Report Card</h2>
          <p className="text-sm font-medium text-slate-500">Structured for Omni Campus school workflows and print export.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      <div id="report-card-container" className="overflow-hidden rounded-[28px] border-2 border-slate-900 bg-white text-slate-950 shadow-2xl print:rounded-none print:border-0 print:shadow-none">
        <div className="border-b-4 border-slate-900 px-8 py-7">
          <div className="grid gap-6 md:grid-cols-[110px_1fr_110px] md:items-center">
            <div className="flex h-24 items-center justify-center rounded-2xl border border-slate-300 bg-slate-50">
              {tenant?.logo ? (
                <img src={tenant.logo} alt="School logo" className="max-h-20 max-w-20 object-contain" />
              ) : (
                <GraduationCap className="h-12 w-12 text-slate-300" />
              )}
            </div>

            <div className="text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.38em] text-emerald-700">Central Board Style Report Card</p>
              <h1 className="mt-2 text-3xl font-black uppercase tracking-tight">{tenant?.name || "Omni Campus School"}</h1>
              <p className="mt-1 text-sm font-medium text-slate-600">{tenant?.address || "School Address"}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
                <span>Affiliation No: {tenant?.affiliationNo || "Pending"}</span>
                <span>School Code: {tenant?.schoolCode || "Pending"}</span>
                <span>Academic Session: {academicYear}</span>
              </div>
            </div>

            <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              School Seal
            </div>
          </div>
        </div>

        <div className="px-8 py-7">
          <div className="grid gap-4 md:grid-cols-3">
            <MiniDetail label="Student Name" value={student.name} icon={<User className="h-3.5 w-3.5" />} />
            <MiniDetail label="Admission No" value={student.admissionNumber} />
            <MiniDetail label="Roll Number" value={student.rollNumber || "N/A"} />
            <MiniDetail label="Class & Section" value={`${student.classroom?.name || ""} ${student.section?.name ? `- ${student.section.name}` : ""}`} icon={<GraduationCap className="h-3.5 w-3.5" />} />
            <MiniDetail label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString("en-IN") : "N/A"} icon={<Calendar className="h-3.5 w-3.5" />} />
            <MiniDetail label="Attendance" value={`${attendance.presentDays}/${attendance.workingDays} (${attendance.percentage}%)`} />
            <MiniDetail label="Father's Name" value={student.fatherName || "N/A"} />
            <MiniDetail label="Mother's Name" value={student.motherName || "N/A"} />
            <MiniDetail label="Final Result" value={promotionStatus} icon={<Award className="h-3.5 w-3.5" />} />
          </div>

          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">Part 1: Scholastic Areas</h3>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Term 1: PT+NB+SE+Half Yearly | Term 2: PT+NB+SE+Annual
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th rowSpan={2} className={`${cellClass} min-w-[220px] text-left`}>Subject</th>
                    <th colSpan={5} className={cellClass}>Term 1</th>
                    <th colSpan={5} className={cellClass}>Term 2</th>
                    <th rowSpan={2} className={cellClass}>Grand Total</th>
                    <th rowSpan={2} className={cellClass}>Grade</th>
                  </tr>
                  <tr className="bg-slate-100 text-slate-900">
                    <th className={cellClass}>PT (10)</th>
                    <th className={cellClass}>NB (5)</th>
                    <th className={cellClass}>SE (5)</th>
                    <th className={cellClass}>Exam</th>
                    <th className={cellClass}>Total</th>
                    <th className={cellClass}>PT (10)</th>
                    <th className={cellClass}>NB (5)</th>
                    <th className={cellClass}>SE (5)</th>
                    <th className={cellClass}>Exam</th>
                    <th className={cellClass}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {results.scholastic.map((subject) => (
                    <tr key={subject.code} className="even:bg-slate-50">
                      <td className={`${cellClass} text-left font-bold`}>{subject.name}</td>
                      <ScoreCell value={subject.term1.periodicTest} />
                      <ScoreCell value={subject.term1.notebook} />
                      <ScoreCell value={subject.term1.subjectEnrichment} />
                      <ScoreCell value={subject.term1.exam} />
                      <td className={`${cellClass} bg-slate-100 font-black`}>{subject.term1.total}</td>
                      <ScoreCell value={subject.term2.periodicTest} />
                      <ScoreCell value={subject.term2.notebook} />
                      <ScoreCell value={subject.term2.subjectEnrichment} />
                      <ScoreCell value={subject.term2.exam} />
                      <td className={`${cellClass} bg-slate-100 font-black`}>{subject.term2.total}</td>
                      <td className={`${cellClass} bg-emerald-50 text-base font-black text-emerald-900`}>{subject.total}</td>
                      <td className={`${cellClass} bg-amber-50 text-base font-black text-amber-800`}>{subject.grade}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-900 text-white">
                    <td className={`${cellClass} text-left font-black`}>Overall Performance</td>
                    <td colSpan={10} className={`${cellClass} text-right font-black`}>
                      Marks Obtained: {results.totalMarksObtained} / {results.totalMaxMarks}
                    </td>
                    <td className={`${cellClass} text-lg font-black`}>{results.overallPercentage}%</td>
                    <td className={`${cellClass} text-lg font-black`}>{results.overallGrade}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-slate-900">Part 2: Co-Scholastic Areas</h3>
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className={`${cellClass} text-left`}>Activity</th>
                    <th className={cellClass}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {results.coScholastic.map((item) => (
                    <tr key={item.name}>
                      <td className={`${cellClass} text-left font-bold`}>{item.name}</td>
                      <td className={`${cellClass} font-black`}>{item.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-slate-900">Part 3: Discipline</h3>
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className={`${cellClass} text-left`}>Indicator</th>
                    <th className={cellClass}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {results.discipline.map((item) => (
                    <tr key={item.name}>
                      <td className={`${cellClass} text-left font-bold`}>{item.name}</td>
                      <td className={`${cellClass} font-black`}>{item.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-[1.5fr_1fr]">
            <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                Teacher Remarks
              </div>
              <p className="text-sm font-semibold leading-6 text-slate-700">{results.remarks}</p>
            </div>

            <div className="rounded-2xl border border-slate-900 bg-slate-900 p-5 text-white">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">Result Summary</div>
              <div className="mt-3 text-3xl font-black">{results.overallGrade}</div>
              <div className="mt-1 text-sm font-semibold text-slate-300">{promotionStatus}</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Rank</div>
                  <div className="mt-1 text-xl font-black">{results.rank || "-"}</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Strength</div>
                  <div className="mt-1 text-xl font-black">{results.totalStudents}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="pt-12 text-center">
              <div className="border-t-2 border-slate-900 pt-2 text-[11px] font-black uppercase tracking-[0.2em]">Class Teacher</div>
            </div>
            <div className="pt-12 text-center">
              <div className="border-t-2 border-slate-900 pt-2 text-[11px] font-black uppercase tracking-[0.2em]">Parent / Guardian</div>
            </div>
            <div className="pt-12 text-center">
              <div className="border-t-2 border-slate-900 pt-2 text-[11px] font-black uppercase tracking-[0.2em]">Principal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
