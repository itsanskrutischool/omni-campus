import Link from "next/link"
import { ArrowLeft, Briefcase, ShieldCheck, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"

export default async function StaffMappingPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; role: string }>
}) {
  const { tenantSlug, role } = await params

  return (
    <div className="space-y-8 pb-16">
      <Link href={`/${tenantSlug}/${role}/staff/import`} className={buttonVariants({ variant: "ghost", className: "rounded-2xl font-bold" })}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Staff Import Center
      </Link>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-3xl">
          <CardHeader><Users className="h-8 w-8 text-emerald-600" /><CardTitle className="text-2xl font-black">Required Fields</CardTitle><CardDescription>Must exist in the file.</CardDescription></CardHeader>
          <CardContent className="space-y-2 text-sm font-semibold text-slate-700">
            <div>name</div><div>email</div><div>phone</div><div>role</div><div>joinDate</div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardHeader><Briefcase className="h-8 w-8 text-blue-600" /><CardTitle className="text-2xl font-black">Auto-Created Masters</CardTitle><CardDescription>Missing masters are created during import.</CardDescription></CardHeader>
          <CardContent className="space-y-2 text-sm font-semibold text-slate-700">
            <div>departmentName</div><div>designationName</div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardHeader><ShieldCheck className="h-8 w-8 text-amber-600" /><CardTitle className="text-2xl font-black">Safety Rules</CardTitle><CardDescription>Keep the migration predictable.</CardDescription></CardHeader>
          <CardContent className="space-y-2 text-sm font-semibold text-slate-700">
            <div>One row per person</div><div>Email should be unique</div><div>Use manual entry for later hires</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
