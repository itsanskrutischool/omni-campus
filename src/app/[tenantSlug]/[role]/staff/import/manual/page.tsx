"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants, Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function StaffManualPage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    joinDate: "",
    departmentName: "",
    designationName: "",
    basicSalary: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const response = await fetch("/api/hr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to create staff")
      setMessage(`Created ${data.name} with employee ID ${data.empId}.`)
      setForm({
        name: "",
        email: "",
        phone: "",
        role: "",
        joinDate: "",
        departmentName: "",
        designationName: "",
        basicSalary: "",
      })
    } catch (submitError: any) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <Link href={`/${tenantSlug}/${role}/staff/import`} className={buttonVariants({ variant: "ghost", className: "rounded-2xl font-bold" })}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Staff Import Center
      </Link>
      <Card className="max-w-3xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-3xl font-black">Manual Staff Entry</CardTitle>
          <CardDescription>Use this for day-to-day additions after the bulk handover is completed.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          {[
            ["name", "Name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["role", "Role"],
            ["joinDate", "Join Date"],
            ["departmentName", "Department"],
            ["designationName", "Designation"],
            ["basicSalary", "Basic Salary"],
          ].map(([key, label]) => (
            <div className="space-y-2" key={key}>
              <Label>{label}</Label>
              <Input
                type={key === "joinDate" ? "date" : key === "basicSalary" ? "number" : "text"}
                value={(form as Record<string, string>)[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                className="rounded-2xl"
              />
            </div>
          ))}
          <div className="md:col-span-2 space-y-4">
            {message && <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> {message}</div>}
            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
            <Button onClick={handleSubmit} disabled={loading || !form.name || !form.email || !form.phone || !form.role || !form.joinDate} className="rounded-2xl font-black">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Staff Record
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
