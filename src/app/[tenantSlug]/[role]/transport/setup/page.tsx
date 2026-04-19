import Link from "next/link"
import { ArrowRight, Bus, FileSpreadsheet, Map } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"

export default async function TransportSetupPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; role: string }>
}) {
  const { tenantSlug, role } = await params
  const base = `/${tenantSlug}/${role}/transport/setup`

  return (
    <div className="space-y-8 pb-16">
      <div className="space-y-3">
        <div className="inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-amber-700">
          Transport Setup
        </div>
        <h1 className="text-4xl font-black tracking-tight">Transport Migration & Setup</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl">
          <CardHeader>
            <FileSpreadsheet className="h-8 w-8 text-amber-600" />
            <CardTitle className="text-2xl font-black">Bulk Route Import</CardTitle>
            <CardDescription>Import routes, stops, vehicles, and drivers during handover.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`${base}/bulk`} className={buttonVariants({ className: "w-full rounded-2xl font-black" })}>
              Open Bulk Import <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <Bus className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl font-black">Manual Route Setup</CardTitle>
            <CardDescription>Use the existing transport console for one-by-one route additions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${tenantSlug}/${role}/transport`} className={buttonVariants({ variant: "outline", className: "w-full rounded-2xl font-black" })}>
              Open Transport Console <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <Map className="h-8 w-8 text-violet-600" />
            <CardTitle className="text-2xl font-black">Recommended Order</CardTitle>
            <CardDescription>Routes first, student allocation after fee mapping if transport is chargeable.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm font-semibold text-slate-700">
            <div>1. Import route master</div>
            <div>2. Validate stop names</div>
            <div>3. Attach students after migration</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
