"use client"

import React from "react"
import { AnimatedCard } from "@/components/ui/animated-primitives"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { 
  Zap, 
  UserPlus, 
  FileText, 
  AlertCircle, 
  TrendingUp, 
  MoreHorizontal,
  ChevronRight
} from "lucide-react"

interface Activity {
  id: string
  user: string
  role: string
  action: string
  target: string
  time: string
  type: "ADMISSION" | "SYSTEM" | "ACADEMIC" | "ALERT" | "FINANCE"
}

interface ActivityWidgetProps {
  activities: Activity[]
  index?: number
  className?: string
}

const TYPE_CONFIG = {
  ADMISSION: { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  SYSTEM: { icon: Zap, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  ACADEMIC: { icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  ALERT: { icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  FINANCE: { icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
}

export function ActivityWidget({ activities, index = 0, className }: ActivityWidgetProps) {
  return (
    <AnimatedCard index={index} className={cn("relative overflow-hidden group perspective-1000 h-full flex flex-col", className)}>
      <div className="relative h-full flex flex-col rounded-[2.5rem] border border-white/10 dark:border-white/5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl shadow-xl transition-all duration-700 group-hover:bg-white/50 dark:group-hover:bg-zinc-900/50">
        
        <CardHeader className="flex flex-row items-center justify-between pb-8 pt-7 px-8">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 font-heading">Event Stream</h4>
             </div>
             <CardTitle className="text-xl font-black font-heading tracking-tighter dark:text-white leading-none">
                Operational Heartbeat
             </CardTitle>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live Flow</span>
             </div>
          </div>
        </CardHeader>
        
        <div className="flex-1 px-8 pb-6 space-y-7 overflow-y-auto custom-scrollbar relative">
          {activities.map((activity, idx) => {
            const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.SYSTEM
            const Icon = config.icon

            return (
              <motion.div 
                key={activity.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index * 0.1) + (idx * 0.05) }}
                className="relative flex gap-5 group/item"
              >
                {/* Timeline Line */}
                {idx !== activities.length - 1 && (
                  <div className="absolute left-[17px] top-10 w-[1px] h-[calc(100%+28px)] bg-gradient-to-b from-border/50 to-transparent" />
                )}
                
                {/* Icon Node */}
                <div className={cn(
                  "z-10 w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-lg transition-all duration-500 group-hover/item:scale-110 group-hover/item:shadow-xl", 
                  config.bg, 
                  config.border
                )}>
                  <Icon className={cn("w-4.5 h-4.5", config.color)} />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center gap-2">
                     <span className="text-[11px] font-black uppercase tracking-tight text-foreground/80 group-hover/item:text-foreground transition-colors">{activity.user}</span>
                     <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                     <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{activity.role}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground font-medium leading-[1.4] transition-colors group-hover/item:text-muted-foreground/80">
                    {activity.action} <span className="text-foreground/90 font-black tracking-tight">{activity.target}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                     <span className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest">{activity.time}</span>
                     <ChevronRight className="w-3 h-3 text-muted-foreground/10 group-hover/item:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="p-6 pt-2">
          <button className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 border border-white/5 transition-all text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary group/btn">
            Explore System History
            <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
          </button>
        </div>

        {/* Tactical Accent */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-50" />
      </div>
    </AnimatedCard>
  )
}
