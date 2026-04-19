"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield, ShieldCheck, ShieldAlert, KeyRound, Search,
  UserCheck, Clock, Phone, User, Baby, AlertTriangle,
  CheckCircle2, XCircle, Plus, Hash, Timer,
  ChevronDown, Filter, RefreshCw, DoorOpen, DoorClosed,
  Eye, EyeOff, Fingerprint, Bell
} from "lucide-react"

// ─── Mock Data ──────────────────────────────────

const mockGatePasses = [
  { id: "gp-1", studentName: "Aman Kumar", parentName: "Mr. Rajesh Kumar", parentPhone: "+91-9876543210", otp: "482916", otpExpiresAt: new Date(Date.now() + 8 * 60000).toISOString(), reason: "Medical Appointment", status: "REQUESTED", requestedAt: new Date().toISOString(), classRoom: "10-A" },
  { id: "gp-2", studentName: "Priya Sharma", parentName: "Mrs. Meena Sharma", parentPhone: "+91-9876541234", otp: "731204", otpExpiresAt: new Date(Date.now() + 3 * 60000).toISOString(), reason: "Family Emergency", status: "REQUESTED", requestedAt: new Date(Date.now() - 5 * 60000).toISOString(), classRoom: "8-B" },
  { id: "gp-3", studentName: "Arjun Reddy", parentName: "Mr. Venkat Reddy", parentPhone: "+91-9876549876", otp: "159374", otpExpiresAt: new Date(Date.now() - 2 * 60000).toISOString(), reason: "Early Pickup", status: "EXPIRED", requestedAt: new Date(Date.now() - 15 * 60000).toISOString(), classRoom: "6-C" },
  { id: "gp-4", studentName: "Neha Patel", parentName: "Mrs. Sunita Patel", parentPhone: "+91-9876545678", otp: "824617", otpExpiresAt: new Date(Date.now() - 30 * 60000).toISOString(), reason: "Doctor Visit", status: "VERIFIED", requestedAt: new Date(Date.now() - 45 * 60000).toISOString(), verifiedAt: new Date(Date.now() - 30 * 60000).toISOString(), verifiedBy: "Guard - Ramesh", classRoom: "9-A" },
  { id: "gp-5", studentName: "Rohit Singh", parentName: "Mr. Ajay Singh", parentPhone: "+91-9876547890", otp: "567823", otpExpiresAt: new Date(Date.now() - 60 * 60000).toISOString(), reason: "Bus Missed", status: "VERIFIED", requestedAt: new Date(Date.now() - 120 * 60000).toISOString(), verifiedAt: new Date(Date.now() - 60 * 60000).toISOString(), verifiedBy: "Guard - Suresh", classRoom: "7-B" },
]

const mockVisitors = [
  { id: "v-1", name: "Mr. Deepak Verma", phone: "+91-9812345678", purpose: "PARENT_MEETING", personToMeet: "Mrs. Sharma (Class Teacher)", badge: "V-001", checkIn: new Date().toISOString(), status: "CHECKED_IN" },
  { id: "v-2", name: "Sunita Enterprises", phone: "+91-9898765432", purpose: "VENDOR", personToMeet: "Mr. Gupta (Admin)", badge: "V-002", checkIn: new Date(Date.now() - 30 * 60000).toISOString(), status: "CHECKED_IN" },
  { id: "v-3", name: "Mr. Rahul Tiwari", phone: "+91-9856781234", purpose: "INTERVIEW", personToMeet: "Principal", badge: "V-003", checkIn: new Date(Date.now() - 120 * 60000).toISOString(), checkOut: new Date(Date.now() - 60 * 60000).toISOString(), status: "CHECKED_OUT" },
]

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  REQUESTED: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Timer },
  VERIFIED: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  EXPIRED: { color: "text-red-700", bg: "bg-red-50 border-red-200", icon: XCircle },
  CANCELLED: { color: "text-gray-700", bg: "bg-gray-50 border-gray-200", icon: XCircle },
}

export default function SafetyPage() {
  const [activeTab, setActiveTab] = useState<"gatepass" | "visitors">("gatepass")
  const [otpInput, setOtpInput] = useState(["", "", "", "", "", ""])
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showNewGatePass, setShowNewGatePass] = useState(false)
  const [showNewVisitor, setShowNewVisitor] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Stats
  const stats = {
    pending: mockGatePasses.filter((g) => g.status === "REQUESTED").length,
    verified: mockGatePasses.filter((g) => g.status === "VERIFIED").length,
    expired: mockGatePasses.filter((g) => g.status === "EXPIRED").length,
    visitorsInCampus: mockVisitors.filter((v) => v.status === "CHECKED_IN").length,
  }

  const handleOtpChange = (idx: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otpInput]
    newOtp[idx] = value
    setOtpInput(newOtp)

    // Auto-focus next
    if (value && idx < 5) {
      otpRefs.current[idx + 1]?.focus()
    }

    // Auto-verify on complete
    if (value && idx === 5 && newOtp.every((d) => d)) {
      const fullOtp = newOtp.join("")
      const match = mockGatePasses.find((g) => g.otp === fullOtp && g.status === "REQUESTED")
      if (match) {
        setVerifyResult({ success: true, message: `✅ Verified! ${match.studentName} (${match.classRoom}) may exit. Parent: ${match.parentName}` })
      } else {
        setVerifyResult({ success: false, message: "❌ Invalid OTP. No matching gate pass found or OTP has expired." })
      }
    }
  }

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpInput[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  const resetOtp = () => {
    setOtpInput(["", "", "", "", "", ""])
    setVerifyResult(null)
    otpRefs.current[0]?.focus()
  }

  const formatTime = (date: string) => new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })

  const getRemainingTime = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return "Expired"
    const mins = Math.floor(diff / 60000)
    const secs = Math.floor((diff % 60000) / 1000)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Safety & Security</h1>
            <p className="text-sm text-gray-500">Gate pass verification, visitor management & campus security</p>
          </div>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Pending Gate Passes", value: stats.pending, icon: Timer, gradient: "from-amber-500 to-orange-500", pulse: stats.pending > 0 },
          { label: "Verified Today", value: stats.verified, icon: ShieldCheck, gradient: "from-emerald-500 to-teal-500" },
          { label: "Expired", value: stats.expired, icon: ShieldAlert, gradient: "from-red-500 to-pink-500" },
          { label: "Visitors In Campus", value: stats.visitorsInCampus, icon: User, gradient: "from-blue-500 to-indigo-500" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden"
          >
            {stat.pulse && <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />}
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ─── OTP Verification (Guard Console) ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <Fingerprint className="w-7 h-7 text-emerald-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Gate OTP Verification</h2>
            <p className="text-sm text-slate-400">Enter the 6-digit OTP provided by the parent</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* OTP Input Fields */}
          <div className="flex gap-3">
            {otpInput.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { otpRefs.current[idx] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className={`w-14 h-16 rounded-xl text-center text-2xl font-bold border-2 transition-all focus:outline-none ${
                  verifyResult
                    ? verifyResult.success
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-red-500 bg-red-500/10 text-red-400"
                    : "border-slate-600 bg-slate-800 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                }`}
              />
            ))}
          </div>

          {/* Result */}
          <AnimatePresence mode="wait">
            {verifyResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-lg p-4 rounded-xl border ${
                  verifyResult.success
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  {verifyResult.success ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm font-medium ${verifyResult.success ? "text-emerald-300" : "text-red-300"}`}>
                    {verifyResult.message}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reset Button */}
          <button
            onClick={resetOtp}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            Clear & Scan Next
          </button>
        </div>
      </motion.div>

      {/* ─── Tab Navigation ─── */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { id: "gatepass" as const, label: "Gate Passes", icon: KeyRound },
          { id: "visitors" as const, label: "Visitor Log", icon: DoorOpen },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Gate Pass Tab ─── */}
      {activeTab === "gatepass" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {["All", "REQUESTED", "VERIFIED", "EXPIRED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s === "All" ? null : s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    (s === "All" && !statusFilter) || statusFilter === s
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowNewGatePass(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Gate Pass
            </button>
          </div>

          <div className="grid gap-3">
            {mockGatePasses
              .filter((g) => !statusFilter || g.status === statusFilter)
              .map((gp, i) => {
                const config = statusConfig[gp.status]
                const StatusIcon = config.icon
                const timeLeft = gp.status === "REQUESTED" ? getRemainingTime(gp.otpExpiresAt) : null

                return (
                  <motion.div
                    key={gp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition ${
                      gp.status === "REQUESTED" ? "border-amber-200 ring-1 ring-amber-100" : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          gp.status === "REQUESTED"
                            ? "bg-amber-100"
                            : gp.status === "VERIFIED"
                              ? "bg-emerald-100"
                              : "bg-red-100"
                        }`}>
                          <Baby className={`w-6 h-6 ${
                            gp.status === "REQUESTED"
                              ? "text-amber-600"
                              : gp.status === "VERIFIED"
                                ? "text-emerald-600"
                                : "text-red-600"
                          }`} />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{gp.studentName}</span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">Class {gp.classRoom}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            <span className="font-medium text-gray-700">{gp.parentName}</span> · {gp.parentPhone}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Reason: {gp.reason}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* OTP Display (for pending) */}
                        {gp.status === "REQUESTED" && (
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <Hash className="w-3 h-3 text-gray-400" />
                              <span className="text-lg font-mono font-bold text-indigo-600 tracking-widest">{gp.otp}</span>
                            </div>
                            <div className={`flex items-center gap-1 text-xs ${
                              timeLeft === "Expired" ? "text-red-600" : "text-amber-600"
                            }`}>
                              <Timer className="w-3 h-3" />
                              <span>{timeLeft}</span>
                            </div>
                          </div>
                        )}

                        {/* Verified info */}
                        {gp.status === "VERIFIED" && (
                          <div className="text-right text-xs text-gray-500">
                            <div>Verified by: <span className="font-medium text-gray-700">{(gp as any).verifiedBy}</span></div>
                            <div>At: {formatTime((gp as any).verifiedAt)}</div>
                          </div>
                        )}

                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${config.bg} ${config.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {gp.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
          </div>
        </div>
      )}

      {/* ─── Visitors Tab ─── */}
      {activeTab === "visitors" && (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <button
              onClick={() => setShowNewVisitor(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Check In Visitor
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Badge</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Visitor</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Purpose</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Meeting</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Check In</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockVisitors.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold">{v.badge}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-gray-900">{v.name}</div>
                      <div className="text-xs text-gray-500">{v.phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-700 capitalize">{v.purpose.toLowerCase().replace("_", " ")}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{v.personToMeet}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatTime(v.checkIn)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        v.status === "CHECKED_IN"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}>
                        {v.status === "CHECKED_IN" ? <DoorOpen className="w-3 h-3" /> : <DoorClosed className="w-3 h-3" />}
                        {v.status === "CHECKED_IN" ? "In Campus" : "Checked Out"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {v.status === "CHECKED_IN" && (
                        <button className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition border border-red-200">
                          Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── New Gate Pass Modal ─── */}
      <AnimatePresence>
        {showNewGatePass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewGatePass(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Request Gate Pass</h3>
                  <p className="text-xs text-gray-500">Generate OTP for parent pickup</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Student Name / Admission No.</label>
                  <input type="text" placeholder="Search student..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Name</label>
                  <input type="text" placeholder="Enter parent name" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Phone</label>
                  <input type="tel" placeholder="+91-9876543210" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
                  <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white">
                    <option>Early Pickup</option>
                    <option>Medical Appointment</option>
                    <option>Family Emergency</option>
                    <option>Bus Missed</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setShowNewGatePass(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowNewGatePass(false)}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
                >
                  Generate OTP
                </button>
              </div>

              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-2">
                  <Bell className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    OTP will be valid for 10 minutes. In production, it will be sent via SMS to the parent&apos;s phone.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── New Visitor Modal ─── */}
      <AnimatePresence>
        {showNewVisitor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewVisitor(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <DoorOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Check In Visitor</h3>
                  <p className="text-xs text-gray-500">Register a new visitor</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Visitor Name</label>
                  <input type="text" placeholder="Full name" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input type="tel" placeholder="+91-XXXXXXXXXX" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose</label>
                  <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white">
                    <option value="PARENT_MEETING">Parent Meeting</option>
                    <option value="VENDOR">Vendor / Delivery</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="INSPECTION">Inspection</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Person to Meet</label>
                  <input type="text" placeholder="Name & Designation" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Type</label>
                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white">
                      <option>Aadhaar</option>
                      <option>Driving License</option>
                      <option>Voter ID</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Number</label>
                    <input type="text" placeholder="ID number" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setShowNewVisitor(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowNewVisitor(false)}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                >
                  Check In & Print Badge
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
