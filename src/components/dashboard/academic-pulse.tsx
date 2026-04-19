"use client"

import { VibrantCard } from "@/components/ui/vibrant-card"
import { Calendar as CalendarIcon, Bell, Clock } from "lucide-react"

export function AcademicPulse() {
  const events = [
    { title: "Mid-Term Review", time: "09:00 AM", type: "ACADEMIC" },
    { title: "Board Meeting", time: "11:30 AM", type: "ADMIN" },
    { title: "Sports Day Prep", time: "03:00 PM", type: "EVENT" }
  ]

  return (
    <VibrantCard glowColor="amber" className="p-8 h-full bg-amber-500/5 border-amber-500/10">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-amber-600/60 dark:text-amber-400/40 italic">Academic Pulse</h3>
        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
          <CalendarIcon className="w-4 h-4 text-amber-500" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Today Header */}
        <div>
          <span className="text-4xl font-black text-zinc-900 dark:text-white leading-none">April 14</span>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Tuesday Schedule</p>
        </div>

        {/* Timeline */}
        <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-500/20">
          {events.map((event, i) => (
            <div key={i} className="flex gap-4 relative">
              <div className="w-4 h-4 rounded-full bg-white dark:bg-zinc-950 border-4 border-amber-500 relative z-10 shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 tracking-widest flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.time}
                </span>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{event.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div className="mt-8 p-6 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 group cursor-pointer hover:bg-rose-500/20 transition-all">
          <div className="flex items-center gap-3 mb-2 text-rose-500">
            <Bell className="w-4 h-4 animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-widest">Urgent Alert</span>
          </div>
          <p className="text-xs font-bold text-rose-900 dark:text-rose-400">Library HVAC system failure reported. Technician arriving at 8:00 PM.</p>
        </div>
      </div>
    </VibrantCard>
  )
}
