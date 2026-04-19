"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  User, 
  CreditCard, 
  ClipboardCheck, 
  FileText, 
  History,
  Info,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  UploadCloud,
  FileUp,
  Image as ImageIcon
} from "lucide-react"
import { Student, ClassRoom, Section, FeeRecord, AttendanceRecord, StudentDocument, Batch, FeeStructure, MarkEntry, Exam, Subject } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

type StudentWithExtras = Student & {
  classroom: ClassRoom | null
  section: Section | null
  batch: Batch | null
  feeRecords: (FeeRecord & { feeStructure: FeeStructure })[]
  attendance: AttendanceRecord[]
  documents: StudentDocument[]
  markEntries: (MarkEntry & { exam: Exam; subject: Subject })[]
}

interface ProfileTabsProps {
  student: StudentWithExtras
}

export function ProfileTabs({ student }: ProfileTabsProps) {
  // Group mark entries by exam
  const groupedAcademic = Object.values(
    student.markEntries.reduce((acc, entry) => {
      const examId = entry.exam.id
      if (!acc[examId]) {
        acc[examId] = {
          exam: entry.exam,
          entries: []
        }
      }
      acc[examId].entries.push(entry)
      return acc
    }, {} as Record<string, { exam: Exam, entries: (MarkEntry & { subject: Subject })[] }>)
  ).sort((a, b) => new Date(b.exam.startDate).getTime() - new Date(a.exam.startDate).getTime())

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1 bg-secondary/50 rounded-2xl border border-secondary">
          <TabsTrigger value="general" className="rounded-xl py-3 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <User className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="fees" className="rounded-xl py-3 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <CreditCard className="h-4 w-4 mr-2" />
            Fees
          </TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-xl py-3 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-xl py-3 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="academic" className="rounded-xl py-3 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <History className="h-4 w-4 mr-2" />
            Academic
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="general" className="m-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-3xl border-none shadow-xl shadow-primary/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Info className="h-5 w-5" />
                    <span>Personal Information</span>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-y-6 py-6">
                  <DetailItem label="Full Name" value={student.name} />
                  <DetailItem label="Gender" value={student.gender} />
                  <DetailItem label="DOB" value={new Date(student.dob).toLocaleDateString()} />
                  <DetailItem label="Blood Group" value={student.bloodGroup || "O+"} />
                  <DetailItem label="Category" value={student.category} />
                  <DetailItem label="Religion" value={student.religion || "Not set"} />
                  <DetailItem label="Aadhaar" value={student.aadhaar || "Not verified"} isSensitive />
                  <DetailItem label="PEN Number" value={student.pen || "Not allocated"} />
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-none shadow-xl shadow-primary/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <ShieldCheck className="h-5 w-5" />
                    <span>Parent / Guardian</span>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-y-6 py-6">
                  <DetailItem label="Father's Name" value={student.fatherName} />
                  <DetailItem label="Mother's Name" value={student.motherName} />
                  <DetailItem label="Guardian Name" value={student.guardianName || "Father"} />
                  <DetailItem label="Guardian Phone" value={student.guardianPhone || student.phone} />
                  <DetailItem label="Emergency Contact" value={student.emergencyContact || student.phone} />
                  <DetailItem label="Current Address" value={student.address || "No address provided"} fullWidth />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fees" className="m-0">
            <Card className="rounded-3xl border-none shadow-xl shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl font-black">Fee Records</CardTitle>
                <CardDescription>Comprehensive fee history and pending dues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {student.feeRecords.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed">
                      No fee records found for this student.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {student.feeRecords.map((record) => (
                        <div key={record.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-secondary/20 rounded-2xl border border-secondary hover:border-primary/20 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${record.status === 'PAID' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                              <CreditCard className={`h-6 w-6 ${record.status === 'PAID' ? 'text-emerald-500' : 'text-red-500'}`} />
                            </div>
                            <div>
                              <p className="font-bold text-lg leading-tight">{record.feeStructure.name}</p>
                              <p className="text-sm text-muted-foreground">Due: {new Date(record.dueDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="mt-4 sm:mt-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                             <p className="text-lg font-black">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(record.amountDue)}</p>
                             <Badge className={record.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}>
                               {record.status}
                             </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="m-0">
            <Card className="rounded-3xl border-none shadow-xl shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl font-black">Recent Attendance</CardTitle>
                <CardDescription>Visual tracker for the last 30 entries</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="flex flex-wrap gap-2">
                   {student.attendance.length === 0 ? (
                     <div className="w-full py-12 text-center text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed">
                       No attendance data available.
                     </div>
                   ) : (
                     student.attendance.map((entry) => (
                       <AttendanceDot key={entry.id} entry={entry} />
                     ))
                   )}
                 </div>
                 <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                   <AttendanceStats label="Present" count={student.attendance.filter(a => a.status === 'PRESENT').length} color="text-emerald-500" />
                   <AttendanceStats label="Absent" count={student.attendance.filter(a => a.status === 'ABSENT').length} color="text-red-500" />
                   <AttendanceStats label="Late" count={student.attendance.filter(a => a.status === 'LATE').length} color="text-amber-500" />
                   <AttendanceStats label="Total" count={student.attendance.length} color="text-primary" />
                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="m-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {student.documents.length === 0 ? (
                <div className="col-span-full py-20 text-center text-muted-foreground bg-secondary/20 rounded-3xl border-2 border-dashed">
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="h-12 w-12 text-muted-foreground/30" />
                    <p className="font-bold">No documents uploaded</p>
                    <Dialog>
                      <DialogTrigger render={<Button variant="outline" className="rounded-xl mt-2 font-bold gap-2" />}>
                        <UploadCloud className="h-4 w-4" />
                        Upload Documents
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Upload Document</DialogTitle>
                          <DialogDescription>Add a new document to the student's file.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="type">Document Type</Label>
                            <Input id="type" placeholder="e.g. Birth Certificate, Transfer Certificate" className="rounded-xl" />
                          </div>
                          <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary/50 transition-colors">
                            <FileUp className="h-10 w-10 text-muted-foreground/50" />
                            <p className="text-sm font-bold text-muted-foreground">Click or drag file to upload</p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="rounded-xl font-bold w-full">Upload</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ) : (
                <>
                  {student.documents.map((doc) => (
                    <Card key={doc.id} className="rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all group">
                      <div className="h-32 bg-secondary/50 flex items-center justify-center">
                         <FileText className="h-10 w-10 text-primary/40 group-hover:scale-110 transition-transform" />
                      </div>
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-bold truncate">{doc.type}</CardTitle>
                        <CardDescription className="text-[10px]">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Button render={<a href={doc.fileUrl} target="_blank" />} variant="secondary" className="w-full rounded-xl font-bold gap-2">
                          <ExternalLink className="h-4 w-4" />
                          View Document
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Upload new document card */}
                  <Card className="rounded-3xl border-2 border-dashed flex items-center justify-center bg-transparent shadow-none hover:bg-secondary/20 transition-colors min-h-[220px]">
                    <Dialog>
                      <DialogTrigger render={<Button variant="ghost" className="h-full w-full rounded-3xl flex-col gap-3 text-muted-foreground font-bold hover:text-foreground" />}>
                        <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                        Upload New Document
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Upload Document</DialogTitle>
                          <DialogDescription>Add a new document to the student's file.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="upload-type">Document Type</Label>
                            <Input id="upload-type" placeholder="e.g. Birth Certificate, Medical Record" className="rounded-xl" />
                          </div>
                          <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary/50 transition-colors">
                            <FileUp className="h-10 w-10 text-muted-foreground/50" />
                            <p className="text-sm font-bold text-muted-foreground">Click or drag file to upload</p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="rounded-xl font-bold w-full">Upload</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="academic" className="m-0">
             <Card className="rounded-3xl border-none shadow-xl shadow-primary/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-black">Academic Records</CardTitle>
                  <CardDescription>Track batches, programs and results</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary/30 rounded-2xl border border-secondary flex flex-col justify-center">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Current Batch</p>
                      <p className="text-lg font-bold">{student.batch?.name || "Not assigned"}</p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-2xl border border-secondary flex flex-col justify-center">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Admission Date</p>
                      <p className="text-lg font-bold">{new Date(student.admissionDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {groupedAcademic.length === 0 ? (
                    <div className="p-8 text-center bg-secondary/20 rounded-3xl border border-dashed">
                       <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                       <p className="text-muted-foreground font-bold italic">Detailed mark history and report cards will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 mt-4">
                      <h3 className="text-lg font-black bg-secondary/30 w-fit px-4 py-1 rounded-full text-foreground/80">Exam Results</h3>
                      {groupedAcademic.map((group) => {
                        const maxTotal = group.entries.reduce((sum, entry) => sum + (entry.maxMarks || 100), 0)
                        const obtainedTotal = group.entries.reduce((sum, entry) => sum + (entry.marks || 0), 0)
                        const percentage = maxTotal > 0 ? (obtainedTotal / maxTotal) * 100 : 0
                        let grade = "F"
                        if (percentage >= 90) grade = "A+"
                        else if (percentage >= 80) grade = "A"
                        else if (percentage >= 70) grade = "B+"
                        else if (percentage >= 60) grade = "B"
                        else if (percentage >= 50) grade = "C+"
                        else if (percentage >= 40) grade = "C"

                        return (
                          <div key={group.exam.id} className="rounded-2xl border border-secondary overflow-hidden group">
                            <div className="bg-secondary/30 p-4 border-b border-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <h4 className="font-bold text-lg text-foreground">{group.exam.name}</h4>
                                <p className="text-xs text-muted-foreground font-medium">Valid from {new Date(group.exam.startDate).toLocaleDateString()} to {new Date(group.exam.endDate).toLocaleDateString()}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">Total</p>
                                  <p className="font-bold leading-none">{obtainedTotal} / {maxTotal}</p>
                                </div>
                                <div className="h-8 border-l border-border mx-1"></div>
                                <div className="text-right">
                                  <p className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">Grade</p>
                                  <p className="font-black text-primary leading-none">{grade}</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-0">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-secondary bg-secondary/10">
                                      <th className="pr-4 pl-6 py-3 text-left font-bold text-muted-foreground w-1/2">Subject</th>
                                      <th className="px-4 py-3 text-right font-bold text-muted-foreground w-1/4">Marks</th>
                                      <th className="pl-4 pr-6 py-3 text-left font-bold text-muted-foreground w-1/4">Grade</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {group.entries.map((entry) => (
                                      <tr key={entry.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
                                        <td className="pr-4 pl-6 py-3 font-medium text-foreground">{entry.subject.name}</td>
                                        <td className="px-4 py-3 text-right">
                                          <div className="font-bold text-foreground">
                                            {entry.marks} <span className="text-muted-foreground text-xs font-normal">/ {entry.maxMarks}</span>
                                          </div>
                                        </td>
                                          <td className="pl-4 pr-6 py-3 text-left">
                                            {entry.grade ? (
                                              <Badge variant="outline" className="bg-primary/10 text-primary border-none">{entry.grade}</Badge>
                                            ) : (
                                              <span className="text-muted-foreground text-sm">N/A</span>
                                            )}
                                          </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
             </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

function DetailItem({ label, value, isSensitive, fullWidth }: { label: string; value: string; isSensitive?: boolean; fullWidth?: boolean }) {
  return (
    <div className={`space-y-1 ${fullWidth ? 'col-span-2' : ''}`}>
      <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground leading-none">{label}</p>
      <p className={`font-bold text-foreground leading-tight ${isSensitive ? 'blur-sm hover:blur-none transition-all cursor-help' : ''}`}>
        {value}
      </p>
    </div>
  )
}

function AttendanceDot({ entry }: { entry: AttendanceRecord }) {
  const statusColors: Record<string, string> = {
    PRESENT: "bg-emerald-500",
    ABSENT: "bg-red-500",
    LATE: "bg-amber-500",
    HOLIDAY: "bg-blue-400"
  }

  return (
    <div className="group relative">
      <div className={`h-6 w-6 rounded-md ${statusColors[entry.status] || 'bg-slate-300'} shadow-sm group-hover:scale-110 transition-transform cursor-pointer`} />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 hidden group-hover:block z-50">
        <div className="bg-popover text-popover-foreground text-[10px] p-2 rounded-lg shadow-xl border border-border">
          <p className="font-black">{new Date(entry.date).toLocaleDateString()}</p>
          <p className="font-bold opacity-80">{entry.status}</p>
          {entry.remarks && <p className="italic mt-1 border-t pt-1 border-border/50">{entry.remarks}</p>}
        </div>
      </div>
    </div>
  )
}

function AttendanceStats({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="p-4 bg-secondary/40 rounded-2xl border border-secondary text-center">
      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${color}`}>{count}</p>
    </div>
  )
}
