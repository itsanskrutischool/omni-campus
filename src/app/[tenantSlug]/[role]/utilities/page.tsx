"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, UploadCloud, Users, GraduationCap, IndianRupee, FileSpreadsheet, FileBadge2, CreditCard } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

export default function UtilitiesHubPage() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const router = useRouter()
  const params = useParams()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  const downloadModule = async (moduleType: string) => {
    setDownloading(moduleType)
    try {
      const response = await fetch(`/api/utilities/export?type=${moduleType}`)
      if (!response.ok) throw new Error("Failed finding endpoint")

      // Browser memory download technique
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      // Grab name safely from headers if exists, otherwise fallback
      const dispo = response.headers.get("content-disposition")
      let name = `${moduleType}_export.csv`
      if (dispo && dispo.includes("filename=")) {
        name = dispo.split("filename=")[1].replace(/"/g, '')
      }
      
      a.download = name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()

    } catch (err) {
      console.error(err)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Utilities</h1>
        <p className="text-muted-foreground mt-1">
          Perform bulk schema operations and safely backup global databases.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Export Drive */}
        <Card className="border-indigo-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10" />
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-xl">Export Engine</CardTitle>
            </div>
            <CardDescription>
              Compile flattened `.csv` mappings safely extracted from nested relationships for backup or external pivot-table evaluation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="group border rounded-lg p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-md text-indigo-700">
                     <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-semibold block">Active Student Rolls</span>
                    <span className="text-xs text-muted-foreground">Includes Class/Section bounds</span>
                  </div>
                </div>
                <Button 
                   variant="outline" 
                   disabled={downloading === "STUDENT"} 
                   onClick={() => downloadModule("STUDENT")}
                >
                   {downloading === "STUDENT" ? "Compiling..." : "Download CSV"}
                </Button>
             </div>

             <div className="group border rounded-lg p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-md text-emerald-700">
                     <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-semibold block">HR & Workforce Profiles</span>
                    <span className="text-xs text-muted-foreground">Internal active educators and roles</span>
                  </div>
                </div>
                <Button 
                   variant="outline" 
                   disabled={downloading === "STAFF"} 
                   onClick={() => downloadModule("STAFF")}
                >
                   {downloading === "STAFF" ? "Compiling..." : "Download CSV"}
                </Button>
             </div>

             <div className="group border rounded-lg p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-md text-amber-700">
                     <IndianRupee className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-semibold block">Global Fee Ledgers</span>
                    <span className="text-xs text-muted-foreground">Complete financial snapshot spanning all receipts</span>
                  </div>
                </div>
                <Button 
                   variant="outline" 
                   disabled={downloading === "FEES"} 
                   onClick={() => downloadModule("FEES")}
                >
                   {downloading === "FEES" ? "Compiling..." : "Download CSV"}
                </Button>
             </div>
          </CardContent>
        </Card>


        {/* Official Document Utility Suite */}
        <Card className="border-sky-100 shadow-sm relative overflow-hidden lg:col-span-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-bl-full -z-10 opacity-50" />
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <FileBadge2 className="w-5 h-5 text-sky-600" />
              <CardTitle className="text-xl">CBSE Compliance Suite</CardTitle>
            </div>
            <CardDescription>
              Generate legal documentation and physical identity tokens for active students.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div 
                  className="group border rounded-lg p-6 flex flex-col items-start gap-4 hover:bg-sky-50 hover:border-sky-200 transition-all cursor-pointer"
                  onClick={() => router.push(`/${tenantSlug}/${role}/utilities/tc-generator`)}
               >
                  <div className="p-3 bg-sky-100 rounded-lg text-sky-700">
                     <FileBadge2 className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-bold block text-lg uppercase tracking-tighter">TC Generator</span>
                    <span className="text-xs text-muted-foreground">Issue Transfer Certificates (Leaving Certificates) as per CBSE Bye-Laws.</span>
                  </div>
                  <Button variant="ghost" className="p-0 h-auto font-bold text-sky-600 hover:bg-transparent">Open Generator →</Button>
               </div>

               <div 
                  className="group border rounded-lg p-6 flex flex-col items-start gap-4 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer"
                  onClick={() => router.push(`/${tenantSlug}/${role}/utilities/id-cards`)}
               >
                  <div className="p-3 bg-indigo-100 rounded-lg text-indigo-700">
                     <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-bold block text-lg uppercase tracking-tighter">ID Card Batcher</span>
                    <span className="text-xs text-muted-foreground">Generate digital-ready student ID cards with QR integration for safe campus entry.</span>
                  </div>
                  <Button variant="ghost" className="p-0 h-auto font-bold text-indigo-600 hover:bg-transparent">Prime Batch →</Button>
               </div>
          </CardContent>
        </Card>


      </div>
    </div>
  )
}
