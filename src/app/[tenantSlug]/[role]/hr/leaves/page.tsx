"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CalendarRange, Clock, Check, X, FileText } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function LeaveManagementPage() {
  const params = useParams()
  const role = params.role as string

  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")

  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    try {
      const res = await fetch('/api/hr/leaves')
      if (res.ok) {
        const data = await res.json()
        setLeaves(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/hr/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          reason
        })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to submit leave request")
      }

      await fetchLeaves()
      setIsDialogOpen(false)
      setStartDate("")
      setEndDate("")
      setReason("")
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpdateStatus = async (leaveId: string, status: string) => {
    try {
      const res = await fetch(`/api/hr/leaves/${leaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        await fetchLeaves()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground mt-1">
            {role === 'admin' ? 'Review operational absence requests' : 'Request and track organizational leaves'}
          </p>
        </div>

        {role !== 'admin' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 gap-2">
              <CalendarRange className="w-4 h-4" />
              Apply for Leave
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Submit Leave Request</DialogTitle>
                <DialogDescription>
                  Your request will be routed to the admin terminal for approval.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason / Narrative</Label>
                  <Input 
                    placeholder="Brief explanation..." 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)} 
                    required 
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">Submit Request</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <p className="text-muted-foreground">Loading queue...</p>
        ) : leaves.length === 0 ? (
          <Card className="py-12 flex flex-col items-center justify-center text-center bg-muted/20">
            <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Clean Slate</h3>
            <p className="text-muted-foreground">{role === 'admin' ? "No pending operational leaves" : "You have no recorded leaves"}</p>
          </Card>
        ) : (
          leaves.map((leave) => (
            <Card key={leave.id} className="overflow-hidden">
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6">
                <div className="space-y-1">
                  {role === 'admin' && leave.staff && (
                    <div className="font-semibold text-lg flex items-center gap-2">
                        {leave.staff.name} 
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 rounded">{leave.staff.department || 'Staff'}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CalendarRange className="w-4 h-4 text-emerald-600" />
                    {new Date(leave.from).toLocaleDateString()} — {new Date(leave.to).toLocaleDateString()}
                  </div>
                  <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                    <FileText className="w-4 h-4" /> &quot;{leave.reason}&quot;
                  </p>
                </div>
                
                <div className="mt-4 sm:mt-0 flex items-center gap-3">
                    {leave.status === 'PENDING' ? (
                        role === 'admin' ? (
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleUpdateStatus(leave.id, 'APPROVED')} className="bg-emerald-600 hover:bg-emerald-700 h-8">
                                    Approve
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(leave.id, 'REJECTED')} className="border-red-200 text-red-600 hover:bg-red-50 h-8">
                                    Deny
                                </Button>
                            </div>
                        ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                                <Clock className="w-3 h-3" /> Under Review
                            </span>
                        )
                    ) : (
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                            leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {leave.status === 'APPROVED' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 
                            {leave.status}
                        </span>
                    )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
