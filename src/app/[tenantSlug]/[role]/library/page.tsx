"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Book,
  BookOpen,
  Library as LibraryIcon,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  BarChart3,
  Bookmark,
  User,
  MoreVertical,
  Calendar,
  X,
  Filter,
  ArrowUpRight,
  AlertTriangle,
  TrendingUp,
  Users
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────

interface Book {
  id: string
  title: string
  author: string
  isbn: string | null
  accessionNo: string
  category: string
  subject: string | null
  publisher: string | null
  publishYear: number | null
  edition: string | null
  price: number | null
  totalCopies: number
  availableCopies: number
  shelfLocation: string | null
  _count: { bookIssues: number }
}

interface BookIssue {
  id: string
  bookId: string
  studentId: string | null
  issuedBy: string
  issueDate: string
  dueDate: string
  returnDate: string | null
  fine: number
  finePaid: boolean
  status: string
  remarks: string | null
  book: { title: string; author: string; accessionNo: string }
  student: { name: string; admissionNumber: string } | null
}

interface Analytics {
  totalBooks: number
  totalIssues: number
  activeIssues: number
  overdueIssues: number
  categoryBreakdown: { category: string; _count: { _all: number }; _sum: { availableCopies: number; totalCopies: number } }[]
  recentIssues: BookIssue[]
}

// ─── Component ─────────────────────────────

export default function LibraryPage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug as string
  const role = params.role as string

  // State
  const [books, setBooks] = useState<Book[]>([])
  const [issues, setIssues] = useState<BookIssue[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [overdue, setOverdue] = useState<BookIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeTab, setActiveTab] = useState<"books" | "issues" | "overdue">("books")

  // Dialogs
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)
  const [isIssueBookOpen, setIsIssueBookOpen] = useState(false)
  const [isReturnBookOpen, setIsReturnBookOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<BookIssue | null>(null)

  // Form state
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    accessionNo: "",
    category: "Textbook",
    subject: "",
    publisher: "",
    publishYear: "",
    edition: "",
    price: "",
    totalCopies: "1",
    shelfLocation: "",
  })
  const [issueForm, setIssueForm] = useState({
    studentId: "",
    dueDate: "",
    remarks: "",
  })

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [booksRes, analyticsRes, overdueRes] = await Promise.all([
        fetch(`/api/library`),
        fetch(`/api/library?analytics=true`),
        fetch(`/api/library?overdue=true`),
      ])

      if (booksRes.ok) {
        const data = await booksRes.json()
        setBooks(data.books || [])
      }
      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        setAnalytics(data)
        setIssues(data.recentIssues || [])
      }
      if (overdueRes.ok) {
        const data = await overdueRes.json()
        setOverdue(data)
      }
    } catch (error) {
      console.error("Library fetch error:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Add book
  const handleAddBook = async () => {
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...newBook, totalCopies: parseInt(newBook.totalCopies) || 1 }),
      })
      if (res.ok) {
        setIsAddBookOpen(false)
        setNewBook({ title: "", author: "", isbn: "", accessionNo: "", category: "Textbook", subject: "", publisher: "", publishYear: "", edition: "", price: "", totalCopies: "1", shelfLocation: "" })
        fetchData()
      }
    } catch (error) {
      console.error("Add book error:", error)
    }
  }

  // Issue book
  const handleIssueBook = async () => {
    if (!selectedBook) return
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "issue",
          bookId: selectedBook.id,
          studentId: issueForm.studentId,
          dueDate: new Date(issueForm.dueDate).toISOString(),
          remarks: issueForm.remarks,
        }),
      })
      if (res.ok) {
        setIsIssueBookOpen(false)
        setSelectedBook(null)
        setIssueForm({ studentId: "", dueDate: "", remarks: "" })
        fetchData()
      }
    } catch (error) {
      console.error("Issue book error:", error)
    }
  }

  // Return book
  const handleReturnBook = async () => {
    if (!selectedIssue) return
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "return", issueId: selectedIssue.id }),
      })
      if (res.ok) {
        setIsReturnBookOpen(false)
        setSelectedIssue(null)
        fetchData()
      }
    } catch (error) {
      console.error("Return book error:", error)
    }
  }

  // Filtered books
  const filteredBooks = books.filter(b => {
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()) || b.accessionNo.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === "all" || b.category === categoryFilter
    return matchSearch && matchCategory
  })

  // Stats
  const stats = {
    totalBooks: analytics?.totalBooks || 0,
    totalCopies: books.reduce((a, b) => a + b.totalCopies, 0),
    availableCopies: books.reduce((a, b) => a + b.availableCopies, 0),
    activeIssues: analytics?.activeIssues || 0,
    overdueIssues: analytics?.overdueIssues || 0,
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              Knowledge Repository
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              <Bookmark className="w-3 h-3" />
              Resource Synchronized
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight dark:text-white leading-none">
            Library <span className="text-emerald-600">Terminal</span>
          </h1>
          <p className="text-muted-foreground font-semibold max-w-xl text-lg">
            Strategic management of bibliographic assets, circulation logistics, and knowledge acquisition.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsAddBookOpen(true)} className="h-14 px-8 rounded-2xl bg-emerald-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 group">
            <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform duration-500" />
            Add Book
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
        <StatCard
          label="Total Books"
          value={stats.totalBooks.toString()}
          icon={LibraryIcon}
          description="Unique titles catalogued"
          variant="emerald"
        />
        <StatCard
          label="Total Copies"
          value={stats.totalCopies.toString()}
          icon={BookOpen}
          description={`${stats.availableCopies} available`}
          variant="blue"
        />
        <StatCard
          label="Active Issues"
          value={stats.activeIssues.toString()}
          icon={ArrowUpRight}
          description="Books in circulation"
          variant="emerald"
        />
        <StatCard
          label="Overdue"
          value={stats.overdueIssues.toString()}
          icon={AlertCircle}
          description="Requires attention"
          variant="amber"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 px-2">
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl">
          {(["books", "issues", "overdue"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-widest transition-all",
                activeTab === tab
                  ? "bg-white dark:bg-zinc-800 text-emerald-900 dark:text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "books" ? "Books" : tab === "issues" ? "Recent Issues" : "Overdue"}
            </button>
          ))}
        </div>
      </div>

      {/* Books Table */}
      {activeTab === "books" && (
        <Card variant="glass" className="border-emerald-500/5 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-emerald-500/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                <Bookmark className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Book Registry</h3>
                <p className="text-sm font-semibold text-muted-foreground">Complete catalog of bibliographic assets.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-72 group/search">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <Input
                  placeholder="Search books..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-14 pl-12 bg-muted/50 border-none rounded-2xl font-bold"
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => { if (v) setCategoryFilter(v) }}>
                <SelectTrigger className="h-14 w-44 rounded-2xl font-bold bg-muted/50 border-none">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-emerald-500" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Textbook">Textbook</SelectItem>
                  <SelectItem value="Reference">Reference</SelectItem>
                  <SelectItem value="Fiction">Fiction</SelectItem>
                  <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
                  <SelectItem value="Periodical">Periodical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-500/[0.02] border-none">
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Book</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Category</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Accession</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400 text-center">Copies</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Shelf</TableHead>
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse border-none">
                      <TableCell colSpan={6} className="h-20 bg-muted/10" />
                    </TableRow>
                  ))
                ) : filteredBooks.length === 0 ? (
                  <TableRow className="border-none">
                    <TableCell colSpan={6} className="py-32 text-center text-muted-foreground font-bold">
                      No books found. Add your first book to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBooks.map((book) => (
                    <TableRow key={book.id} className="group/row hover:bg-emerald-500/[0.02] transition-all border-b border-emerald-500/5">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-500/10 flex items-center justify-center shadow-sm group-hover/row:scale-110 transition-transform">
                            <Book className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-black text-lg group-hover/row:text-emerald-600 transition-colors tracking-tight line-clamp-1">{book.title}</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{book.author}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-xl font-bold text-[10px] uppercase tracking-widest">
                          {book.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold">{book.accessionNo}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-black text-emerald-600">{book.availableCopies}</span>
                          <span className="text-muted-foreground text-xs font-bold">/ {book.totalCopies}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-bold">{book.shelfLocation || "—"}</TableCell>
                      <TableCell className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <Button
                            onClick={() => { setSelectedBook(book); setIsIssueBookOpen(true) }}
                            disabled={book.availableCopies <= 0}
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-emerald-500/10 hover:bg-emerald-500/10 hover:text-emerald-700 font-bold"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5 mr-2" /> Issue
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Recent Issues Table */}
      {activeTab === "issues" && (
        <Card variant="glass" className="border-emerald-500/5 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-emerald-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                <ArrowUpRight className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Recent Circulation</h3>
                <p className="text-sm font-semibold text-muted-foreground">Latest book issue transactions.</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-500/[0.02] border-none">
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Book</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Student</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Issued</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Due Date</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Status</TableHead>
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.length === 0 ? (
                  <TableRow className="border-none">
                    <TableCell colSpan={6} className="py-32 text-center text-muted-foreground font-bold">
                      No recent circulation activity.
                    </TableCell>
                  </TableRow>
                ) : (
                  issues.map((issue) => (
                    <TableRow key={issue.id} className="group/row hover:bg-emerald-500/[0.02] transition-all border-b border-emerald-500/5">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-500/10 flex items-center justify-center shadow-sm">
                            <Book className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-black text-lg tracking-tight">{issue.book.title}</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{issue.book.author}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {issue.student ? (
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-blue-500" />
                            <div>
                              <p className="text-sm font-black dark:text-white uppercase">{issue.student.name}</p>
                              <p className="text-[9px] font-bold text-muted-foreground">{issue.student.admissionNumber}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm font-bold">Staff</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-bold">{new Date(issue.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm font-bold">{new Date(issue.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "rounded-xl font-black text-[10px] uppercase tracking-widest",
                          issue.status === "ISSUED" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                            issue.status === "RETURNED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                              "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        )}>
                          {issue.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                        {issue.status === "ISSUED" && (
                          <Button
                            onClick={() => { setSelectedIssue(issue); setIsReturnBookOpen(true) }}
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-emerald-500/10 hover:bg-emerald-500/10 hover:text-emerald-700 font-bold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Return
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Overdue Table */}
      {activeTab === "overdue" && (
        <Card variant="glass" className="border-rose-500/5 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-rose-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/10">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Overdue Books</h3>
                <p className="text-sm font-semibold text-muted-foreground">Books past their return deadline.</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-rose-500/[0.02] border-none">
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-rose-800 dark:text-rose-400">Book</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-rose-800 dark:text-rose-400">Student</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-rose-800 dark:text-rose-400">Due Date</TableHead>
                  <TableHead className="py-6 font-black text-[10px] uppercase tracking-[0.2em] text-rose-800 dark:text-rose-400">Days Overdue</TableHead>
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-rose-800 dark:text-rose-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdue.length === 0 ? (
                  <TableRow className="border-none">
                    <TableCell colSpan={5} className="py-32 text-center text-muted-foreground font-bold">
                      <div className="flex flex-col items-center gap-4">
                        <CheckCircle2 className="w-12 h-12 text-emerald-300" />
                        No overdue books. All accounts in good standing!
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  overdue.map((issue) => {
                    const daysOverdue = Math.ceil((new Date().getTime() - new Date(issue.dueDate).getTime()) / (1000 * 60 * 60 * 24))
                    return (
                      <TableRow key={issue.id} className="group/row hover:bg-rose-500/[0.02] transition-all border-b border-rose-500/5">
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-rose-500/10 flex items-center justify-center shadow-sm">
                              <Book className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                              <p className="font-black text-lg tracking-tight">{issue.book.title}</p>
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{issue.book.author}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {issue.student && (
                            <div>
                              <p className="text-sm font-black dark:text-white uppercase">{issue.student.name}</p>
                              <p className="text-[9px] font-bold text-muted-foreground">{issue.student.admissionNumber}</p>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-bold">{new Date(issue.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest">
                            {daysOverdue} days
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-right">
                          <Button
                            onClick={() => { setSelectedIssue(issue); setIsReturnBookOpen(true) }}
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-rose-500/10 hover:bg-rose-500/10 hover:text-rose-700 font-bold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Return
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add Book Dialog */}
      <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
            <DialogDescription>Enter bibliographic details for the new book.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} className="rounded-xl mt-1" />
            </div>
            <div>
              <Label htmlFor="author">Author *</Label>
              <Input id="author" value={newBook.author} onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} className="rounded-xl mt-1" />
            </div>
            <div>
              <Label htmlFor="isbn">ISBN</Label>
              <Input id="isbn" value={newBook.isbn} onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })} className="rounded-xl mt-1" />
            </div>
            <div>
              <Label htmlFor="accessionNo">Accession No *</Label>
              <Input id="accessionNo" value={newBook.accessionNo} onChange={(e) => setNewBook({ ...newBook, accessionNo: e.target.value })} className="rounded-xl mt-1" />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={newBook.category} onValueChange={(v) => { if (v) setNewBook({ ...newBook, category: v }) }}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Textbook">Textbook</SelectItem>
                  <SelectItem value="Reference">Reference</SelectItem>
                  <SelectItem value="Fiction">Fiction</SelectItem>
                  <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
                  <SelectItem value="Periodical">Periodical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={newBook.subject} onChange={(e) => setNewBook({ ...newBook, subject: e.target.value })} className="rounded-xl mt-1" />
            </div>
            <div>
              <Label htmlFor="publisher">Publisher</Label>
              <Input id="publisher" value={newBook.publisher} onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })} className="rounded-xl mt-1" />
            </div>
            <div>
              <Label htmlFor="publishYear">Publish Year</Label>
              <Input id="publishYear" type="number" value={newBook.publishYear} onChange={(e) => setNewBook({ ...newBook, publishYear: e.target.value })} className="rounded-xl mt-1" />
            </div>
            <div>
              <Label htmlFor="edition">Edition</Label>
              <Input id="edition" value={newBook.edition} onChange={(e) => setNewBook({ ...newBook, edition: e.target.value })} className="rounded-xl mt-1" />
            </div>
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" type="number" value={newBook.price} onChange={(e) => setNewBook({ ...newBook, price: e.target.value })} className="rounded-xl mt-1" />
            </div>
            <div>
              <Label htmlFor="totalCopies">Total Copies</Label>
              <Input id="totalCopies" type="number" min="1" value={newBook.totalCopies} onChange={(e) => setNewBook({ ...newBook, totalCopies: e.target.value })} className="rounded-xl mt-1" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="shelfLocation">Shelf Location</Label>
              <Input id="shelfLocation" value={newBook.shelfLocation} onChange={(e) => setNewBook({ ...newBook, shelfLocation: e.target.value })} className="rounded-xl mt-1" placeholder="e.g., A-12-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBookOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleAddBook} className="rounded-xl font-bold">Add Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Book Dialog */}
      <Dialog open={isIssueBookOpen} onOpenChange={setIsIssueBookOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle>Issue Book</DialogTitle>
            <DialogDescription>
              {selectedBook && <span className="font-bold text-foreground">{selectedBook.title}</span>} - Enter student details and due date.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="studentId">Student ID *</Label>
              <Input id="studentId" value={issueForm.studentId} onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })} className="rounded-xl mt-1" placeholder="Enter student admission number" />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input id="dueDate" type="date" value={issueForm.dueDate} onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })} className="rounded-xl mt-1" />
            </div>
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Input id="remarks" value={issueForm.remarks} onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })} className="rounded-xl mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIssueBookOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleIssueBook} className="rounded-xl font-bold">Issue Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Book Dialog */}
      <Dialog open={isReturnBookOpen} onOpenChange={setIsReturnBookOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle>Return Book</DialogTitle>
            <DialogDescription>
              Confirm return for <span className="font-bold text-foreground">{selectedIssue?.book.title}</span>
            </DialogDescription>
          </DialogHeader>
          {selectedIssue && (
            <div className="p-4 bg-muted/50 rounded-2xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-bold">Due Date</span>
                <span className="font-black">{new Date(selectedIssue.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-bold">Student</span>
                <span className="font-black">{selectedIssue.student?.name || "N/A"}</span>
              </div>
              {new Date() > new Date(selectedIssue.dueDate) && (
                <div className="flex justify-between text-sm text-rose-600">
                  <span className="font-bold">Fine (₹10/day)</span>
                  <span className="font-black">
                    ₹{Math.ceil((new Date().getTime() - new Date(selectedIssue.dueDate).getTime()) / (1000 * 60 * 60 * 24)) * 10}
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReturnBookOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleReturnBook} className="rounded-xl font-bold">Confirm Return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
