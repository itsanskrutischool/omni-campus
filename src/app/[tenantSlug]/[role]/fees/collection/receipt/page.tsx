"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Printer, ShieldCheck, IndianRupee, QrCode, FileCheck2, Building2, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function FeeReceiptPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string
  const recordId = searchParams.get("recordId")
  const transactionId = searchParams.get("transactionId")

  const [record, setRecord] = useState<any>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (recordId) {
      fetch(`/api/fees/records?query=${recordId}`)
        .then(r => r.json())
        .then(data => {
          // Find the specific record in the student's ledger
          const found = data.records?.find((r: any) => r.id === recordId)
          if (found) {
            setRecord({ ...found, student: data.student })

            // Find specific transaction if requested
            if (transactionId) {
              const tx = found.transactions?.find((t: any) => t.id === transactionId)
              if (tx) setSelectedTransaction(tx)
            } else if (found.transactions?.length > 0) {
              // Default to most recent transaction if none specified
              setSelectedTransaction(found.transactions[0])
            }
          }
          setLoading(false)
        })
    }
  }, [recordId, transactionId])

  const handlePrint = () => window.print()

  const handleDownloadPDF = async () => {
    try {
      const url = `/api/fees/receipt/pdf?recordId=${recordId}${transactionId ? `&transactionId=${transactionId}` : ""}`
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to generate PDF")

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `Receipt-${selectedTransaction?.receiptNumber || recordId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error("PDF Download Error:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="w-12 h-12 border-4 border-emerald-900/10 border-t-emerald-900 rounded-full animate-spin" />
      <div className="text-center font-black uppercase tracking-widest text-emerald-900/40 text-xs">Securing Ledger Data...</div>
    </div>
  )

  if (!record) return (
    <div className="p-20 text-center space-y-4">
      <h2 className="text-2xl font-black uppercase text-rose-600">Secure Ledger Error</h2>
      <p className="text-muted-foreground">Transaction ID not found or unauthorized.</p>
      <Button onClick={() => router.back()} className="rounded-2xl h-12 px-8 font-bold uppercase tracking-widest text-xs">Return to POS</Button>
    </div>
  )

  const copies = ["Office Copy", "Guardian Copy", "Student Copy"]

  return (
    <div className="space-y-12 animate-in fade-in duration-700 min-h-screen pb-20">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * { visibility: hidden; }
          #receipt-stack, #receipt-stack * { visibility: visible; }
          #receipt-stack {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 40px;
          }
          .receipt-copy {
            page-break-after: always;
            border-bottom: 2px dashed #000 !important;
          }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="flex items-center justify-between no-print max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-emerald-950">Receipt Terminal</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              GST Compliant Fiscal Token
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleDownloadPDF} variant="outline" className="gap-2 font-bold rounded-2xl h-12 px-8 border-emerald-900/20 text-emerald-900 hover:bg-emerald-50">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button onClick={handlePrint} className="bg-emerald-900 hover:bg-black gap-2 font-bold rounded-2xl h-12 px-8 shadow-xl shadow-emerald-900/20 translate-y-[-2px] active:translate-y-0 transition-all">
            <Printer className="w-4 h-4" />
            Authorize Print Execution
          </Button>
        </div>
      </div>

      <div id="receipt-stack" className="space-y-12 flex flex-col items-center">
        {copies.map((copyType, idx) => (
          <div key={copyType} className="receipt-copy bg-white text-black p-10 w-full max-w-[210mm] border-2 border-emerald-900/5 relative shadow-2xl print:shadow-none print:border-none rounded-[2.5rem] print:rounded-none overflow-hidden">

            {/* Background Texture for Authenticity */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none flex items-center justify-center">
              <Building2 className="w-[400px] h-[400px] text-emerald-900" />
            </div>

            {/* Receipt Header */}
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-emerald-900 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">St. Xavier&apos;s International</h2>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">Affiliated to CBSE, New Delhi · School Code: 60112</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">UDISE: 09012345678 · Campus: Main City Civil Lines</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-emerald-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/10 mb-2">
                  {copyType}
                </div>
                <p className="text-[10px] font-black text-gray-300 uppercase leading-none">Receipt No</p>
                <p className="text-sm font-black text-emerald-900"># {selectedTransaction?.receiptNumber || record.receiptNumber || `TEMP-${record.id.slice(-6).toUpperCase()}`}</p>
              </div>
            </div>

            <div className="h-[2px] bg-gradient-to-r from-transparent via-emerald-900/10 to-transparent w-full mb-8" />

            {/* Fiscal Details Grid */}
            <div className="grid grid-cols-2 gap-12 mb-10 relative z-10">
              <div className="space-y-4">
                <div>
                  <label className="text-[8px] font-black uppercase text-emerald-900/40 tracking-[0.2em] block mb-1">Payer Identity</label>
                  <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-900/5">
                    <p className="text-base font-black uppercase text-emerald-950">{record.student.firstName} {record.student.lastName}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[9px] font-bold text-emerald-900/50">ADM: <span className="text-emerald-900">{record.student.admissionNumber}</span></span>
                      <span className="text-[9px] font-bold text-emerald-900/50">CLASS: <span className="text-emerald-900">X-A</span></span>
                    </div>
                  </div>
                </div>
                <div className="px-1">
                  <label className="text-[8px] font-black uppercase text-emerald-900/40 tracking-[0.2em] block mb-1 italic">Father/Guardian Name</label>
                  <p className="text-sm font-black text-emerald-950 uppercase">{record.student.fatherName || "UNSPECIFIED"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[8px] font-black uppercase text-emerald-900/40 tracking-[0.2em] block mb-1">Payment ID</label>
                    <p className="text-xs font-black text-emerald-950 uppercase">{record.id.slice(0, 12)}</p>
                  </div>
                  <div>
                    <label className="text-[8px] font-black uppercase text-emerald-900/40 tracking-[0.2em] block mb-1">Issue Date</label>
                    <p className="text-xs font-black text-emerald-950 uppercase">{new Date(selectedTransaction?.date || record.paidDate || Date.now()).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <label className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em] block mb-1">Payment Modality</label>
                    <p className="text-sm font-black text-emerald-900 uppercase italic">{selectedTransaction?.method || record.paymentMethod || "CASH"}</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-200">
                    <QrCode className="w-8 h-8 text-black opacity-20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Table */}
            <div className="mb-10 relative z-10">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="text-[8px] font-black uppercase text-emerald-900/40 tracking-[0.2em] pb-4 pl-4">Service Description</th>
                    <th className="text-[8px] font-black uppercase text-emerald-900/40 tracking-[0.2em] pb-4 text-right pr-4">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="bg-emerald-50/20 rounded-[2rem]">
                  <tr className="border-b border-white">
                    <td className="p-4 font-bold text-emerald-950">
                      <span className="block text-sm leading-none mb-1">{record.feeStructure.name}</span>
                      <span className="text-[9px] text-emerald-900/40 uppercase font-black">{selectedTransaction ? 'Partial Payment Execution' : 'Tuition & Academic Access'} · Term 1</span>
                    </td>
                    <td className="p-4 text-right font-black text-emerald-950">₹{(selectedTransaction?.amount || record.amountPaid).toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td className="p-4 text-right pt-6">
                      <span className="text-[10px] font-black uppercase text-emerald-900/40 tracking-[0.2em]">Transaction Total</span>
                    </td>
                    <td className="p-4 text-right pt-6">
                      <div className="text-xl font-black text-emerald-950 bg-emerald-50 rounded-2xl px-4 py-2 inline-flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-emerald-600" />
                        {(selectedTransaction?.amount || record.amountPaid).toLocaleString("en-IN")}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Summary & Sign-off */}
            <div className="flex justify-between items-end relative z-10">
              <div className="flex-1 max-w-sm">
                <p className="text-[9px] font-bold text-emerald-900/40 uppercase tracking-widest mb-1 italic">Amount in Words:</p>
                <p className="text-xs font-black text-emerald-950 uppercase bg-gray-50 px-3 py-2 rounded-xl italic border border-gray-100">
                  Only {(selectedTransaction?.amount || record.amountPaid).toLocaleString("en-IN")} Rupees processed
                </p>
              </div>
              <div className="w-48 text-center space-y-8">
                <div className="h-12 flex items-end justify-center">
                  <div className="w-full border-b border-gray-200" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40">Authorized Seal</p>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="mt-12 flex justify-between items-center text-[7px] font-bold text-gray-300 uppercase tracking-widest border-t border-gray-50 pt-4">
              <p>© 2024 Omni-Campus Fiscal Ledger Engine</p>
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><ShieldCheck className="w-2 h-2" /> Verified Transaction</span>
                <span className="flex items-center gap-1"><FileCheck2 className="w-2 h-2" /> GST Applied</span>
              </div>
            </div>

            {/* Scissors cutout lines for print */}
            {idx < copies.length - 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-0 print:border-b-2 print:border-dashed print:border-black no-print" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
