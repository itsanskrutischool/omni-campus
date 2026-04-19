"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Wallet, Plus, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, Filter, DollarSign, Receipt } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

export default function PettyCashPage() {
  const params = useParams()
  const [vouchers, setVouchers] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState({ type: "PAYMENT", category: "Office Supplies", amount: "", description: "", paidBy: "", remarks: "" })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [vRes, aRes] = await Promise.all([
        fetch(`/api/vouchers?type=${typeFilter !== "ALL" ? typeFilter : ""}`),
        fetch("/api/vouchers?analytics=true"),
      ])
      if (vRes.ok) setVouchers(await vRes.json())
      if (aRes.ok) setAnalytics(await aRes.json())
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [typeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async () => {
    try {
      await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...form, amount: parseFloat(form.amount) }),
      })
      setIsAddOpen(false)
      setForm({ type: "PAYMENT", category: "Office Supplies", amount: "", description: "", paidBy: "", remarks: "" })
      fetchData()
    } catch (err) { console.error(err) }
  }

  const handleApprove = async (voucherId: string, status: string) => {
    try {
      await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", voucherId, status }),
      })
      fetchData()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      <div className="space-y-4 px-2">
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest inline-block">Accounts</div>
        <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">Petty Cash <span className="text-emerald-600">Manager</span></h1>
        <p className="text-muted-foreground font-semibold max-w-xl text-lg">Track daily expenses, vouchers, and petty cash transactions.</p>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
          <StatCard label="Total Vouchers" value={analytics.total.toString()} icon={Receipt} description="All transactions" variant="emerald" />
          <StatCard label="Total Expenses" value={`₹${analytics.totalAmount.toLocaleString("en-IN")}`} icon={TrendingDown} description="Approved payments" variant="rose" />
          <StatCard label="Pending" value={analytics.pending.toString()} icon={Clock} description="Awaiting approval" variant="amber" />
          <StatCard label="Approved" value={analytics.approved.toString()} icon={CheckCircle2} description="Processed vouchers" variant="emerald" />
        </div>
      )}

      <div className="flex items-center gap-3 px-2">
        <Select value={typeFilter} onValueChange={(v) => { if (v) setTypeFilter(v) }}>
          <SelectTrigger className="h-12 w-44 rounded-2xl font-bold bg-muted/50 border-none"><div className="flex items-center gap-2"><Filter className="w-4 h-4 text-emerald-500" /><SelectValue /></div></SelectTrigger>
          <SelectContent className="rounded-2xl"><SelectItem value="ALL">All Types</SelectItem><SelectItem value="PAYMENT">Payment</SelectItem><SelectItem value="RECEIPT">Receipt</SelectItem><SelectItem value="JOURNAL">Journal</SelectItem></SelectContent>
        </Select>
        <Button onClick={() => setIsAddOpen(true)} className="h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-xl ml-auto">
          <Plus className="w-4 h-4 mr-2" /> New Voucher
        </Button>
      </div>

      <Card className="border-emerald-500/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-500/[0.02] border-none">
                <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Voucher No</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Type</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Category</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Description</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400 text-right">Amount</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Date</TableHead>
                <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Status</TableHead>
                <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.length === 0 ? (
                <TableRow className="border-none"><TableCell colSpan={8} className="py-32 text-center text-muted-foreground font-bold">
                  <Wallet className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">No vouchers recorded yet.</p>
                  <Button onClick={() => setIsAddOpen(true)} variant="outline" className="mt-4 rounded-xl font-bold">Create First Voucher</Button>
                </TableCell></TableRow>
              ) : (
                vouchers.map(v => (
                  <TableRow key={v.id} className="group/row hover:bg-emerald-500/[0.02] transition-all border-b border-emerald-500/5">
                    <TableCell className="px-8 py-6 font-mono font-black text-sm">{v.voucherNo}</TableCell>
                    <TableCell><Badge variant="outline" className={cn("font-bold text-[10px] uppercase", v.type === "PAYMENT" ? "text-rose-600" : v.type === "RECEIPT" ? "text-emerald-600" : "text-blue-600")}>{v.type}</Badge></TableCell>
                    <TableCell className="text-sm font-bold">{v.category}</TableCell>
                    <TableCell className="text-sm font-bold max-w-[200px] truncate">{v.description}</TableCell>
                    <TableCell className={cn("text-right font-black", v.type === "PAYMENT" ? "text-rose-600" : "text-emerald-600")}>₹{v.amount.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-sm font-bold">{new Date(v.date).toLocaleDateString()}</TableCell>
                    <TableCell><Badge className={cn("rounded-xl font-black text-[10px] uppercase", v.status === "PENDING" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : v.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20")}>{v.status}</Badge></TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      {v.status === "PENDING" && (
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => handleApprove(v.id, "APPROVED")} size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px] uppercase"><CheckCircle2 className="w-3 h-3 mr-1" /> Approve</Button>
                          <Button onClick={() => handleApprove(v.id, "REJECTED")} variant="outline" size="sm" className="rounded-xl border-rose-500/20 text-rose-600 hover:bg-rose-500/10 font-bold text-[10px] uppercase"><XCircle className="w-3 h-3 mr-1" /> Reject</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Category Breakdown */}
      {analytics?.byCategory && analytics.byCategory.length > 0 && (
        <Card className="border-emerald-500/5 shadow-lg">
          <CardHeader><CardTitle className="text-lg font-black flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-500" /> Expense Breakdown by Category</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {analytics.byCategory.map((c: any) => (
                <div key={c.category} className="p-4 bg-muted/50 rounded-2xl text-center">
                  <p className="font-black text-lg text-emerald-600">₹{(c._sum.amount || 0).toLocaleString("en-IN")}</p>
                  <p className="text-xs font-bold text-muted-foreground mt-1">{c.category}</p>
                  <p className="text-[9px] text-muted-foreground">{c._count._all} vouchers</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Voucher Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader><DialogTitle>New Voucher</DialogTitle><DialogDescription>Record a petty cash transaction.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Type</Label><Select value={form.type} onValueChange={v => { if (v) setForm({ ...form, type: v }) }}><SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="PAYMENT">Payment</SelectItem><SelectItem value="RECEIPT">Receipt</SelectItem><SelectItem value="JOURNAL">Journal</SelectItem></SelectContent></Select></div>
            <div><Label>Category</Label><Select value={form.category} onValueChange={v => { if (v) setForm({ ...form, category: v }) }}><SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="Office Supplies">Office Supplies</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Transport">Transport</SelectItem><SelectItem value="Utilities">Utilities</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
            <div><Label>Amount (₹) *</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="rounded-xl mt-1" /></div>
            <div><Label>Description *</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="rounded-xl mt-1" rows={2} /></div>
            <div><Label>Paid By</Label><Input value={form.paidBy} onChange={e => setForm({ ...form, paidBy: e.target.value })} className="rounded-xl mt-1" /></div>
            <div><Label>Remarks</Label><Input value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} className="rounded-xl mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button><Button onClick={handleCreate} className="rounded-xl font-bold">Create Voucher</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
