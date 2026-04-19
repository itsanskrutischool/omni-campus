"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

/* ═══════════════════════════════════════════════════
   AnimatedCard — Staggered entrance per brief spec
   Duration: 400ms + 60ms stagger between siblings
   Easing: cubic-bezier(0.4, 0, 0.2, 1)
   ═══════════════════════════════════════════════════ */
interface AnimatedCardProps {
  children: ReactNode
  index?: number
  className?: string
  onClick?: () => void
}

export function AnimatedCard({ children, index = 0, className = "", onClick }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════
   AnimatedNumber — CountUp stat display
   Duration: 1200ms, easing: easeOutExpo
   ═══════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from "react"

interface AnimatedNumberProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  decimals?: number
}

export function AnimatedNumber({
  value,
  duration = 1200,
  prefix = "",
  suffix = "",
  className = "",
  decimals = 0,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    startTimeRef.current = null
    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)

      setDisplayValue(Math.round(easedProgress * value * Math.pow(10, decimals)) / Math.pow(10, decimals))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [value, duration, decimals])

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : displayValue.toLocaleString()

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  )
}

/* ═══════════════════════════════════════════════════
   StatusBadge — Exact brief spec colors
   Pending = #ff9800, Approved = #4caf50,
   Declined = #f44336, Active = #2196f3
   ═══════════════════════════════════════════════════ */
type BadgeVariant = "pending" | "approved" | "declined" | "active" | "emergency" | "medical" | "casual" | "info"

const badgeStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  pending:   { bg: "rgba(255,152,0,0.15)",  text: "#ff9800" },
  approved:  { bg: "rgba(76,175,80,0.15)",   text: "#4caf50" },
  declined:  { bg: "rgba(244,67,54,0.15)",   text: "#f44336" },
  active:    { bg: "rgba(33,150,243,0.15)",   text: "#2196f3" },
  emergency: { bg: "rgba(244,67,54,0.15)",   text: "#f44336" },
  medical:   { bg: "rgba(76,175,80,0.15)",   text: "#4caf50" },
  casual:    { bg: "rgba(255,152,0,0.15)",   text: "#ff9800" },
  info:      { bg: "rgba(33,150,243,0.15)",   text: "#2196f3" },
}

interface StatusBadgeProps {
  variant: BadgeVariant
  label?: string
  pulse?: boolean
  className?: string
}

export function StatusBadge({ variant, label, pulse = false, className = "" }: StatusBadgeProps) {
  const style = badgeStyles[variant]
  const displayLabel = label || variant.charAt(0).toUpperCase() + variant.slice(1)

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${pulse && variant === "pending" ? "animate-pulse-pending" : ""} ${className}`}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.text }} />
      {displayLabel}
    </span>
  )
}

/* ═══════════════════════════════════════════════════
   SkeletonCard — Shimmer loading placeholder
   ═══════════════════════════════════════════════════ */
interface SkeletonCardProps {
  className?: string
  lines?: number
}

export function SkeletonCard({ className = "", lines = 3 }: SkeletonCardProps) {
  return (
    <div className={`bg-card rounded-xl border border-border p-5 ${className}`}>
      <div className="skeleton-shimmer h-4 w-1/3 rounded mb-4" />
      <div className="skeleton-shimmer h-8 w-1/2 rounded mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-shimmer h-3 rounded mb-2"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   StatCard — Dashboard stat cards with icon, count,
   active/inactive breakdown, and "View All" link
   ═══════════════════════════════════════════════════ */
interface StatCardProps {
  icon: ReactNode
  label: string
  value: number
  active: number
  inactive: number
  color: string
  index?: number
  href?: string
}

export function StatCard({ icon, label, value, active, inactive, color, index = 0, href }: StatCardProps) {
  return (
    <AnimatedCard index={index} className="bg-card rounded-xl border border-border p-5 flex items-start gap-4 cursor-pointer group">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-content-center shrink-0 text-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{label}</p>
        <AnimatedNumber value={value} className="text-2xl font-bold font-display text-foreground" />
        <div className="flex items-center gap-3 mt-2 text-xs">
          <span className="text-[#4caf50]">Active: {active}</span>
          <span className="text-[#f44336]">Inactive: {inactive}</span>
        </div>
        {href && (
          <a href={href} className="text-xs text-primary font-medium mt-2 inline-block group-hover:underline">
            View All →
          </a>
        )}
      </div>
    </AnimatedCard>
  )
}

/* ═══════════════════════════════════════════════════
   PageTransition — Wraps page content with fade
   ═══════════════════════════════════════════════════ */
export function PageTransition({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
