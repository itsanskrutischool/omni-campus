"use client"

import { ChangeEvent, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type ClassRow = {
  name: string
  numeric: number
  sections: string[]
}

function parseClassCsv(text: string): ClassRow[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (lines.length <= 1) return []

  return lines.slice(1).map((line) => {
    const [name = "", numeric = "", sections = ""] = line.split(",")
    return {
      name: name.trim(),
      numeric: Number(numeric.trim()),
      sections: sections
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean),
    }
  })
}

export default function BulkClassImportPage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  const sample = "name,numeric,sections\nClass 6,6,A|B\nClass 9,9,A|B|C\nClass 11 Science,11,Science|Commerce"

  const [csvText, setCsvText] = useState(sample)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const parsedRows = useMemo(() => parseClassCsv(csvText), [csvText])

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setCsvText(text)
  }

  const handleImport = async () => {
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "bulk",
          rows: parsedRows,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Bulk import failed")
      }

      setMessage(`Imported ${data.imported}, updated ${data.updated}, skipped ${data.skipped}.`)
    } catch (importError: any) {
      setError(importError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <Link href={`/${tenantSlug}/${role}/academics/structure/classes`} className={buttonVariants({ variant: "ghost", className: "rounded-2xl font-bold" })}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Class Operations
      </Link>

      <Card className="rounded-3xl border-blue-500/10 shadow-sm">
        <CardHeader>
          <FileSpreadsheet className="h-8 w-8 text-blue-600" />
          <CardTitle className="text-3xl font-black">Bulk Import Classes & Sections</CardTitle>
          <CardDescription>
            Use this during ERP handover. Paste CSV data or upload a `.csv` file with `name`, `numeric`, and `sections`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center rounded-2xl border px-4 py-2 text-sm font-bold">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload CSV
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
            </label>
            <Button variant="outline" onClick={() => setCsvText(sample)} className="rounded-2xl font-bold">
              Reset Sample
            </Button>
          </div>

          <Textarea
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            className="min-h-[260px] rounded-3xl font-mono text-sm"
          />

          <div className="rounded-3xl border bg-slate-50 p-5">
            <div className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Parsed Preview</div>
            <div className="space-y-2 text-sm font-semibold text-slate-700">
              {parsedRows.length === 0 ? (
                <div>No valid rows detected yet.</div>
              ) : (
                parsedRows.slice(0, 5).map((row, index) => (
                  <div key={`${row.name}-${index}`}>
                    {row.name} ({row.numeric}) {"->"} {row.sections.join(", ") || "No sections"}
                  </div>
                ))
              )}
            </div>
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

          <Button onClick={handleImport} disabled={loading || parsedRows.length === 0} className="rounded-2xl font-black">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Run Bulk Class Import
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
