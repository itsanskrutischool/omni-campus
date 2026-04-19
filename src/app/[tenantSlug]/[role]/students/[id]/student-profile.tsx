"use client"

import { Student, ClassRoom, Section, FeeRecord, AttendanceRecord, StudentDocument, Batch, FeeStructure, MarkEntry, Exam, Subject } from "@prisma/client"
import { VibrantCard } from "@/components/ui/vibrant-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProfileTabs } from "./profile-tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  GraduationCap, 
  CreditCard, 
  ClipboardCheck, 
  FileText,
  Edit,
  ArrowRightLeft
} from "lucide-react"

type StudentWithExtras = Student & {
  classroom: ClassRoom | null
  section: Section | null
  batch: Batch | null
  feeRecords: (FeeRecord & { feeStructure: FeeStructure })[]
  attendance: AttendanceRecord[]
  documents: StudentDocument[]
  markEntries: (MarkEntry & { exam: Exam; subject: Subject })[]
}

interface StudentProfileProps {
  student: StudentWithExtras
  tenantSlug: string
  role: string
}

export function StudentProfile({ student, tenantSlug, role }: StudentProfileProps) {
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase()

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    INACTIVE: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    TRANSFERRED: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    PASSED_OUT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <VibrantCard glowColor="blue" className="overflow-hidden border-none shadow-2xl shadow-primary/5">
        <div className="p-8 md:p-10 relative">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
          
          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <div className="relative group">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-background shadow-xl rounded-2xl group-hover:scale-105 transition-transform duration-500">
                <AvatarImage src={student.profileImage || ""} alt={student.name} className="object-cover" />
                <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary rounded-2xl">
                  {getInitials(student.name)}
                </AvatarFallback>
              </Avatar>
              <Badge 
                className={`absolute -bottom-2 right-4 px-3 py-1 font-semibold border shadow-lg ${statusColors[student.status] || statusColors.ACTIVE}`}
              >
                {student.status}
              </Badge>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                    {student.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded-md text-sm">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      {student.classroom?.name} - {student.section?.name || "No Section"}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm">
                      <span className="text-primary/60 font-bold">ID:</span> {student.admissionNumber}
                    </span>
                    {student.rollNumber && (
                      <span className="flex items-center gap-1.5 text-sm border-l border-border pl-4">
                        <span className="text-primary/60 font-bold">Roll:</span> {student.rollNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="rounded-xl font-bold bg-background/50 hover:bg-background"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Coming Soon
                  </Button>
                  <Dialog>
                    <DialogTrigger render={<Button variant="outline" className="rounded-xl font-bold bg-background/50 hover:bg-background text-amber-600 hover:text-amber-700 hover:bg-amber-50" />}>
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      TC / Transfer
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Issue Transfer Certificate (TC)</DialogTitle>
                        <DialogDescription>
                          Initiate a transfer or issue a TC for {student.name}. This is a stubbed UI.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="tc-reason">Reason for Transfer</Label>
                          <Input id="tc-reason" placeholder="e.g. Relocation, Graduation" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="tc-date">Date of Transfer</Label>
                          <Input id="tc-date" type="date" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="tc-comments">Additional Comments</Label>
                          <Textarea id="tc-comments" placeholder="Any additional notes..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline">Cancel</Button>
                        <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Issue TC</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-2xl border border-secondary">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground leading-none mb-1">Contact</p>
                    <p className="text-sm font-bold truncate">{student.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-2xl border border-secondary">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground leading-none mb-1">DOB</p>
                    <p className="text-sm font-bold">{new Date(student.dob).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-2xl border border-secondary">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground leading-none mb-1">Father's Name</p>
                    <p className="text-sm font-bold truncate">{student.fatherName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-2xl border border-secondary">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground leading-none mb-1">Address</p>
                    <p className="text-sm font-bold truncate">{student.address || "Not set"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </VibrantCard>

      {/* Detail Tabs */}
      <ProfileTabs student={student} />
    </div>
  )
}
