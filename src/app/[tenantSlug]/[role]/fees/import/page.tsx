import Link from "next/link"
import { ArrowRight, FileSpreadsheet, IndianRupee, Network } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"

export default async function FeeImportHomePage({
  params,
}: {
  params: Promise<{ tenantSlug: string; role: string }>
}) {
  const { tenantSlug, role } = await params
  const base = `/${tenantSlug}/${role}/fees/import`

  return (
    <div className="space-y-8 pb-16">
      <div className="space-y-3">
        <div className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">
          Finance Migration
        </div>
        <h1 className="text-4xl font-black tracking-tight">Fee Migration Center</h1>
        <p className="max-w-3xl text-sm font-medium text-muted-foreground">
          Set up fee structures for migrated classes first, then move into student ledger generation and collection.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-3xl">
          <CardHeader>
            <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
            <CardTitle className="text-2xl font-black">Bulk Fee Structures</CardTitle>
            <CardDescription>Import tuition, annual, transport, and category-based fee models in one pass.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`${base}/bulk-structures`} className={buttonVariants({ className: "w-full rounded-2xl font-black" })}>
              Open Structure Import <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <IndianRupee className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl font-black">Manual Fee Setup</CardTitle>
            <CardDescription>Use the existing fee structure page for one-by-one fee models after migration.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${tenantSlug}/${role}/fees/structures`} className={buttonVariants({ variant: "outline", className: "w-full rounded-2xl font-black" })}>
              Open Fee Structures <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <Network className="h-8 w-8 text-violet-600" />
            <CardTitle className="text-2xl font-black">Migration Order</CardTitle>
            <CardDescription>Recommended fee handover sequence for live schools.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm font-semibold text-slate-700">
            <div>1. Import classes and students</div>
            <div>2. Import fee structures</div>
            <div>3. Generate or import fee records</div>
            <div>4. Continue collections in Omni Campus</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
