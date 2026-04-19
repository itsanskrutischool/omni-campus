"use client"

import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  IndianRupee, 
  Settings2, 
  ArrowRight, 
  Wallet, 
  ShieldCheck, 
  Sparkles,
  BarChart3,
  ChevronRight
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function FeesIndexPage() {
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  const modules = [
    {
      title: "Fee Collection",
      description: "Process student payments, generate digital receipts, and manage transaction history with AI risk assessment.",
      icon: IndianRupee,
      path: `/${tenantSlug}/${role}/fees/collection`,
      color: "emerald",
      stats: "Real-time sync"
    },
    {
      title: "Fee Structures",
      description: "Define academic fee models, concession rules, and automated late-fee calculation logic.",
      icon: Settings2,
      path: `/${tenantSlug}/${role}/fees/structures`,
      color: "blue",
      stats: "Dynamic models"
    },
    {
      title: "Migration Center",
      description: "Bulk onboard fee structures and prepare handover from the previous school ERP before normal collections begin.",
      icon: Wallet,
      path: `/${tenantSlug}/${role}/fees/import`,
      color: "emerald",
      stats: "Bulk onboarding"
    }
  ]

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 py-10 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="space-y-4 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
          <Sparkles className="w-3 h-3" />
          Financial Intelligence
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
          Treasury <span className="text-emerald-600">Hub</span>
        </h1>
        <p className="text-slate-500 font-semibold max-w-2xl mx-auto text-lg italic">
          Strategic management of institutional capital, revenue streams, and automated financial cycles.
        </p>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {modules.map((module, i) => (
          <motion.div
            key={module.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card 
              onClick={() => router.push(module.path)}
              className="group relative overflow-hidden h-[380px] rounded-[3rem] border-white/5 bg-white dark:bg-zinc-900 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-700 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="p-10 flex flex-col h-full justify-between relative z-10">
                <div>
                  <div className={cn(
                    "w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6",
                    module.color === "emerald" ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"
                  )}>
                    <module.icon className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-4 uppercase">{module.title}</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">{module.description}</p>
                </div>

                <div className="flex items-center justify-between mt-auto">
                   <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                         {[1, 2, 3].map(j => (
                           <div key={j} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-slate-200 dark:bg-zinc-800" />
                         ))}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{module.stats}</span>
                   </div>
                   <div className="w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white transition-all duration-500">
                      <ArrowRight className="w-5 h-5" />
                   </div>
                </div>
              </div>

              {/* Decorative BG Icon */}
              <div className="absolute -right-12 -bottom-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 rotate-12">
                 <module.icon className="w-64 h-64" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Footer Insight Section */}
      <div className="px-4">
        <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
           <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                 <ShieldCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="flex-1 space-y-1 text-center md:text-left">
                 <h4 className="text-white font-black uppercase tracking-widest text-sm flex items-center justify-center md:justify-start gap-2">
                    Treasury Security Protocol <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 </h4>
                 <p className="text-slate-400 font-bold text-xs uppercase tracking-tight italic leading-relaxed">
                    All financial operations are encrypted and audited through a 256-bit cryptographic matrix. Automated reconciliations occur every 300ms across all active payment gateways.
                 </p>
              </div>
              <div className="flex gap-4">
                 <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/5 bg-white/5 text-slate-300 font-bold hover:bg-white hover:text-black transition-all">
                    Security Audit
                 </Button>
                 <Button className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-black uppercase tracking-widest text-xs">
                    Get Assistance
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
