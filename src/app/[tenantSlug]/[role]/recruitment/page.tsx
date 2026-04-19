"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"

interface Vacancy {
  id: string
  title: string
  department: string
  location: string
  type: string
  status: string
  deadline?: string
  _count?: {
    applications: number
  }
}

interface Application {
  id: string
  name: string
  email: string
  status: string
}

interface RecruitmentStatistics {
  totalVacancies: number
  totalApplications: number
  pendingApplications: number
  hiredCandidates: number
}

export default function RecruitmentPage() {
  const { data: session } = useSession()
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [statistics, setStatistics] = useState<RecruitmentStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVacancy, setSelectedVacancy] = useState("")
  const [isVacancyDialogOpen, setIsVacancyDialogOpen] = useState(false)
  const [vacancyTitle, setVacancyTitle] = useState("")
  const [vacancyDescription, setVacancyDescription] = useState("")
  const [vacancyDepartment, setVacancyDepartment] = useState("")
  const [vacancyLocation, setVacancyLocation] = useState("")
  const [vacancyType, setVacancyType] = useState<"FULL_TIME" | "PART_TIME" | "CONTRACT">("FULL_TIME")
  const [vacancyStartDate, setVacancyStartDate] = useState("")

  useEffect(() => {
    if (session?.user?.tenantId) {
      loadData()
    }
  }, [session?.user?.tenantId])

  const loadData = async () => {
    try {
      setLoading(true)
      const tenantId = session?.user?.tenantId

      const [vacanciesRes, statsRes] = await Promise.all([
        fetch(`/api/recruitment?tenantId=${tenantId}&type=vacancy`),
        fetch(`/api/recruitment?tenantId=${tenantId}&stats=true`),
      ])

      const vacanciesData = await vacanciesRes.json()
      const stats = await statsRes.json()

      // Handle both response structures: { vacancies: [] } or direct array
      const vacancies = Array.isArray(vacanciesData) ? vacanciesData : (vacanciesData.vacancies || [])
      setVacancies(vacancies)
      setStatistics(stats.statistics)
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  const loadApplications = async (vacancyId: string) => {
    try {
      const tenantId = session?.user?.tenantId
      if (!tenantId) return
      const res = await fetch(`/api/recruitment?tenantId=${tenantId}&type=application&vacancyId=${vacancyId}`)
      const data = await res.json()
      setApplications(data.applications || [])
    } catch (error) {
      // Error handled silently
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const tenantId = session?.user?.tenantId
      if (!tenantId) return
      const res = await fetch("/api/recruitment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          id: applicationId,
          action: "updateApplicationStatus",
          status,
        }),
      })
      const data = await res.json()
      if (data.success) {
        loadApplications(selectedVacancy)
      }
    } catch (error) {
      // Error handled silently
    }
  }

  const createVacancy = async () => {
    try {
      const tenantId = session?.user?.tenantId
      if (!tenantId) return
      const res = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          action: "createVacancy",
          title: vacancyTitle,
          description: vacancyDescription,
          department: vacancyDepartment,
          location: vacancyLocation,
          type: vacancyType,
          startDate: vacancyStartDate ? new Date(vacancyStartDate) : new Date(),
        }),
      })
      const data = await res.json()
      if (data.success || data.id) {
        setIsVacancyDialogOpen(false)
        setVacancyTitle("")
        setVacancyDescription("")
        setVacancyDepartment("")
        setVacancyLocation("")
        setVacancyType("FULL_TIME")
        setVacancyStartDate("")
        await loadData()
      }
    } catch (error) {
      // Error handled silently
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recruitment Management</h1>
          <p className="text-muted-foreground">Manage job vacancies and candidate applications</p>
        </div>
        <Button onClick={() => setIsVacancyDialogOpen(true)}>Create Vacancy</Button>
      </div>

      <Dialog open={isVacancyDialogOpen} onOpenChange={setIsVacancyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Job Vacancy</DialogTitle>
            <DialogDescription>Add a new job opening</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={vacancyTitle}
                onChange={(e) => setVacancyTitle(e.target.value)}
                placeholder="e.g., Mathematics Teacher"
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input
                value={vacancyDepartment}
                onChange={(e) => setVacancyDepartment(e.target.value)}
                placeholder="e.g., Academics, Administration"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={vacancyLocation}
                onChange={(e) => setVacancyLocation(e.target.value)}
                placeholder="e.g., Main Campus"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={vacancyType} onValueChange={(v) => v && setVacancyType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={vacancyStartDate}
                onChange={(e) => setVacancyStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={vacancyDescription}
                onChange={(e) => setVacancyDescription(e.target.value)}
                placeholder="Job description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createVacancy}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Vacancies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalVacancies || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalApplications || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.pendingApplications || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Hired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{statistics.hiredCandidates || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="vacancies">
        <TabsList>
          <TabsTrigger value="vacancies">Vacancies</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="vacancies">
          <Card>
            <CardHeader>
              <CardTitle>Job Vacancies</CardTitle>
              <CardDescription>Current open positions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vacancies.map((vacancy: Vacancy) => (
                    <TableRow key={vacancy.id}>
                      <TableCell>{vacancy.title}</TableCell>
                      <TableCell>{vacancy.department || "-"}</TableCell>
                      <TableCell>{vacancy.type}</TableCell>
                      <TableCell>{vacancy._count?.applications || 0}</TableCell>
                      <TableCell>
                        <Badge variant={vacancy.status === "ACTIVE" ? "default" : "secondary"}>
                          {vacancy.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {vacancy.deadline ? new Date(vacancy.deadline).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setSelectedVacancy(vacancy.id); loadApplications(vacancy.id) }}
                        >
                          View Applications
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {vacancies.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No vacancies found. Create a vacancy to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>Candidate applications for selected vacancy</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app: any) => (
                    <TableRow key={app.id}>
                      <TableCell>{app.name}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>{app.phone || "-"}</TableCell>
                      <TableCell>
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            app.status === "HIRED"
                              ? "default"
                              : app.status === "REJECTED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {app.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateApplicationStatus(app.id, "SHORTLISTED")}
                            >
                              Shortlist
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateApplicationStatus(app.id, "REJECTED")}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {app.status === "SHORTLISTED" && (
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(app.id, "HIRED")}
                          >
                            Hire
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {applications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Select a vacancy to view applications.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
