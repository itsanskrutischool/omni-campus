"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CreditCard, Smartphone, CheckCircle2, AlertTriangle, Lock,
  ArrowRight, ArrowLeft, Calendar, Receipt, Download,
  Shield, Clock, Info, AlertCircle, Copy, RefreshCw
} from "lucide-react"

const mockFeeRecord = {
  id: "FR-001",
  studentName: "Aman Kumar",
  admissionNumber: "ADM-2024-001",
  classRoom: "10-A",
  academicYear: "2024-25",
  feeStructure: "Annual Fee Package",
  totalAmount: 125000,
  paidAmount: 75000,
  pendingAmount: 50000,
  dueDate: "2026-04-30",
  installments: [
    { id: "INST-1", name: "Term 1", amount: 62500, dueDate: "2024-04-30", status: "PAID", paidDate: "2024-04-15" },
    { id: "INST-2", name: "Term 2", amount: 62500, dueDate: "2026-04-30", status: "PENDING", paidDate: null },
  ],
  waiver: 0,
  waiverRemarks: "",
}

const paymentMethods = [
  { id: "razorpay", name: "Razorpay", icon: CreditCard, description: "Pay using UPI, Cards, Net Banking" },
  { id: "upi", name: "UPI", icon: Smartphone, description: "Pay using any UPI app" },
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, RuPay" },
]

export default function PaymentCheckoutPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedMethod, setSelectedMethod] = useState("razorpay")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentId, setPaymentId] = useState("")

  const handleNext = () => {
    if (step < 4) setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)
  }

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setPaymentSuccess(true)
    setPaymentId(`PAY-${Date.now()}`)
    setStep(4)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fee Payment</h1>
              <p className="text-gray-600">Secure online payment gateway</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`flex flex-col items-center ${s <= step ? "text-emerald-600" : "text-gray-400"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    s < step ? "bg-emerald-500 text-white" : s === step ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                  }`}>
                    {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                  </div>
                  <span className="text-xs mt-2 font-medium">
                    {s === 1 ? "Review" : s === 2 ? "Method" : s === 3 ? "Pay" : "Confirm"}
                  </span>
                </div>
                {s < 4 && (
                  <div className={`w-24 h-1 mx-2 ${s < step ? "bg-emerald-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Fee Details</h2>
                
                {/* Student Info */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Student Name</label>
                      <p className="font-semibold text-gray-900">{mockFeeRecord.studentName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Admission Number</label>
                      <p className="font-semibold text-gray-900">{mockFeeRecord.admissionNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Class</label>
                      <p className="font-semibold text-gray-900">{mockFeeRecord.classRoom}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Academic Year</label>
                      <p className="font-semibold text-gray-900">{mockFeeRecord.academicYear}</p>
                    </div>
                  </div>
                </div>

                {/* Fee Summary */}
                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold text-gray-900">Fee Structure</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Fee Structure</span>
                      <span className="font-medium text-gray-900">{mockFeeRecord.feeStructure}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-medium text-gray-900">₹{mockFeeRecord.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Paid Amount</span>
                      <span className="font-medium text-emerald-600">₹{mockFeeRecord.paidAmount.toLocaleString()}</span>
                    </div>
                    {mockFeeRecord.waiver > 0 && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Waiver</span>
                        <span className="font-medium text-amber-600">-₹{mockFeeRecord.waiver.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Pending Amount</span>
                        <span className="font-bold text-emerald-600 text-xl">₹{mockFeeRecord.pendingAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Installments */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Installment Status</h3>
                  <div className="space-y-3">
                    {mockFeeRecord.installments.map((inst) => (
                      <div key={inst.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              inst.status === "PAID" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                            }`}>
                              {inst.status === "PAID" ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{inst.name}</p>
                              <p className="text-sm text-gray-500">Due: {inst.dueDate}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">₹{inst.amount.toLocaleString()}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              inst.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {inst.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Due Date Warning */}
                <div className={`p-4 rounded-xl mb-6 ${
                  new Date(mockFeeRecord.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    ? "bg-red-50 border border-red-200"
                    : "bg-amber-50 border border-amber-200"
                }`}>
                  <div className="flex items-start gap-3">
                    {new Date(mockFeeRecord.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">Due Date: {mockFeeRecord.dueDate}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(mockFeeRecord.dueDate) < new Date()
                          ? "Payment is overdue. Please pay immediately to avoid late fees."
                          : new Date(mockFeeRecord.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                          ? "Payment is due soon. Complete payment to avoid late fees."
                          : "Payment is due on this date."}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
                >
                  Continue to Payment
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Payment Method</h2>
                
                <div className="space-y-4 mb-6">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full p-6 rounded-xl border-2 transition-all ${
                          selectedMethod === method.id
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${
                            selectedMethod === method.id ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600"
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedMethod === method.id ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                          }`}>
                            {selectedMethod === method.id && <div className="w-3 h-3 bg-white rounded-full" />}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Payment Amount */}
                <div className="bg-emerald-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Amount to Pay</span>
                    <span className="text-3xl font-bold text-emerald-600">₹{mockFeeRecord.pendingAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Secure Payment</p>
                      <p className="text-sm text-gray-600">
                        Your payment is secured with 256-bit SSL encryption. We do not store your card details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleBack}
                    className="flex-1 py-4 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 flex items-center justify-center gap-2"
                  >
                    Proceed
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Payment</h2>
                
                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium text-gray-900">{paymentMethods.find((m) => m.id === selectedMethod)?.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Fee Record</span>
                    <span className="font-medium text-gray-900">{mockFeeRecord.id}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total Amount</span>
                      <span className="font-bold text-emerald-600 text-xl">₹{mockFeeRecord.pendingAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Razorpay Placeholder */}
                {selectedMethod === "razorpay" && (
                  <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-xl p-8 mb-6 text-center">
                    <CreditCard className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                    <p className="font-semibold text-gray-900 mb-2">Razorpay Payment Gateway</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Click below to open Razorpay secure payment window
                    </p>
                    <div className="bg-white rounded-lg p-4 inline-block">
                      <p className="text-xs text-gray-500 mb-2">Test Mode</p>
                      <p className="text-sm font-mono text-gray-700">rzp_test_mock</p>
                    </div>
                  </div>
                )}

                {/* UPI Placeholder */}
                {selectedMethod === "upi" && (
                  <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-xl p-8 mb-6 text-center">
                    <Smartphone className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                    <p className="font-semibold text-gray-900 mb-2">UPI Payment</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Scan QR code or use UPI app to pay
                    </p>
                    <div className="bg-white rounded-lg p-4 inline-block">
                      <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Smartphone className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500">QR Code Placeholder</p>
                    </div>
                  </div>
                )}

                {/* Card Placeholder */}
                {selectedMethod === "card" && (
                  <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-xl p-8 mb-6">
                    <CreditCard className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                    <p className="font-semibold text-gray-900 mb-2">Card Payment</p>
                    <p className="text-sm text-gray-600 mb-4">Enter your card details below</p>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Card Number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handleBack}
                    disabled={isProcessing}
                    className="flex-1 py-4 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Pay ₹{mockFeeRecord.pendingAmount.toLocaleString()}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-8">Your fee payment has been completed successfully.</p>

                <div className="bg-emerald-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Payment ID</span>
                    <span className="font-medium text-gray-900">{paymentId}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-bold text-emerald-600">₹{mockFeeRecord.pendingAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Payment Date</span>
                    <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium text-gray-900">{paymentMethods.find((m) => m.id === selectedMethod)?.name}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 max-w-md mx-auto">
                  <button className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Download Receipt
                  </button>
                  <button className="w-full py-4 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2">
                    <Copy className="w-5 h-5" />
                    Copy Payment ID
                  </button>
                  <button className="w-full py-4 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    Return to Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Security */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>PCI DSS Compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <Info className="w-4 h-4" />
              <span>Razorpay Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
