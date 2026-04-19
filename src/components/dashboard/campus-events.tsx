"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

export function CampusEventsWidget() {
  const events = [
    {
      month: "OCT",
      day: "12",
      title: "Annual Sports Meet 2024",
      info: "Main Campus Stadium • 09:00 AM"
    },
    {
      month: "OCT",
      day: "15",
      title: "Tech Symposium Guest Lecture",
      info: "Auditorium B • 14:00 PM"
    }
  ]

  return (
    <Card className="rounded-[2.5rem] border-none bg-white dark:bg-zinc-900 shadow-xl overflow-hidden h-full flex flex-col">
      <div className="p-6 pb-2 flex items-center justify-between">
        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Campus Events</h3>
        <button className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">View All</button>
      </div>
      <CardContent className="p-6 space-y-6">
        {events.map((event, i) => (
          <motion.div 
            key={i} 
            whileHover={{ x: 5 }}
            className="flex items-center gap-5 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center shadow-inner group-hover:bg-slate-100 dark:group-hover:bg-zinc-700 transition-colors">
              <span className="text-[9px] font-black tracking-[0.2em] text-slate-400 group-hover:text-slate-500">{event.month}</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{event.day}</span>
            </div>
            <div className="flex flex-col gap-1.5">
               <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{event.title}</h4>
               <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight italic">{event.info}</p>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}
