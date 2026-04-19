"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

export function PerformerCards() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Best Performer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="rounded-2xl overflow-hidden shadow-md relative h-40 cursor-pointer"
        style={{ background: "linear-gradient(135deg, #059669, #10B981)" }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-2 right-2 w-16 h-16 rounded-full border-4 border-white" />
          <div className="absolute bottom-4 right-12 w-8 h-8 rounded-full border-2 border-white" />
        </div>
        <div className="p-4 relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Best Performer
            </span>
            <div className="flex gap-1">
              <button className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <ChevronLeft size={10} />
              </button>
              <button className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <ChevronRight size={10} />
              </button>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                AR
              </div>
              <div>
                <div className="text-base font-bold text-white">Adrian Rubell</div>
                <div className="text-[11px] text-white/80">Physics Teacher</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={11} className="text-yellow-300 fill-yellow-300" />
              ))}
              <span className="text-[10px] text-white/70 ml-1">4.9</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Star Student */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="rounded-2xl overflow-hidden shadow-md relative h-40 cursor-pointer"
        style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-3 right-3 w-12 h-12 bg-white rounded-lg rotate-45" />
        </div>
        <div className="p-4 relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Star Student
            </span>
            <div className="flex gap-1">
              <button className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <ChevronLeft size={10} />
              </button>
              <button className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <ChevronRight size={10} />
              </button>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                TE
              </div>
              <div>
                <div className="text-base font-bold text-white">Tenesa</div>
                <div className="text-[11px] text-white/80">XII, A</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">Score: 98%</span>
                <span className="text-[10px] text-white/70">Top 1%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "98%" }}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                  className="bg-yellow-300 h-1.5 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
