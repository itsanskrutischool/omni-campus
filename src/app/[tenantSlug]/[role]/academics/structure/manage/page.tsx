"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Layers,
  GitBranch,
  Plus,
  Trash2,
  Loader2,
  LayoutGrid,
  ChevronRight,
  Users,
  Search,
  Edit,
  X,
  Save,
  GraduationCap,
  Hash,
  ArrowLeft,
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
import { cn } from "@/lib/utils"
import Link from "next/link"

// Types
interface ClassRoom {
  id: string
  name: string
  numeric: number
  _count?: { students: number; sections: number; streams: number }
}

interface Stream {
  id: string
  name: string
  code: string | null
  description: string | null
  classRoomId: string
  classRoom?: ClassRoom
  _count?: { sections: number }
}

interface Section {
  id: string
  name: string
  classRoomId: string
  streamId: string | null
  classRoom?: ClassRoom
  stream?: Stream
  _count?: { students: number }
}

type TabType = "classes" | "streams" | "sections"

export default function AcademicStructureManagePage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  const [activeTab, setActiveTab] = useState<TabType>("classes")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Data states
  const [classes, setClasses] = useState<ClassRoom[]>([])
  const [streams, setStreams] = useState<Stream[]>([])
  const [sections, setSections] = useState<Section[]>([])

  // Modal states
  const [showClassModal, setShowClassModal] = useState(false)
  const [showStreamModal, setShowStreamModal] = useState(false)
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Form states
  const [classForm, setClassForm] = useState({ name: "", numeric: "" })
  const [streamForm, setStreamForm] = useState({ name: "", code: "", description: "", classRoomId: "" })
  const [sectionForm, setSectionForm] = useState({ name: "", classRoomId: "", streamId: "" })

  const [submitting, setSubmitting] = useState(false)

  // Fetch all data
  const fetchData = async () => {
    setLoading(true)
    try {
      const [classesRes, streamsRes, sectionsRes] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/streams"),
        fetch("/api/sections"),
      ])

      if (classesRes.ok) setClasses(await classesRes.json())
      if (streamsRes.ok) setStreams(await streamsRes.json())
      if (sectionsRes.ok) setSections(await sectionsRes.json())
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Create/Update handlers
  const handleSaveClass = async () => {
    if (!classForm.name || !classForm.numeric) return
    setSubmitting(true)
    try {
      const url = editingItem ? "/api/classes" : "/api/classes"
      const method = editingItem ? "PUT" : "POST"
      const body = editingItem
        ? { id: editingItem.id, name: classForm.name, numeric: Number(classForm.numeric) }
        : { name: classForm.name, numeric: Number(classForm.numeric) }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowClassModal(false)
        setClassForm({ name: "", numeric: "" })
        setEditingItem(null)
        fetchData()
      }
    } catch (error) {
      console.error("Failed to save class:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveStream = async () => {
    if (!streamForm.name || !streamForm.classRoomId) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/streams", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingItem
            ? { id: editingItem.id, ...streamForm }
            : streamForm
        ),
      })

      if (res.ok) {
        setShowStreamModal(false)
        setStreamForm({ name: "", code: "", description: "", classRoomId: "" })
        setEditingItem(null)
        fetchData()
      }
    } catch (error) {
      console.error("Failed to save stream:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveSection = async () => {
    if (!sectionForm.name || !sectionForm.classRoomId) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/sections", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingItem
            ? { id: editingItem.id, ...sectionForm }
            : sectionForm
        ),
      })

      if (res.ok) {
        setShowSectionModal(false)
        setSectionForm({ name: "", classRoomId: "", streamId: "" })
        setEditingItem(null)
        fetchData()
      }
    } catch (error) {
      console.error("Failed to save section:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return
    try {
      const endpoint = type === "class" ? "classes" : type === "stream" ? "streams" : "sections"
      const res = await fetch(`/api/${endpoint}?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || `Failed to delete ${type}`)
      }
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error)
    }
  }

  const openEditModal = (type: TabType, item: any) => {
    setEditingItem(item)
    if (type === "classes") {
      setClassForm({ name: item.name, numeric: String(item.numeric) })
      setShowClassModal(true)
    } else if (type === "streams") {
      setStreamForm({
        name: item.name,
        code: item.code || "",
        description: item.description || "",
        classRoomId: item.classRoomId,
      })
      setShowStreamModal(true)
    } else {
      setSectionForm({
        name: item.name,
        classRoomId: item.classRoomId,
        streamId: item.streamId || "",
      })
      setShowSectionModal(true)
    }
  }

  // Filter data based on search
  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(c.numeric).includes(searchQuery)
  )
  const filteredStreams = streams.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredSections = sections.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const tabs = [
    { id: "classes" as const, label: "Classes", icon: BookOpen, count: classes.length, color: "violet" },
    { id: "streams" as const, label: "Streams", icon: GitBranch, count: streams.length, color: "blue" },
    { id: "sections" as const, label: "Sections", icon: Layers, count: sections.length, color: "emerald" },
  ]

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/${tenantSlug}/${role}/academics/structure`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Structure</span>
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-widest">
              Admin Control
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight dark:text-white">
            Manage Academic <span className="text-violet-600">Structure</span>
          </h1>
          <p className="text-muted-foreground font-semibold mt-2">
            Create and manage Classes, Streams, and Sections
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Card
              key={tab.id}
              className={cn(
                "rounded-3xl border-2 cursor-pointer transition-all hover:scale-[1.02]",
                activeTab === tab.id
                  ? `border-${tab.color}-500 bg-${tab.color}-500/5`
                  : "border-transparent hover:border-muted"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", `bg-${tab.color}-500/10`)}>
                    <Icon className={cn("w-6 h-6", `text-${tab.color}-600`)} />
                  </div>
                  <div>
                    <p className="text-2xl font-black">{tab.count}</p>
                    <p className="text-sm font-medium text-muted-foreground">{tab.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const TabIcon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border",
                isActive
                  ? `bg-${tab.color}-600 text-white border-${tab.color}-600 shadow-lg shadow-${tab.color}-600/20`
                  : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
              )}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
              <span className={cn(
                "px-2 py-0.5 rounded-lg text-[9px] font-black",
                isActive ? "bg-white/20" : "bg-muted"
              )}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Main Content */}
      <Card className="rounded-[2rem] border-violet-500/10 overflow-hidden shadow-2xl">
        <CardHeader className="p-6 border-b border-violet-500/5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              {activeTab === "classes" && <BookOpen className="w-5 h-5 text-violet-600" />}
              {activeTab === "streams" && <GitBranch className="w-5 h-5 text-blue-600" />}
              {activeTab === "sections" && <Layers className="w-5 h-5 text-emerald-600" />}
            </div>
            <div>
              <CardTitle className="text-xl font-black">
                {activeTab === "classes" && "Class Management"}
                {activeTab === "streams" && "Stream Management"}
                {activeTab === "sections" && "Section Management"}
              </CardTitle>
              <CardDescription className="text-sm">
                {activeTab === "classes" && "Manage classes (e.g., Class 1, Class 2, etc.)"}
                {activeTab === "streams" && "Manage streams within classes (e.g., Science, Commerce)"}
                {activeTab === "sections" && "Manage sections within classes and streams (e.g., A, B, C)"}
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingItem(null)
              if (activeTab === "classes") {
                setClassForm({ name: "", numeric: "" })
                setShowClassModal(true)
              } else if (activeTab === "streams") {
                setStreamForm({ name: "", code: "", description: "", classRoomId: "" })
                setShowStreamModal(true)
              } else {
                setSectionForm({ name: "", classRoomId: "", streamId: "" })
                setShowSectionModal(true)
              }
            }}
            className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {activeTab === "classes" ? "Class" : activeTab === "streams" ? "Stream" : "Section"}
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : (
            <div className="divide-y divide-violet-500/5">
              {/* Classes View */}
              {activeTab === "classes" && (
                filteredClasses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-black mb-2">No Classes Found</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      {searchQuery ? "No classes match your search." : "Create your first class to get started."}
                    </p>
                  </div>
                ) : (
                  filteredClasses.map((cls) => (
                    <motion.div
                      key={cls.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-violet-50/50 dark:hover:bg-violet-500/5 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-violet-500/20">
                        {cls.numeric}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm">{cls.name}</p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium mt-0.5">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {cls._count?.sections || 0} sections
                          </span>
                          <span className="flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            {cls._count?.streams || 0} streams
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {cls._count?.students || 0} students
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal("classes", cls)}
                          className="p-2 rounded-xl hover:bg-violet-500/10 text-violet-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete("class", cls.id)}
                          className="p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )
              )}

              {/* Streams View */}
              {activeTab === "streams" && (
                filteredStreams.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                      <GitBranch className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-black mb-2">No Streams Found</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      {searchQuery ? "No streams match your search." : "Create streams like Science, Commerce, Arts within classes."}
                    </p>
                  </div>
                ) : (
                  filteredStreams.map((stream) => (
                    <motion.div
                      key={stream.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <GitBranch className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm">{stream.name}</p>
                        {stream.code && (
                          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider mt-1">
                            {stream.code}
                          </Badge>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium mt-1">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {stream.classRoom?.name || "Unknown Class"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {stream._count?.sections || 0} sections
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal("streams", stream)}
                          className="p-2 rounded-xl hover:bg-blue-500/10 text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete("stream", stream.id)}
                          className="p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )
              )}

              {/* Sections View */}
              {activeTab === "sections" && (
                filteredSections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                      <Layers className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-black mb-2">No Sections Found</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      {searchQuery ? "No sections match your search." : "Create sections like A, B, C within classes and streams."}
                    </p>
                  </div>
                ) : (
                  filteredSections.map((section) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/20">
                        {section.name}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm">Section {section.name}</p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium mt-1">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {section.classRoom?.name || "Unknown Class"}
                          </span>
                          {section.stream && (
                            <>
                              <ChevronRight className="w-3 h-3" />
                              <span className="flex items-center gap-1">
                                <GitBranch className="w-3 h-3" />
                                {section.stream.name}
                              </span>
                            </>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {section._count?.students || 0} students
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal("sections", section)}
                          className="p-2 rounded-xl hover:bg-emerald-500/10 text-emerald-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete("section", section.id)}
                          className="p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Class Modal */}
      <AnimatePresence>
        {showClassModal && (
          <Modal onClose={() => { setShowClassModal(false); setEditingItem(null); }}>
            <div className="p-6 border-b border-violet-500/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black">{editingItem ? "Edit Class" : "New Class"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {editingItem ? "Update class details" : "Create a new academic class"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Class Name</Label>
                <Input
                  value={classForm.name}
                  onChange={(e) => setClassForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Class 10"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Numeric Value</Label>
                <Input
                  type="number"
                  value={classForm.numeric}
                  onChange={(e) => setClassForm(f => ({ ...f, numeric: e.target.value }))}
                  placeholder="e.g., 10"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="p-6 border-t border-violet-500/5 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => { setShowClassModal(false); setEditingItem(null); }}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveClass}
                disabled={submitting || !classForm.name || !classForm.numeric}
                className="bg-violet-600 hover:bg-violet-700 text-white font-black"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {editingItem ? "Update" : "Create"}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Stream Modal */}
      <AnimatePresence>
        {showStreamModal && (
          <Modal onClose={() => { setShowStreamModal(false); setEditingItem(null); }}>
            <div className="p-6 border-b border-blue-500/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black">{editingItem ? "Edit Stream" : "New Stream"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {editingItem ? "Update stream details" : "Create a new stream within a class"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Stream Name</Label>
                <Input
                  value={streamForm.name}
                  onChange={(e) => setStreamForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Science"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Stream Code (Optional)</Label>
                <Input
                  value={streamForm.code}
                  onChange={(e) => setStreamForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="e.g., SCI"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  value={streamForm.description}
                  onChange={(e) => setStreamForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description..."
                  className="rounded-xl"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Class</Label>
                <Select
                  value={streamForm.classRoomId}
                  onValueChange={(v) => setStreamForm(f => ({ ...f, classRoomId: v }))}
                  disabled={!!editingItem}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 border-t border-blue-500/5 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => { setShowStreamModal(false); setEditingItem(null); }}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveStream}
                disabled={submitting || !streamForm.name || !streamForm.classRoomId}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {editingItem ? "Update" : "Create"}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Section Modal */}
      <AnimatePresence>
        {showSectionModal && (
          <Modal onClose={() => { setShowSectionModal(false); setEditingItem(null); }}>
            <div className="p-6 border-b border-emerald-500/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black">{editingItem ? "Edit Section" : "New Section"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {editingItem ? "Update section details" : "Create a new section"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Section Name</Label>
                <Input
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., A"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Class</Label>
                <Select
                  value={sectionForm.classRoomId}
                  onValueChange={(v) => setSectionForm(f => ({ ...f, classRoomId: v, streamId: "" }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stream (Optional)</Label>
                <Select
                  value={sectionForm.streamId}
                  onValueChange={(v) => setSectionForm(f => ({ ...f, streamId: v }))}
                  disabled={!sectionForm.classRoomId}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={sectionForm.classRoomId ? "Select a stream..." : "Select class first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Stream</SelectItem>
                    {streams
                      .filter(s => s.classRoomId === sectionForm.classRoomId)
                      .map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 border-t border-emerald-500/5 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => { setShowSectionModal(false); setEditingItem(null); }}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveSection}
                disabled={submitting || !sectionForm.name || !sectionForm.classRoomId}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {editingItem ? "Update" : "Create"}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

// Modal Component
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-violet-500/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
