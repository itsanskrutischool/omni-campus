"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DialogFooter } from "@/components/ui/dialog"
import { useSession } from "next-auth/react"

interface Hostel {
  id: string
  name: string
  code: string
  location: string
  capacity: number
  occupied: number
  _count?: {
    rooms: number
  }
}

interface Room {
  id: string
  roomNumber: string
  hostelId: string
  capacity: number
  occupied: number
  studentId?: string
  studentName?: string
}

interface HostelStatistics {
  totalHostels: number
  totalRooms: number
  totalCapacity: number
  totalOccupied: number
  availableRooms: number
  occupancyRate: number
  availableBeds: number
}

export default function HostelPage() {
  const { data: session } = useSession()
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [statistics, setStatistics] = useState<HostelStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedHostel, setSelectedHostel] = useState("")
  const [isHostelDialogOpen, setIsHostelDialogOpen] = useState(false)
  const [hostelName, setHostelName] = useState("")
  const [hostelCode, setHostelCode] = useState("")
  const [hostelLocation, setHostelLocation] = useState("")
  const [hostelCapacity, setHostelCapacity] = useState("")

  useEffect(() => {
    if (session?.user?.tenantId) {
      loadData()
    }
  }, [session?.user?.tenantId])

  const loadData = async () => {
    try {
      setLoading(true)
      const tenantId = session?.user?.tenantId

      const [hostelsRes, statsRes] = await Promise.all([
        fetch(`/api/hostel?tenantId=${tenantId}&type=hostel`),
        fetch(`/api/hostel?tenantId=${tenantId}&stats=true`),
      ])

      const hostelsData = await hostelsRes.json()
      const stats = await statsRes.json()

      setHostels(hostelsData.hostels || [])
      setStatistics(stats.statistics)
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  const loadRooms = async (hostelId: string) => {
    try {
      const tenantId = session?.user?.tenantId
      if (!tenantId) return
      const res = await fetch(`/api/hostel?tenantId=${tenantId}&type=room&hostelId=${hostelId}`)
      const data = await res.json()
      setRooms(data.rooms || [])
    } catch (error) {
      // Error handled silently
    }
  }

  const allocateRoom = async (roomId: string, studentId: string) => {
    try {
      const tenantId = session?.user?.tenantId
      if (!tenantId) return
      const res = await fetch("/api/hostel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          action: "allocateRoom",
          roomId,
          studentId,
        }),
      })
      const data = await res.json()
      if (data.success) {
        loadRooms(selectedHostel)
      }
    } catch (error) {
      // Error handled silently
    }
  }

  const createHostel = async () => {
    try {
      const tenantId = session?.user?.tenantId
      if (!tenantId) return
      const res = await fetch("/api/hostel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          action: "createHostel",
          name: hostelName,
          code: hostelCode,
          location: hostelLocation,
          capacity: parseInt(hostelCapacity),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsHostelDialogOpen(false)
        setHostelName("")
        setHostelCode("")
        setHostelLocation("")
        setHostelCapacity("")
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
          <h1 className="text-3xl font-bold">Hostel Management</h1>
          <p className="text-muted-foreground">Manage hostels, rooms, and student allocations</p>
        </div>
        <Button onClick={() => setIsHostelDialogOpen(true)}>Create Hostel</Button>
      </div>

      <Dialog open={isHostelDialogOpen} onOpenChange={setIsHostelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Hostel</DialogTitle>
            <DialogDescription>Add a new hostel building</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Hostel Name</Label>
              <Input
                value={hostelName}
                onChange={(e) => setHostelName(e.target.value)}
                placeholder="e.g., Boys Hostel A"
              />
            </div>
            <div>
              <Label>Code</Label>
              <Input
                value={hostelCode}
                onChange={(e) => setHostelCode(e.target.value)}
                placeholder="e.g., BH-A"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={hostelLocation}
                onChange={(e) => setHostelLocation(e.target.value)}
                placeholder="e.g., North Campus"
              />
            </div>
            <div>
              <Label>Capacity</Label>
              <Input
                type="number"
                value={hostelCapacity}
                onChange={(e) => setHostelCapacity(e.target.value)}
                placeholder="100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createHostel}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Hostels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalHostels || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalRooms || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.occupancyRate || 0}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Available Beds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.availableBeds || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="hostels">
        <TabsList>
          <TabsTrigger value="hostels">Hostels</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
        </TabsList>

        <TabsContent value="hostels">
          <Card>
            <CardHeader>
              <CardTitle>Hostels</CardTitle>
              <CardDescription>All hostel buildings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Total Rooms</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hostels.map((hostel: Hostel) => (
                    <TableRow key={hostel.id}>
                      <TableCell>{hostel.name}</TableCell>
                      <TableCell>{hostel.code}</TableCell>
                      <TableCell>{hostel.location}</TableCell>
                      <TableCell>{hostel._count?.rooms || 0}</TableCell>
                      <TableCell>{hostel.capacity || "-"}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => { setSelectedHostel(hostel.id); loadRooms(hostel.id) }}>
                          View Rooms
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {hostels.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No hostels found. Create a hostel to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <CardTitle>Rooms</CardTitle>
              <CardDescription>Room details and occupancy</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Occupied</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room: Room) => (
                    <TableRow key={room.id}>
                      <TableCell>{room.roomNumber}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>{room.occupied}</TableCell>
                      <TableCell>{room.studentName || "-"}</TableCell>
                      <TableCell>
                        {room.studentName ? (
                          <Button size="sm" variant="outline" onClick={() => allocateRoom(room.id, "")}>
                            Deallocate
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            Allocate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {rooms.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No rooms found. Select a hostel to view rooms.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations">
          <Card>
            <CardHeader>
              <CardTitle>Room Allocations</CardTitle>
              <CardDescription>Current student room assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Select a room to view allocations
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
