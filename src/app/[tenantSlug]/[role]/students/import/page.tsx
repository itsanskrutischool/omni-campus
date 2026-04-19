import Link from "next/link"
import { ArrowRight, FileSpreadsheet, Network, UserPlus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"

export default async function StudentImportHomePage({
  params,
}: {
  params: Promise<{ tenantSlug: string; role: string }>
}) {
  const { tenantSlug, role } = await params
  const base = `/${tenantSlug}/${role}/students/import`

  return (
    <div className="space-y-8 pb-16">
      <div className="space-y-3">
        <div className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">
          Migration Center
        </div>
        <h1 className="text-4xl font-black tracking-tight">Student Onboarding & Mapping</h1>
        <p className="max-w-3xl text-sm font-medium text-muted-foreground">
          This area is designed for real-school handover: bulk import for migration, mapping review for structure fit,
          and the existing admissions flow for one-by-one onboarding after go-live.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl border-emerald-500/10 shadow-sm">
          <CardHeader>
            <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
            <CardTitle className="text-2xl font-black">Bulk Student Import</CardTitle>
            <CardDescription>Bring in students from the old ERP using CSV and class/section lookup.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`${base}/bulk`} className={buttonVariants({ className: "w-full rounded-2xl font-black" })}>
              Open Bulk Import <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-blue-500/10 shadow-sm">
          <CardHeader>
            <Network className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl font-black">Mapping Rules</CardTitle>
            <CardDescription>Review how old-school data should map into Omni Campus classes, sections, and required fields.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`${base}/mapping`} className={buttonVariants({ variant: "outline", className: "w-full rounded-2xl font-black" })}>
              Open Mapping Guide <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-violet-500/10 shadow-sm">
          <CardHeader>
            <UserPlus className="h-8 w-8 text-violet-600" />
            <CardTitle className="text-2xl font-black">Single Admissions</CardTitle>
            <CardDescription>After migration is complete, daily admissions should continue through the regular admissions workflow.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${tenantSlug}/${role}/admissions`} className={buttonVariants({ variant: "ghost", className: "w-full rounded-2xl font-black" })}>
              Open Admissions <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
