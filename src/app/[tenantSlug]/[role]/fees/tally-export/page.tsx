"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, FileText, Calendar, CheckCircle2, XCircle } from "lucide-react"

export default function TallyExportPage() {
  const [exportType, setExportType] = useState<"fee-transactions" | "vouchers" | "all">("fee-transactions")
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<any>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setExportResult(null)

    // Simulate export process
    setTimeout(() => {
      setExportResult({
        success: true,
        filename: `tally_${exportType}_${new Date().toISOString().split('T')[0]}.xml`,
        recordCount: Math.floor(Math.random() * 100) + 10,
      })
      setIsExporting(false)
    }, 2000)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tally XML Export</h1>
          <p className="text-gray-600 mt-1">Export financial data to Tally-compatible XML format</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Export Type</label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="fee-transactions">Fee Transactions</option>
              <option value="vouchers">Vouchers</option>
              <option value="all">All Financial Data</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export to Tally XML
              </>
            )}
          </button>
        </div>
      </motion.div>

      {exportResult && exportResult.success && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900">Export Successful</h3>
              <div className="mt-2 space-y-1 text-sm text-green-800">
                <p>File: {exportResult.filename}</p>
                <p>Records exported: {exportResult.recordCount}</p>
              </div>
              <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Download XML File
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Information</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Fee Transactions</h4>
              <p className="text-sm text-gray-600 mt-1">Export all fee payment transactions with student details, fee types, and payment methods</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-full">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Vouchers</h4>
              <p className="text-sm text-gray-600 mt-1">Export petty cash vouchers, receipts, payments, and journal entries</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-full">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Complete Export</h4>
              <p className="text-sm text-gray-600 mt-1">Export all financial data including ledgers, vouchers, and transactions in one file</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Tally XML Format</h4>
          <p className="text-sm text-blue-800">
            The exported XML files are compatible with Tally Prime and Tally.ERP 9. Import the XML file through 
            <span className="font-medium"> Gateway of Tally → Import Data → Import of XML Data</span>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
