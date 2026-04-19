"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Eye, Calendar } from "lucide-react"

const COLORS = ["#2563EB", "#E2E8F0", "#FBBF24"]

interface AttendanceData {
  present: number
  absent: number
  late: number
  emergency: number
  medical: number
}

export function AttendanceWidget({ attendance }: { attendance: AttendanceData }) {
  const [activeTab, setActiveTab] = useState("Students")

  const donutData = [
    { name: "Present", value: attendance.present, color: "#2563EB" },
    { name: "Absent", value: attendance.absent, color: "#E2E8F0" },
    { name: "Late", value: attendance.late, color: "#FBBF24" },
  ]

  const statBreakdown = [
    { label: "Emergency", value: attendance.emergency, color: "text-red-600 bg-red-50" },
    { label: "Medical", value: attendance.medical, color: "text-blue-600 bg-blue-50" },
    { label: "Absent", value: attendance.absent, color: "text-orange-600 bg-orange-50" },
    { label: "Late", value: attendance.late, color: "text-purple-600 bg-purple-50" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Attendance</h3>
        <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <Calendar size={10} /> Today
        </span>
      </div>

      <div className="flex gap-4 mb-4 border-b border-slate-100 dark:border-white/5">
        {["Students", "Teachers", "Staff"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-semibold pb-2 border-b-2 transition-colors ${activeTab === tab
                ? "text-blue-600 border-blue-600"
                : "text-slate-400 border-transparent hover:text-slate-600"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="grid grid-cols-2 gap-3 flex-1">
          {statBreakdown.map((s, i) => (
            <div key={i} className="text-center p-2 rounded-xl bg-slate-50 dark:bg-white/5">
              <div className={`text-lg font-bold ${s.color.split(" ")[0]}`}>{s.value}</div>
              <div className="text-[10px] text-slate-400 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="relative" style={{ width: 120, height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={36} outerRadius={52} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                  {donutData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-slate-800 dark:text-white">{attendance.present}</span>
              <span className="text-[9px] text-slate-500">Present</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> {attendance.present}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" /> {attendance.absent}
            </span>
          </div>
        </div>
      </div>

      <button className="mt-4 w-full border border-blue-200 dark:border-blue-800 text-blue-600 text-xs py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-1.5 font-semibold">
        <Eye size={13} /> View All Student Attendance
      </button>
    </motion.div>
  )
}
