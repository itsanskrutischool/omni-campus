"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react"

export function MiniCalendarWidget() {
  const [currentDate] = useState(new Date())
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const days = ["S", "M", "T", "W", "T", "F", "S"]
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDaysInMonth = new Date(year, month, 0).getDate()
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })
  const todayDate = new Date().getDate()

  const cells: { day: number; isCurrentMonth: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevDaysInMonth - i, isCurrentMonth: false })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, isCurrentMonth: true })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Schedules</h3>
        <button className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 hover:bg-blue-100 transition-colors">
          <Plus size={10} /> Add New
        </button>
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{monthName}</span>
        <div className="flex gap-1">
          <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors"><ChevronLeft size={14} /></button>
          <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors"><ChevronRight size={14} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {days.map((d, i) => (<div key={i} className="text-[10px] font-bold text-slate-400 py-1">{d}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {cells.map((cell, i) => {
          const isToday = cell.isCurrentMonth && cell.day === todayDate
          return (
            <div key={i} className={`text-[11px] py-1.5 rounded-full cursor-pointer transition-all font-medium ${!cell.isCurrentMonth ? "text-slate-300 dark:text-slate-700"
                : isToday ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-200 dark:shadow-blue-900"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}>{cell.day}</div>
          )
        })}
      </div>
    </motion.div>
  )
}

interface UpcomingEvent {
  title: string
  date: string
  time: string
  color: string
}

export function UpcomingEventsWidget({ events }: { events: UpcomingEvent[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5"
    >
      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Upcoming Events</h3>
      {events.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">No upcoming events</p>
      ) : (
        <div className="space-y-3">
          {events.map((event, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
              className={`flex items-start gap-3 pl-3 border-l-2 ${event.color}`}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{event.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{event.date}</p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Clock size={9} /> {event.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
