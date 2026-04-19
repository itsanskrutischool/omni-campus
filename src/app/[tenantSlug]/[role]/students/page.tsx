import { StudentList } from "./student-list"
import { StudentsHeader } from "./students-header"

export default async function StudentsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; role: string }>
}) {
  const { tenantSlug, role } = await params

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000 pb-20">
      <StudentsHeader tenantSlug={tenantSlug} role={role} />

      <div className="pt-4">
        <StudentList tenantSlug={tenantSlug} role={role} />
      </div>
    </div>
  )
}
