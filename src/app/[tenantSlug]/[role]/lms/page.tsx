"use client"

import { useState, useEffect, useCallback, type ComponentType } from "react"
import { BookOpen, Video, FileText, Link as LinkIcon, Search, Plus, Filter, Play, ExternalLink, Tag, Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

export default function LMSPage() {
  const [contents, setContents] = useState<Array<{
    id: string
    title: string
    description?: string | null
    type: string
    url?: string | null
    chapter?: string | null
    tags?: string | null
  }>>([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", type: "VIDEO", url: "", chapter: "", tags: "" })

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/lms?type=${typeFilter !== "ALL" ? typeFilter : ""}&search=${encodeURIComponent(search)}`)
      if (res.ok) {
        const data = await res.json()
        setContents(data.contents || [])
      }
    } catch (err) { console.error(err) }
  }, [search, typeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAdd = async () => {
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...form }),
      })
      if (res.ok) {
        setIsAddOpen(false)
        setForm({ title: "", description: "", type: "VIDEO", url: "", chapter: "", tags: "" })
        fetchData()
      }
    } catch (err) { console.error(err) }
  }

  const TYPE_ICONS: Record<string, ComponentType<{ className?: string }>> = { VIDEO: Video, PDF: FileText, LINK: LinkIcon, NOTES: BookOpen, PRESENTATION: Layers }
  const TYPE_COLORS: Record<string, string> = { VIDEO: "bg-red-500/10 text-red-600", PDF: "bg-blue-500/10 text-blue-600", LINK: "bg-emerald-500/10 text-emerald-600", NOTES: "bg-amber-500/10 text-amber-600", PRESENTATION: "bg-purple-500/10 text-purple-600" }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-4">
          <div className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 text-[10px] font-black uppercase tracking-widest inline-block">Learning Platform</div>
          <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">LMS <span className="text-violet-600">Content Hub</span></h1>
          <p className="text-muted-foreground font-semibold max-w-xl text-lg">Digital learning resources: video lectures, PDFs, notes, and presentations organized by subject and chapter.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="h-14 px-8 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl">
          <Plus className="w-4 h-4 mr-3" /> Upload Content
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
        <StatCard label="Total Resources" value={contents.length.toString()} icon={BookOpen} description="All learning materials" variant="violet" />
        <StatCard label="Video Lectures" value={contents.filter(c => c.type === "VIDEO").length.toString()} icon={Video} description="YouTube & uploaded videos" variant="rose" />
        <StatCard label="Documents" value={contents.filter(c => c.type === "PDF").length.toString()} icon={FileText} description="PDFs and notes" variant="blue" />
        <StatCard label="Links" value={contents.filter(c => c.type === "LINK").length.toString()} icon={LinkIcon} description="External resources" variant="emerald" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-2">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" /><Input placeholder="Search content..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 pl-12 bg-muted/50 border-none rounded-2xl font-bold" /></div>
        <Select value={typeFilter} onValueChange={(v) => { if (v) setTypeFilter(v) }}>
          <SelectTrigger className="h-12 w-44 rounded-2xl font-bold bg-muted/50 border-none"><div className="flex items-center gap-2"><Filter className="w-4 h-4 text-violet-500" /><SelectValue /></div></SelectTrigger>
          <SelectContent className="rounded-2xl"><SelectItem value="ALL">All Types</SelectItem><SelectItem value="VIDEO">Video</SelectItem><SelectItem value="PDF">PDF</SelectItem><SelectItem value="LINK">Link</SelectItem><SelectItem value="NOTES">Notes</SelectItem><SelectItem value="PRESENTATION">Presentation</SelectItem></SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
        {contents.length === 0 ? (
          <Card className="col-span-full border-violet-500/5 shadow-2xl"><CardContent className="py-32 text-center text-muted-foreground font-bold">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No content uploaded yet.</p>
            <p className="text-sm mt-2">Start building your digital library.</p>
          </CardContent></Card>
        ) : (
          contents.map(c => {
            const TypeIcon = TYPE_ICONS[c.type]

            return (
              <Card key={c.id} className="border-violet-500/5 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", TYPE_COLORS[c.type])}>
                      {TypeIcon ? <TypeIcon className="w-6 h-6" /> : null}
                    </div>
                    <Badge variant="outline" className="font-bold text-[10px] uppercase">{c.type}</Badge>
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight">{c.title}</h3>
                    {c.chapter && <p className="text-xs text-muted-foreground font-bold mt-1">Chapter: {c.chapter}</p>}
                  </div>
                  {c.tags && (
                    <div className="flex flex-wrap gap-1">
                      {c.tags.split(",").map((tag: string, i: number) => <Badge key={i} variant="secondary" className="text-[9px] font-bold"><Tag className="w-2 h-2 mr-1" />{tag.trim()}</Badge>)}
                    </div>
                  )}
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full rounded-xl font-bold text-xs uppercase tracking-widest">
                        {c.type === "VIDEO" ? <Play className="w-3.5 h-3.5 mr-2" /> : <ExternalLink className="w-3.5 h-3.5 mr-2" />} Open Resource
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Add Content Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader><DialogTitle>Upload Content</DialogTitle><DialogDescription>Add learning resources for students.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="rounded-xl mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="rounded-xl mt-1" rows={2} /></div>
            <div><Label>Type</Label><Select value={form.type} onValueChange={v => { if (v) setForm({ ...form, type: v }) }}><SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="VIDEO">Video</SelectItem><SelectItem value="PDF">PDF</SelectItem><SelectItem value="LINK">External Link</SelectItem><SelectItem value="NOTES">Notes</SelectItem><SelectItem value="PRESENTATION">Presentation</SelectItem></SelectContent></Select></div>
            <div><Label>URL *</Label><Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="rounded-xl mt-1" placeholder="YouTube URL or file link" /></div>
            <div><Label>Chapter</Label><Input value={form.chapter} onChange={e => setForm({ ...form, chapter: e.target.value })} className="rounded-xl mt-1" /></div>
            <div><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="rounded-xl mt-1" placeholder="e.g., Physics, Chapter 5" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button><Button onClick={handleAdd} className="rounded-xl font-bold">Upload</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
