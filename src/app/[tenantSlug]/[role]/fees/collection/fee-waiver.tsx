"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { IndianRupee, Gift, Tag, Info, CheckCircle2, Loader2, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FeeWaiverProps {
  record: any
  onSuccess: (recordId: string) => void
  onCancel: () => void
}

export function FeeWaiver({ record, onSuccess, onCancel }: FeeWaiverProps) {
  const [amount, setAmount] = useState(record.amountDue.toString())
  const [remarks, setRemarks] = useState("")
  const [loading, setLoading] = useState(false)
  const [state, setState] = useState<"input" | "processing" | "success">("input")

  const isValid = parseFloat(amount) > 0 && parseFloat(amount) <= record.amountDue

  const handleApplyWaiver = async () => {
    if (!isValid) return
    setLoading(true)
    setState("processing")
    try {
      const res = await fetch(`/api/fees/records`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId: record.id,
          amount: parseFloat(amount),
          remarks: remarks,
          type: "WAIVER"
        })
      })

      if (res.ok) {
        setTimeout(() => {
          setState("success")
          setTimeout(() => {
            onSuccess(record.id)
          }, 1500)
        }, 2000)
      } else {
        const err = await res.json()
        alert(err.error || "Failed to apply waiver")
        setState("input")
      }
    } catch (err) {
      console.error(err)
      setState("input")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
      <CardContent className="p-0">
        <div className="relative h-2 bg-indigo-50 overlay overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={state === "processing" ? { x: "100%" } : { x: "-100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
          />
        </div>

        <div className="p-8">
          <div className="flex justify-end mb-4">
             <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full hover:bg-rose-50 hover:text-rose-500">
                <X className="h-5 w-5" />
             </Button>
          </div>
          
          <AnimatePresence mode="wait">
            {state === "input" && (
              <motion.div 
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-indigo-950">Apply Waiver</h3>
                    <p className="text-indigo-900/40 font-bold text-xs uppercase tracking-widest">Scholarship & Adjustments</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-indigo-900/40 uppercase tracking-widest mb-1">Current Balance</p>
                    <p className="text-xl font-black text-rose-500">₹{record.amountDue.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] ml-1">Waiver Amount</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <IndianRupee className="h-5 w-5 text-indigo-600 transition-transform group-focus-within:scale-110" />
                      </div>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-14 h-16 rounded-2xl bg-indigo-50/50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-xl font-bold"
                        max={record.amountDue}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em] ml-1">Remarks / Reason</label>
                    <Textarea 
                      placeholder="e.g. Merit-based scholarship, Staff ward discount..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="rounded-2xl border-none bg-indigo-50/50 focus-visible:ring-2 focus-visible:ring-indigo-500 min-h-[100px] resize-none p-4"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-4 flex gap-4 border border-amber-100">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Info className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-amber-900 uppercase tracking-tight">Financial Warning</p>
                    <p className="text-[11px] text-amber-800/70 font-medium leading-relaxed">
                      Waivers permanently reduce the receivable amount. This action is recorded in the audit logs for administrative review.
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handleApplyWaiver}
                  disabled={!isValid || loading}
                  className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] group"
                >
                  <Tag className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                  Execute Waiver
                </Button>
              </motion.div>
            )}

            {state === "processing" && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Gift className="h-8 w-8 text-indigo-500 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-black text-indigo-950">Validating Ledger</h4>
                  <p className="text-indigo-900/40 font-bold text-sm">Adjusting student balance records...</p>
                </div>
              </motion.div>
            )}

            {state === "success" && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="h-24 w-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-emerald-950">Adjustment Applied</h4>
                  <p className="text-emerald-900/40 font-bold text-sm">Student's balance successfully updated.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
