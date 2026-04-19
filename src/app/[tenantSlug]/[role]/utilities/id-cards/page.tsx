"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Printer, CreditCard, QrCode, Phone, Droplet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function IDCardGeneratorPage() {
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/classes").then(r => r.json()).then(setClasses)
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetch(`/api/students?classRoomId=${selectedClass}&pageSize=100`)
        .then(r => r.json())
        .then(data => setStudents(data.students || []))
    }
  }, [selectedClass])

  const handlePrint = () => window.print()

  return (
    <div className="space-y-6 animate-in fade-in duration-700 min-h-screen pb-12">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #id-cards-grid, #id-cards-grid * { visibility: visible; }
          #id-cards-grid {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">ID Card Batcher</h1>
            <p className="text-sm text-muted-foreground">Standard CR-80 PVC Format (85.6mm x 54mm)</p>
          </div>
        </div>
        {students.length > 0 && (
          <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 gap-2 font-bold">
            <Printer className="w-4 h-4" />
            Print All ({students.length})
          </Button>
        )}
      </div>

      <Card className="no-print border-none shadow-sm dark:bg-white/5 backdrop-blur-md mb-8">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase text-muted-foreground mb-1 block">Step 1: Focus Class</label>
            <Select value={selectedClass} onValueChange={(val) => setSelectedClass(val || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class for Batch" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div id="id-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((stu) => (
          <div key={stu.id} className="w-[340px] h-[215px] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg relative flex flex-col group hover:scale-[1.02] transition-transform">
            {/* ID Header Pattern */}
            <div className="h-12 bg-indigo-900 flex items-center px-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                <div className="z-10">
                    <h4 className="text-[10px] font-black tracking-tighter text-white uppercase italic leading-none">St. Xavier&apos;s</h4>
                    <p className="text-[6px] font-bold text-white/60 tracking-widest uppercase">International School</p>
                </div>
                <div className="ml-auto bg-white/10 p-1 rounded-sm text-white/50">
                    <CreditCard className="w-4 h-4" />
                </div>
            </div>

            <div className="flex-1 flex p-3 gap-3">
                {/* Photo Placeholder */}
                <div className="flex-shrink-0">
                    <div className="w-20 h-24 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center relative overflow-hidden">
                        <span className="text-[8px] font-bold text-gray-300 uppercase rotate-[-30deg]">No Photo</span>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 py-0.5 text-center">
                            <span className="text-[6px] font-black text-white/80 uppercase">Verified</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-2">
                    <div className="border-b border-gray-100 pb-1">
                        <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Student Name</p>
                        <h3 className="text-xs font-black uppercase text-indigo-950 leading-none truncate">{stu.name}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                       <div>
                            <p className="text-[6px] font-bold text-gray-400 uppercase leading-none mb-0.5">Adm No</p>
                            <p className="text-[8px] font-black uppercase">{stu.admissionNumber}</p>
                       </div>
                       <div>
                            <p className="text-[6px] font-bold text-gray-400 uppercase leading-none mb-0.5">Class/Sec</p>
                            <p className="text-[8px] font-black uppercase">{stu.classroom?.name || "N/A"}-{stu.section?.name || "A"}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center gap-1">
                            <Droplet className="w-2 h-2 text-red-500 fill-current" />
                            <span className="text-[7px] font-bold uppercase">Blood: B+</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Phone className="w-2 h-2 text-indigo-500" />
                            <span className="text-[7px] font-bold uppercase">{stu.phone.slice(0, 10)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ID Card Footer - QR & Security */}
            <div className="h-10 bg-gray-50 border-t border-gray-100 flex items-center px-3">
                <div className="flex-1">
                    <p className="text-[6px] font-bold text-gray-400 italic">This card remains the property of the school and must be produced when requested.</p>
                </div>
                <div className="flex items-center justify-center p-1 bg-white border border-gray-100 rounded shadow-sm opacity-80">
                    <QrCode className="w-6 h-6 text-indigo-900" />
                </div>
            </div>
          </div>
        ))}

        {!selectedClass && (
            <div className="col-span-full py-20 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center opacity-40">
                <CreditCard className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-black uppercase tracking-widest leading-none">ID Matrix Standby</h3>
                <p className="text-xs mt-2 font-bold text-muted-foreground uppercase tracking-widest">Select a class to prime the batch processor</p>
            </div>
        )}
      </div>
    </div>
  )
}
