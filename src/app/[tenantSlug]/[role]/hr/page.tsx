"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  Briefcase,
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  Calendar,
  MoreVertical,
  LayoutGrid,
  ShieldCheck,
  Zap,
  Clock,
  CreditCard,
  Users,
  TrendingUp,
  ChevronRight,
  DollarSign,
  Award,
  UserCheck,
  CalendarDays,
  ArrowUpRight,
  Banknote,
  FileText,
  Filter,
  Download,
  X,
  MapPin,
  Fingerprint,
  Edit,
  Activity,
  Cpu,
  Globe,
  Lock,
} from "lucide-react"
import { Card } from "@/components/ui/card"
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// ─── Types ─────────────────────────────────

interface Department {
  id: string
  name: string
  description: string | null
  _count: { staff: number }
}

interface StaffWithHR {
  id: string
  empId: string
  name: string
  email: string
  phone: string
  role: string
  status: string
  basicSalary: number | null
  joinDate: string
  department: { name: string } | null
  designation: { name: string } | null
  payrolls: PayrollRecord[]
}

interface PayrollRecord {
  id: string
  month: number
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  status: string
  paymentDate: string | null
}

type TabKey = "overview" | "departments" | "payroll" | "analytics"

// ─── Month Helper ──────────────────────────
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

// ─── Component ─────────────────────────────

export default function HRPayrollCenter() {
  const params = useParams()
  const isAdmin = params.role === "admin"
  const [activeTab, setActiveTab] = useState<TabKey>("overview")
  const [search, setSearch] = useState("")
  const [staff, setStaff] = useState<StaffWithHR[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedEmployee, setSelectedEmployee] = useState<StaffWithHR | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/hr`)
        if (res.ok) {
          const data = await res.json()
          setStaff(data.staff || [])
          setDepartments(data.departments || [])
        }
      } catch {
        // fallback
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.tenantSlug])

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.empId.toLowerCase().includes(search.toLowerCase()) ||
    (s.department?.name || "").toLowerCase().includes(search.toLowerCase())
  )

  const totalPayroll = staff.reduce((sum, s) => sum + (s.basicSalary || 0), 0)
  const activeCount = staff.filter(s => s.status === "ACTIVE").length

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Personnel Directory", icon: Users },
    { key: "departments", label: "Departments", icon: Building2 },
    { key: "payroll", label: "Payroll Management", icon: Banknote },
    { key: "analytics", label: "Workforce Analytics", icon: TrendingUp },
  ]

  const handleRowClick = (emp: StaffWithHR) => {
    setSelectedEmployee(emp)
    setIsPreviewOpen(true)
  }

  if (loading) {
    return (
      <div className="p-6 md:p-10 space-y-10 animate-pulse pt-2 bg-slate-50/50 dark:bg-zinc-950/50 min-h-screen">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <div className="h-10 w-48 bg-slate-200 dark:bg-white/5 rounded-xl" />
            <div className="h-4 w-96 bg-slate-100 dark:bg-white/5 rounded-lg" />
          </div>
          <div className="flex gap-3">
             <div className="h-11 w-32 bg-slate-100 dark:bg-white/5 rounded-xl" />
             <div className="h-11 w-40 bg-slate-200 dark:bg-white/5 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-white/5" />
          ))}
        </div>
        <div className="h-[500px] rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 shadow-sm" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 space-y-8 bg-slate-50/50 dark:bg-zinc-950/50 min-h-full">
      
      {/* ─── PROFESSIONAL HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">HR & Payroll</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your workforce, departments, and payroll operations from a single dashboard.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 dark:border-white/10 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          {isAdmin && (
            <Button 
              variant="default"
              size="lg"
              className="h-11 px-6 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 group"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span className="font-semibold">Add Employee</span>
            </Button>
          )}
        </div>
      </div>

      {/* ─── QUICK STATS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <StatCard
           label="Total Employees"
           value={loading ? 0 : staff.length}
           icon={Users}
           description="Total registered personnel"
           variant="blue"
           index={0}
         />
         <StatCard
           label="Active Status"
           value={loading ? "0" : activeCount}
           icon={UserCheck}
           description="Employees currently active"
           variant="emerald"
           index={1}
         />
         <StatCard
           label="Departments"
           value={loading ? 0 : departments.length}
           icon={Building2}
           description="Operational departments"
           variant="violet"
           index={2}
         />
         <StatCard
           label="Monthly Payroll"
           value={loading ? "₹0" : `₹${(totalPayroll / 100000).toFixed(1)}L`}
           icon={Banknote}
           description="Estimated monthly spend"
           variant="amber"
           index={3}
         />
      </div>

      {/* ─── NAVIGATION & SEARCH ─── */}
      <Card className="p-2 border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2">
           <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                   key={tab.key}
                   onClick={() => setActiveTab(tab.key)}
                   className={cn(
                     "relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2.5",
                     activeTab === tab.key 
                       ? "bg-primary text-white shadow-md shadow-primary/20" 
                       : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-white/5 dark:text-slate-400 dark:hover:text-white"
                   )}
                >
                   <tab.icon className="w-4 h-4" />
                   <span>{tab.label}</span>
                </button>
              ))}
           </div>

           <div className="relative w-full lg:w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by name, ID or dept..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
              />
           </div>
        </div>
      </Card>

      {/* ─── CONTENT AREA ─── */}
      <div className="relative min-h-[500px]">
         <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                 <Card className="rounded-2xl border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50/50 dark:bg-zinc-800/30">
                        <TableRow className="hover:bg-transparent border-slate-100 dark:border-white/5">
                          <TableHead className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Employee</TableHead>
                          <TableHead className="py-4 font-semibold text-slate-900 dark:text-slate-200">Department</TableHead>
                          <TableHead className="py-4 font-semibold text-slate-900 dark:text-slate-200">Designation</TableHead>
                          <TableHead className="py-4 font-semibold text-slate-900 dark:text-slate-200">Basic Salary</TableHead>
                          <TableHead className="py-4 font-semibold text-slate-900 dark:text-slate-200 text-center">Status</TableHead>
                          <TableHead className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-200">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell colSpan={6} className="h-20 px-6">
                                 <div className="h-12 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : filteredStaff.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-64 text-center">
                               <div className="flex flex-col items-center gap-4 py-12">
                                  <Users className="w-12 h-12 text-slate-200 dark:text-slate-800" />
                                  <p className="text-slate-400 font-medium">No results found for your search.</p>
                               </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredStaff.map((emp) => (
                            <TableRow 
                              key={emp.id}
                              onClick={() => handleRowClick(emp)}
                              className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-slate-100 dark:border-white/5"
                            >
                              <TableCell className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-zinc-800 overflow-hidden ring-1 ring-slate-200 dark:ring-white/10">
                                    <img 
                                      className="h-full w-full object-cover" 
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.empId}`} 
                                      alt={emp.name} 
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">{emp.name}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">{emp.empId}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{emp.department?.name || "Unassigned"}</span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-none font-medium px-2 py-1">
                                  {emp.designation?.name || "Staff"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                  ₹{emp.basicSalary?.toLocaleString("en-IN") || "0"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center">
                                  <Badge className={cn(
                                    "rounded-lg px-2 py-1 border-none font-bold text-[10px] uppercase tracking-wider",
                                    emp.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                                    emp.status === "ON_LEAVE" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : 
                                    "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                                  )}>
                                    {emp.status}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4 text-right">
                                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10">
                                    <ChevronRight className="w-4 h-4" />
                                 </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                 </Card>
              </motion.div>
            )}

            {activeTab === "departments" && (
              <motion.div
                key="departments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                 {loading ? (
                   Array.from({ length: 6 }).map((_, i) => (
                     <div key={i} className="h-48 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                   ))
                 ) : (
                   departments.map((dept) => (
                     <Card
                       key={dept.id}
                       className="group p-6 rounded-2xl border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                     >
                        <div className="flex justify-between items-start mb-4">
                           <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                              <Building2 className="w-6 h-6" />
                           </div>
                           <Badge variant="secondary" className="rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-none font-bold text-[10px] uppercase px-2 py-1">
                              {dept._count.staff} Staff
                           </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{dept.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6">
                          {dept.description || "Management and operations control."}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                           <div className="flex -space-x-2">
                             {Array.from({ length: Math.min(dept._count.staff, 3) }).map((_, j) => (
                               <div key={j} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden shadow-sm">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${dept.id}-${j}`} alt="" className="w-full h-full object-cover" />
                               </div>
                             ))}
                             {dept._count.staff > 3 && (
                               <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                 +{dept._count.staff - 3}
                               </div>
                             )}
                           </div>
                           <Button variant="ghost" size="sm" className="text-primary font-semibold hover:bg-primary/5 rounded-lg px-2">
                              View Details
                           </Button>
                        </div>
                     </Card>
                   ))
                 )}
              </motion.div>
            )}

            {activeTab === "payroll" && (
              <motion.div
                key="payroll"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 rounded-2xl border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-primary/10 rounded-xl text-primary">
                             <Banknote className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-medium text-slate-500">Total Budget</p>
                             <p className="text-2xl font-bold">₹{(totalPayroll / 100).toFixed(1)}k</p>
                          </div>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-2/3" />
                       </div>
                    </Card>

                    <Card className="p-6 rounded-2xl border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-violet-500/10 rounded-xl text-violet-500">
                             <FileText className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-medium text-slate-500">Processed</p>
                             <p className="text-2xl font-bold">85%</p>
                          </div>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 w-10/12" />
                       </div>
                    </Card>

                    <Card className="p-6 rounded-2xl border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                             <TrendingUp className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-medium text-slate-500">Sync Rate</p>
                             <p className="text-2xl font-bold">99.8%</p>
                          </div>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-full" />
                       </div>
                    </Card>
                 </div>

                 <Card className="rounded-2xl border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                             <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                             <h3 className="text-lg font-bold">Payroll Ledger</h3>
                             <p className="text-xs text-slate-500 font-medium">Monthly disbursement overview</p>
                          </div>
                       </div>
                       {isAdmin && (
                         <Button className="rounded-xl bg-slate-900 dark:bg-white dark:text-black hover:bg-slate-800 font-bold px-6">
                            Run Payroll Cycle
                         </Button>
                       )}
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-zinc-800/30">
                          <TableRow className="hover:bg-transparent border-slate-100 dark:border-white/5">
                            <TableHead className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Employee</TableHead>
                            <TableHead className="py-4 font-semibold text-slate-900 dark:text-slate-200">Base Salary</TableHead>
                            <TableHead className="py-4 font-semibold text-slate-900 dark:text-slate-200">Allowances</TableHead>
                            <TableHead className="py-4 font-semibold text-slate-900 dark:text-slate-200">Deductions</TableHead>
                            <TableHead className="py-4 font-semibold text-slate-900 dark:text-slate-200">Net Pay</TableHead>
                            <TableHead className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-200">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStaff.map((emp) => {
                            const latestPayroll = emp.payrolls?.[0]
                            return (
                              <TableRow key={emp.id} className="hover:bg-slate-50 dark:hover:bg-white/5 border-slate-100 dark:border-white/5">
                                <TableCell className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-slate-200 dark:ring-white/10">
                                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.empId}`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold">{emp.name}</span>
                                      <span className="text-[10px] text-slate-500 font-mono">{emp.empId}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm font-medium">₹{emp.basicSalary?.toLocaleString("en-IN") || 0}</TableCell>
                                <TableCell className="text-sm font-medium text-emerald-600">+₹{(latestPayroll?.allowances ?? 0).toLocaleString("en-IN")}</TableCell>
                                <TableCell className="text-sm font-medium text-rose-600">-₹{(latestPayroll?.deductions ?? 0).toLocaleString("en-IN")}</TableCell>
                                <TableCell className="text-sm font-bold text-slate-900 dark:text-white">
                                  ₹{(latestPayroll?.netSalary ?? emp.basicSalary ?? 0).toLocaleString("en-IN")}
                                </TableCell>
                                <TableCell className="px-6 text-right">
                                  <Badge className={cn(
                                     "rounded-lg font-bold text-[10px] uppercase tracking-wider px-3 py-1 border-none",
                                     latestPayroll?.status === "PAID" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                                  )}>
                                    {latestPayroll?.status ?? "SCHEDULED"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                 </Card>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                  <Card className="p-8 rounded-2xl border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                     <div className="p-4 bg-primary/10 rounded-full text-primary">
                        <TrendingUp className="w-8 h-8" />
                     </div>
                     <h3 className="text-xl font-bold">Performance Analytics</h3>
                     <p className="text-slate-500 max-w-xs">Detailed workforce performance metrics and growth indicators will be displayed here.</p>
                     <Button variant="outline" className="rounded-xl px-8 border-slate-200 dark:border-white/10">Generate Report</Button>
                  </Card>
                  
                  <Card className="p-8 rounded-2xl border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                     <div className="p-4 bg-violet-500/10 rounded-full text-violet-500">
                        <Activity className="w-8 h-8" />
                     </div>
                     <h3 className="text-xl font-bold">Attendance Trends</h3>
                     <p className="text-slate-500 max-w-xs">Visualizing employee presence and leave patterns over the current academic session.</p>
                     <Button variant="outline" className="rounded-xl px-8 border-slate-200 dark:border-white/10">View Trends</Button>
                  </Card>
              </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* ─── PERSONNEL DOSSIER SHEET ─── */}
      <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 border-l border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900">
          {selectedEmployee && (
            <div className="h-full flex flex-col">
               <div className="relative h-48 bg-slate-900 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-violet-900/60 opacity-50" />
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  <div className="relative h-24 w-24 rounded-2xl border-4 border-white dark:border-zinc-900 shadow-2xl overflow-hidden bg-white dark:bg-zinc-800">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedEmployee.empId}`} alt="" className="h-full w-full object-cover" />
                  </div>
               </div>

               <div className="px-10 -mt-6 relative z-10">
                  <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 shadow-2xl space-y-6">
                     <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{selectedEmployee.name}</h2>
                        <div className="flex items-center justify-center gap-2">
                           <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-wider text-[10px] px-3 py-1">
                              {selectedEmployee.empId}
                           </Badge>
                           <Badge variant="outline" className="border-slate-200 dark:border-white/10 text-slate-500 font-bold uppercase tracking-wider text-[10px] px-3 py-1">
                              {selectedEmployee.department?.name}
                           </Badge>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-1">
                           <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Base Compensation</p>
                           <p className="text-xl font-bold text-slate-900 dark:text-white">₹{selectedEmployee.basicSalary?.toLocaleString("en-IN") || 0}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-1">
                           <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date of Joining</p>
                           <p className="text-xl font-bold text-slate-900 dark:text-white">{new Date(selectedEmployee.joinDate).toLocaleDateString()}</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
                           Contact Information
                           <div className="flex-1 h-px bg-slate-100 dark:bg-white/5" />
                        </h4>
                        <div className="space-y-3">
                           <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                              <Mail className="w-5 h-5 text-slate-300" />
                              <span className="text-sm font-medium">{selectedEmployee.email}</span>
                           </div>
                           <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                              <Phone className="w-5 h-5 text-slate-300" />
                              <span className="text-sm font-medium">{selectedEmployee.phone}</span>
                           </div>
                        </div>
                     </div>

                     {isAdmin && (
                        <div className="pt-6 space-y-4">
                          <Button className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white dark:text-black hover:bg-slate-800 font-bold text-sm tracking-wide shadow-lg">
                             Modify Personnel Record
                          </Button>
                          <div className="grid grid-cols-2 gap-4">
                             <Button variant="outline" className="h-12 rounded-xl border-slate-200 dark:border-white/10 font-bold text-xs uppercase tracking-widest">
                                Pay Slip
                             </Button>
                             <Button variant="outline" className="h-12 rounded-xl border-slate-200 dark:border-white/10 font-bold text-xs uppercase tracking-widest text-rose-500 hover:bg-rose-50/50">
                                Terminate
                             </Button>
                          </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
