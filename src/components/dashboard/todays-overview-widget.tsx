"use client"

import { motion } from "framer-motion"
import { BookOpen, Calendar, DollarSign, Bell, Zap, Activity } from "lucide-react"

interface OverviewStats {
  totalStudents: { active: number }
}

export function TodaysOverviewWidget({
  stats,
  pendingApprovals,
  upcomingEventsCount,
}: {
  stats: OverviewStats
  pendingApprovals: number
  upcomingEventsCount: number
}) {
  const overviewItems = [
    { label: "Active Students", value: String(stats.totalStudents.active), icon: <BookOpen size={15} /> },
    { label: "Events", value: String(upcomingEventsCount), icon: <Calendar size={15} /> },
    { label: "Pending Fees", value: "--", icon: <DollarSign size={15} /> },
    { label: "New Requests", value: String(pendingApprovals), icon: <Bell size={15} /> },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl p-5 shadow-lg text-white relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full border-4 border-white" />
        <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full border-2 border-white" />
        <div className="absolute top-8 right-16 w-6 h-6 bg-white rounded-full" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-yellow-300" />
          <h3 className="text-sm font-bold">Today&apos;s Overview</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {overviewItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 mb-1.5 text-blue-200">
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
              <div className="text-xl font-bold">{item.value}</div>
            </motion.div>
          ))}
        </div>
        <button className="mt-4 w-full bg-white/15 hover:bg-white/25 text-white text-xs py-2.5 rounded-xl transition-colors font-semibold flex items-center justify-center gap-1.5 backdrop-blur-sm">
          <Activity size={13} /> View Full Report
        </button>
      </div>
    </motion.div>
  )
}
