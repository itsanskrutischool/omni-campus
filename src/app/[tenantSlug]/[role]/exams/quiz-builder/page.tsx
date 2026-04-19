"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Trash2, Save, Play, Clock, Target, CheckCircle2,
  XCircle, ChevronDown, Search, Filter, RefreshCw, FileText,
  Edit, Copy, Eye, Settings
} from "lucide-react"

const mockQuizzes = [
  {
    id: "qz-1",
    title: "Mathematics - Chapter 5",
    subject: "Mathematics",
    classRoom: "10-A",
    duration: 30,
    totalMarks: 50,
    passingMarks: 25,
    maxAttempts: 2,
    status: "PUBLISHED",
    questionCount: 20,
    attempts: 45,
    createdAt: "2026-04-15",
  },
  {
    id: "qz-2",
    title: "Science - Physics Basics",
    subject: "Science",
    classRoom: "9-B",
    duration: 45,
    totalMarks: 60,
    passingMarks: 30,
    maxAttempts: 1,
    status: "DRAFT",
    questionCount: 15,
    attempts: 0,
    createdAt: "2026-04-18",
  },
  {
    id: "qz-3",
    title: "English - Grammar Test",
    subject: "English",
    classRoom: "8-C",
    duration: 20,
    totalMarks: 40,
    passingMarks: 20,
    maxAttempts: 3,
    status: "PUBLISHED",
    questionCount: 25,
    attempts: 78,
    createdAt: "2026-04-10",
  },
]

const mockQuestions = [
  {
    id: "qn-1",
    type: "MCQ_SINGLE",
    text: "What is the value of π?",
    options: ["3.14", "3.14159", "3.142", "3.1416"],
    correctAnswer: "1",
    marks: 1,
    order: 1,
  },
  {
    id: "qn-2",
    type: "MCQ_SINGLE",
    text: "Solve: 2x + 5 = 15",
    options: ["x = 5", "x = 10", "x = 7.5", "x = 2"],
    correctAnswer: "0",
    marks: 2,
    order: 2,
  },
]

export default function QuizBuilderPage() {
  const [activeTab, setActiveTab] = useState<"list" | "builder">("list")
  const [selectedQuiz, setSelectedQuiz] = useState<typeof mockQuizzes[0] | null>(null)
  const [showNewQuiz, setShowNewQuiz] = useState(false)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const stats = {
    totalQuizzes: mockQuizzes.length,
    published: mockQuizzes.filter((q) => q.status === "PUBLISHED").length,
    drafts: mockQuizzes.filter((q) => q.status === "DRAFT").length,
    totalAttempts: mockQuizzes.reduce((sum, q) => sum + q.attempts, 0),
  }

  const filteredQuizzes = mockQuizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quiz Builder</h1>
                <p className="text-gray-600">Create and manage online assessments</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center gap-2">
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
              <FileText className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.totalQuizzes}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Quizzes</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.published}</span>
            </div>
            <p className="text-gray-600 text-sm">Published</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <Edit className="w-8 h-8 text-amber-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.drafts}</span>
            </div>
            <p className="text-gray-600 text-sm">Drafts</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.totalAttempts}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Attempts</p>
          </motion.div>
        </div>

        {/* Content */}
        {activeTab === "list" ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search quizzes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setShowNewQuiz(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Quiz
                </button>
              </div>
            </div>

            {/* Quiz List */}
            <div className="p-4 space-y-3">
              {filteredQuizzes.map((quiz) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          quiz.status === "PUBLISHED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {quiz.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-gray-600">{quiz.subject}</div>
                        <div className="text-gray-600">{quiz.classRoom}</div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {quiz.duration} mins
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Target className="w-4 h-4" />
                          {quiz.totalMarks} marks
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{quiz.questionCount} questions</span>
                        <span>{quiz.attempts} attempts</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedQuiz(quiz)
                          setActiveTab("builder")
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Copy">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Preview">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            {/* Builder Toolbar */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveTab("list")}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-2"
                >
                  ← Back
                </button>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Draft
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Publish
                  </button>
                </div>
              </div>
            </div>

            {/* Quiz Info */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedQuiz?.title}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    defaultValue={selectedQuiz?.subject}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <input
                    type="text"
                    defaultValue={selectedQuiz?.classRoom}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    defaultValue={selectedQuiz?.duration}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    defaultValue={selectedQuiz?.totalMarks}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Questions ({mockQuestions.length})</h3>
                <button
                  onClick={() => setShowAddQuestion(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>

              <div className="space-y-4">
                {mockQuestions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {question.type}
                        </span>
                        <span className="text-sm text-gray-500">{question.marks} marks</span>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1 text-gray-600 hover:bg-gray-200 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-900 mb-3">{question.text}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {question.options.map((option, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded border ${
                            i === parseInt(question.correctAnswer)
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-200"
                          }`}
                        >
                          <span className="text-sm">{option}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Quiz Modal */}
      <AnimatePresence>
        {showNewQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowNewQuiz(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Quiz</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter quiz title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Select subject...</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Select class...</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passing Marks</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewQuiz(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowNewQuiz(false)
                    setActiveTab("builder")
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700"
                >
                  Create Quiz
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Question Modal */}
      <AnimatePresence>
        {showAddQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAddQuestion(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Question</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>MCQ_SINGLE</option>
                    <option>MCQ_MULTIPLE</option>
                    <option>TRUE_FALSE</option>
                    <option>SHORT_ANSWER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24" placeholder="Enter your question" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="radio" name="correct" className="w-4 h-4" />
                        <input type="text" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" placeholder={`Option ${i}`} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg h-16" placeholder="Add explanation for the answer" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddQuestion(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700">
                  Add Question
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
