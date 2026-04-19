import Link from "next/link"
import { ArrowRight, FileSpreadsheet, GitBranchPlus, Layers3, Settings2, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"

export default async function ClassOperationsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; role: string }>
}) {
  const { tenantSlug, role } = await params
  const base = `/${tenantSlug}/${role}/academics/structure/classes`

  return (
    <div className="space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-3">
        <div className="inline-flex rounded-full bg-violet-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-violet-700">
          Class Setup Command
        </div>
        <h1 className="text-4xl font-black tracking-tight">Class & Stream Operations</h1>
        <p className="max-w-3xl text-sm font-medium text-muted-foreground">
          This is the handover-friendly setup area for academic structure. Use manual setup for day-to-day additions,
          and bulk import when migrating from an already running school into Omni Campus.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl border-violet-500/10 shadow-sm">
          <CardHeader>
            <GitBranchPlus className="h-8 w-8 text-violet-600" />
            <CardTitle className="text-2xl font-black">Manual Class Setup</CardTitle>
            <CardDescription>
              Add one class at a time with sections or streams so school staff can continue normal daily operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm font-semibold text-slate-600">
              <div>Single class creation</div>
              <div>Section/stream creation</div>
              <div>Operational for ongoing admissions</div>
            </div>
            <Link href={`${base}/manual`} className={buttonVariants({ className: "w-full rounded-2xl font-black" })}>
              Open Manual Setup <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-blue-500/10 shadow-sm">
          <CardHeader>
            <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl font-black">Bulk Import Classes</CardTitle>
            <CardDescription>
              Import the complete class and section hierarchy from the previous ERP during school handover.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm font-semibold text-slate-600">
              <div>CSV paste or file intake</div>
              <div>Section auto-creation</div>
              <div>Safe updates for existing classes</div>
            </div>
            <Link href={`${base}/bulk-import`} className={buttonVariants({ variant: "outline", className: "w-full rounded-2xl font-black" })}>
              Open Bulk Intake <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-emerald-500/10 shadow-sm">
          <CardHeader>
            <Settings2 className="h-8 w-8 text-emerald-600" />
            <CardTitle className="text-2xl font-black">Migration Blueprint</CardTitle>
            <CardDescription>
              Mirrors the reference ERP handover flow: structure first, student mapping next, operational records after that.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm font-semibold text-slate-600">
            <div className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-emerald-600" /> Create classes and sections</div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-emerald-600" /> Map students into those sections</div>
            <div className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Then import fees, attendance, and reports</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
