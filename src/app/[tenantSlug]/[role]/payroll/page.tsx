"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"

interface Payroll {
  id: string
  staffId: string
  staffName: string
  month: number
  year: number
  earnings: number
  deductions: number
  netSalary: number
  status: string
}

interface PayHead {
  id: string
  name: string
  type: "EARNING" | "DEDUCTION"
  amount: number
}

interface PayrollStatistics {
  totalStaff: number
  processedPayrolls: number
  pendingPayrolls: number
  paidPayrolls: number
  totalEarnings: number
  totalDeductions: number
  totalBasicSalary: number
}

export default function PayrollPage() {
  const { data: session } = useSession()
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [payHeads, setPayHeads] = useState<PayHead[]>([])
  const [statistics, setStatistics] = useState<PayrollStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isPayHeadDialogOpen, setIsPayHeadDialogOpen] = useState(false)
  const [payHeadName, setPayHeadName] = useState("")
  const [payHeadType, setPayHeadType] = useState<"EARNING" | "DEDUCTION">("EARNING")
  const [payHeadAmount, setPayHeadAmount] = useState("")

  useEffect(() => {
    if (session?.user?.tenantId) {
      loadData()
    }
  }, [selectedMonth, selectedYear, session?.user?.tenantId])

  const loadData = async () => {
    try {
      setLoading(true)
      const tenantId = session?.user?.tenantId

      const [statsRes, payrollsRes] = await Promise.all([
        fetch(`/api/payroll?tenantId=${tenantId}&stats=true&month=${selectedMonth}&year=${selectedYear}`),
        fetch(`/api/payroll?tenantId=${tenantId}&month=${selectedMonth}&year=${selectedYear}`),
      ])

      const stats = await statsRes.json()
      const payrollData = await payrollsRes.json()

      setStatistics(stats.statistics)
      setPayrolls(payrollData.payrolls || [])
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  const generateBulkPayroll = async () => {
    try {
      const tenantId = session?.user?.tenantId
      if (!tenantId) return
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          action: "generateBulkPayroll",
          month: selectedMonth,
          year: selectedYear,
        }),
      })
      const data = await res.json()
      if (data.success) {
        loadData()
      }
    } catch (error) {
      // Error handled silently
    }
  }

  const updatePayrollStatus = async (payrollId: string, status: string) => {
    try {
      const tenantId = session?.user?.tenantId
      if (!tenantId) return
      const res = await fetch("/api/payroll", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          payrollId,
          status,
        }),
      })
      const data = await res.json()
      if (data.success) {
        loadData()
      }
    } catch (error) {
      // Error handled silently
    }
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "$0.00"
    return `$${value.toFixed(2)}`
  }

  const createPayHead = async () => {
    try {
      const tenantId = session?.user?.tenantId
      if (!tenantId) return
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          action: "createPayHead",
          name: payHeadName,
          type: payHeadType,
          amount: parseFloat(payHeadAmount),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsPayHeadDialogOpen(false)
        setPayHeadName("")
        setPayHeadAmount("")
      }
    } catch (error) {
      // Error handled silently
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Manage staff salaries and payroll processing</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(v) => v && setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  Month {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(v) => v && setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setIsPayHeadDialogOpen(true)}>Add Pay Head</Button>
          <Button onClick={generateBulkPayroll}>Generate Payroll</Button>
        </div>
      </div>

      <Dialog open={isPayHeadDialogOpen} onOpenChange={setIsPayHeadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Pay Head</DialogTitle>
            <DialogDescription>Create a new earning or deduction pay head</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pay Head Name</Label>
              <Input
                value={payHeadName}
                onChange={(e) => setPayHeadName(e.target.value)}
                placeholder="e.g., HRA, DA, PF"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={payHeadType} onValueChange={(v) => v && setPayHeadType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EARNING">Earning</SelectItem>
                  <SelectItem value="DEDUCTION">Deduction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Default Amount</Label>
              <Input
                type="number"
                value={payHeadAmount}
                onChange={(e) => setPayHeadAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createPayHead}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalStaff || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(statistics.totalBasicSalary || 0).toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.pendingPayrolls || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.paidPayrolls || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
          <CardDescription>Staff payroll for {selectedMonth}/{selectedYear}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Month/Year</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrolls.map((payroll: Payroll) => (
                <TableRow key={payroll.id}>
                  <TableCell>{payroll.staffName}</TableCell>
                  <TableCell>{payroll.month}/{payroll.year}</TableCell>
                  <TableCell>{formatCurrency(payroll.earnings)}</TableCell>
                  <TableCell>{formatCurrency(payroll.deductions)}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(payroll.netSalary)}</TableCell>
                  <TableCell>
                    <Badge variant={payroll.status === "PAID" ? "default" : "secondary"}>
                      {payroll.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payroll.status !== "PAID" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePayrollStatus(payroll.id, "PAID")}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {payrolls.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No payroll records found. Generate payroll to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
