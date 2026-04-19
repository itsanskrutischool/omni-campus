import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { IndianRupee, Wallet, CreditCard, Banknote, ShieldCheck, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FeePaymentProps {
  records: any[]
  onSuccess: (recordId?: string, transactionId?: string) => void
  onCancel: () => void
}

export function FeePayment({ records, onSuccess, onCancel }: FeePaymentProps) {
  const totalDue = records.reduce((sum, r) => sum + (r.amountDue - (r.amountPaid || 0) - (r.waiver || 0)), 0)
  const isBulk = records.length > 1
  
  const [amount, setAmount] = useState(totalDue.toString())
  const [method, setMethod] = useState("CASH")
  const [loading, setLoading] = useState(false)
  const [state, setState] = useState<"input" | "processing" | "success">("input")
  const [transactionId, setTransactionId] = useState<string | null>(null)

  useEffect(() => {
    setAmount(totalDue.toString())
  }, [totalDue])

  const isValid = parseFloat(amount) > 0 && (isBulk ? parseFloat(amount) === totalDue : parseFloat(amount) <= totalDue)
  const isPartial = !isBulk && parseFloat(amount) < totalDue

  const handlePayment = async () => {
    setLoading(true)
    setState("processing")
    try {
      const payload = isBulk ? {
        payments: records.map(r => ({
          recordId: r.id,
          amount: r.amountDue - (r.amountPaid || 0) - (r.waiver || 0)
        })),
        paymentMethod: method
      } : {
        recordId: records[0].id,
        amount: parseFloat(amount),
        paymentMethod: method
      }

      const res = await fetch(`/api/fees/records`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        setTransactionId(data.transactionId)
        setTimeout(() => {
          setState("success")
          setTimeout(() => {
            onSuccess(isBulk ? undefined : records[0].id, data.transactionId)
          }, 1500)
        }, 2000)
      }
    } catch (err) {
      console.error(err)
      setState("input")
    } finally {
      setLoading(false)
    }
  }

  const mainRecord = records[0]

  return (
    <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
      <CardContent className="p-0">
        <div className="relative h-2 bg-emerald-50 overlay overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={state === "processing" ? { x: "100%" } : { x: "-100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
          />
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {state === "input" && (
              <motion.div 
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-emerald-950">Secure Checkout</h3>
                    <p className="text-emerald-900/40 font-bold text-xs uppercase tracking-widest">
                      {isBulk ? `${records.length} Fee Records Selected` : mainRecord.feeStructure.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest mb-1">Total Outstanding</p>
                    <p className="text-xl font-black text-rose-500">₹{totalDue.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-emerald-900/40 uppercase tracking-[0.2em] ml-1">Payment Execution Amount</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <IndianRupee className="h-5 w-5 text-emerald-600 transition-transform group-focus-within:scale-110" />
                    </div>
                    <Input
                      type="number"
                      value={amount}
                      readOnly={isBulk}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`h-20 pl-14 text-3xl font-black rounded-3xl border-2 border-emerald-50 bg-emerald-50/30 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all ${isBulk ? "opacity-70 cursor-not-allowed" : ""}`}
                      placeholder="0.00"
                    />
                    {isPartial && isValid && (
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                        Partial Payment
                      </div>
                    )}
                    {isBulk && (
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                        Full Bulk Payment
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-emerald-900/40 uppercase tracking-[0.2em] ml-1">Select Ledger Channel</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: "CASH", label: "Cash", icon: Banknote },
                      { id: "ONLINE", label: "Digital", icon: Wallet },
                      { id: "CARD", label: "Card", icon: CreditCard },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all ${
                          method === m.id 
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200" 
                            : "bg-white border-emerald-50 text-emerald-900/60 hover:border-emerald-200"
                        }`}
                      >
                        <m.icon className={`h-6 w-6 ${method === m.id ? "text-white" : "text-emerald-500"}`} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confirm Button */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button"
                    onClick={onCancel}
                    variant="ghost" 
                    className="flex-1 h-14 rounded-2xl font-black uppercase text-xs tracking-widest text-emerald-900/40 hover:text-emerald-900 hover:bg-emerald-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    disabled={!isValid || loading}
                    onClick={handlePayment}
                    className="flex-[2] h-14 rounded-2xl font-black uppercase text-xs tracking-[0.2em] bg-emerald-950 hover:bg-black text-white shadow-xl shadow-emerald-900/10"
                  >
                    Authorize Payment <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
