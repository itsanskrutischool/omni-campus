"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Cpu,
  Target,
  ArrowUpRight,
  Fingerprint
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DASHBOARD_STATS } from "@/lib/dashboard-data"

interface TacticalBriefDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function TacticalBriefDrawer({ isOpen, onClose }: TacticalBriefDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full md:w-[450px] h-full bg-zinc-950 border-l border-white/10 z-[101] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header / Scanning Effect */}
            <div className="relative p-8 border-b border-white/10 overflow-hidden shrink-0">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
               <motion.div 
                 initial={{ y: -100 }}
                 animate={{ y: 500 }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20"
               />

               <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Zap className="w-5 h-5 text-blue-400" />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-white tracking-tighter">Tactical Brief</h2>
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Live Intel Feed</span>
                        </div>
                     </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl hover:bg-white/5 text-white">
                    <X className="w-5 h-5" />
                  </Button>
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
               
               {/* 1. Status Diagnostics */}
               <section className="space-y-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                     <Cpu className="w-3 h-3" />
                     Operation Diagnostics
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     {[
                       { label: "Fleet Health", value: "Optimal", color: "text-emerald-400" },
                       { label: "Revenue Sync", value: "Verified", color: "text-blue-400" },
                       { label: "Attendance Trace", value: "Active", color: "text-purple-400" },
                       { label: "Security Node", value: "Encrypted", color: "text-emerald-400" },
                     ].map((item) => (
                       <div key={item.label} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">{item.label}</p>
                          <p className={cn("text-sm font-black uppercase tracking-tight", item.color)}>{item.value}</p>
                       </div>
                     ))}
                  </div>
               </section>

               {/* 2. Critical Awareness */}
               <section className="space-y-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
                     <AlertTriangle className="w-3 h-3" />
                     Critical Awareness
                  </div>

                  <div className="space-y-4">
                     <div className="group relative p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                           <TrendingUp className="w-12 h-12" />
                        </div>
                        <h4 className="text-sm font-black text-amber-200 mb-1">Fee Latency Detected</h4>
                        <p className="text-[11px] text-amber-200/60 font-medium leading-relaxed">
                           14% of Grade 12 students have pending balances exceeding the 30-day window. Expected liquidity impact: <span className="text-amber-200 font-bold">$12,300</span>.
                        </p>
                        <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-amber-500 mt-3 group-hover:translate-x-1 transition-transform">
                           Initiate Reminder sequence <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Button>
                     </div>

                     <div className="group relative p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                           <Target className="w-12 h-12" />
                        </div>
                        <h4 className="text-sm font-black text-blue-200 mb-1">Growth Opportunity</h4>
                        <p className="text-[11px] text-blue-200/60 font-medium leading-relaxed">
                           Applied Physics enquiry volume is up 42% this week. Highly correlated with the "Silicon Academy" scholarship announcement.
                        </p>
                     </div>
                  </div>
               </section>

               {/* 3. Performance Matrix */}
               <section className="space-y-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
                     <BarChart3 className="w-3 h-3" />
                     Performance Matrix
                  </div>

                  <div className="space-y-6">
                     {[
                       { label: "Operational Efficiency", percentage: 94, color: "bg-blue-500" },
                       { label: "Student Sentiment", percentage: 88, color: "bg-emerald-500" },
                       { label: "Resource Allocation", percentage: 76, color: "bg-purple-500" },
                     ].map((bar) => (
                       <div key={bar.label} className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tight">
                             <span className="text-muted-foreground">{bar.label}</span>
                             <span className="text-white">{bar.percentage}%</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${bar.percentage}%` }}
                               transition={{ duration: 1, delay: 0.5 }}
                               className={cn("h-full", bar.color)}
                             />
                          </div>
                       </div>
                     ))}
                  </div>
               </section>

            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/10 shrink-0 bg-zinc-950/80 backdrop-blur-md">
               <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-500/20 group">
                  Deploy Full Report
                  <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
               </Button>
               <div className="mt-6 flex items-center justify-center gap-2 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em]">
                  <Fingerprint className="w-3 h-3" />
                  Terminal Authorized ID: OC-ADMIN-X
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
