"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface VibrantCardProps {
  children: ReactNode
  className?: string
  index?: number
  glowColor?: "blue" | "indigo" | "emerald" | "rose" | "amber"
}

const colors = {
  blue: "rgba(37, 99, 235, 0.5)",
  indigo: "rgba(79, 70, 229, 0.5)",
  emerald: "rgba(16, 185, 129, 0.5)",
  rose: "rgba(225, 29, 72, 0.5)",
  amber: "rgba(245, 158, 11, 0.5)"
}

export function VibrantCard({ children, className, index = 0, glowColor = "indigo" }: VibrantCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1, 
        ease: [0.23, 1, 0.32, 1] 
      }}
      whileHover={{ 
        y: -5,
        boxShadow: `0 20px 40px -15px ${colors[glowColor]}`,
        transition: { duration: 0.3 }
      }}
      className={cn(
        "relative rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm",
        className
      )}
    >
      {/* Subtle Inner Glow */}
      <div 
        className="absolute inset-x-0 top-0 h-40 pointer-events-none opacity-10 dark:opacity-20 transition-opacity duration-500 group-hover:opacity-100"
        style={{ 
          background: `linear-gradient(to bottom, ${colors[glowColor]}, transparent)` 
        }} 
      />
      
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  )
}
