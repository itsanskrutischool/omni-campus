"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  Users,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Types
interface ClassRoom {
  id: string
  name: string
  numeric: number
}

interface Section {
  id: string
  name: string
  classRoomId: string
}

interface StudentData {
  id: string
  admissionNumber: string
  rollNumber: string | null
  name: string
  gender: string
  dob: string
  aadhaar: string | null
  pen: string | null
  bloodGroup: string | null
  category: string
  religion: string | null
  profileImage: string | null
  email: string | null
  fatherName: string
  fatherPhone: string | null
  fatherOccupation: string | null
  motherName: string
  motherPhone: string | null
  motherOccupation: string | null
  guardianName: string | null
  guardianPhone: string | null
  guardianRelation: string | null
  phone: string
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  emergencyContact: string | null
  previousSchool: string | null
  admissionDate: string
  status: string
  notes: string | null
  classRoomId: string | null
  sectionId: string | null
}

export default function EditStudentPage() {
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string
  const studentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [classes, setClasses] = useState<ClassRoom[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<Partial<StudentData>>({})

  // Fetch student and reference data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, classesRes] = await Promise.all([
          fetch(`/api/students/${studentId}`),
          fetch("/api/classes"),
        ])

        if (studentRes.ok) {
          const student = await studentRes.json()
          // Format dates for input fields
          setFormData({
            ...student,
            dob: student.dob ? new Date(student.dob).toISOString().split("T")[0] : "",
            admissionDate: student.admissionDate
              ? new Date(student.admissionDate).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
          })
        } else {
          setError("Failed to load student data")
        }

        if (classesRes.ok) {
          setClasses(await classesRes.json())
        }
      } catch (err) {
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [studentId])

  // Fetch sections when class changes
  useEffect(() => {
    if (formData.classRoomId) {
      fetch(`/api/sections?classRoomId=${formData.classRoomId}`)
        .then((r) => r.json())
        .then((data) => setSections(data || []))
        .catch(() => setSections([]))
    } else {
      setSections([])
    }
  }, [formData.classRoomId])

  const handleInputChange = (field: keyof StudentData, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear section if class changes
    if (field === "classRoomId") {
      setFormData((prev) => ({ ...prev, sectionId: null }))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB")
      return
    }

    setUploadingImage(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("studentId", studentId)

      const res = await fetch("/api/students/upload-image", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setFormData((prev) => ({ ...prev, profileImage: data.url }))
      } else {
        const err = await res.json()
        setError(err.error || "Failed to upload image")
      }
    } catch (err) {
      setError("Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/${tenantSlug}/${role}/students/${studentId}`)
        }, 1500)
      } else {
        const err = await res.json()
        setError(err.error || "Failed to update student")
      }
    } catch (err) {
      setError("Failed to update student")
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "ST"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/${tenantSlug}/${role}/students/${studentId}`}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Edit Student Profile</h1>
            <p className="text-muted-foreground text-sm">Update student information and details</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {error && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-600 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Saved successfully!
            </div>
          )}
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Profile Image Section */}
      <Card className="rounded-3xl border-violet-500/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-32 w-32 ring-4 ring-violet-500/10 shadow-xl rounded-2xl">
                <AvatarImage
                  src={formData.profileImage || ""}
                  alt={formData.name || "Student"}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-black bg-violet-500/10 text-violet-600 rounded-2xl">
                  {getInitials(formData.name || "")}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 shadow-lg transition-all hover:scale-110"
              >
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-black">{formData.name || "Student Name"}</h2>
              <p className="text-muted-foreground text-sm">Admission No: {formData.admissionNumber}</p>
              <div className="flex items-center gap-2 mt-3 justify-center md:justify-start">
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-lg font-black text-[10px] uppercase tracking-wider",
                    formData.status === "ACTIVE" && "border-emerald-500/20 text-emerald-600 bg-emerald-500/10",
                    formData.status === "INACTIVE" && "border-red-500/20 text-red-600 bg-red-500/10",
                    formData.status === "TRANSFERRED" && "border-amber-500/20 text-amber-600 bg-amber-500/10"
                  )}
                >
                  {formData.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formData.classRoomId
                    ? classes.find((c) => c.id === formData.classRoomId)?.name
                    : "No Class"}
                  {formData.sectionId &&
                    ` - ${sections.find((s) => s.id === formData.sectionId)?.name}`}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="rounded-2xl p-1 bg-muted/50">
          <TabsTrigger value="basic" className="rounded-xl font-black text-xs uppercase tracking-wider">
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="parents" className="rounded-xl font-black text-xs uppercase tracking-wider">
            Parents & Guardian
          </TabsTrigger>
          <TabsTrigger value="academic" className="rounded-xl font-black text-xs uppercase tracking-wider">
            Academic
          </TabsTrigger>
          <TabsTrigger value="additional" className="rounded-xl font-black text-xs uppercase tracking-wider">
            Additional Info
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="mt-6 space-y-6">
          <Card className="rounded-3xl border-violet-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <User className="w-5 h-5 text-violet-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Student full name"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="student@example.com"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Contact number"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select
                  value={formData.gender || ""}
                  onValueChange={(v) => handleInputChange("gender", v)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={formData.dob || ""}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select
                  value={formData.bloodGroup || "NONE"}
                  onValueChange={(v) => handleInputChange("bloodGroup", v === "NONE" ? null : v)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Not Specified</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category || "GENERAL"}
                  onValueChange={(v) => handleInputChange("category", v)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="ST">ST</SelectItem>
                    <SelectItem value="OBC">OBC</SelectItem>
                    <SelectItem value="EWS">EWS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Religion</Label>
                <Input
                  value={formData.religion || ""}
                  onChange={(e) => handleInputChange("religion", e.target.value)}
                  placeholder="Religion"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Aadhaar Number</Label>
                <Input
                  value={formData.aadhaar || ""}
                  onChange={(e) => handleInputChange("aadhaar", e.target.value)}
                  placeholder="12-digit Aadhaar"
                  className="rounded-xl"
                  maxLength={12}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-violet-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <MapPin className="w-5 h-5 text-violet-600" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label>Full Address</Label>
                <Textarea
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Complete address"
                  className="rounded-xl min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={formData.city || ""}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="City"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={formData.state || ""}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="State"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input
                  value={formData.pincode || ""}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  placeholder="Pincode"
                  className="rounded-xl"
                  maxLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <Input
                  value={formData.emergencyContact || ""}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder="Emergency contact number"
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parents Tab */}
        <TabsContent value="parents" className="mt-6 space-y-6">
          <Card className="rounded-3xl border-blue-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <Users className="w-5 h-5 text-blue-600" />
                Father&apos;s Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Father&apos;s Name *</Label>
                <Input
                  value={formData.fatherName || ""}
                  onChange={(e) => handleInputChange("fatherName", e.target.value)}
                  placeholder="Father's full name"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Father&apos;s Phone</Label>
                <Input
                  value={formData.fatherPhone || ""}
                  onChange={(e) => handleInputChange("fatherPhone", e.target.value)}
                  placeholder="Contact number"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Father&apos;s Occupation</Label>
                <Input
                  value={formData.fatherOccupation || ""}
                  onChange={(e) => handleInputChange("fatherOccupation", e.target.value)}
                  placeholder="Occupation"
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-pink-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <Users className="w-5 h-5 text-pink-600" />
                Mother&apos;s Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Mother&apos;s Name *</Label>
                <Input
                  value={formData.motherName || ""}
                  onChange={(e) => handleInputChange("motherName", e.target.value)}
                  placeholder="Mother's full name"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Mother&apos;s Phone</Label>
                <Input
                  value={formData.motherPhone || ""}
                  onChange={(e) => handleInputChange("motherPhone", e.target.value)}
                  placeholder="Contact number"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Mother&apos;s Occupation</Label>
                <Input
                  value={formData.motherOccupation || ""}
                  onChange={(e) => handleInputChange("motherOccupation", e.target.value)}
                  placeholder="Occupation"
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-amber-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <Users className="w-5 h-5 text-amber-600" />
                Guardian Information (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Guardian Name</Label>
                <Input
                  value={formData.guardianName || ""}
                  onChange={(e) => handleInputChange("guardianName", e.target.value)}
                  placeholder="Guardian's full name"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Guardian Phone</Label>
                <Input
                  value={formData.guardianPhone || ""}
                  onChange={(e) => handleInputChange("guardianPhone", e.target.value)}
                  placeholder="Contact number"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Relation to Student</Label>
                <Input
                  value={formData.guardianRelation || ""}
                  onChange={(e) => handleInputChange("guardianRelation", e.target.value)}
                  placeholder="e.g., Uncle, Grandparent"
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="mt-6 space-y-6">
          <Card className="rounded-3xl border-emerald-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Roll Number</Label>
                <Input
                  value={formData.rollNumber || ""}
                  onChange={(e) => handleInputChange("rollNumber", e.target.value)}
                  placeholder="Class roll number"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Class</Label>
                <Select
                  value={formData.classRoomId || "NONE"}
                  onValueChange={(v) => handleInputChange("classRoomId", v === "NONE" ? null : v)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">No Class</SelectItem>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Section</Label>
                <Select
                  value={formData.sectionId || "NONE"}
                  onValueChange={(v) => handleInputChange("sectionId", v === "NONE" ? null : v)}
                  disabled={!formData.classRoomId}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={formData.classRoomId ? "Select section" : "Select class first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">No Section</SelectItem>
                    {sections.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        Section {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>PEN (Permanent Education Number)</Label>
                <Input
                  value={formData.pen || ""}
                  onChange={(e) => handleInputChange("pen", e.target.value)}
                  placeholder="PEN issued by board"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Previous School</Label>
                <Input
                  value={formData.previousSchool || ""}
                  onChange={(e) => handleInputChange("previousSchool", e.target.value)}
                  placeholder="Previous school name"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Admission Date</Label>
                <Input
                  type="date"
                  value={formData.admissionDate || ""}
                  onChange={(e) => handleInputChange("admissionDate", e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status || "ACTIVE"}
                  onValueChange={(v) => handleInputChange("status", v)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                    <SelectItem value="PASSED_OUT">Passed Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional Tab */}
        <TabsContent value="additional" className="mt-6">
          <Card className="rounded-3xl border-violet-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <User className="w-5 h-5 text-violet-600" />
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Notes / Remarks</Label>
                <Textarea
                  value={formData.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any additional notes about the student..."
                  className="rounded-xl min-h-[150px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
