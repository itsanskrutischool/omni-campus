import Link from "next/link"
import { ArrowRight, FileSpreadsheet, Network, UserPlus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"

export default async function StaffImportHomePage({
  params,
}: {
  params: Promise<{ tenantSlug: string; role: string }>
}) {
  const { tenantSlug, role } = await params
  const base = `/${tenantSlug}/${role}/staff/import`

  return (
    <div className="space-y-8 pb-16">
      <div className="space-y-3">
        <div className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">
          Workforce Migration
        </div>
        <h1 className="text-4xl font-black tracking-tight">Staff Onboarding Center</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl">
          <CardHeader>
            <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
            <CardTitle className="text-2xl font-black">Bulk Staff Import</CardTitle>
            <CardDescription>Import workforce details from the previous ERP with department and designation mapping.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`${base}/bulk`} className={buttonVariants({ className: "w-full rounded-2xl font-black" })}>
              Open Bulk Import <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <UserPlus className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl font-black">Manual Staff Entry</CardTitle>
            <CardDescription>Use this for one-by-one additions after the main migration is finished.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`${base}/manual`} className={buttonVariants({ variant: "outline", className: "w-full rounded-2xl font-black" })}>
              Open Manual Entry <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <Network className="h-8 w-8 text-violet-600" />
            <CardTitle className="text-2xl font-black">Mapping Rules</CardTitle>
            <CardDescription>Department and designation masters are auto-created when missing.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`${base}/mapping`} className={buttonVariants({ variant: "ghost", className: "w-full rounded-2xl font-black" })}>
              View Rules <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
