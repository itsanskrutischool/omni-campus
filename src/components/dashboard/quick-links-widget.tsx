"use client"

import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Calendar, ClipboardList, UserCheck, CreditCard,
  Home, BarChart3, ChevronLeft, ChevronRight,
  BookOpen, Building2, Heart, FileBadge, Award, MonitorPlay, Receipt, Bus
} from "lucide-react"

const quickLinks = [
  { label: "Attendance", icon: <UserCheck size={18} />, color: "text-green-600 bg-green-50 dark:bg-green-900/20", href: "/attendance" },
  { label: "Fees", icon: <CreditCard size={18} />, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20", href: "/fees" },
  { label: "Library", icon: <BookOpen size={18} />, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20", href: "/library" },
  { label: "Front Office", icon: <Building2 size={18} />, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20", href: "/front-office" },
  { label: "Health", icon: <Heart size={18} />, color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20", href: "/health" },
  { label: "Certificates", icon: <FileBadge size={18} />, color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20", href: "/certificates" },
  { label: "Scholarships", icon: <Award size={18} />, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20", href: "/scholarships" },
  { label: "LMS", icon: <MonitorPlay size={18} />, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20", href: "/lms" },
  { label: "Homework", icon: <Home size={18} />, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20", href: "/homework" },
  { label: "Timetable", icon: <Calendar size={18} />, color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20", href: "/timetable" },
  { label: "Petty Cash", icon: <Receipt size={18} />, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20", href: "/petty-cash" },
  { label: "Reports", icon: <BarChart3 size={18} />, color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20", href: "/reports" },
]

export function QuickLinksWidget() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Quick Links</h3>
        <div className="flex gap-1">
          <button className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <ChevronLeft size={12} />
          </button>
          <button className="w-6 h-6 rounded-full bg-slate-800 dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-slate-700 transition-colors">
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {quickLinks.map((link, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={`/${tenantSlug}/${role}${link.href}`}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer block"
            >
              <div className={`p-2 rounded-xl ${link.color}`}>{link.icon}</div>
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 text-center leading-tight">
                {link.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
