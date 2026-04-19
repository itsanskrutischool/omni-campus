"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Building2, Users, DollarSign, TrendingUp, AlertTriangle, CheckCircle2,
  RefreshCw, Filter, Search, ArrowRight, Settings, School, GraduationCap,
  CreditCard, Activity, Calendar, BarChart3, PieChart, MoreVertical
} from "lucide-react"

const mockSchools = [
  {
    id: "school-1",
    name: "Omni Campus Main",
    location: "Bangalore",
    studentCount: 1250,
    staffCount: 85,
    revenue: 25000000,
    growth: 15,
    status: "ACTIVE",
    lastUpdated: "2026-04-19",
  },
  {
    id: "school-2",
    name: "Omni Campus North",
    location: "Delhi",
    studentCount: 890,
    staffCount: 65,
    revenue: 18000000,
    growth: 12,
    status: "ACTIVE",
    lastUpdated: "2026-04-19",
  },
  {
    id: "school-3",
    name: "Omni Campus South",
    location: "Chennai",
    studentCount: 650,
    staffCount: 50,
    revenue: 12000000,
    growth: 8,
    status: "ACTIVE",
    lastUpdated: "2026-04-18",
  },
  {
    id: "school-4",
    name: "Omni Campus East",
    location: "Kolkata",
    studentCount: 450,
    staffCount: 35,
    revenue: 8000000,
    growth: -2,
    status: "ACTIVE",
    lastUpdated: "2026-04-17",
  },
  {
    id: "school-5",
    name: "Omni Campus West",
    location: "Mumbai",
    studentCount: 0,
    staffCount: 0,
    revenue: 0,
    growth: 0,
    status: "COMING_SOON",
    lastUpdated: "2026-04-01",
  },
]

const mockMetrics = {
  totalStudents: 3240,
  totalStaff: 235,
  totalRevenue: 63000000,
  avgGrowth: 8.25,
  activeSchools: 4,
  comingSoon: 1,
  pendingAdmissions: 156,
  totalFeeCollection: 52000000,
  pendingFees: 11000000,
}

export default function MultiSchoolDashboard() {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"overview" | "comparison">("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const filteredSchools = mockSchools.filter((school) => {
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         school.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || school.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Multi-School Dashboard</h1>
                <p className="text-gray-600">Overview of all Omni Campus locations</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold text-gray-900">{mockMetrics.totalStudents}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Students</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-emerald-500" />
              <span className="text-3xl font-bold text-gray-900">₹{(mockMetrics.totalRevenue / 10000000).toFixed(1)}Cr</span>
            </div>
            <p className="text-gray-600 text-sm">Total Revenue</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold text-gray-900">{mockMetrics.avgGrowth}%</span>
            </div>
            <p className="text-gray-600 text-sm">Avg Growth</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <School className="w-8 h-8 text-amber-500" />
              <span className="text-3xl font-bold text-gray-900">{mockMetrics.activeSchools}</span>
            </div>
            <p className="text-gray-600 text-sm">Active Schools</p>
          </motion.div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Fee Collection
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Collected</span>
                  <span className="font-semibold text-emerald-600">₹{(mockMetrics.totalFeeCollection / 1000000).toFixed(1)}M</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(mockMetrics.totalFeeCollection / (mockMetrics.totalFeeCollection + mockMetrics.pendingFees)) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-amber-600">₹{(mockMetrics.pendingFees / 1000000).toFixed(1)}M</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(mockMetrics.pendingFees / (mockMetrics.totalFeeCollection + mockMetrics.pendingFees)) * 100}%` }} />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Admissions Pipeline
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Pending Admissions</span>
                <span className="font-bold text-blue-600">{mockMetrics.pendingAdmissions}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <span className="text-gray-700">New This Month</span>
                <span className="font-bold text-emerald-600">45</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <span className="text-gray-700">Conversion Rate</span>
                <span className="font-bold text-amber-600">68%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* School List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search schools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="COMING_SOON">Coming Soon</option>
              </select>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg flex items-center gap-2">
                <School className="w-4 h-4" />
                Add School
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchools.map((school) => (
                <motion.div
                  key={school.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white border-2 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer ${
                    selectedSchool === school.id ? "border-blue-500" : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedSchool(school.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      school.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {school.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1">{school.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{school.location}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Students</p>
                      <p className="font-semibold text-gray-900">{school.studentCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Staff</p>
                      <p className="font-semibold text-gray-900">{school.staffCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="font-semibold text-gray-900">₹{(school.revenue / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Growth</p>
                      <p className={`font-semibold ${school.growth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {school.growth >= 0 ? "+" : ""}{school.growth}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Updated: {school.lastUpdated}</span>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* School Details Panel */}
        {selectedSchool && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 p-6"
          >
            {(() => {
              const school = mockSchools.find((s) => s.id === selectedSchool)
              if (!school) return null
              return (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{school.name}</h2>
                      <p className="text-gray-600">{school.location}</p>
                    </div>
                    <button
                      onClick={() => setSelectedSchool(null)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <Users className="w-6 h-6 text-blue-600 mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{school.studentCount}</p>
                      <p className="text-sm text-gray-600">Students</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <GraduationCap className="w-6 h-6 text-purple-600 mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{school.staffCount}</p>
                      <p className="text-sm text-gray-600">Staff</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <DollarSign className="w-6 h-6 text-emerald-600 mb-2" />
                      <p className="text-2xl font-bold text-gray-900">₹{(school.revenue / 10000000).toFixed(1)}Cr</p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4">
                      <TrendingUp className="w-6 h-6 text-amber-600 mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{school.growth}%</p>
                      <p className="text-sm text-gray-600">Growth</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </button>
                    <button className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                      <PieChart className="w-4 h-4" />
                      Reports
                    </button>
                    <button className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Schedule
                    </button>
                    <button className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 flex items-center justify-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Visit Dashboard
                    </button>
                  </div>
                </>
              )
            })()}
          </motion.div>
        )}
      </div>
    </div>
  )
}
