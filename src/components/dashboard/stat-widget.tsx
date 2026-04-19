"use client"

import React from "react"
import { LucideIcon } from "lucide-react"
import { AnimatedCard, AnimatedNumber } from "@/components/ui/animated-primitives"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface StatWidgetProps {
  label: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: string
  trendType?: "up" | "down" | "neutral"
  variant?: "primary" | "success" | "warning" | "error" | "info" | "violet"
  index?: number
}

export function StatWidget({
  label,
  value,
  icon: Icon,
  description,
  trend,
  trendType = "neutral",
  variant = "primary",
  index = 0
}: StatWidgetProps) {
  
  const variants = {
    primary: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
    success: "text-green-500 bg-green-500/10 border-green-500/20 shadow-green-500/5",
    warning: "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5",
    error: "text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-rose-500/5",
    info: "text-blue-400 bg-blue-400/10 border-blue-400/20 shadow-blue-400/5",
    violet: "text-violet-500 bg-violet-500/10 border-violet-500/20 shadow-violet-500/5",
  }

  const glowColors = {
    primary: "from-emerald-500/20",
    success: "from-green-500/20",
    warning: "from-amber-500/20",
    error: "from-rose-500/20",
    info: "from-blue-500/20",
    violet: "from-violet-500/20",
  }

  // Parse value if it's a string with currency or percentage
  const isString = typeof value === "string"
  const numericValue = isString ? parseFloat(value.replace(/[^0-9.]/g, "")) : value
  const prefix = isString && (value.startsWith("$") || value.startsWith("₹")) ? value.charAt(0) : ""
  const suffix = isString && value.endsWith("%") ? "%" : ""

  return (
    <AnimatedCard index={index} className="h-full relative group perspective-1000">
      <div className="relative h-full rounded-[2rem] border border-white/10 dark:border-white/5 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-3xl shadow-2xl overflow-hidden transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/60 dark:group-hover:bg-zinc-900/60 p-7 flex flex-col justify-between z-10">
        
        {/* Elite Ambient Glow */}
        <div className={cn(
          "absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br via-transparent to-transparent rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none",
          glowColors[variant]
        )} />

        <div className="flex items-start justify-between relative z-20">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", variants[variant].split(' ')[0].replace('text-', 'bg-'))} />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 font-heading">
                 {label}
               </p>
            </div>
            <div className="flex items-baseline gap-1.5">
              {prefix && <span className="text-2xl font-black text-muted-foreground/30">{prefix}</span>}
              <h3 className="text-4xl font-black tracking-tighter dark:text-white font-heading leading-none">
                {typeof numericValue === "number" ? <AnimatedNumber value={numericValue} /> : value}
                {suffix && <span className="text-xl font-bold ml-1 opacity-40">{suffix}</span>}
              </h3>
            </div>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.15, rotate: 5 }}
            className={cn(
              "p-4 rounded-[1.25rem] border backdrop-blur-md transition-all duration-700 shadow-xl group-hover:shadow-2xl", 
              variants[variant]
            )}
          >
            <Icon className="w-6 h-6 stroke-[2.5]" />
          </motion.div>
        </div>

        <div className="mt-8 flex items-end justify-between relative z-20">
          <div className="space-y-2 max-w-[60%]">
             {description && (
               <p className="text-[11px] font-bold text-muted-foreground/60 leading-relaxed uppercase tracking-wide">
                 {description}
               </p>
             )}
             <div className="h-1 w-12 rounded-full bg-muted-foreground/10 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, delay: index * 0.1 }}
                  className={cn("h-full", variants[variant].split(' ')[0].replace('text-', 'bg-'))}
                />
             </div>
          </div>
          
          {trend && (
            <div className={cn(
              "px-3 py-1.5 rounded-xl text-[10px] font-black tracking-tighter uppercase flex items-center gap-1.5 border border-white/5 shadow-sm",
              trendType === "up" ? "bg-emerald-500/10 text-emerald-500" : 
              trendType === "down" ? "bg-rose-500/10 text-rose-500" : 
              "bg-slate-500/10 text-slate-500"
            )}>
              <span className="w-1 h-1 rounded-full bg-current" />
              {trend}
            </div>
          )}
        </div>

        {/* Mesh Background Accent */}
        <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 pointer-events-none">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                 <radialGradient id={`mesh-${index}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="currentColor" />
                    <stop offset="100%" stopColor="transparent" />
                 </radialGradient>
              </defs>
              <circle cx="80" cy="20" r="40" fill={`url(#mesh-${index})`} className={variants[variant].split(' ')[0]} />
              <circle cx="20" cy="80" r="40" fill={`url(#mesh-${index})`} className={variants[variant].split(' ')[0]} />
           </svg>
        </div>
      </div>

      {/* Glass Reflection Effect */}
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />
    </AnimatedCard>
  )
}
