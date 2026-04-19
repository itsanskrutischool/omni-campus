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
import { useSession } from "next-auth/react"

interface AlumniMember {
  id: string
  name: string
  email: string
  phone: string
  batch: string
  batchYear?: string
  department: string
  currentRole?: string
  currentCompany?: string
  verified: boolean
  isVerified?: boolean
}

interface AlumniEvent {
  id: string
  name: string
  date: string
  location: string
  type?: string
  _count?: {
    registrations: number
  }
}

interface AlumniStatistics {
  totalAlumni: number
  verifiedAlumni: number
  upcomingEvents: number
  totalDonations: number
}

export default function AlumniPage() {
  const { data: session } = useSession()
  const [alumni, setAlumni] = useState<AlumniMember[]>([])
  const [events, setEvents] = useState<AlumniEvent[]>([])
  const [statistics, setStatistics] = useState<AlumniStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [eventName, setEventName] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventLocation, setEventLocation] = useState("")

  useEffect(() => {
    if (session?.user?.tenantId) {
      loadData()
    }
  }, [session?.user?.tenantId])

  const loadData = async () => {
    try {
      setLoading(true)
      const tenantId = session?.user?.tenantId

      const [alumniRes, eventsRes, statsRes] = await Promise.all([
        fetch(`/api/alumni?tenantId=${tenantId}&type=alumni`),
        fetch(`/api/alumni?tenantId=${tenantId}&type=event`),
        fetch(`/api/alumni?tenantId=${tenantId}&stats=true`),
      ])

      const alumniData = await alumniRes.json()
      const eventsData = await eventsRes.json()
      const stats = await statsRes.json()

      setAlumni(alumniData.alumni || [])
      setEvents(eventsData.events || [])
      setStatistics(stats.statistics)
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  const verifyAlumni = async (alumniId: string) => {
    try {
      const tenantId = session?.user?.tenantId
      if (!tenantId) return
      const res = await fetch("/api/alumni", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          action: "verifyAlumni",
          id: alumniId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        loadData()
      }
    } catch (error) {
      // Error handled silently
    }
  }

  const createEvent = async () => {
    try {
      const tenantId = session?.user?.tenantId
      if (!tenantId) return
      const res = await fetch("/api/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          action: "createEvent",
          name: eventName,
          date: eventDate,
          location: eventLocation,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsEventDialogOpen(false)
        setEventName("")
        setEventDate("")
        setEventLocation("")
        loadData()
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
          <h1 className="text-3xl font-bold">Alumni Network</h1>
          <p className="text-muted-foreground">Manage alumni directory, events, and engagement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEventDialogOpen(true)}>Create Event</Button>
          <Button>Register Alumni</Button>
        </div>
      </div>

      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Alumni Event</DialogTitle>
            <DialogDescription>Add a new alumni event</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Event Name</Label>
              <Input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g., Annual Reunion"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="e.g., Main Auditorium"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createEvent}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalAlumni || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{statistics.verifiedAlumni || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(statistics.totalDonations || 0).toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.upcomingEvents || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <Card>
            <CardHeader>
              <CardTitle>Alumni Directory</CardTitle>
              <CardDescription>Registered alumni members</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alumni.map((alum: AlumniMember) => (
                    <TableRow key={alum.id}>
                      <TableCell>{alum.name}</TableCell>
                      <TableCell>{alum.batchYear || "-"}</TableCell>
                      <TableCell>{alum.currentRole || "-"}</TableCell>
                      <TableCell>{alum.currentCompany || "-"}</TableCell>
                      <TableCell>{alum.email}</TableCell>
                      <TableCell>
                        <Badge variant={alum.isVerified ? "default" : "secondary"}>
                          {alum.isVerified ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!alum.isVerified && (
                          <Button size="sm" variant="outline" onClick={() => verifyAlumni(alum.id)}>
                            Verify
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {alumni.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No alumni found. Register alumni to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Alumni Events</CardTitle>
              <CardDescription>Reunions and networking events</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event: AlumniEvent) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.name}</TableCell>
                      <TableCell>
                        {event.date ? new Date(event.date).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>{event.location || "-"}</TableCell>
                      <TableCell>{event.type}</TableCell>
                      <TableCell>{event._count?.registrations || 0}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {events.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No events found. Create an event to engage alumni.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <CardTitle>Donations</CardTitle>
              <CardDescription>Alumni contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Select an alumni member to view donation history
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Alumni accomplishments and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Select an alumni member to view achievements
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
