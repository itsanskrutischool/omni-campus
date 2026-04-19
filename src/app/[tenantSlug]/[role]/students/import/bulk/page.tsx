"use client"

import { ChangeEvent, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type StudentRow = Record<string, string>

function parseCsvToObjects(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (lines.length <= 1) return [] as StudentRow[]

  const headers = lines[0].split(",").map((header) => header.trim())
  return lines.slice(1).map((line) => {
    const cells = line.split(",")
    return headers.reduce((acc, header, index) => {
      acc[header] = (cells[index] || "").trim()
      return acc
    }, {} as StudentRow)
  })
}

export default function BulkStudentImportPage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  const sample = [
    "name,gender,dob,fatherName,motherName,phone,className,sectionName,guardianPhone,previousSchool,address",
    "Aarav Sharma,MALE,2012-03-14,Raj Sharma,Pooja Sharma,9999999991,Class 6,A,9999999992,St. Mary School,Delhi",
    "Anaya Singh,FEMALE,2011-08-22,Vikram Singh,Neha Singh,9999999993,Class 9,B,9999999994,Sunrise School,Gurugram",
  ].join("\n")

  const [csvText, setCsvText] = useState(sample)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const rows = useMemo(() => parseCsvToObjects(csvText), [csvText])

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
        body: JSON.stringify({
          type: "STUDENTS",
          rows,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Student import failed")
      }

      const errorSnippet = Array.isArray(data.errors) && data.errors.length > 0 ? ` First issue: ${data.errors[0]}` : ""
      setMessage(`Imported ${data.imported}, skipped ${data.skipped}.${errorSnippet}`)
    } catch (importError: any) {
      setError(importError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <Link href={`/${tenantSlug}/${role}/students/import`} className={buttonVariants({ variant: "ghost", className: "rounded-2xl font-bold" })}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Import Center
      </Link>

      <Card className="rounded-3xl border-emerald-500/10 shadow-sm">
        <CardHeader>
          <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
          <CardTitle className="text-3xl font-black">Bulk Student Import</CardTitle>
          <CardDescription>
            Intake for school handover. Import student records in bulk after classes and sections are already configured.
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
            <Link href={`/${tenantSlug}/${role}/students/import/mapping`} className={buttonVariants({ variant: "ghost", className: "rounded-2xl font-bold" })}>
              View Mapping Rules
            </Link>
          </div>

          <Textarea value={csvText} onChange={(event) => setCsvText(event.target.value)} className="min-h-[280px] rounded-3xl font-mono text-sm" />

          <div className="rounded-3xl border bg-slate-50 p-5">
            <div className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Preview</div>
            <div className="space-y-2 text-sm font-semibold text-slate-700">
              {rows.length === 0 ? (
                <div>No rows detected yet.</div>
              ) : (
                rows.slice(0, 5).map((row, index) => (
                  <div key={`${row.name}-${index}`}>
                    {row.name} {"->"} {row.className || "No class"} / {row.sectionName || "No section"}
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

          <Button onClick={handleImport} disabled={loading || rows.length === 0} className="rounded-2xl font-black">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Run Bulk Student Import
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
