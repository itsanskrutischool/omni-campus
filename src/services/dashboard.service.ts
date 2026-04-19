import { prisma } from "@/lib/prisma"

/**
 * Dashboard Service
 * ─────────────────
 * Aggregates real data from database for the admin dashboard.
 * All queries are strictly scoped by tenantId for multi-tenant isolation.
 */

export class DashboardService {
    /**
     * Get complete dashboard data for a tenant.
     */
    static async getDashboardData(tenantId: string) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const [
            stats,
            attendance,
            feeData,
            leaveRequests,
            notices,
            activities,
            classPerformance,
            upcomingEvents,
            approvalCount,
        ] = await Promise.all([
            this.getEntityStats(tenantId),
            this.getAttendanceStats(tenantId, today, tomorrow),
            this.getFeeStats(tenantId),
            this.getLeaveRequests(tenantId),
            this.getNotices(tenantId),
            this.getRecentActivities(tenantId),
            this.getClassPerformance(tenantId),
            this.getUpcomingEvents(tenantId),
            this.getPendingApprovals(tenantId),
        ])

        return {
            stats,
            attendance,
            finance: feeData.finance,
            feeTrend: feeData.feeTrend,
            classPerformance,
            leaveRequests,
            notices,
            activities,
            upcomingEvents,
            pendingApprovals: approvalCount,
        }
    }

    /**
     * Entity counts: students, staff (teachers), staff (non-teaching), subjects
     */
    static async getEntityStats(tenantId: string) {
        const [
            totalStudents,
            activeStudents,
            inactiveStudents,
            totalStaff,
            activeStaff,
            inactiveStaff,
            totalTeachers,
            activeTeachers,
            inactiveTeachers,
            totalSubjects,
            activeSubjects,
        ] = await Promise.all([
            prisma.student.count({ where: { tenantId } }),
            prisma.student.count({ where: { tenantId, status: "ACTIVE" } }),
            prisma.student.count({ where: { tenantId, status: "INACTIVE" } }),
            prisma.staff.count({ where: { tenantId } }),
            prisma.staff.count({ where: { tenantId, status: "ACTIVE" } }),
            prisma.staff.count({ where: { tenantId, status: { not: "ACTIVE" } } }),
            prisma.staff.count({ where: { tenantId, role: { contains: "TEACHER" } } }),
            prisma.staff.count({ where: { tenantId, role: { contains: "TEACHER" }, status: "ACTIVE" } }),
            prisma.staff.count({ where: { tenantId, role: { contains: "TEACHER" }, status: { not: "ACTIVE" } } }),
            prisma.subject.count({ where: { tenantId } }),
            prisma.subject.count({ where: { tenantId, type: "SCHOLASTIC" } }),
        ])

        // Compute student growth (students admitted in last 30 days vs previous 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const sixtyDaysAgo = new Date()
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

        const [recentAdmissions, previousAdmissions] = await Promise.all([
            prisma.student.count({
                where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
            }),
            prisma.student.count({
                where: { tenantId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
            }),
        ])

        const growthPct = previousAdmissions > 0
            ? (((recentAdmissions - previousAdmissions) / previousAdmissions) * 100).toFixed(1)
            : recentAdmissions > 0 ? "+100" : "0"

        // Compute staff vacancies (inactive/terminated)
        const vacancies = inactiveStaff

        return {
            totalStudents: {
                value: totalStudents,
                active: activeStudents,
                inactive: inactiveStudents,
                badge: `${Number(growthPct) >= 0 ? "+" : ""}${growthPct}%`,
            },
            totalTeachers: {
                value: totalTeachers,
                active: activeTeachers,
                inactive: inactiveTeachers,
                badge: activeTeachers > 0 ? "OPTIMAL" : "NONE",
            },
            totalStaff: {
                value: totalStaff,
                active: activeStaff,
                inactive: inactiveStaff,
                badge: vacancies > 0 ? `-${vacancies} VACANCY` : "FULL",
            },
            totalSubjects: {
                value: totalSubjects,
                active: activeSubjects,
                inactive: totalSubjects - activeSubjects,
                badge: "CORE",
            },
        }
    }

    /**
     * Today's attendance stats for students and staff
     */
    static async getAttendanceStats(tenantId: string, today: Date, tomorrow: Date) {
        // Student attendance today
        const studentAttendance = await prisma.attendanceRecord.groupBy({
            by: ["status"],
            where: {
                student: { tenantId },
                date: { gte: today, lt: tomorrow },
            },
            _count: { status: true },
        })

        const studentMap: Record<string, number> = {}
        studentAttendance.forEach((a) => {
            studentMap[a.status] = a._count.status
        })

        // Staff attendance today
        const staffAttendance = await prisma.staffAttendance.groupBy({
            by: ["status"],
            where: {
                staff: { tenantId },
                date: { gte: today, lt: tomorrow },
            },
            _count: { status: true },
        })

        const staffMap: Record<string, number> = {}
        staffAttendance.forEach((a) => {
            staffMap[a.status] = a._count.status
        })

        return {
            students: {
                present: studentMap["PRESENT"] || 0,
                absent: studentMap["ABSENT"] || 0,
                late: studentMap["LATE"] || 0,
                emergency: studentMap["EMERGENCY"] || 0,
                medical: studentMap["MEDICAL"] || 0,
            },
            staff: {
                present: staffMap["PRESENT"] || 0,
                absent: staffMap["ABSENT"] || 0,
                late: staffMap["LATE"] || 0,
                onLeave: staffMap["ON_LEAVE"] || 0,
            },
        }
    }

    /**
     * Fee collection statistics and trends
     */
    static async getFeeStats(tenantId: string) {
        const activeStudents = await prisma.student.findMany({
            where: { tenantId, status: "ACTIVE" },
            select: { id: true },
        })
        const studentIds = activeStudents.map((s) => s.id)

        if (studentIds.length === 0) {
            return {
                finance: {
                    totalRevenue: "₹0",
                    revenueGrowth: "0%",
                    unpaidFees: "₹0",
                    expenseRatio: "0%",
                    fineCollected: "₹0",
                    studentsNotPaid: 0,
                    totalOutstanding: "₹0",
                    systemEfficiency: "0%",
                },
                feeTrend: { series: [], categories: [] },
            }
        }

        const records = await prisma.feeRecord.findMany({
            where: { studentId: { in: studentIds } },
        })

        const totalExpected = records.reduce((a, r) => a + r.amountDue, 0)
        const totalCollected = records.reduce((a, r) => a + r.amountPaid, 0)
        const totalOutstanding = totalExpected - totalCollected
        const totalWaivers = records.reduce((a, r) => a + r.waiver, 0)
        const collectionRate = totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : "0"
        const studentsNotPaid = new Set(
            records.filter((r) => r.status === "PENDING").map((r) => r.studentId)
        ).size

        // Monthly collection trend (last 6 months)
        const monthlyCollected: number[] = []
        const monthlyTotal: number[] = []
        const categories: string[] = []
        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)

            const monthCollect = records
                .filter((r) => r.paidDate && r.paidDate >= monthStart && r.paidDate <= monthEnd)
                .reduce((a, r) => a + r.amountPaid, 0)

            const monthDue = records
                .filter((r) => r.dueDate >= monthStart && r.dueDate <= monthEnd)
                .reduce((a, r) => a + r.amountDue, 0)

            monthlyCollected.push(Math.round(monthCollect))
            monthlyTotal.push(Math.round(monthDue))
            categories.push(monthStart.toLocaleString("default", { month: "short" }))
        }

        // Revenue growth (this month vs last month)
        const thisMonthCollected = monthlyCollected[monthlyCollected.length - 1] || 0
        const lastMonthCollected = monthlyCollected[monthlyCollected.length - 2] || 0
        const revenueGrowth = lastMonthCollected > 0
            ? (((thisMonthCollected - lastMonthCollected) / lastMonthCollected) * 100).toFixed(1)
            : "0"

        const formatCurrency = (val: number) =>
            "₹" + val.toLocaleString("en-IN")

        return {
            finance: {
                totalRevenue: formatCurrency(totalCollected),
                revenueGrowth: `${Number(revenueGrowth) >= 0 ? "+" : ""}${revenueGrowth}%`,
                unpaidFees: formatCurrency(totalOutstanding),
                expenseRatio: `${totalExpected > 0 ? ((totalOutstanding / totalExpected) * 100).toFixed(0) : 0}%`,
                fineCollected: formatCurrency(totalWaivers),
                studentsNotPaid,
                totalOutstanding: formatCurrency(totalOutstanding),
                systemEfficiency: `${collectionRate}%`,
            },
            feeTrend: {
                series: [
                    { name: "Fees Collected", data: monthlyCollected },
                    { name: "Total Fee", data: monthlyTotal },
                ],
                categories,
            },
        }
    }

    /**
     * Recent leave requests
     */
    static async getLeaveRequests(tenantId: string) {
        const requests = await prisma.leaveRequest.findMany({
            where: { staff: { tenantId } },
            include: { staff: { select: { name: true, role: true } } },
            orderBy: { from: "desc" },
            take: 5,
        })

        return requests.map((r) => ({
            name: r.staff.name,
            role: r.staff.role,
            type: r.reason || "Casual",
            leaveRange: `${r.from.toLocaleDateString("en-US", { day: "numeric", month: "short" })} - ${r.to.toLocaleDateString("en-US", { day: "numeric", month: "short" })}`,
            applyDate: r.from.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
            avatar: r.staff.name.substring(0, 2).toUpperCase(),
            status: r.status,
        }))
    }

    /**
     * Recent notices
     */
    static async getNotices(tenantId: string) {
        const notices = await prisma.notice.findMany({
            where: { tenantId },
            orderBy: { publishedAt: "desc" },
            take: 5,
        })

        return notices.map((n) => ({
            title: n.title,
            date: `Added on: ${n.publishedAt.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`,
            type: n.audience === "ALL" ? "EVENT" : n.audience === "STAFF" ? "ADMIN" : "SYSTEM",
        }))
    }

    /**
     * Recent audit log activities
     */
    static async getRecentActivities(tenantId: string) {
        const logs = await prisma.auditLog.findMany({
            where: { tenantId },
            orderBy: { createdAt: "desc" },
            take: 6,
        })

        return logs.map((log) => {
            const typeMap: Record<string, string> = {
                students: "ADMISSION",
                fees: "FINANCE",
                attendance: "ACADEMIC",
                transport: "ALERT",
            }
            const timeDiff = Date.now() - log.createdAt.getTime()
            const minutes = Math.floor(timeDiff / 60000)
            const hours = Math.floor(minutes / 60)
            const days = Math.floor(hours / 24)
            const timeAgo = days > 0 ? `${days}d ago` : hours > 0 ? `${hours}h ago` : minutes > 0 ? `${minutes}m ago` : "Just now"

            return {
                id: log.id,
                user: log.userName || "System",
                role: log.userRole || "SYSTEM",
                action: log.summary,
                target: log.entityType,
                time: timeAgo,
                type: typeMap[log.module] || "SYSTEM",
            }
        })
    }

    /**
     * Class performance stats from mark entries
     */
    static async getClassPerformance(tenantId: string) {
        const marks = await prisma.markEntry.findMany({
            where: { student: { tenantId } },
            select: { marks: true, maxMarks: true },
        })

        if (marks.length === 0) {
            return { good: 0, topStudents: 0, average: 0, belowAverage: 0 }
        }

        let good = 0,
            topStudents = 0,
            average = 0,
            belowAverage = 0

        marks.forEach((m) => {
            const pct = m.maxMarks > 0 ? (m.marks / m.maxMarks) * 100 : 0
            if (pct >= 90) topStudents++
            else if (pct >= 70) good++
            else if (pct >= 50) average++
            else belowAverage++
        })

        return { good, topStudents, average, belowAverage }
    }

    /**
     * Upcoming events from notices (published in future or recently)
     */
    static async getUpcomingEvents(tenantId: string) {
        const now = new Date()
        const futureNotices = await prisma.notice.findMany({
            where: {
                tenantId,
                publishedAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
            },
            orderBy: { publishedAt: "asc" },
            take: 5,
        })

        const colors = [
            "border-blue-500",
            "border-red-500",
            "border-slate-400",
            "border-teal-500",
            "border-purple-500",
        ]

        return futureNotices.map((n, i) => ({
            title: n.title,
            date: n.publishedAt.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
            time: n.publishedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            color: colors[i % colors.length],
        }))
    }

    /**
     * Count pending approvals
     */
    static async getPendingApprovals(tenantId: string) {
        return prisma.approvalRequest.count({
            where: { tenantId, status: "PENDING" },
        })
    }
}
