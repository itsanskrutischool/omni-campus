"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar, Clock, BookOpen, Plus, Search, Filter, RefreshCw,
  CheckCircle2, XCircle, Edit, Trash2, Eye, FileText, User,
  Download, Share2
} from "lucide-react"

const mockLessonPlans = [
  {
    id: "lp-1",
    teacherId: "TCH-001",
    teacherName: "Mrs. Priya Sharma",
    subjectId: "SUB-001",
    subjectName: "Mathematics",
    classRoomId: "CLS-001",
    classRoomName: "10-A",
    chapter: "Algebra",
    topic: "Quadratic Equations",
    objectives: ["Understand quadratic equations", "Solve quadratic equations", "Apply in real-world problems"],
    materials: ["Textbook", "Whiteboard", "Calculator"],
    activities: ["Lecture", "Practice problems", "Group discussion"],
    homework: "Complete exercises 5.1-5.5",
    assessment: "In-class quiz",
    duration: 45,
    date: "2026-04-20",
    status: "COMPLETED",
  },
  {
    id: "lp-2",
    teacherId: "TCH-002",
    teacherName: "Mr. Rajesh Verma",
    subjectId: "SUB-002",
    subjectName: "Science",
    classRoomId: "CLS-002",
    classRoomName: "9-B",
    chapter: "Physics",
    topic: "Newton's Laws of Motion",
    objectives: ["Understand Newton's laws", "Apply laws to solve problems", "Conduct experiments"],
    materials: ["Lab equipment", "Demonstration kit", "Worksheets"],
    activities: ["Demonstration", "Lab experiment", "Problem solving"],
    homework: "Write lab report",
    assessment: "Lab performance",
    duration: 60,
    date: "2026-04-21",
    status: "SCHEDULED",
  },
  {
    id: "lp-3",
    teacherId: "TCH-003",
    teacherName: "Dr. Anjali Gupta",
    subjectId: "SUB-003",
    subjectName: "English",
    classRoomId: "CLS-003",
    classRoomName: "8-C",
    chapter: "Grammar",
    topic: "Tenses",
    objectives: ["Understand different tenses", "Use tenses correctly", "Identify tenses in sentences"],
    materials: ["Grammar book", "Worksheets", "Flashcards"],
    activities: ["Explanation", "Practice exercises", "Quiz"],
    homework: "Complete worksheet",
    assessment: "Written test",
    duration: 40,
    date: "2026-04-22",
    status: "DRAFT",
  },
]

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  COMPLETED: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  SCHEDULED: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Clock },
  DRAFT: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Edit },
  CANCELLED: { color: "text-red-700", bg: "bg-red-50 border-red-200", icon: XCircle },
}

export default function LessonPlansPage() {
  const [showNewPlan, setShowNewPlan] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<typeof mockLessonPlans[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [teacherFilter, setTeacherFilter] = useState<string | null>(null)
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null)

  const stats = {
    totalPlans: mockLessonPlans.length,
    completed: mockLessonPlans.filter((p) => p.status === "COMPLETED").length,
    scheduled: mockLessonPlans.filter((p) => p.status === "SCHEDULED").length,
    drafts: mockLessonPlans.filter((p) => p.status === "DRAFT").length,
  }

  const filteredPlans = mockLessonPlans.filter((plan) => {
    const matchesSearch = plan.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || plan.status === statusFilter
    const matchesTeacher = !teacherFilter || plan.teacherId === teacherFilter
    const matchesSubject = !subjectFilter || plan.subjectId === subjectFilter
    return matchesSearch && matchesStatus && matchesTeacher && matchesSubject
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Lesson Plans</h1>
                <p className="text-gray-600">Plan and manage your teaching schedule</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center gap-2">
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
              <BookOpen className="w-8 h-8 text-emerald-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.totalPlans}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Plans</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.completed}</span>
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
              <span className="text-3xl font-bold text-gray-900">{stats.scheduled}</span>
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
              <Edit className="w-8 h-8 text-amber-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.drafts}</span>
            </div>
            <p className="text-gray-600 text-sm">Drafts</p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search lesson plans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="DRAFT">Draft</option>
              </select>
              <select
                value={teacherFilter || ""}
                onChange={(e) => setTeacherFilter(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Teachers</option>
                <option value="TCH-001">Mrs. Priya Sharma</option>
                <option value="TCH-002">Mr. Rajesh Verma</option>
                <option value="TCH-003">Dr. Anjali Gupta</option>
              </select>
              <select
                value={subjectFilter || ""}
                onChange={(e) => setSubjectFilter(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Subjects</option>
                <option value="SUB-001">Mathematics</option>
                <option value="SUB-002">Science</option>
                <option value="SUB-003">English</option>
              </select>
              <button
                onClick={() => setShowNewPlan(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Plan
              </button>
            </div>
          </div>

          {/* Lesson Plans List */}
          <div className="p-4 space-y-3">
            {filteredPlans.map((plan) => {
              const StatusIcon = statusConfig[plan.status]?.icon
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-semibold text-gray-900">{plan.topic}</h3>
                        <span className="text-sm text-gray-500">| {plan.chapter}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[plan.status]?.bg} ${statusConfig[plan.status]?.color} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {plan.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                        <div className="text-gray-600">
                          <User className="w-4 h-4 inline mr-1" />
                          {plan.teacherName}
                        </div>
                        <div className="text-gray-600">
                          <BookOpen className="w-4 h-4 inline mr-1" />
                          {plan.subjectName}
                        </div>
                        <div className="text-gray-600">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {plan.date}
                        </div>
                        <div className="text-gray-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {plan.duration} mins
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Class:</span> {plan.classRoomName}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPlan(plan)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Share">
                        <Share2 className="w-4 h-4" />
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
        </div>
      </div>

      {/* New Lesson Plan Modal */}
      <AnimatePresence>
        {showNewPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowNewPlan(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Lesson Plan</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Select teacher...</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Select subject...</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Select class...</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter chapter" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter topic" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Learning Objectives</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20" placeholder="Enter learning objectives (one per line)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Materials</label>
                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20" placeholder="List materials needed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activities</label>
                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20" placeholder="List activities" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Homework</label>
                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg h-16" placeholder="Assign homework" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assessment</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Assessment method" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewPlan(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700">
                  Save as Draft
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700">
                  Create Plan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedPlan(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.topic}</h2>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teacher</label>
                    <p className="text-gray-900">{selectedPlan.teacherName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Subject</label>
                    <p className="text-gray-900">{selectedPlan.subjectName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Class</label>
                    <p className="text-gray-900">{selectedPlan.classRoomName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-gray-900">{selectedPlan.date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <p className="text-gray-900">{selectedPlan.duration} mins</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-gray-900">{selectedPlan.status}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Chapter</label>
                  <p className="text-gray-900">{selectedPlan.chapter}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Learning Objectives</label>
                  <ul className="list-disc list-inside text-gray-900 mt-1">
                    {selectedPlan.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Materials</label>
                  <ul className="list-disc list-inside text-gray-900 mt-1">
                    {selectedPlan.materials.map((mat, i) => (
                      <li key={i}>{mat}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Activities</label>
                  <ul className="list-disc list-inside text-gray-900 mt-1">
                    {selectedPlan.activities.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Homework</label>
                  <p className="text-gray-900">{selectedPlan.homework}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Assessment</label>
                  <p className="text-gray-900">{selectedPlan.assessment}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
