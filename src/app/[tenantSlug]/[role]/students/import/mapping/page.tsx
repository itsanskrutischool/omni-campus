import Link from "next/link"
import { ArrowLeft, DatabaseZap, FileSpreadsheet, GraduationCap, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"

export default async function StudentMappingGuidePage({
  params,
}: {
  params: Promise<{ tenantSlug: string; role: string }>
}) {
  const { tenantSlug, role } = await params

  return (
    <div className="space-y-8 pb-16">
      <Link href={`/${tenantSlug}/${role}/students/import`} className={buttonVariants({ variant: "ghost", className: "rounded-2xl font-bold" })}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Import Center
      </Link>

      <div className="space-y-3">
        <div className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-blue-700">
          Migration Mapping
        </div>
        <h1 className="text-4xl font-black tracking-tight">Student Import Mapping Rules</h1>
        <p className="max-w-3xl text-sm font-medium text-muted-foreground">
          These rules are based on school handover reality: clean structure first, then align legacy student data into
          Omni Campus without forcing manual re-entry.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader>
            <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl font-black">Required CSV Columns</CardTitle>
            <CardDescription>These fields should exist in the migration file for the first usable import wave.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm font-semibold text-slate-700">
            <div>`name`</div>
            <div>`gender`</div>
            <div>`dob` in `YYYY-MM-DD`</div>
            <div>`fatherName`</div>
            <div>`motherName`</div>
            <div>`phone`</div>
            <div>`className`</div>
            <div>`sectionName`</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <GraduationCap className="h-8 w-8 text-emerald-600" />
            <CardTitle className="text-2xl font-black">Class Matching Logic</CardTitle>
            <CardDescription>Student rows resolve against already-created class and section records.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm font-semibold text-slate-700">
            <div>Classes are matched by exact class name or numeric value.</div>
            <div>Sections are matched inside the selected class only.</div>
            <div>Set up classes first through the class operation center.</div>
            <div>Unmatched rows are skipped instead of creating bad mappings silently.</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <DatabaseZap className="h-8 w-8 text-violet-600" />
            <CardTitle className="text-2xl font-black">Recommended Handover Order</CardTitle>
            <CardDescription>Follow this order when taking over a live school from another ERP.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm font-semibold text-slate-700">
            <div>1. Import classes, sections, and streams</div>
            <div>2. Import active students</div>
            <div>3. Validate profiles and class counts</div>
            <div>4. Import fee structures and ledgers</div>
            <div>5. Import exam history and attendance</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <ShieldCheck className="h-8 w-8 text-amber-600" />
            <CardTitle className="text-2xl font-black">Safe Use Notes</CardTitle>
            <CardDescription>Keep migration safe and predictable for admin teams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm font-semibold text-slate-700">
            <div>Do one sample import before the full upload.</div>
            <div>Check skipped rows and fix naming mismatches.</div>
            <div>Use admissions only for new students after go-live.</div>
            <div>Do not mix old and new section naming conventions mid-import.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
