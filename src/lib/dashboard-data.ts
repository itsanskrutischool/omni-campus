/**
 * OmniCampus ERP v3.0 — Dashboard Mock Data
 * ──────────────────────────────────────────
 * Comprehensive datasets for the Admin Dashboard
 */

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface Activity {
  id: string
  user: string
  role: string
  action: string
  target: string
  time: string
  type: "ADMISSION" | "SYSTEM" | "ACADEMIC" | "ALERT" | "FINANCE"
}

export interface Notice {
  title: string
  date: string
  type: "EVENT" | "ADMIN" | "SYSTEM"
}

export interface LeaveRequest {
  name: string
  role: string
  type: "Emergency" | "Casual" | "Medical"
  leaveRange: string
  applyDate: string
  avatar: string
}

export interface TodoItem {
  text: string
  time: string
  done?: boolean
}

export interface InboxMessage {
  name: string
  date: string
  preview: string
  color: string
  unread?: boolean
}

export interface UpcomingEvent {
  title: string
  date: string
  time: string
  color: string
}

export interface StudentActivity {
  event: string
  description: string
  time: string
  avatar: string
}

export interface ClassRoutine {
  month: string
  description: string
  color: string
}

export interface DashboardData {
  finance: {
    totalRevenue: string
    revenueGrowth: string
    unpaidFees: string
    expenseRatio: string
    fineCollected: string
    studentsNotPaid: number
    totalOutstanding: string
    systemEfficiency: string
    pendingApprovals: number
  }
  academics: {
    onlineAttendance: string
    examPassRate: string
    activeStudents: string
    studentGrowth: string
  }
  hr: {
    staffCount: string
    staffAttendance: string
    activeGrievances: string
    payrollsProcessed: string
  }
  admissions: {
    newAdmissions: string
    pendingEnquiries: string
    conversionRate: string
  }
  stats: {
    totalStudents: { value: number; active: number; inactive: number; badge: string }
    totalTeachers: { value: number; active: number; inactive: number; badge: string }
    totalStaff: { value: number; active: number; inactive: number; badge: string }
    totalSubjects: { value: number; active: number; inactive: number; badge: string }
  }
  attendance: {
    present: number
    absent: number
    late: number
    emergency: number
    medical: number
  }
  feeTrend: {
    series: { name: string; data: number[] }[]
    categories: string[]
  }
  attendanceDonut: {
    series: number[]
    labels: string[]
  }
  admissionFunnel: {
    series: { name: string; data: number[] }[]
    categories: string[]
  }
  academicPerformance: {
    series: { name: string; data: number[] }[]
    categories: string[]
  }
  classPerformance: {
    good: number
    topStudents: number
    average: number
    belowAverage: number
  }
  activities: Activity[]
  notices: Notice[]
  leaveRequests: LeaveRequest[]
  todos: TodoItem[]
  inbox: InboxMessage[]
  upcomingEvents: UpcomingEvent[]
  studentActivities: StudentActivity[]
  classRoutines: ClassRoutine[]
}

// ─── DATA ────────────────────────────────────────────────────────────────────

export const DASHBOARD_STATS: DashboardData = {
  // --- COUNTERS ---
  finance: {
    totalRevenue: "$428,500",
    revenueGrowth: "+12.4%",
    unpaidFees: "$12,300",
    expenseRatio: "14%",
    fineCollected: "$4,564",
    studentsNotPaid: 545,
    totalOutstanding: "$6,545,454",
    systemEfficiency: "98.2%",
    pendingApprovals: 4,
  },
  academics: {
    onlineAttendance: "94.2%",
    examPassRate: "88%",
    activeStudents: "1,284",
    studentGrowth: "+15%",
  },
  hr: {
    staffCount: "142",
    staffAttendance: "98.1%",
    activeGrievances: "2",
    payrollsProcessed: "100%",
  },
  admissions: {
    newAdmissions: "42",
    pendingEnquiries: "156",
    conversionRate: "24%",
  },

  stats: {
    totalStudents: { value: 3654, active: 3643, inactive: 11, badge: "+4.2%" },
    totalTeachers: { value: 284, active: 254, inactive: 30, badge: "OPTIMAL" },
    totalStaff: { value: 162, active: 161, inactive: 2, badge: "-6 VACANCY" },
    totalSubjects: { value: 82, active: 81, inactive: 1, badge: "CORE" },
  },

  attendance: {
    present: 3610,
    absent: 44,
    late: 15,
    emergency: 28,
    medical: 12,
  },

  // --- CHART DATA ---
  feeTrend: {
    series: [
      { name: "Fees Collected", data: [45, 52, 48, 55, 30, 40, 35, 50] },
      { name: "Total Fee", data: [60, 60, 60, 60, 60, 60, 60, 60] },
    ],
    categories: ["Q1'23", "Q2'23", "Q3'23", "Q4'23", "Q1'24", "Q2'24", "Q3'24", "Q4'24"],
  },

  attendanceDonut: {
    series: [94, 4, 2],
    labels: ["Present", "Absent", "On Leave"],
  },

  admissionFunnel: {
    series: [{ name: "Candidates", data: [1380, 1100, 990, 880, 740, 548, 330, 210] }],
    categories: ["Enquiry", "Counseling", "Entrance", "Interview", "DocVer", "FeePay", "Confirmed", "Onboarding"],
  },

  academicPerformance: {
    series: [{ name: "Class Average GPA", data: [3.4, 3.6, 3.2, 3.8, 3.5, 3.9, 3.7] }],
    categories: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"],
  },

  classPerformance: {
    good: 95,
    topStudents: 45,
    average: 11,
    belowAverage: 2,
  },

  // --- ACTIVITIES ---
  activities: [
    { id: "1", user: "John Doe", role: "RECEPTION", action: "enrolled a new student", target: "Aryan Singh (Grade 5-B)", time: "2 mins ago", type: "ADMISSION" },
    { id: "2", user: "System Engine", role: "FINANCE", action: "generated monthly payroll", target: "February 2026", time: "15 mins ago", type: "SYSTEM" },
    { id: "3", user: "Sarah Williams", role: "TEACHER", action: "submitted exam results", target: "Mathematics Q3", time: "1 hour ago", type: "ACADEMIC" },
    { id: "4", user: "Security Node", role: "TRANSPORT", action: "detected vehicle delay", target: "Bus Route #4 (Traffic)", time: "2 hours ago", type: "ALERT" },
  ],

  // --- NOTICES ---
  notices: [
    { title: "World Environment Day Program...!!!", date: "Added on: 21 Apr 2024", type: "EVENT" },
    { title: "New Syllabus Instructions", date: "Added on: 11 Mar 2024", type: "ADMIN" },
    { title: "Exam Preparation Notification!", date: "Added on: 18 Mar 2024", type: "ADMIN" },
    { title: "Online Classes Preparation", date: "Added on: 24 May 2024", type: "SYSTEM" },
  ],

  // --- LEAVE REQUESTS ---
  leaveRequests: [
    { name: "James", role: "Physics Teacher", type: "Emergency", leaveRange: "12 - 13 May", applyDate: "12 May", avatar: "JA" },
    { name: "Ramien", role: "Accountant", type: "Casual", leaveRange: "12 - 13 May", applyDate: "11 May", avatar: "RA" },
    { name: "Hendrita", role: "Staff", type: "Medical", leaveRange: "14 - 16 May", applyDate: "10 May", avatar: "HE" },
  ],

  // --- TODOS ---
  todos: [
    { text: "Send Fees Reminder to All Students", time: "01:00 PM", done: true },
    { text: "Create Routine to new staff", time: "04:50 PM" },
    { text: "Extra Class Info to Students & Teachers", time: "04:55 PM" },
    { text: "Fees Creation for Upcoming Academic Year", time: "04:55 PM" },
    { text: "English - Essay on Visited Place", time: "05:55 PM" },
  ],

  // --- INBOX ---
  inbox: [
    { name: "Adam Lee", date: "05 May 2024", preview: "After you've generated your first response, you might realize that it's not quite perfect...", color: "bg-blue-500", unread: true },
    { name: "Toplins", date: "03 May 2024", preview: "Edit Your Email Copy for the upcoming event...", color: "bg-emerald-500" },
    { name: "Hendrita", date: "01 May 2024", preview: "Regarding the upcoming event schedule...", color: "bg-orange-500" },
  ],

  // --- UPCOMING EVENTS ---
  upcomingEvents: [
    { title: "Parents, Teacher Meet", date: "15 July 2024", time: "09:10AM - 10:50PM", color: "border-blue-500" },
    { title: "Vacation Meeting", date: "07 July 2024", time: "09:10AM - 10:50PM", color: "border-red-500" },
    { title: "Staff Meeting", date: "10 July 2024", time: "09:10AM - 10:50PM", color: "border-slate-400" },
    { title: "Admission Camp", date: "20 July 2024", time: "09:10AM - 10:50PM", color: "border-teal-500" },
  ],

  // --- STUDENT ACTIVITIES ---
  studentActivities: [
    { event: "1st place in 'Chess'", description: "This event took place in Our School for...", time: "A Day ago", avatar: "CH" },
    { event: "Participated in 'Carrom'", description: "Justin Lee participated in 'Carrom'", time: "4 Weeks ago", avatar: "CA" },
    { event: "International Conference", description: "We hosted international conference", time: "2 Weeks ago", avatar: "IC" },
    { event: "1st place in 'Tennis'", description: "This event took place in Our School for...", time: "4 Weeks ago", avatar: "TE" },
  ],

  // --- CLASS ROUTINES ---
  classRoutines: [
    { month: "October 2024", description: "October month Class routine", color: "bg-teal-100 text-teal-600" },
    { month: "Nov 2024", description: "Nov month Class routine", color: "bg-pink-100 text-pink-600" },
  ],
}
