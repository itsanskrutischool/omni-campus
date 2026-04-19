"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Download, FileSpreadsheet, Database, Upload, CheckCircle2, AlertTriangle,
  RefreshCw, Calendar, Filter, Search, Info, ArrowRight, Settings,
  School, Users, GraduationCap, BookOpen, Building
} from "lucide-react"

const udiseSections = [
  { id: "school", name: "School Information", icon: School, required: true, fields: 15 },
  { id: "students", name: "Student Data", icon: Users, required: true, fields: 25 },
  { id: "teachers", name: "Teacher Data", icon: GraduationCap, required: true, fields: 20 },
  { id: "infrastructure", name: "Infrastructure", icon: Building, required: true, fields: 30 },
  { id: "academic", name: "Academic Performance", icon: BookOpen, required: true, fields: 18 },
  { id: "finance", name: "Financial Data", icon: Database, required: false, fields: 12 },
]

const mockDataStatus = {
  school: { filled: 15, total: 15, status: "complete" },
  students: { filled: 25, total: 25, status: "complete" },
  teachers: { filled: 18, total: 20, status: "partial" },
  infrastructure: { filled: 28, total: 30, status: "partial" },
  academic: { filled: 18, total: 18, status: "complete" },
  finance: { filled: 0, total: 12, status: "pending" },
}

export default function UDISEExportPage() {
  const [selectedYear, setSelectedYear] = useState("2024-25")
  const [selectedSections, setSelectedSections] = useState<string[]>(["school", "students", "teachers"])
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsExporting(false)
    setExportComplete(true)
  }

  const overallProgress = Math.round(
    Object.values(mockDataStatus).reduce((sum, section) => sum + section.filled, 0) /
    Object.values(mockDataStatus).reduce((sum, section) => sum + section.total, 0) * 100
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">UDISE+ Export</h1>
              <p className="text-gray-600">Generate government-mandated UDISE+ data exports</p>
            </div>
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
              <FileSpreadsheet className="w-8 h-8 text-indigo-500" />
              <span className="text-3xl font-bold text-gray-900">{overallProgress}%</span>
            </div>
            <p className="text-gray-600 text-sm">Data Completion</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span className="text-3xl font-bold text-gray-900">
                {Object.values(mockDataStatus).filter((s) => s.status === "complete").length}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Complete Sections</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <span className="text-3xl font-bold text-gray-900">
                {Object.values(mockDataStatus).filter((s) => s.status === "partial").length}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Partial Sections</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <Database className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold text-gray-900">{120}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Data Fields</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Sections */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-600" />
              Data Sections
            </h2>

            <div className="space-y-4">
              {udiseSections.map((section) => {
                const Icon = section.icon
                const status = mockDataStatus[section.id as keyof typeof mockDataStatus]
                const isSelected = selectedSections.includes(section.id)
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => handleSectionToggle(section.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isSelected ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{section.name}</h3>
                          {section.required && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Required</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">{status.filled}/{status.total} fields</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            status.status === "complete" ? "bg-emerald-100 text-emerald-700" :
                            status.status === "partial" ? "bg-amber-100 text-amber-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {status.status}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                status.status === "complete" ? "bg-emerald-500" :
                                status.status === "partial" ? "bg-amber-500" :
                                "bg-gray-400"
                              }`}
                              style={{ width: `${(status.filled / status.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Export Configuration */}
          <div className="space-y-6">
            {/* Academic Year Selection */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-600" />
                Export Configuration
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                  <option value="2022-23">2022-23</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg text-left">
                    <FileSpreadsheet className="w-6 h-6 text-indigo-600 mb-2" />
                    <p className="font-medium text-gray-900">Excel (XLSX)</p>
                    <p className="text-xs text-gray-500">Recommended format</p>
                  </button>
                  <button className="p-4 border-2 border-gray-200 hover:border-indigo-300 rounded-lg text-left">
                    <Database className="w-6 h-6 text-gray-600 mb-2" />
                    <p className="font-medium text-gray-900">CSV</p>
                    <p className="text-xs text-gray-500">Comma separated</p>
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600" defaultChecked />
                  <span className="text-sm text-gray-700">Include validation report</span>
                </label>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm text-gray-700">Include previous year comparison</span>
                </label>
              </div>
            </div>

            {/* Export Actions */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Export Actions</h2>

              {!exportComplete ? (
                <button
                  onClick={handleExport}
                  disabled={isExporting || selectedSections.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating Export...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Export UDISE+ Data
                    </>
                  )}
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Export Complete!</h3>
                  <p className="text-gray-600 mb-6">Your UDISE+ data has been exported successfully.</p>
                  <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download File
                    </button>
                    <button
                      onClick={() => setExportComplete(false)}
                      className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                    >
                      New Export
                    </button>
                  </div>
                </motion.div>
              )}

              {selectedSections.length === 0 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Select at least one section to export
                </p>
              )}
            </div>

            {/* Upload to Portal */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-6 h-6 text-indigo-600" />
                Upload to UDISE+ Portal
              </h2>
              <div className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-xl p-6 text-center">
                <Upload className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                <p className="font-medium text-gray-900 mb-2">Upload to Government Portal</p>
                <p className="text-sm text-gray-600 mb-4">
                  After export, upload the file to the official UDISE+ portal
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 mx-auto">
                  <ArrowRight className="w-4 h-4" />
                  Go to UDISE+ Portal
                </button>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-indigo-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About UDISE+</h3>
                  <p className="text-sm text-gray-600">
                    UDISE+ (Unified District Information System for Education Plus) is a government-mandated data collection system. 
                    All schools in India must submit annual data including student enrollment, teacher details, infrastructure, and academic performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
