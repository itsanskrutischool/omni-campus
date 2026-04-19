"use client"

import { useState, useEffect, useCallback } from "react"

export interface DashboardData {
    stats: {
        totalStudents: { value: number; active: number; inactive: number; badge: string }
        totalTeachers: { value: number; active: number; inactive: number; badge: string }
        totalStaff: { value: number; active: number; inactive: number; badge: string }
        totalSubjects: { value: number; active: number; inactive: number; badge: string }
    }
    attendance: {
        students: { present: number; absent: number; late: number; emergency: number; medical: number }
        staff: { present: number; absent: number; late: number; onLeave: number }
    }
    finance: {
        totalRevenue: string
        revenueGrowth: string
        unpaidFees: string
        expenseRatio: string
        fineCollected: string
        studentsNotPaid: number
        totalOutstanding: string
        systemEfficiency: string
    }
    feeTrend: {
        series: { name: string; data: number[] }[]
        categories: string[]
    }
    classPerformance: { good: number; topStudents: number; average: number; belowAverage: number }
    leaveRequests: { name: string; role: string; type: string; leaveRange: string; applyDate: string; avatar: string; status: string }[]
    notices: { title: string; date: string; type: string }[]
    activities: { id: string; user: string; role: string; action: string; target: string; time: string; type: string }[]
    upcomingEvents: { title: string; date: string; time: string; color: string }[]
    pendingApprovals: number
}

export function useDashboardData() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/dashboard")
            if (!res.ok) throw new Error("Failed to load dashboard data")
            const json = await res.json()
            setData(json)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown error")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { data, loading, error, refresh: fetchData }
}
