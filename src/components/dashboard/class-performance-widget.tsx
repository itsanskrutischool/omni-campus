"use client"

import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const COLORS = ["#2563EB", "#F59E0B", "#10B981", "#EF4444"]

interface PerformanceData {
  good: number
  topStudents: number
  average: number
  belowAverage: number
}

export function ClassPerformanceWidget({ performance }: { performance: PerformanceData }) {
  const data = [
    { name: "Good", value: performance.good },
    { name: "Top Students", value: performance.topStudents },
    { name: "Average", value: performance.average },
    { name: "Below Average", value: performance.belowAverage },
  ]
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Class Wise Students</h3>
        <select className="text-[10px] border border-slate-200 dark:border-white/10 dark:bg-zinc-800 rounded-lg px-2 py-1 text-slate-500 outline-none">
          <option>All Subjects</option>
        </select>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0" style={{ width: 130, height: 130 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={2} stroke="#fff">
                {data.map((_, i) => (<Cell key={i} fill={COLORS[i]} />))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-800 dark:text-white">{total}</span>
            <span className="text-[9px] text-slate-400">Total</span>
          </div>
        </div>
        <div className="flex-1 space-y-2.5">
          {data.map((d, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{d.name}</span>
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-white">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
