"use client"

import { motion } from "framer-motion"
import { DASHBOARD_STATS } from "@/lib/dashboard-data"

export function InboxWidget() {
  const { inbox } = DASHBOARD_STATS

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Inbox</h3>
        <div className="flex gap-3 text-[10px]">
          <button className="text-slate-500 hover:text-slate-700 font-medium">All Mails</button>
          <button className="text-blue-600 font-semibold hover:text-blue-800">View All</button>
        </div>
      </div>
      <div className="space-y-3.5">
        {inbox.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + i * 0.08 }}
            whileHover={{ x: 3, transition: { duration: 0.15 } }}
            className="flex items-start gap-3 cursor-pointer group"
          >
            <div className={`w-9 h-9 rounded-full ${msg.color} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm`}>
              {msg.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold ${msg.unread ? "text-slate-800 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
                  {msg.name}
                </span>
                <span className="text-[10px] text-slate-400 flex-shrink-0">{msg.date}</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                {msg.preview}
              </p>
            </div>
            {msg.unread && (
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
