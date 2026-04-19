"use client"

import { motion } from "framer-motion"
import { CheckCircle, Calendar } from "lucide-react"
import { DASHBOARD_STATS } from "@/lib/dashboard-data"

export function TodoWidget() {
  const { todos } = DASHBOARD_STATS

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Todo</h3>
        <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <Calendar size={10} /> Today
        </span>
      </div>
      <div className="space-y-3">
        {todos.map((todo, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            className="flex items-start gap-3 group cursor-pointer"
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
              todo.done
                ? "bg-blue-600 border-blue-600"
                : "border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
            }`}>
              {todo.done && <CheckCircle size={12} className="text-white" />}
            </div>
            <div className="flex-1">
              <p className={`text-xs leading-relaxed ${
                todo.done
                  ? "line-through text-slate-400"
                  : "text-slate-700 dark:text-slate-300"
              }`}>
                {todo.text}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{todo.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
