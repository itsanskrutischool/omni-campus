"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Award, FileText, Download, Search, Filter, RefreshCw, Eye,
  Printer, Share2, CheckCircle2, AlertTriangle, Calendar, User,
  School, GraduationCap, Trophy, Medal, Star, ArrowRight, Settings
} from "lucide-react"

const certificateTypes = [
  { id: "bonafide", name: "Bonafide Certificate", icon: FileText, description: "Proof of enrollment" },
  { id: "transfer", name: "Transfer Certificate", icon: School, description: "For school transfer" },
  { id: "conduct", name: "Conduct Certificate", icon: Award, description: "Character certificate" },
  { id: "migration", name: "Migration Certificate", icon: GraduationCap, description: "For higher education" },
  { id: "attendance", name: "Attendance Certificate", icon: Calendar, description: "Attendance proof" },
  { id: "achievement", name: "Achievement Certificate", icon: Trophy, description: "Awards & recognition" },
  { id: "sports", name: "Sports Certificate", icon: Medal, description: "Sports achievements" },
  { id: "extracurricular", name: "Extracurricular Certificate", icon: Star, description: "Activities participation" },
]

const mockCertificates = [
  {
    id: "cert-1",
    studentId: "STU-001",
    studentName: "Aman Kumar",
    admissionNumber: "ADM-2024-001",
    type: "bonafide",
    issuedDate: "2026-04-19",
    validUntil: "2026-10-19",
    status: "ISSUED",
    issuedBy: "Principal",
  },
  {
    id: "cert-2",
    studentId: "STU-002",
    studentName: "Priya Sharma",
    admissionNumber: "ADM-2024-002",
    type: "transfer",
    issuedDate: "2026-04-15",
    validUntil: null,
    status: "ISSUED",
    issuedBy: "Principal",
  },
  {
    id: "cert-3",
    studentId: "STU-003",
    studentName: "Arjun Reddy",
    admissionNumber: "ADM-2024-003",
    type: "conduct",
    issuedDate: null,
    validUntil: null,
    status: "PENDING",
    issuedBy: null,
  },
]

export default function CertificatesGeneratorPage() {
  const [activeTab, setActiveTab] = useState<"generate" | "history">("generate")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [previewCertificate, setPreviewCertificate] = useState(false)

  const filteredCertificates = mockCertificates.filter((cert) => {
    const matchesSearch = cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !typeFilter || cert.type === typeFilter
    const matchesStatus = !statusFilter || cert.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const handleGenerate = async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsGenerating(false)
    setPreviewCertificate(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Certificates Generator</h1>
                <p className="text-gray-600">Generate and manage student certificates</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all flex items-center gap-2">
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
              <FileText className="w-8 h-8 text-amber-500" />
              <span className="text-3xl font-bold text-gray-900">{mockCertificates.length}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Certificates</p>
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
                {mockCertificates.filter((c) => c.status === "ISSUED").length}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Issued</p>
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
                {mockCertificates.filter((c) => c.status === "PENDING").length}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Pending</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <GraduationCap className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold text-gray-900">{certificateTypes.length}</span>
            </div>
            <p className="text-gray-600 text-sm">Certificate Types</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("generate")}
              className={`flex-1 px-6 py-4 flex items-center gap-2 font-medium transition-colors ${
                activeTab === "generate"
                  ? "bg-amber-50 text-amber-700 border-b-2 border-amber-500"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Award className="w-5 h-5" />
              Generate Certificate
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 px-6 py-4 flex items-center gap-2 font-medium transition-colors ${
                activeTab === "history"
                  ? "bg-amber-50 text-amber-700 border-b-2 border-amber-500"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FileText className="w-5 h-5" />
              Certificate History
            </button>
          </div>

          {/* Content */}
          {activeTab === "generate" ? (
            <div className="p-6">
              {/* Certificate Types */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Certificate Type</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {certificateTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          selectedType === type.id
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-200 hover:border-amber-300"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center ${
                          selectedType === type.id ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600"
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <p className="font-medium text-gray-900 text-center">{type.name}</p>
                        <p className="text-xs text-gray-500 text-center mt-1">{type.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Student Selection */}
              {selectedType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Student</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["Aman Kumar", "Priya Sharma", "Arjun Reddy", "Neha Patel", "Rohit Singh", "Sneha Gupta"].map((student) => (
                      <button
                        key={student}
                        onClick={() => setSelectedStudent(student)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedStudent === student
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-200 hover:border-amber-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            selectedStudent === student ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600"
                          }`}>
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student}</p>
                            <p className="text-xs text-gray-500">Class 10-A</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Generate Button */}
              {selectedType && selectedStudent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Award className="w-5 h-5" />
                        Generate Certificate
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="p-6">
              {/* Filters */}
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search certificates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={typeFilter || ""}
                  onChange={(e) => setTypeFilter(e.target.value || null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Types</option>
                  {certificateTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                <select
                  value={statusFilter || ""}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Status</option>
                  <option value="ISSUED">Issued</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              {/* Certificate List */}
              <div className="space-y-3">
                {filteredCertificates.map((cert) => {
                  const type = certificateTypes.find((t) => t.id === cert.type)
                  const TypeIcon = type?.icon
                  return (
                    <motion.div
                      key={cert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            cert.status === "ISSUED" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                          }`}>
                            {TypeIcon && <TypeIcon className="w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{cert.studentName}</h3>
                            <p className="text-sm text-gray-600">{cert.admissionNumber}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-gray-500">{type?.name}</span>
                              {cert.issuedDate && (
                                <span className="text-gray-500">Issued: {cert.issuedDate}</span>
                              )}
                              {cert.validUntil && (
                                <span className="text-gray-500">Valid until: {cert.validUntil}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            cert.status === "ISSUED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {cert.status}
                          </span>
                          {cert.status === "ISSUED" && (
                            <>
                              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="View">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Download">
                                <Download className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Print">
                                <Printer className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Share">
                                <Share2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setPreviewCertificate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Certificate Preview</h2>
                <button
                  onClick={() => setPreviewCertificate(false)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {/* Certificate Preview */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-4 border-amber-300 rounded-lg p-8 mb-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Bonafide Certificate</h1>
                  <p className="text-gray-600">This is to certify that</p>
                </div>

                <div className="text-center mb-8">
                  <p className="text-2xl font-bold text-gray-900 mb-2">{selectedStudent}</p>
                  <p className="text-gray-600">Admission Number: ADM-2024-001</p>
                  <p className="text-gray-600">Class: 10-A | Academic Year: 2024-25</p>
                </div>

                <div className="text-center mb-8">
                  <p className="text-gray-700 leading-relaxed">
                    is a bonafide student of this institution. This certificate is issued for the purpose of 
                    official documentation and verification.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-12">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Date of Issue</p>
                    <p className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-2">Principal Signature</p>
                    <div className="border-b-2 border-gray-400 w-48 ml-auto" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setPreviewCertificate(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
