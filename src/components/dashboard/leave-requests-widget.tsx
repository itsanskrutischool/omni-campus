"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, X } from "lucide-react"

const badgeMap: Record<string, string> = {
  Emergency: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Casual: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Medical: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
}

interface LeaveRequestItem {
  name: string
  role: string
  type: string
  leaveRange: string
  applyDate: string
  avatar: string
  status: string
}

export function LeaveRequestsWidget({ requests }: { requests: LeaveRequestItem[] }) {
  const [activeTab, setActiveTab] = useState("Students")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Leave Requests</h3>
        <select className="text-[10px] border border-slate-200 dark:border-white/10 dark:bg-zinc-800 rounded-lg px-2 py-1 text-slate-500 outline-none">
          <option>This Month</option>
        </select>
      </div>

      <div className="flex gap-4 mb-4 border-b border-slate-100 dark:border-white/5">
        {["Students", "Teachers & Staffs"].map((tab) => (
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

      <div className="space-y-3">
        {requests.map((req, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm">
              {req.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white">{req.name}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeMap[req.type]}`}>
                  {req.type}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{req.role}</div>
              <div className="flex gap-3 text-[10px] text-slate-400 mt-1 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-lg">
                <span>Leave: {req.leaveRange}</span>
                <span>Applied: {req.applyDate}</span>
              </div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors">
                <CheckCircle size={13} />
              </button>
              <button className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors">
                <X size={13} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
