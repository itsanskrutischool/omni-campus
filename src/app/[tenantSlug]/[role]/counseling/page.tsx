"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart, Brain, MessageSquare, AlertTriangle, Search, Plus,
  Filter, Calendar, User, Clock, CheckCircle2, XCircle,
  ChevronDown, RefreshCw, FileText, Phone, Mail, MapPin
} from "lucide-react"

const mockSessions = [
  {
    id: "cs-1",
    studentName: "Aman Kumar",
    studentId: "STU-001",
    counselorName: "Dr. Priya Sharma",
    sessionDate: "2026-04-19",
    duration: 45,
    type: "ACADEMIC",
    severity: "MEDIUM",
    summary: "Student struggling with mathematics",
    status: "COMPLETED",
  },
  {
    id: "cs-2",
    studentName: "Priya Sharma",
    studentId: "STU-002",
    counselorName: "Dr. Rajesh Verma",
    sessionDate: "2026-04-18",
    duration: 30,
    type: "BEHAVIORAL",
    severity: "HIGH",
    summary: "Behavioral issues in classroom",
    status: "COMPLETED",
  },
  {
    id: "cs-3",
    studentName: "Arjun Reddy",
    studentId: "STU-003",
    counselorName: "Dr. Priya Sharma",
    sessionDate: "2026-04-20",
    duration: 60,
    type: "PERSONAL",
    severity: "LOW",
    summary: "Family concerns affecting studies",
    status: "SCHEDULED",
  },
]

const mockAlerts = [
  {
    id: "ca-1",
    studentName: "Rohit Singh",
    studentId: "STU-004",
    type: "ACADEMIC",
    severity: "HIGH",
    description: "Consistently low grades in all subjects",
    status: "OPEN",
    createdAt: "2026-04-15",
    assignedTo: "Dr. Priya Sharma",
  },
  {
    id: "ca-2",
    studentName: "Neha Patel",
    studentId: "STU-005",
    type: "BEHAVIORAL",
    severity: "MEDIUM",
    description: "Frequent absences without reason",
    status: "IN_PROGRESS",
    createdAt: "2026-04-10",
    assignedTo: "Dr. Rajesh Verma",
  },
]

const severityConfig: Record<string, { color: string; bg: string; icon: any }> = {
  HIGH: { color: "text-red-700", bg: "bg-red-50 border-red-200", icon: AlertTriangle },
  MEDIUM: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: AlertTriangle },
  LOW: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
}

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  COMPLETED: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  SCHEDULED: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Clock },
  CANCELLED: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200", icon: XCircle },
  OPEN: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: AlertTriangle },
  IN_PROGRESS: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Clock },
  RESOLVED: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
}

export default function CounselingPage() {
  const [activeTab, setActiveTab] = useState<"sessions" | "alerts">("sessions")
  const [showNewSession, setShowNewSession] = useState(false)
  const [showNewAlert, setShowNewAlert] = useState(false)
  const [severityFilter, setSeverityFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const stats = {
    totalSessions: mockSessions.length,
    completedSessions: mockSessions.filter((s) => s.status === "COMPLETED").length,
    scheduledSessions: mockSessions.filter((s) => s.status === "SCHEDULED").length,
    openAlerts: mockAlerts.filter((a) => a.status === "OPEN").length,
    highSeverityAlerts: mockAlerts.filter((a) => a.severity === "HIGH").length,
  }

  const filteredSessions = mockSessions.filter((session) => {
    const matchesSearch = session.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.counselorName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = !severityFilter || session.severity === severityFilter
    const matchesStatus = !statusFilter || session.status === statusFilter
    return matchesSearch && matchesSeverity && matchesStatus
  })

  const filteredAlerts = mockAlerts.filter((alert) => {
    const matchesSearch = alert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = !severityFilter || alert.severity === severityFilter
    const matchesStatus = !statusFilter || alert.status === statusFilter
    return matchesSearch && matchesSeverity && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Counseling Center</h1>
                <p className="text-gray-600">Student counseling & behavioral support</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-600 hover:to-rose-700 transition-all flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-8 h-8 text-pink-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.totalSessions}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Sessions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.completedSessions}</span>
            </div>
            <p className="text-gray-600 text-sm">Completed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.scheduledSessions}</span>
            </div>
            <p className="text-gray-600 text-sm">Scheduled</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.openAlerts}</span>
            </div>
            <p className="text-gray-600 text-sm">Open Alerts</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("sessions")}
              className={`flex-1 px-6 py-4 flex items-center gap-2 font-medium transition-colors ${
                activeTab === "sessions"
                  ? "bg-pink-50 text-pink-700 border-b-2 border-pink-500"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Sessions
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`flex-1 px-6 py-4 flex items-center gap-2 font-medium transition-colors ${
                activeTab === "alerts"
                  ? "bg-pink-50 text-pink-700 border-b-2 border-pink-500"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              Alerts
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={activeTab === "sessions" ? "Search sessions..." : "Search alerts..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={severityFilter || ""}
                onChange={(e) => setSeverityFilter(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Severity</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                {activeTab === "sessions" ? (
                  <>
                    <option value="COMPLETED">Completed</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="CANCELLED">Cancelled</option>
                  </>
                ) : (
                  <>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </>
                )}
              </select>
              <button
                onClick={activeTab === "sessions" ? () => setShowNewSession(true) : () => setShowNewAlert(true)}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-600 hover:to-rose-700 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {activeTab === "sessions" ? "New Session" : "New Alert"}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === "sessions" ? (
              <div className="space-y-3">
                {filteredSessions.map((session) => {
                  const SeverityIcon = severityConfig[session.severity]?.icon
                  const StatusIcon = statusConfig[session.status]?.icon
                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <User className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">{session.studentName}</h3>
                            <span className="text-sm text-gray-500">({session.studentId})</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="w-4 h-4" />
                              {session.counselorName}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {session.sessionDate}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              {session.duration} mins
                            </div>
                            <div className="flex items-center gap-2">
                              <SeverityIcon className="w-4 h-4" />
                              <span className={severityConfig[session.severity]?.color}>{session.severity}</span>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{session.summary}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full border ${statusConfig[session.status]?.bg} ${statusConfig[session.status]?.color} flex items-center gap-1`}>
                          <StatusIcon className="w-4 h-4" />
                          {session.status}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert) => {
                  const SeverityIcon = severityConfig[alert.severity]?.icon
                  const StatusIcon = statusConfig[alert.status]?.icon
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                        alert.severity === "HIGH" ? "border-red-300" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <User className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">{alert.studentName}</h3>
                            <span className="text-sm text-gray-500">({alert.studentId})</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm mb-2">
                            <div className="flex items-center gap-2">
                              <SeverityIcon className="w-4 h-4" />
                              <span className={severityConfig[alert.severity]?.color}>{alert.severity}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {alert.createdAt}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{alert.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <User className="w-4 h-4" />
                            Assigned to: {alert.assignedTo}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full border ${statusConfig[alert.status]?.bg} ${statusConfig[alert.status]?.color} flex items-center gap-1`}>
                          <StatusIcon className="w-4 h-4" />
                          {alert.status}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Session Modal */}
      <AnimatePresence>
        {showNewSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowNewSession(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">New Counseling Session</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Select student...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Counselor</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Select counselor...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>ACADEMIC</option>
                    <option>BEHAVIORAL</option>
                    <option>PERSONAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>LOW</option>
                    <option>MEDIUM</option>
                    <option>HIGH</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewSession(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-600 hover:to-rose-700">
                  Create Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Alert Modal */}
      <AnimatePresence>
        {showNewAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowNewAlert(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">New Counseling Alert</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Select student...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>ACADEMIC</option>
                    <option>BEHAVIORAL</option>
                    <option>ATTENDANCE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>LOW</option>
                    <option>MEDIUM</option>
                    <option>HIGH</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Select counselor...</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewAlert(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-600 hover:to-rose-700">
                  Create Alert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
