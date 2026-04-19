"use client"

import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts"
interface FinanceData {
  fineCollected: string
  studentsNotPaid: number
  totalOutstanding: string
}

interface FeeTrendData {
  categories: string[]
  series: { name: string; data: number[] }[]
}

export function FeesCollectionChart({ finance, feeTrend }: { finance: FinanceData; feeTrend: FeeTrendData }) {
  const data = feeTrend.categories.map((cat, i) => ({
    name: cat,
    collected: feeTrend.series[0]?.data[i] ?? 0,
    total: feeTrend.series[1]?.data[i] ?? 0,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Fees Collection</h3>
        <select className="text-[10px] border border-slate-200 dark:border-white/10 dark:bg-zinc-800 rounded-lg px-2 py-1 text-slate-500 outline-none">
          <option>This Year</option>
        </select>
      </div>

      {/* Chart */}
      <div className="h-[180px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#94a3b8" }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                fontSize: "11px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Bar dataKey="collected" radius={[6, 6, 0, 0]} barSize={16}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={i % 2 === 0 ? "#2563EB" : "#93C5FD"}
                />
              ))}
            </Bar>
            <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={16} fill="#E2E8F0" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
        <div className="text-center p-2 rounded-xl bg-blue-50 dark:bg-blue-900/10">
          <div className="text-[10px] font-medium text-slate-400 mb-0.5">Fine Collected</div>
          <div className="text-xs font-bold text-blue-600">{finance.fineCollected}</div>
        </div>
        <div className="text-center p-2 rounded-xl bg-red-50 dark:bg-red-900/10">
          <div className="text-[10px] font-medium text-slate-400 mb-0.5">Not Paid</div>
          <div className="text-xs font-bold text-red-600">{finance.studentsNotPaid} Students</div>
        </div>
        <div className="text-center p-2 rounded-xl bg-amber-50 dark:bg-amber-900/10">
          <div className="text-[10px] font-medium text-slate-400 mb-0.5">Outstanding</div>
          <div className="text-xs font-bold text-amber-600">{finance.totalOutstanding}</div>
        </div>
      </div>
    </motion.div>
  )
}
