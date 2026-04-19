"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Phone, Mail, Calendar, Search, Filter, Plus, RefreshCw,
  TrendingUp, CheckCircle2, Clock, AlertTriangle, Edit, Trash2,
  PhoneCall, Mail as MailIcon, MessageSquare, FileText, ChevronDown,
  Star, Target, ArrowUpRight, Activity
} from "lucide-react"

const mockLeads = [
  {
    id: "lead-1",
    name: "Aman Kumar",
    phone: "+91-9876543210",
    email: "aman.kumar@email.com",
    address: "123 Main Street, City",
    source: "WEBSITE",
    sourceDetail: "Online inquiry form",
    gradeApplying: "10",
    academicYear: "2026-27",
    parentName: "Mr. Rajesh Kumar",
    parentPhone: "+91-9876543210",
    previousSchool: "City Public School",
    notes: "Interested in science stream",
    status: "NEW",
    priority: "HIGH",
    assignedTo: "Mrs. Priya Sharma",
    createdAt: "2026-04-19",
    score: 85,
  },
  {
    id: "lead-2",
    name: "Priya Sharma",
    phone: "+91-9876541234",
    email: "priya.sharma@email.com",
    address: "456 Park Avenue, City",
    source: "REFERRAL",
    sourceDetail: "Referred by existing parent",
    gradeApplying: "8",
    academicYear: "2026-27",
    parentName: "Mrs. Meena Sharma",
    parentPhone: "+91-9876541234",
    previousSchool: "St. Mary's School",
    notes: "Looking for holistic education",
    status: "CONTACTED",
    priority: "MEDIUM",
    assignedTo: "Mr. Rajesh Verma",
    createdAt: "2026-04-18",
    score: 72,
  },
  {
    id: "lead-3",
    name: "Arjun Reddy",
    phone: "+91-9876549876",
    email: "arjun.reddy@email.com",
    address: "789 Lake Road, City",
    source: "WALK_IN",
    sourceDetail: "Walked into office",
    gradeApplying: "6",
    academicYear: "2026-27",
    parentName: "Mr. Venkat Reddy",
    parentPhone: "+91-9876549876",
    previousSchool: "Little Flower School",
    notes: "Interested in sports facilities",
    status: "QUALIFIED",
    priority: "HIGH",
    assignedTo: "Dr. Anjali Gupta",
    createdAt: "2026-04-15",
    score: 91,
  },
  {
    id: "lead-4",
    name: "Neha Patel",
    phone: "+91-9876545678",
    email: "neha.patel@email.com",
    address: "321 Garden Street, City",
    source: "ADVERTISEMENT",
    sourceDetail: "Newspaper ad",
    gradeApplying: "5",
    academicYear: "2026-27",
    parentName: "Mrs. Sunita Patel",
    parentPhone: "+91-9876545678",
    previousSchool: "Sunshine School",
    notes: "",
    status: "CONVERTED",
    priority: "LOW",
    assignedTo: "Mrs. Priya Sharma",
    createdAt: "2026-04-10",
    score: 68,
  },
]

const mockActivities = [
  {
    id: "act-1",
    leadId: "lead-1",
    leadName: "Aman Kumar",
    type: "PHONE_CALL",
    description: "Initial inquiry call",
    outcome: "Interested",
    performedBy: "Mrs. Priya Sharma",
    performedAt: "2026-04-19",
    nextAction: "Schedule campus visit",
    nextActionDate: "2026-04-22",
  },
  {
    id: "act-2",
    leadId: "lead-2",
    leadName: "Priya Sharma",
    type: "EMAIL",
    description: "Sent brochure and fee structure",
    outcome: "Awaiting response",
    performedBy: "Mr. Rajesh Verma",
    performedAt: "2026-04-18",
    nextAction: "Follow up call",
    nextActionDate: "2026-04-21",
  },
]

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  NEW: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Users },
  CONTACTED: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: PhoneCall },
  QUALIFIED: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  CONVERTED: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: Star },
  LOST: { color: "text-red-700", bg: "bg-red-50 border-red-200", icon: AlertTriangle },
}

const priorityConfig: Record<string, { color: string; bg: string }> = {
  HIGH: { color: "text-red-700", bg: "bg-red-50 border-red-200" },
  MEDIUM: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  LOW: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
}

export default function AdmissionCRMPage() {
  const [activeTab, setActiveTab] = useState<"leads" | "activities">("leads")
  const [showNewLead, setShowNewLead] = useState(false)
  const [showAddActivity, setShowAddActivity] = useState(false)
  const [selectedLead, setSelectedLead] = useState<typeof mockLeads[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
  const [sourceFilter, setSourceFilter] = useState<string | null>(null)

  const stats = {
    totalLeads: mockLeads.length,
    new: mockLeads.filter((l) => l.status === "NEW").length,
    contacted: mockLeads.filter((l) => l.status === "CONTACTED").length,
    qualified: mockLeads.filter((l) => l.status === "QUALIFIED").length,
    converted: mockLeads.filter((l) => l.status === "CONVERTED").length,
    avgScore: Math.round(mockLeads.reduce((sum, l) => sum + l.score, 0) / mockLeads.length),
  }

  const filteredLeads = mockLeads.filter((lead) => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.phone.includes(searchQuery) ||
                         lead.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || lead.status === statusFilter
    const matchesPriority = !priorityFilter || lead.priority === priorityFilter
    const matchesSource = !sourceFilter || lead.source === sourceFilter
    return matchesSearch && matchesStatus && matchesPriority && matchesSource
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admission CRM</h1>
                <p className="text-gray-600">Manage leads and convert enrollments</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-orange-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.totalLeads}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Leads</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.new}</span>
            </div>
            <p className="text-gray-600 text-sm">New</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <PhoneCall className="w-8 h-8 text-amber-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.contacted}</span>
            </div>
            <p className="text-gray-600 text-sm">Contacted</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.qualified}</span>
            </div>
            <p className="text-gray-600 text-sm">Qualified</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.converted}</span>
            </div>
            <p className="text-gray-600 text-sm">Converted</p>
          </motion.div>
        </div>

        {/* Pipeline Overview */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Conversion Pipeline
          </h2>
          <div className="flex items-center gap-2">
            {["NEW", "CONTACTED", "QUALIFIED", "CONVERTED"].map((status, i) => (
              <div key={status} className="flex-1">
                <div className="text-center text-sm font-medium text-gray-600 mb-1">{status}</div>
                <div className="h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">
                    {mockLeads.filter((l) => l.status === status).length}
                  </span>
                </div>
                {i < 3 && <ArrowUpRight className="w-4 h-4 text-gray-400 mx-auto rotate-90" />}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("leads")}
              className={`flex-1 px-6 py-4 flex items-center gap-2 font-medium transition-colors ${
                activeTab === "leads"
                  ? "bg-orange-50 text-orange-700 border-b-2 border-orange-500"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Users className="w-5 h-5" />
              Leads
            </button>
            <button
              onClick={() => setActiveTab("activities")}
              className={`flex-1 px-6 py-4 flex items-center gap-2 font-medium transition-colors ${
                activeTab === "activities"
                  ? "bg-orange-50 text-orange-700 border-b-2 border-orange-500"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Activity className="w-5 h-5" />
              Activities
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
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="CONVERTED">Converted</option>
              </select>
              <select
                value={priorityFilter || ""}
                onChange={(e) => setPriorityFilter(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Priority</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <select
                value={sourceFilter || ""}
                onChange={(e) => setSourceFilter(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Sources</option>
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="WALK_IN">Walk-in</option>
                <option value="ADVERTISEMENT">Advertisement</option>
              </select>
              <button
                onClick={() => setShowNewLead(true)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Lead
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === "leads" ? (
              <div className="space-y-3">
                {filteredLeads.map((lead) => {
                  const StatusIcon = statusConfig[lead.status]?.icon
                  return (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-orange-600" />
                            <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[lead.priority]?.bg} ${priorityConfig[lead.priority]?.color}`}>
                              {lead.priority}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[lead.status]?.bg} ${statusConfig[lead.status]?.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {lead.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              {lead.phone}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              {lead.email}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Target className="w-4 h-4" />
                              Grade {lead.gradeApplying}
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-amber-500" />
                              <span className="font-semibold text-gray-900">{lead.score}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Source:</span> {lead.source} | <span className="font-medium">Assigned:</span> {lead.assignedTo}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="View Details"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Add Activity">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Call">
                            <PhoneCall className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Email">
                            <MailIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {mockActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Activity className="w-5 h-5 text-orange-600" />
                          <h3 className="font-semibold text-gray-900">{activity.leadName}</h3>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{activity.type}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div className="text-gray-600">Outcome: {activity.outcome}</div>
                          <div className="text-gray-600">By: {activity.performedBy}</div>
                          <div className="text-gray-600">On: {activity.performedAt}</div>
                        </div>
                        {activity.nextAction && (
                          <div className="mt-2 text-sm">
                            <span className="text-amber-600">Next: {activity.nextAction}</span>
                            <span className="text-gray-500 ml-2">({activity.nextActionDate})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Lead Modal */}
      <AnimatePresence>
        {showNewLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowNewLead(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">New Admission Lead</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade Applying</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Select grade...</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg h-16" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>WEBSITE</option>
                      <option>REFERRAL</option>
                      <option>WALK_IN</option>
                      <option>ADVERTISEMENT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>HIGH</option>
                      <option>MEDIUM</option>
                      <option>LOW</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Previous School</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Select staff...</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewLead(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700">
                  Create Lead
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
