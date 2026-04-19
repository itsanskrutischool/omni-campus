"use client"

import { ChangeEvent, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants, Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type FeeRow = Record<string, string>

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (lines.length <= 1) return [] as FeeRow[]
  const headers = lines[0].split(",").map((header) => header.trim())
  return lines.slice(1).map((line) => {
    const cells = line.split(",")
    return headers.reduce((acc, header, index) => {
      acc[header] = (cells[index] || "").trim()
      return acc
    }, {} as FeeRow)
  })
}

export default function BulkFeeStructuresPage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string
  const sample = [
    "name,amount,frequency,className,category",
    "Tuition Fee,2500,MONTHLY,Class 6,GENERAL",
    "Annual Charges,5000,YEARLY,Class 9,GENERAL",
    "Transport Fee,1200,MONTHLY,Class 6,TRANSPORT",
  ].join("\n")

  const [csvText, setCsvText] = useState(sample)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const rows = useMemo(() => parseCsv(csvText), [csvText])

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setCsvText(await file.text())
  }

  const handleImport = async () => {
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const response = await fetch("/api/utilities/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "FEE_STRUCTURES", rows }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Fee import failed")
      setMessage(`Imported ${data.imported}, updated ${data.updated} for academic year ${data.academicYear}.`)
    } catch (importError: any) {
      setError(importError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <Link href={`/${tenantSlug}/${role}/fees/import`} className={buttonVariants({ variant: "ghost", className: "rounded-2xl font-bold" })}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Fee Migration Center
      </Link>

      <Card className="rounded-3xl">
        <CardHeader>
          <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
          <CardTitle className="text-3xl font-black">Bulk Fee Structure Import</CardTitle>
          <CardDescription>Import fee models after class hierarchy is ready. CSV columns: `name, amount, frequency, className, category`.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex cursor-pointer items-center rounded-2xl border px-4 py-2 text-sm font-bold">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload CSV
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
            </label>
            <Button variant="outline" onClick={() => setCsvText(sample)} className="rounded-2xl font-bold">Reset Sample</Button>
          </div>

          <Textarea value={csvText} onChange={(event) => setCsvText(event.target.value)} className="min-h-[260px] rounded-3xl font-mono text-sm" />

          {message && <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> {message}</div>}
          {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

          <Button onClick={handleImport} disabled={loading || rows.length === 0} className="rounded-2xl font-black">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Run Fee Structure Import
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
