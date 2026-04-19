"use client"

import { motion } from "framer-motion"
import { Plus, FileText, BookMarked, Monitor } from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  EVENT: <FileText size={14} />,
  ADMIN: <BookMarked size={14} />,
  SYSTEM: <Monitor size={14} />,
}

const colorMap: Record<string, string> = {
  EVENT: "bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400",
  ADMIN: "bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400",
  SYSTEM: "bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400",
}

interface NoticeItem {
  title: string
  date: string
  type: string
}

export function NoticeBoardWidget({ notices }: { notices: NoticeItem[] }) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Notice Board</h3>
        <div className="flex gap-2">
          <button className="text-[10px] text-blue-600 flex items-center gap-1 hover:text-blue-800 font-semibold">
            <Plus size={10} /> Add New
          </button>
          <button className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold">View All</button>
        </div>
      </div>
      <div className="space-y-1">
        {notices.map((notice, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 + i * 0.06 }}
            className="flex items-start gap-3 py-3 border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg px-2 transition-colors cursor-pointer"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[notice.type]}`}>
              {iconMap[notice.type]}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{notice.title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{notice.date}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
