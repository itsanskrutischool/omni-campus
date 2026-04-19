"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  UserPlus,
  User,
  Users as UsersIcon,
  GraduationCap,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  ClipboardCheck,
  Zap,
  Clock,
  LayoutGrid
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
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────

interface ClassRoom {
  id: string
  name: string
  numeric: number
  sections: { id: string; name: string }[]
}

interface FormData {
  // Step 1: Personal
  name: string
  gender: string
  dob: string
  bloodGroup: string
  category: string
  religion: string
  aadhaar: string
  pen: string
  // Step 2: Parent/Guardian
  fatherName: string
  motherName: string
  guardianName: string
  guardianPhone: string
  phone: string
  emergencyContact: string
  // Step 3: Academic
  classRoomId: string
  sectionId: string
  previousSchool: string
  admissionStatus: string
  // Step 4: Address/Docs
  address: string
  notes: string
}

const INITIAL_FORM: FormData = {
  name: "", gender: "", dob: "", bloodGroup: "", category: "GENERAL",
  religion: "", aadhaar: "", pen: "",
  fatherName: "", motherName: "", guardianName: "", guardianPhone: "",
  phone: "", emergencyContact: "",
  classRoomId: "", sectionId: "", previousSchool: "", admissionStatus: "ADMITTED",
  address: "", notes: "",
}

const STEPS = [
  { id: 1, label: "Personal Info", icon: User, description: "Student's basic identification" },
  { id: 2, label: "Parent / Guardian", icon: UsersIcon, description: "Family & contact hierarchy" },
  { id: 3, label: "Academic Info", icon: GraduationCap, description: "Grade level & prior academic record" },
  { id: 4, label: "Address & Social", icon: FileText, description: "Residence & background details" },
  { id: 5, label: "Review & Commit", icon: CheckCircle2, description: "Final verification & registration" },
]

const GENDERS = ["MALE", "FEMALE", "OTHER"]
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const CATEGORIES = ["GENERAL", "OBC", "SC", "ST", "EWS"]
const ADMISSION_STATUSES = ["ENQUIRY", "APPLIED", "ADMITTED"]

// ─── Component ─────────────────────────────

export default function AdmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [classes, setClasses] = useState<ClassRoom[]>([])
  const [sections, setSections] = useState<{ id: string; name: string }[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [createdAdmNo, setCreatedAdmNo] = useState("")
  const [error, setError] = useState("")

  const [stats, setStats] = useState({ total: 0, active: 0, enquiry: 0, applied: 0, admitted: 0 })
  const [analyzing, setAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)

  useEffect(() => {
    const loadPageData = async () => {
      try {
        const [classesRes, statsRes] = await Promise.all([
          fetch("/api/classes", { cache: "no-store" }),
          fetch("/api/students?stats=true", { cache: "no-store" }),
        ])

        const classesData = await classesRes.json()
        const statsData = await statsRes.json()

        if (classesRes.ok && Array.isArray(classesData)) {
          setClasses(classesData)
          setForm((current) => {
            if (current.classRoomId || classesData.length === 0) {
              return current
            }

            return {
              ...current,
              classRoomId: classesData[0].id,
              sectionId: classesData[0].sections[0]?.id || "",
            }
          })
        } else {
          setClasses([])
        }

        if (statsRes.ok) {
          setStats(statsData)
        }
      } catch (fetchError) {
        console.error("Admissions page bootstrap failed:", fetchError)
        setClasses([])
      } finally {
        setLoadingClasses(false)
      }
    }

    void loadPageData()
  }, [])

  const runAIAnalysis = () => {
    setAnalyzing(true)
    // Simulate premium AI processing
    setTimeout(() => {
      setAiAnalysis(`Predictive Profile: ${form.name} shows high potential for STEM subjects based on background. Recommended placement in fast-track logic programs. Early reading scores suggest a 92% compatibility with the Level 4 Creative program.`)
      setAnalyzing(false)
    }, 2500)
  }

  // When class changes, update sections
  useEffect(() => {
    if (form.classRoomId) {
      const cls = classes.find((c) => c.id === form.classRoomId)
      setSections(cls?.sections || [])
      setForm((current) => {
        const nextSections = cls?.sections || []
        const currentSectionStillValid = nextSections.some((section) => section.id === current.sectionId)

        return {
          ...current,
          sectionId: currentSectionStillValid ? current.sectionId : nextSections[0]?.id || "",
        }
      })
    } else {
      setSections([])
    }
  }, [form.classRoomId, classes])

  const update = (field: keyof FormData, value: string | null) => {
    setForm((f) => ({ ...f, [field]: value ?? "" }))
    setError("")
  }

  const conversionRate = stats.total > 0 ? ((stats.admitted / stats.total) * 100).toFixed(1) : "0.0"

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!form.name || !form.gender || !form.dob) {
          setError("Name, Gender, and Date of Birth are mandatory.")
          return false
        }
        return true
      case 2:
        if (!form.fatherName || !form.motherName || !form.phone) {
          setError("Guardian details and primary phone are mandatory.")
          return false
        }
        return true
      case 3:
        if (!form.classRoomId) {
          setError("Academic classification is mandatory.")
          return false
        }
        return true
      default:
        return true
    }
  }

  const next = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, 5))
      setError("")
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prev = () => {
    setStep((s) => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Mission failed: Enrollment registration rejected")
      }
      const student = await res.json()
      setCreatedAdmNo(student.admissionNumber)
      setSubmitted(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Success Screen ─────────────────────

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] animate-in fade-in zoom-in-95 duration-1000">
        <div className="relative group max-w-lg w-full">
           <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
           <Card variant="glass" className="relative text-center p-2 rounded-[2.5rem] border-emerald-500/10">
              <CardContent className="p-12">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/40 transform transition-transform group-hover:scale-110 duration-700">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-black dark:text-white mb-4 tracking-tighter sticky top-0">
                  Enrollment Successful
                </h2>
                <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
                  The mission was accomplished. Student registration has been synchronized with the core directory.
                </p>
                
                <div className="relative mb-10 group/id">
                  <div className="absolute -inset-4 bg-emerald-500/5 rounded-2xl scale-95 opacity-0 group-hover/id:opacity-100 group-hover/id:scale-100 transition-all duration-500"></div>
                  <div className="relative p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 backdrop-blur-sm">
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-2">
                      Official Admission ID
                    </p>
                    <p className="text-4xl font-black text-emerald-950 dark:text-emerald-50 font-mono tracking-wider">
                      {createdAdmNo}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    className="h-12 px-8 rounded-2xl border-emerald-100 hover:bg-emerald-50 text-emerald-900 font-bold transition-all"
                    onClick={() => {
                      setSubmitted(false)
                      setForm(INITIAL_FORM)
                      setStep(1)
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    New Registration
                  </Button>
                  <Button
                    onClick={() => router.push(`/${tenantSlug}/${role}/students`)}
                    className="h-12 px-8 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold shadow-xl shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95"
                  >
                    View Directory
                  </Button>
                </div>
              </CardContent>
           </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Dynamic Command Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                Mission Operational
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                Live Update
              </div>
           </div>
           <h1 className="text-5xl font-black tracking-tight dark:text-white leading-[1.1]">
              Admission <span className="text-emerald-600">Terminal</span>
           </h1>
           <p className="text-muted-foreground font-semibold mt-3 text-lg">
              Precision enrollment processing for Omni Campus Public School.
           </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex -space-x-3 overflow-hidden">
              {[1,2,3,4].map(i => (
                <div key={i} className="inline-block h-10 w-10 rounded-2xl ring-4 ring-background bg-muted border border-emerald-500/10 shadow-lg overflow-hidden">
                   <img className="h-full w-full object-cover" src={`https://i.pravatar.cc/256?u=${i+10}`} alt="" />
                </div>
              ))}
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-900 ring-4 ring-background text-[10px] font-black text-white shadow-lg">
                +12
              </div>
           </div>
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-2">
             Currently <br/> Reviewing
           </p>
        </div>
      </div>

      {/* Strategic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Enrollments" 
          value={stats.total.toLocaleString()} 
          icon={UsersIcon} 
          trend={[30, 45, 38, 52, 60, 58, 70]} 
          description="Total active students registered"
          variant="emerald"
        />
        <StatCard 
          label="Conversion Rate" 
          value={`${conversionRate}%`} 
          icon={Zap} 
          trend={[60, 65, 62, 70, 75, 80, 84]} 
          description="Admissions as a share of registered learners"
          variant="blue"
        />
        <StatCard 
          label="Pending Clearance" 
          value={stats.applied} 
          icon={Clock} 
          trend={[10, 15, 8, 12, 18, 14, 10]} 
          description="Applications awaiting review"
          variant="amber"
        />
      </div>

      {/* Modern Multi-Step Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Navigation Sidebar (Desktop) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="sticky top-10">
            <p className="text-[10px] font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-[0.2em] mb-6 pl-4">
              Operation Stages
            </p>
            {STEPS.map((s) => {
              const StepIcon = s.icon
              const isCurrent = s.id === step
              const isCompleted = s.id < step
              
              return (
                <button
                  key={s.id}
                  onClick={() => s.id < step && setStep(s.id)}
                  disabled={s.id > step}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-[1.25rem] transition-all duration-500 text-left group",
                    isCurrent 
                      ? "bg-emerald-900 text-white shadow-2xl shadow-emerald-900/30 translate-x-2" 
                      : isCompleted
                      ? "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 cursor-pointer"
                      : "text-muted-foreground/50 opacity-60 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                    isCurrent ? "bg-white/20" : isCompleted ? "bg-emerald-100" : "bg-muted"
                  )}>
                    {isCompleted ? <ClipboardCheck className="w-5 h-5" /> : <StepIcon className={cn("w-5 h-5", isCurrent && "text-white")} />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black uppercase tracking-tight leading-none mb-1">{s.label}</span>
                    <span className="text-[9px] font-bold opacity-60 truncate">{isCompleted ? "Completed" : isCurrent ? "Active" : "Locked"}</span>
                  </div>
                  {isCurrent && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Form Content Terminal */}
        <div className="lg:col-span-9">
           <Card variant="glass" className="border-emerald-500/5 overflow-hidden group/card shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/card:opacity-10 transition-opacity duration-1000">
                 <LayoutGrid className="w-40 h-40 scale-150 rotate-12" />
              </div>

              <CardHeader className="p-8 border-b border-emerald-500/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                     <Sparkles className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tight">{STEPS[step - 1].label}</CardTitle>
                    <CardDescription className="text-sm font-medium">{STEPS[step - 1].description}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 md:p-12">
                {error && (
                  <div className="mb-10 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-bold flex items-center gap-3 animate-shake">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    {error}
                  </div>
                )}

                <div className="space-y-12">
                  
                  {/* Step 1: Personal Identification */}
                  {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                      <div className="md:col-span-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 mb-4 block">
                          Legal Full Name
                        </Label>
                        <Input
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="e.g. ARJUN MALHOTRA"
                          className="h-16 text-lg font-black bg-muted/30 border-none focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-2xl"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                          Gender Classification
                        </Label>
                        <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                          <SelectTrigger className="h-14 bg-muted/30 border-none rounded-2xl font-bold">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {GENDERS.map((g) => (
                              <SelectItem key={g} value={g} className="font-bold">{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                          Date of Birth
                        </Label>
                        <Input
                          type="date"
                          value={form.dob}
                          onChange={(e) => update("dob", e.target.value)}
                          className="h-14 bg-muted/30 border-none rounded-2xl font-bold"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                          Blood Group
                        </Label>
                        <Select value={form.bloodGroup} onValueChange={(v) => update("bloodGroup", v)}>
                          <SelectTrigger className="h-14 bg-muted/30 border-none rounded-2xl font-bold">
                            <SelectValue placeholder="Unknown" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {BLOOD_GROUPS.map((b) => (
                              <SelectItem key={b} value={b} className="font-bold">{b}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                          Social Category
                        </Label>
                        <Select value={form.category} onValueChange={(v) => update("category", v)}>
                          <SelectTrigger className="h-14 bg-muted/30 border-none rounded-2xl font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-emerald-500/5">
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                            Aadhaar Identification
                          </Label>
                          <Input
                            value={form.aadhaar}
                            onChange={(e) => update("aadhaar", e.target.value)}
                            placeholder="12 Digit Numeric ID"
                            maxLength={12}
                            className="h-14 bg-muted/30 border-none rounded-2xl font-mono text-lg font-black tracking-widest"
                          />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                            Permanent Education No. (PEN)
                          </Label>
                          <Input
                            value={form.pen}
                            onChange={(e) => update("pen", e.target.value)}
                            placeholder="Government Issued PEN"
                            className="h-14 bg-muted/30 border-none rounded-2xl font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Parent/Guardian Architecture */}
                  {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                          Father's Full Name
                        </Label>
                        <Input
                          value={form.fatherName}
                          onChange={(e) => update("fatherName", e.target.value)}
                          placeholder="Legal name of father"
                          className="h-14 bg-muted/30 border-none rounded-2xl font-bold"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                          Mother's Full Name
                        </Label>
                        <Input
                          value={form.motherName}
                          onChange={(e) => update("motherName", e.target.value)}
                          placeholder="Legal name of mother"
                          className="h-14 bg-muted/30 border-none rounded-2xl font-bold"
                        />
                      </div>
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-emerald-500/5">
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                            Primary Communication Phone
                          </Label>
                          <Input
                            value={form.phone}
                            onChange={(e) => update("phone", e.target.value)}
                            placeholder="+91-XXXXXXXXXX"
                            className="h-14 bg-muted/30 border-none rounded-2xl font-black text-lg tracking-widest"
                          />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                            Emergency Contact Protocol
                          </Label>
                          <Input
                            value={form.emergencyContact}
                            onChange={(e) => update("emergencyContact", e.target.value)}
                            placeholder="Alternative phone number"
                            className="h-14 bg-muted/30 border-none rounded-2xl font-bold"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                          Legal Guardian (Optional)
                        </Label>
                        <Input
                          value={form.guardianName}
                          onChange={(e) => update("guardianName", e.target.value)}
                          placeholder="Only if student lives with guardian"
                          className="h-14 bg-muted/30 border-none rounded-2xl font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Academic Strategic Placement */}
                  {step === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                          Target Academic Class
                        </Label>
                        <Select
                          value={form.classRoomId}
                          onValueChange={(v) => update("classRoomId", v)}
                          disabled={loadingClasses || classes.length === 0}
                        >
                          <SelectTrigger className="h-14 bg-muted/30 border-none rounded-2xl font-black">
                            <SelectValue placeholder={loadingClasses ? "Loading classes..." : "Choose Class"} />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {classes.map((c) => (
                              <SelectItem key={c.id} value={c.id} className="font-bold">
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {loadingClasses
                            ? "Loading academic structure..."
                            : classes.length > 0
                              ? `${classes.length} classes ready for assignment`
                              : "No classes available. Check Academic Structure."}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                          Section Assignment
                        </Label>
                        <Select
                          value={form.sectionId}
                          onValueChange={(v) => update("sectionId", v)}
                          disabled={sections.length === 0}
                        >
                          <SelectTrigger className="h-14 bg-muted/30 border-none rounded-2xl font-bold">
                            <SelectValue placeholder={sections.length ? "Select Section" : "Verify Class First"} />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {sections.map((s) => (
                              <SelectItem key={s.id} value={s.id} className="font-bold">
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {sections.length > 0
                            ? `${sections.length} sections available in the selected class`
                            : "Pick a class to unlock sections"}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                          Initial Admission State
                        </Label>
                        <Select value={form.admissionStatus} onValueChange={(v) => update("admissionStatus", v)}>
                          <SelectTrigger className="h-14 bg-muted/30 border-none rounded-2xl font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {ADMISSION_STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                          Prior Educational Institution
                        </Label>
                        <Input
                          value={form.previousSchool}
                          onChange={(e) => update("previousSchool", e.target.value)}
                          placeholder="Name of last attended school"
                          className="h-14 bg-muted/30 border-none rounded-2xl font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Geographic & Remarks */}
                  {step === 4 && (
                    <div className="grid grid-cols-1 gap-12">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                          Permanent Residential Logistics
                        </Label>
                        <Textarea
                          value={form.address}
                          onChange={(e) => update("address", e.target.value)}
                          placeholder="Enter full verifiable address..."
                          rows={4}
                          className="text-lg font-bold bg-muted/30 border-none rounded-2xl focus-visible:ring-emerald-500 p-6"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/60 dark:text-emerald-400/60 block">
                          Special Observations / Intelligence
                        </Label>
                        <Textarea
                          value={form.notes}
                          onChange={(e) => update("notes", e.target.value)}
                          placeholder="Any specific health, academic or social remarks..."
                          rows={4}
                          className="text-lg font-bold bg-muted/30 border-none rounded-2xl focus-visible:ring-emerald-500 p-6"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 5: Verification & Synchronization */}
                  {step === 5 && (
                    <div className="space-y-10">
                      <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-5 transition-all hover:bg-emerald-500/10 active:scale-[0.99] cursor-default">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-900 flex items-center justify-center shrink-0 shadow-lg" >
                           <Sparkles className="w-6 h-6 text-emerald-400" />
                        </div>
                        <p className="text-sm text-emerald-900 dark:text-emerald-50 font-black leading-snug">
                          All systems verified. Submitting this form will synchronize data with the global directory and generate an official Enrollment ID.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {[
                          {
                            title: "Personnel Data",
                            fields: [
                              ["Name", form.name],
                              ["Gender", form.gender],
                              ["DOB", form.dob],
                              ["Category", form.category],
                            ],
                          },
                          {
                            title: "Contact Infrastructure",
                            fields: [
                              ["Father", form.fatherName],
                              ["Primary Phone", form.phone],
                              ["Class", classes.find((c) => c.id === form.classRoomId)?.name || "N/A"],
                              ["Status", form.admissionStatus],
                            ],
                          },
                        ].map((section) => (
                          <div key={section.title} className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 pl-2 border-l-4 border-emerald-600">
                              {section.title}
                            </h3>
                            <div className="space-y-5 pl-3" >
                               {section.fields.map(([label, value]) => (
                                 <div key={label} className="group/item">
                                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 group-hover/item:text-emerald-600 transition-colors">{label}</p>
                                   <p className="text-lg font-black dark:text-white truncate">{value || "—"}</p>
                                 </div>
                               ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* AI Enrichment Layer */}
                      <div className="mt-10 p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500 rounded-xl">
                              <Zap className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black dark:text-white">AI Enrollment Analyst</h4>
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Powered by Omni-Intelligence</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={runAIAnalysis} 
                            disabled={analyzing || !!aiAnalysis}
                            className="text-indigo-600 font-bold hover:text-indigo-700 hover:bg-indigo-50"
                          >
                            {analyzing ? "Analyzing..." : aiAnalysis ? "Analysis Complete" : "Generate Profile"}
                          </Button>
                        </div>
                        
                        {analyzing && (
                           <div className="space-y-2 animate-pulse">
                             <div className="h-2 bg-indigo-200 dark:bg-indigo-900 rounded w-full"></div>
                             <div className="h-2 bg-indigo-200 dark:bg-indigo-900 rounded w-3/4"></div>
                           </div>
                        )}

                        {aiAnalysis && (
                          <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs font-medium dark:text-indigo-200 leading-relaxed italic"
                          >
                            {aiAnalysis}
                          </motion.p>
                        )}

                        {!aiAnalysis && !analyzing && (
                          <p className="text-[11px] text-muted-foreground font-medium">
                            Generate a pedagogical predictive profile based on student demographics and background notes.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Operational Controls */}
                  <div className="flex items-center justify-between pt-12 mt-12 border-t border-emerald-500/5">
                    <Button
                      variant="ghost"
                      onClick={prev}
                      disabled={step === 1}
                      className={cn(
                        "h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                        step === 1 ? "opacity-0 invisible" : "text-muted-foreground hover:bg-emerald-50 dark:hover:bg-emerald-500/5 hover:text-emerald-900"
                      )}
                    >
                      <ArrowLeft className="w-4 h-4 mr-3" />
                      Backtrack
                    </Button>

                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black text-muted-foreground tracking-[0.3em] uppercase hidden sm:block">
                         Sequence {step} / 5
                       </span>
                       {step < 5 ? (
                        <Button 
                          onClick={next} 
                          className="h-14 px-8 rounded-2xl bg-emerald-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 group"
                        >
                          Execute Logic
                          <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                              Synchronizing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-3" />
                              Commit Registration
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
