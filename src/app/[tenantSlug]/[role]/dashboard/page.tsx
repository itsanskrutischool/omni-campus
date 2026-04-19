"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  GraduationCap, Users, Briefcase, BookOpen,
  ArrowUpRight, AlertCircle, RefreshCw
} from "lucide-react"
import { AnimatedNumber } from "@/components/ui/animated-primitives"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useParams } from "next/navigation"

// ─── Widgets ───────────────────────────────────────────────────────
import { VibrantBanner } from "@/components/dashboard/vibrant-banner"
import { FinancialFlow } from "@/components/dashboard/financial-flow"
import { AcademicPulse } from "@/components/dashboard/academic-pulse"
import { AttendanceWidget } from "@/components/dashboard/attendance-widget"
import { LeaveRequestsWidget } from "@/components/dashboard/leave-requests-widget"
import { MiniCalendarWidget, UpcomingEventsWidget } from "@/components/dashboard/mini-calendar-widget"
import { PerformerCards } from "@/components/dashboard/performer-cards"
import { QuickLinksWidget } from "@/components/dashboard/quick-links-widget"
import { ClassRoutineWidget } from "@/components/dashboard/class-routine-widget"
import { NoticeBoardWidget } from "@/components/dashboard/notice-board-widget"
import { TodoWidget } from "@/components/dashboard/todo-widget"
import { InboxWidget } from "@/components/dashboard/inbox-widget"
import { StudentActivityWidget } from "@/components/dashboard/student-activity-widget"
import { TodaysOverviewWidget } from "@/components/dashboard/todays-overview-widget"
import { FeesCollectionChart } from "@/components/dashboard/fees-collection-chart"
import { ClassPerformanceWidget } from "@/components/dashboard/class-performance-widget"

// ─── Navigation Tabs ───────────────────────────────────────────────
const navTabs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "HR", href: "/hr" },
  { label: "Events", href: "/front-office" },
  { label: "Membership", href: "/students" },
  { label: "Finance", href: "/accounts" },
  { label: "Fees", href: "/fees/collection" },
  { label: "Academic", href: "/academics" },
]

const iconMap = [
  { icon: <GraduationCap size={20} />, color: "from-blue-500 to-blue-600", iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600", badgeColor: "text-green-600 bg-green-50 dark:bg-green-900/20" },
  { icon: <Users size={20} />, color: "from-emerald-500 to-emerald-600", iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600", badgeColor: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
  { icon: <Briefcase size={20} />, color: "from-amber-500 to-amber-600", iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600", badgeColor: "text-red-600 bg-red-50 dark:bg-red-900/20" },
  { icon: <BookOpen size={20} />, color: "from-purple-500 to-purple-600", iconBg: "bg-purple-100 dark:bg-purple-900/30 text-purple-600", badgeColor: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
]

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-[300px] rounded-[3rem] bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3 h-80 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="lg:col-span-5 h-80 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="lg:col-span-4 h-80 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const params = useParams<{ tenantSlug: string; role: string }>()
  const { data, loading, error, refresh } = useDashboardData()
  const tenantSlug = params.tenantSlug
  const role = params.role

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Failed to load dashboard</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    )
  }

  if (!data) return <DashboardSkeleton />

  const statCards = [
    { label: "Total Students", ...data.stats.totalStudents, ...iconMap[0] },
    { label: "Total Teachers", ...data.stats.totalTeachers, ...iconMap[1] },
    { label: "Total Staff", ...data.stats.totalStaff, ...iconMap[2] },
    { label: "Total Subjects", ...data.stats.totalSubjects, ...iconMap[3] },
  ]

  return (
    <div className="space-y-6">
      {/* ════════════════════════════════════════════════
         SECTION 1: Hero Banner
         ════════════════════════════════════════════════ */}
      <VibrantBanner
        userName="Admin"
        institutionalRole="SUPER ADMIN"
        date={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        efficiency={data.finance.systemEfficiency}
        pendingApprovals={data.pendingApprovals}
      />

      {/* ════════════════════════════════════════════════
         SECTION 2: Navigation Tabs
         ════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-1 bg-white dark:bg-zinc-900 rounded-2xl p-1.5 shadow-sm border border-slate-100 dark:border-white/5 overflow-x-auto"
      >
        {navTabs.map((tab, i) => {
          const isActive = tab.href === "/dashboard"

          return (
            <Link
              key={tab.label}
              href={`/${tenantSlug}/${role}${tab.href}`}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${isActive
              ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
        <div className="ml-auto flex items-center gap-2 px-2">
          <select className="text-xs border border-slate-200 dark:border-white/10 dark:bg-zinc-800 rounded-lg px-2.5 py-1.5 outline-none text-slate-500">
            <option>Academic Year: 2024-25</option>
          </select>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════
         SECTION 3: Stat Cards
         ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.05 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ y: -4, boxShadow: "0 12px 30px -8px rgba(0,0,0,0.1)", transition: { duration: 0.2 } }}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                {card.icon}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
            <div className="mb-3">
              <AnimatedNumber value={card.value} className="text-2xl font-bold text-slate-800 dark:text-white" />
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{card.label}</p>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="text-emerald-600 font-semibold">Active: {card.active}</span>
              <span className="text-red-500 font-semibold">Inactive: {card.inactive}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-50 dark:border-white/5">
              <span className="text-[10px] text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                View All <ArrowUpRight size={10} />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ════════════════════════════════════════════════
         SECTION 4: Calendar + Events | Attendance | Performers + Quick Links
         ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <MiniCalendarWidget />
          <UpcomingEventsWidget events={data.upcomingEvents} />
        </div>
        <div className="lg:col-span-5">
          <AttendanceWidget attendance={data.attendance.students} />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <PerformerCards />
          <QuickLinksWidget />
        </div>
      </div>

      {/* ════════════════════════════════════════════════
         SECTION 5: Class Routine | Class Performance | Fees Collection
         ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ClassRoutineWidget />
        <ClassPerformanceWidget performance={data.classPerformance} />
        <FeesCollectionChart finance={data.finance} feeTrend={data.feeTrend} />
      </div>

      {/* ════════════════════════════════════════════════
         SECTION 6: Financial Intelligence (Full Width)
         ════════════════════════════════════════════════ */}
      <FinancialFlow feeTrend={data.feeTrend} finance={data.finance} />

      {/* ════════════════════════════════════════════════
         SECTION 7: Leave Requests | Notice Board | Academic Pulse
         ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LeaveRequestsWidget requests={data.leaveRequests} />
        <NoticeBoardWidget notices={data.notices} />
        <AcademicPulse />
      </div>

      {/* ════════════════════════════════════════════════
         SECTION 8: Todo | Inbox | Student Activity | Today's Overview
         ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TodoWidget />
        <InboxWidget />
        <StudentActivityWidget />
        <TodaysOverviewWidget
          stats={data.stats}
          pendingApprovals={data.pendingApprovals}
          upcomingEventsCount={data.upcomingEvents.length}
        />
      </div>
    </div>
  )
}
