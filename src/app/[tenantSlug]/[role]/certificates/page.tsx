"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { FileText, Download, Search, User, CheckCircle2, AlertCircle, Loader2, Shield, ScrollText, FileBadge } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const CERT_TYPES = [
  { id: "BONAFIDE", name: "Bonafide Certificate", icon: Shield, color: "emerald", desc: "Proof of studentship for official purposes" },
  { id: "CHARACTER", name: "Character Certificate", icon: FileBadge, color: "blue", desc: "Moral character and conduct assessment" },
  { id: "TC", name: "Transfer Certificate", icon: ScrollText, color: "purple", desc: "For leaving the institution and joining another" },
]

export default function CertificatesPage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  const [studentId, setStudentId] = useState("")
  const [selectedCert, setSelectedCert] = useState<string | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)
  const [generated, setGenerated] = useState<string[]>([])
  const [error, setError] = useState("")
  const [studentInfo, setStudentInfo] = useState<{ id: string; name: string; admissionNumber: string; classRoom?: { name: string }; section?: { name: string } } | null>(null)
  const [searching, setSearching] = useState(false)

  const searchStudent = async () => {
    if (!studentId) return
    setSearching(true)
    setError("")
    setStudentInfo(null)
    try {
      const res = await fetch(`/api/certificates?studentId=${studentId}`)
      if (res.ok) {
        const data = await res.json()
        setStudentInfo(data.student)
      } else {
        setError("Student not found. Check the admission number.")
      }
    } catch (err) {
      setError("Failed to search. Please try again.")
    } finally {
      setSearching(false)
    }
  }

  const generateCertificate = async (certType: string) => {
    if (!studentId) return
    setGenerating(certType)
    setError("")
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateType: certType, studentId }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${certType}_${studentId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setGenerated(prev => [...prev, certType])
      } else {
        const err = await res.json()
        setError(err.error || "Failed to generate certificate")
      }
    } catch (err) {
      setError("Failed to generate certificate. Please try again.")
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">

      {/* Header */}
      <div className="space-y-4 px-2">
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest inline-block">Document Generator</div>
        <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">Certificate <span className="text-emerald-600">Terminal</span></h1>
        <p className="text-muted-foreground font-semibold max-w-xl text-lg">Generate official certificates: Bonafide, Character, and Transfer Certificates.</p>
      </div>

      {/* Student Search */}
      <Card className="border-emerald-500/5 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-black flex items-center gap-2"><Search className="w-5 h-5 text-emerald-500" /> Student Identification</CardTitle>
          <CardDescription>Search by admission number or student ID to generate certificates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="studentId">Admission Number / Student ID</Label>
              <Input id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchStudent()} className="rounded-xl mt-1 h-12 font-bold" placeholder="e.g., 202400001" />
            </div>
            <div className="flex items-end">
              <Button onClick={searchStudent} disabled={searching || !studentId} className="h-12 px-8 rounded-xl bg-emerald-900 hover:bg-black font-bold">
                {searching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Search
              </Button>
            </div>
          </div>

          {/* Student Info */}
          {studentInfo && (
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center"><User className="w-6 h-6 text-emerald-600" /></div>
              <div>
                <p className="font-black text-lg text-emerald-900 dark:text-white">{studentInfo.name}</p>
                <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest">ADM: {studentInfo.admissionNumber} · Class: {studentInfo.classRoom?.name || "N/A"} - {studentInfo.section?.name || "N/A"}</p>
              </div>
              <Badge className="ml-auto bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black text-[10px] uppercase"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</Badge>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-500/20 flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-bold text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificate Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
        {CERT_TYPES.map((cert) => {
          const isGenerated = generated.includes(cert.id)
          const isGenerating = generating === cert.id
          return (
            <Card key={cert.id} className={cn(
              "border-2 transition-all shadow-lg hover:shadow-xl",
              selectedCert === cert.id ? "border-emerald-500 shadow-emerald-500/20" : "border-muted/20",
              isGenerated && "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-900/5"
            )}>
              <CardHeader>
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
                  cert.color === "emerald" && "bg-emerald-500/10 text-emerald-600",
                  cert.color === "blue" && "bg-blue-500/10 text-blue-600",
                  cert.color === "purple" && "bg-purple-500/10 text-purple-600",
                )}>
                  <cert.icon className="w-7 h-7" />
                </div>
                <CardTitle className="text-lg font-black">{cert.name}</CardTitle>
                <CardDescription className="text-sm">{cert.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerated && (
                  <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black text-[10px] uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Generated
                  </Badge>
                )}
                <Button
                  onClick={() => generateCertificate(cert.id)}
                  disabled={!studentId || isGenerating}
                  className={cn(
                    "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                    isGenerating && "opacity-70",
                    isGenerated
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "bg-emerald-900 hover:bg-black text-white"
                  )}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : isGenerated ? (
                    <Download className="w-4 h-4 mr-2" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  {isGenerating ? "Generating..." : isGenerated ? "Download Again" : "Generate PDF"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
