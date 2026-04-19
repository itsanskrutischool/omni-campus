"use client"

import { motion } from "framer-motion"
import { DASHBOARD_STATS } from "@/lib/dashboard-data"

export function StudentActivityWidget() {
  const { studentActivities } = DASHBOARD_STATS

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5"
    >
      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Student Activity</h3>
      <div className="space-y-3.5">
        {studentActivities.map((act, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.07 }}
            className="flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm">
              {act.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white">{act.event}</p>
              <p className="text-[10px] text-slate-400 truncate">{act.description}</p>
            </div>
            <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">{act.time}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
