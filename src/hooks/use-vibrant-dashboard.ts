"use client"

import { useMemo } from "react"
import { DASHBOARD_STATS } from "@/lib/dashboard-data"

export function useVibrantDashboard() {
  const stats = useMemo(() => {
    // Transformer for vibrant UI display
    return {
      totalRevenue: {
        value: 428500,
        growth: "+12.4%",
        trend: "UP",
        color: "blue"
      },
      activeStudents: {
        value: 1284,
        growth: "+15%",
        trend: "UP",
        color: "indigo"
      },
      staffAttendance: {
        value: 98.1,
        growth: "Optimal",
        trend: "STABLE",
        color: "emerald"
      },
      conversionRate: {
        value: 24,
        growth: "High",
        trend: "UP",
        color: "rose"
      }
    }
  }, [])

  const activities = DASHBOARD_STATS.activities.slice(0, 5)
  const notices = DASHBOARD_STATS.notices.slice(0, 3)

  return {
    stats,
    activities,
    notices,
    currentDate: new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }
}
