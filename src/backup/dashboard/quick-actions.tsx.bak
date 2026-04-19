"use client"

import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, FileText, IndianRupee, Bell, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionItemProps {
  label: string
  icon: LucideIcon
  color: string
}

function ActionItem({ label, icon: Icon, color }: ActionItemProps) {
  return (
    <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 group shadow-sm hover:shadow-xl border border-transparent hover:border-slate-100 dark:hover:border-white/5 active:scale-95">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">{label}</span>
    </button>
  )
}

export function QuickActionsGrid() {
  const actions = [
    { label: "New Student", icon: UserPlus, color: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
    { label: "Post Notice", icon: FileText, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" },
    { label: "Fee Entry", icon: IndianRupee, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
    { label: "Send Alert", icon: Bell, color: "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" }
  ]

  return (
    <Card className="rounded-[2.5rem] border-none bg-white dark:bg-zinc-900 shadow-xl overflow-hidden h-full flex flex-col">
       <div className="p-6 pb-2">
        <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Quick Actions</h3>
      </div>
      <CardContent className="p-6 grid grid-cols-2 gap-4 flex-1">
        {actions.map((action, i) => (
          <ActionItem key={i} {...action} />
        ))}
      </CardContent>
    </Card>
  )
}
