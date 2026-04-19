"use client"

import React from "react"
import { LucideIcon } from "lucide-react"
import { AnimatedCard, AnimatedNumber } from "@/components/ui/animated-primitives"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: number[]
  description?: string
  className?: string
  variant?: "emerald" | "amber" | "blue" | "purple" | "pink" | "rose" | "violet"
  index?: number
  badge?: string
  badgeColor?: "success" | "warning" | "error" | "info" | "neutral"
}

const VARIANT_CONFIG = {
  emerald: { 
    color: "text-emerald-500", 
    bg: "bg-emerald-500/10", 
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/10",
    mesh: "from-emerald-500/20"
  },
  amber: { 
    color: "text-amber-500", 
    bg: "bg-amber-500/10", 
    border: "border-amber-500/20",
    glow: "shadow-amber-500/10",
    mesh: "from-amber-500/20"
  },
  blue: { 
    color: "text-blue-500", 
    bg: "bg-blue-500/10", 
    border: "border-blue-500/20",
    glow: "shadow-blue-500/10",
    mesh: "from-blue-500/20"
  },
  purple: { 
    color: "text-purple-500", 
    bg: "bg-purple-500/10", 
    border: "border-purple-500/20",
    glow: "shadow-purple-500/10",
    mesh: "from-purple-500/20"
  },
  violet: { 
    color: "text-violet-500", 
    bg: "bg-violet-500/10", 
    border: "border-violet-500/20",
    glow: "shadow-violet-500/10",
    mesh: "from-violet-500/20"
  },
  pink: { 
    color: "text-pink-500", 
    bg: "bg-pink-500/10", 
    border: "border-pink-500/20",
    glow: "shadow-pink-500/10",
    mesh: "from-pink-500/20"
  },
  rose: { 
    color: "text-rose-500", 
    bg: "bg-rose-500/10", 
    border: "border-rose-500/20",
    glow: "shadow-rose-500/10",
    mesh: "from-rose-500/20"
  },
}

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  description,
  className,
  variant = "emerald",
  index = 0,
  badge,
  badgeColor = "success"
}: StatCardProps) {
  const config = VARIANT_CONFIG[variant as keyof typeof VARIANT_CONFIG] || VARIANT_CONFIG.blue
  
  // Extract number from string if necessary for AnimatedNumber
  const isString = typeof value === "string"
  const numericValue = isString ? parseFloat(value.replace(/[^0-9.]/g, "")) : value
  const prefix = isString && (value.startsWith("$") || value.startsWith("₹")) ? value.charAt(0) : ""
  const suffix = isString && (value.endsWith("%") || value.includes("%")) ? "%" : ""

  return (
    <AnimatedCard index={index} className={cn("h-full relative group perspective-1000", className)}>
      <div className="relative h-full rounded-[2.5rem] border border-white/10 dark:border-white/5 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-3xl shadow-2xl overflow-hidden transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/60 dark:group-hover:bg-zinc-900/60 p-7 flex flex-col justify-between z-10">
        
        {/* Ambient Glow */}
        <div className={cn(
          "absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br via-transparent to-transparent rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none",
          config.mesh
        )} />

        <div className="flex items-start justify-between relative z-20">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", config.color.replace('text-', 'bg-'))} />
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
          
          <div className="flex flex-col items-end gap-3">
            {badge && (
              <div className={cn(
                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm border",
                badgeColor === "success" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                badgeColor === "warning" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                badgeColor === "error" && "bg-rose-500/10 text-rose-500 border-rose-500/20",
                badgeColor === "info" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                badgeColor === "neutral" && "bg-slate-500/10 text-slate-500 border-slate-500/20"
              )}>
                {badge}
              </div>
            )}
            <motion.div 
              whileHover={{ scale: 1.15, rotate: 5 }}
              className={cn(
                "p-4 rounded-[1.25rem] border backdrop-blur-md transition-all duration-700 shadow-xl group-hover:shadow-2xl", 
                config.bg, config.border, config.color
              )}
            >
              <Icon className="w-6 h-6 stroke-[2.5]" />
            </motion.div>
          </div>
        </div>

        <div className="mt-8 relative z-20">
           {description && (
             <p className="text-[11px] font-bold text-muted-foreground/60 leading-relaxed uppercase tracking-wider mb-3">
               {description}
             </p>
           )}
           <div className="h-1 w-full bg-muted-foreground/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, delay: index * 0.1 }}
                className={cn("h-full opacity-40", config.color.replace('text-', 'bg-'))}
              />
           </div>
        </div>

        {/* Tactical Mesh Accent */}
        <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 pointer-events-none">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                 <radialGradient id={`sc-mesh-${index}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="currentColor" />
                    <stop offset="100%" stopColor="transparent" />
                 </radialGradient>
              </defs>
              <circle cx="90" cy="10" r="40" fill={`url(#sc-mesh-${index})`} className={config.color} />
              <circle cx="10" cy="90" r="40" fill={`url(#sc-mesh-${index})`} className={config.color} />
           </svg>
        </div>
      </div>

      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />
    </AnimatedCard>
  )
}
