"use client"

import { useState } from "react"
import { 
    Settings as SettingsIcon, 
    School, 
    Palette, 
    ShieldCheck, 
    Globe, 
    Save, 
    RotateCcw,
    Zap,
    Cpu,
    Fingerprint,
    BellRing
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function SettingsHub() {
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => setSaving(false), 1000)
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                 System Configuration
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                <Cpu className="w-3 h-3" />
                V3.1.2-PRO
              </div>
           </div>
           <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">
              Institutional <span className="text-indigo-600">Settings</span>
           </h1>
           <p className="text-muted-foreground font-semibold max-w-xl text-lg">
              Manage core institutional parameters, visual identity, and security protocols.
           </p>
        </div>

        <div className="flex gap-4">
           <Button variant="ghost" className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest">
              <RotateCcw className="w-4 h-4 mr-3" />
              Reset
           </Button>
           <Button onClick={handleSave} disabled={saving} className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-black text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/20 transition-all hover:scale-105 active:scale-95 group">
              {saving ? <RotateCcw className="w-4 h-4 mr-3 animate-spin" /> : <Save className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />}
              Synchronize Changes
           </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-8">
        <TabsList className="bg-muted/50 p-1.5 rounded-2xl border border-indigo-500/5 h-auto overflow-x-auto justify-start inline-flex">
          <TabsTrigger value="general" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">General</TabsTrigger>
          <TabsTrigger value="branding" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">Branding</TabsTrigger>
          <TabsTrigger value="academic" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">Academic</TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="rounded-[2.5rem] border-indigo-500/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl overflow-hidden group">
                 <CardHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                       <School className="w-5 h-5 text-indigo-600" />
                       <CardTitle className="text-2xl font-black">Institutional Profile</CardTitle>
                    </div>
                    <CardDescription className="font-semibold">Configure basic identifiers for your campus.</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 pt-4 space-y-6">
                    <div className="grid gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600">School Legal Name</label>
                          <Input defaultValue="St. Xavier's International School" className="h-12 bg-muted/30 border-none rounded-xl font-bold" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Affiliation Number</label>
                             <Input defaultValue="CBSE-2130321" className="h-12 bg-muted/30 border-none rounded-xl font-bold" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600">School Code</label>
                             <Input defaultValue="XAV-60122" className="h-12 bg-muted/30 border-none rounded-xl font-bold" />
                          </div>
                       </div>
                    </div>
                 </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-indigo-500/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl overflow-hidden group">
                 <CardHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                       <Globe className="w-5 h-5 text-indigo-600" />
                       <CardTitle className="text-2xl font-black">Region & Localization</CardTitle>
                    </div>
                    <CardDescription className="font-semibold">Timezone and currency calibration.</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 pt-4 space-y-6">
                    <div className="grid gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Primary Timezone</label>
                          <Input defaultValue="(GMT+05:30) India Standard Time" className="h-12 bg-muted/30 border-none rounded-xl font-bold" readOnly />
                       </div>
                       <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                          <div className="space-y-1">
                             <p className="text-sm font-black">Financial Currency</p>
                             <p className="text-[10px] font-bold text-muted-foreground">Used across all fee terminals</p>
                          </div>
                          <Badge className="bg-white text-indigo-600 font-bold px-4 py-1.5 rounded-lg shadow-sm">INR (₹)</Badge>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="branding" className="animate-in fade-in duration-500">
           <Card className="rounded-[2.5rem] border-indigo-500/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-12">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <div className="p-3 w-fit rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20">
                             <Palette className="w-6 h-6" />
                          </div>
                          <h2 className="text-3xl font-black tracking-tighter">Visual Identity</h2>
                          <p className="font-semibold text-muted-foreground">Configure the aesthetic core of your Omni-Campus instance.</p>
                       </div>

                       <div className="space-y-6">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Primary Theme Color</label>
                             <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-600 shadow-xl" />
                                <Input defaultValue="#4F46E5" className="h-12 bg-muted/30 border-none rounded-xl font-bold w-40" />
                                <Button variant="outline" className="h-12 rounded-xl font-bold">Pick Color</Button>
                             </div>
                          </div>

                          <div className="flex items-center justify-between p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
                             <div className="space-y-1">
                                <p className="text-lg font-black">Dark Mode Alpha</p>
                                <p className="text-xs font-bold text-muted-foreground">Enable dynamic luminance shifting</p>
                             </div>
                             <Switch defaultChecked />
                          </div>
                       </div>
                    </div>

                    <div className="bg-indigo-600 rounded-[3rem] p-10 text-white flex flex-col justify-between shadow-2xl shadow-indigo-900/40 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                          <Zap className="w-64 h-64" />
                       </div>
                       <div className="relative">
                          <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/20 mb-6 font-black tracking-widest uppercase py-1 px-4">Live Preview</Badge>
                          <h3 className="text-4xl font-black tracking-tighter mb-4 leading-none">The Future of <br/>Campus Ops</h3>
                          <div className="w-20 h-1.5 bg-white rounded-full mb-6" />
                       </div>
                       <div className="flex items-center gap-4 relative">
                          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20" />
                          <div className="space-y-1">
                             <div className="w-32 h-2.5 bg-white/20 rounded-full" />
                             <div className="w-20 h-2 bg-white/10 rounded-full" />
                          </div>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="academic" className="animate-in fade-in duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="rounded-[2.5rem] border-indigo-500/5 bg-white shadow-xl shadow-indigo-500/5">
                 <CardHeader className="p-8">
                    <CardTitle className="text-xl font-black">Examination Board</CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 pt-0 space-y-6">
                    <div className="flex flex-col gap-3">
                       <Button variant="outline" className="h-14 rounded-2xl border-none bg-indigo-600 text-white justify-between px-6 font-black group">
                          CBSE India
                          <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                       </Button>
                       <Button variant="outline" className="h-14 rounded-2xl border-none bg-muted/50 justify-between px-6 font-black opacity-50 grayscale">
                          ICSE Global
                          <Badge variant="outline" className="text-[8px] font-black border-none py-0">PRO</Badge>
                       </Button>
                       <Button variant="outline" className="h-14 rounded-2xl border-none bg-muted/50 justify-between px-6 font-black opacity-50 grayscale">
                          State Board
                          <Badge variant="outline" className="text-[8px] font-black border-none py-0">PRO</Badge>
                       </Button>
                    </div>
                 </CardContent>
              </Card>

              <Card className="col-span-2 rounded-[2.5rem] border-indigo-500/5 bg-white shadow-xl shadow-indigo-500/5">
                 <CardHeader className="p-8">
                    <CardTitle className="text-xl font-black">Active Curriculum Vectors</CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {[
                         { label: "CCE Pattern (Primary)", enabled: true },
                         { label: "New Tech Grading (Secondary)", enabled: true },
                         { label: "Attendance Weighted Marksheets", enabled: false },
                         { label: "Internal Assessment Integration", enabled: true },
                         { label: "Co-Scholastic AI Evaluation", enabled: true }
                       ].map((v, i) => (
                         <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-muted/50 transition-all hover:border-indigo-500/20 group">
                            <span className="text-xs font-black group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{v.label}</span>
                            <Switch defaultChecked={v.enabled} />
                         </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="security" className="animate-in fade-in duration-500">
           <Card className="rounded-[2.5rem] border-red-500/10 bg-red-500/[0.02] overflow-hidden">
              <CardContent className="p-12 flex flex-col items-center text-center space-y-8">
                 <div className="p-6 rounded-[2rem] bg-red-600 text-white shadow-2xl shadow-red-900/30">
                    <Fingerprint className="w-12 h-12" />
                 </div>
                 <div className="space-y-3 max-w-2xl">
                    <h2 className="text-4xl font-black tracking-tighter">Biometric Security Handshake</h2>
                    <p className="font-semibold text-muted-foreground text-lg italic">Enterprise devices require encrypted master keys for biometric synchronization.</p>
                 </div>
                 <div className="flex gap-4">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-red-500/20 font-black text-xs uppercase tracking-widest text-red-600">Regenerate Master Key</Button>
                    <Button className="h-14 px-10 rounded-2xl bg-red-600 hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-red-900/20 transition-all">Enable Hardware Lock</Button>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      {/* Persistence Notification */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-10">
         <div className="px-6 py-3 rounded-2xl bg-black dark:bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-4 shadow-2xl border border-white/10">
            <BellRing className="w-4 h-4 text-emerald-500" />
            Live Synchronization Active
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
         </div>
      </div>

    </div>
  )
}
