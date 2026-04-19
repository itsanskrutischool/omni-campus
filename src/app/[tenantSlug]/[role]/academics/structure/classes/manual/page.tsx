"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, GitBranchPlus, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ManualClassSetupPage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  const [name, setName] = useState("")
  const [numeric, setNumeric] = useState("")
  const [sections, setSections] = useState("A, B")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const parsedSections = useMemo(
    () =>
      sections
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [sections]
  )

  const handleSubmit = async () => {
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "single",
          name,
          numeric: Number(numeric),
          sections: parsedSections,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to create class")
      }

      setMessage(`Created ${data.name} with ${data.sections?.length || 0} section(s).`)
      setName("")
      setNumeric("")
      setSections("A, B")
    } catch (submitError: any) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <Link href={`/${tenantSlug}/${role}/academics/structure/classes`} className={buttonVariants({ variant: "ghost", className: "rounded-2xl font-bold" })}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Class Operations
      </Link>

      <Card className="max-w-3xl rounded-3xl border-violet-500/10 shadow-sm">
        <CardHeader>
          <GitBranchPlus className="h-8 w-8 text-violet-600" />
          <CardTitle className="text-3xl font-black">Manual Class & Stream Setup</CardTitle>
          <CardDescription>
            Use this after migration too, when the school needs to add a new class, stream, or section individually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Class 11 Science" className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label>Class Numeric</Label>
              <Input value={numeric} onChange={(event) => setNumeric(event.target.value)} placeholder="11" className="rounded-2xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sections / Streams</Label>
            <Input
              value={sections}
              onChange={(event) => setSections(event.target.value)}
              placeholder="A, B, Science, Commerce"
              className="rounded-2xl"
            />
            <p className="text-xs font-medium text-muted-foreground">
              Separate values with commas. Example: `A, B` or `Science, Commerce`.
            </p>
          </div>

          <div className="rounded-3xl border bg-slate-50 p-5 text-sm font-semibold text-slate-700">
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-violet-600">Preview</div>
            <div>Class name: {name || "Not entered yet"}</div>
            <div>Numeric: {numeric || "Not entered yet"}</div>
            <div>Sections: {parsedSections.length > 0 ? parsedSections.join(", ") : "No sections added"}</div>
          </div>

          {message && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> {message}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || !name.trim() || !numeric.trim()}
            className="rounded-2xl font-black"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Class Structure
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
