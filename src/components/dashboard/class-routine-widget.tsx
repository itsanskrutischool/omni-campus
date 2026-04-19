"use client"

import { motion } from "framer-motion"
import { Plus, Download, Calendar } from "lucide-react"
import { DASHBOARD_STATS } from "@/lib/dashboard-data"

export function ClassRoutineWidget() {
  const { classRoutines } = DASHBOARD_STATS

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Class Routine</h3>
        <button className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 hover:bg-blue-100 transition-colors">
          <Plus size={10} /> Create New
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select className="flex-1 text-[11px] border border-slate-200 dark:border-white/10 dark:bg-zinc-800 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300 text-slate-500">
          <option>Filter Class</option>
        </select>
        <select className="flex-1 text-[11px] border border-slate-200 dark:border-white/10 dark:bg-zinc-800 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300 text-slate-500">
          <option>Section</option>
        </select>
      </div>

      {/* Routine Items */}
      <div className="space-y-3">
        {classRoutines.map((routine, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${routine.color}`}>
                <Calendar size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">{routine.month}</h4>
                <p className="text-[10px] text-slate-400">{routine.description}</p>
              </div>
            </div>
            <button className="text-[10px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center gap-1 font-medium">
              <Download size={10} /> Download
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
