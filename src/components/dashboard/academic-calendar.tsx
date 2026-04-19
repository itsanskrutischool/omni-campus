"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

export function AcademicCalendarWidget() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const deadlines = [
    {
      title: "Mid-Term Grades",
      due: "Due in 2 days",
      color: "bg-rose-500"
    },
    {
      title: "Faculty Meeting",
      due: "Tomorrow, 10:00 AM",
      color: "bg-amber-500"
    }
  ]

  return (
    <Card className="rounded-[2.5rem] border-none bg-white dark:bg-zinc-900 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-6 pb-2 flex items-center justify-between">
        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Academic Calendar</h3>
        <CalendarIcon className="w-4 h-4 text-slate-400" />
      </div>
      
      <CardContent className="p-4 pt-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-xl border-none p-2 w-full flex justify-center scale-90 origin-top"
        />

        <div className="mt-4 px-2 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            Upcoming Deadlines
          </h4>
          
          <div className="space-y-4">
            {deadlines.map((item, i) => (
              <div key={i} className="flex gap-4 group">
                <div className={`w-1 rounded-full ${item.color} group-hover:scale-y-125 transition-transform`} />
                <div>
                   <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{item.title}</div>
                   <div className="text-[10px] font-medium text-slate-400 mt-1">{item.due}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
