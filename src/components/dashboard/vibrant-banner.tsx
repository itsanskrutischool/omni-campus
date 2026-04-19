"use client"

import { motion } from "framer-motion"
import { Sparkles, ArrowUpRight, Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface VibrantBannerProps {
  userName: string
  institutionalRole: string
  date: string
  efficiency?: string
  pendingApprovals?: number
}

export function VibrantBanner({ 
  userName, 
  institutionalRole, 
  date,
  efficiency = "98.2%",
  pendingApprovals = 4
}: VibrantBannerProps) {
  const [searchValue, setSearchValue] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Handle ⌘K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full h-[300px] rounded-[3rem] overflow-hidden bg-zinc-950 shadow-2xl group"
    >
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0],
            x: [0, 50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] bg-[radial-gradient(circle_at_center,_#3b82f6_0%,_transparent_50%)] opacity-30 mix-blend-screen"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -5, 0],
            x: [0, -40, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/4 w-[150%] h-[200%] bg-[radial-gradient(circle_at_center,_#4f46e5_0%,_transparent_50%)] opacity-30 mix-blend-screen"
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            System Live: Hybrid Mode
          </div>
          <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{date}</div>
        </div>

        <h1 className="text-5xl font-black text-white tracking-tight mb-4 flex items-center gap-4">
          Welcome, {userName}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-12 h-12 text-blue-400" />
          </motion.div>
        </h1>
        
        <p className="text-zinc-400 text-lg max-w-xl font-medium leading-relaxed">
          Your institutional engine is running at <span className="text-white font-bold">{efficiency} efficiency</span>. 
          You have <span className="text-white font-bold">{pendingApprovals} pending approvals</span> requiring your immediate attention.
        </p>

        {/* Floating Search Hub */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-end gap-4">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-[2rem] w-80 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-bold text-sm">Quick Global Search</span>
              <kbd className="bg-white/10 text-white/50 text-xs px-2 py-1 rounded-md font-sans border border-white/5 shadow-inner">⌘ K</kbd>
            </div>
            <div className="relative group/search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within/search:text-blue-400 transition-colors" />
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Find student, staff or ledger..." 
                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-blue-500/50 focus:bg-zinc-900/80 transition-all shadow-inner"
              />
            </div>
            {searchValue && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-[10px] text-zinc-500 flex items-center gap-1.5 px-1"
              >
                Press <kbd className="text-zinc-400 border border-zinc-700 px-1 rounded">Enter</kbd> to search for "{searchValue}"
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Corner Element */}
      <div className="absolute top-0 right-0 p-1">
        <button className="bg-white text-black w-24 h-24 rounded-bl-[4rem] flex flex-col items-center justify-center gap-1 group/btn hover:bg-blue-400 transition-colors">
          <ArrowUpRight className="w-6 h-6 transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Ops View</span>
        </button>
      </div>
    </motion.div>
  )
}
