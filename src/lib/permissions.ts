/**
 * Static RBAC Permission Matrix
 * ──────────────────────────────
 * Maps each role to allowed modules and actions.
 * Later: move to DB-driven permissions via a Permission table.
 */

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Bus,
  IndianRupee,
  Settings,
  ClipboardList,
  BookOpen,
  Calendar,
  MessageSquare,
  UserPlus,
  FileText,
  Building2,
  Briefcase,
  Shield,
  ScrollText,
  Wallet,
  Phone,
  type LucideIcon,
  Heart,
  Award,
  FileBadge,
  MonitorPlay,
  Receipt,
  BedDouble,
  Package,
  UserRoundCheck,
} from "lucide-react"

// ─── Types ───────────────────────────────────

export const USER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "TEACHER",
  "PARENT",
  "STUDENT",
  "ACCOUNTS",
  "RECEPTION",
  "TRANSPORT",
] as const

export type UserRole = (typeof USER_ROLES)[number]

export const MODULES = [
  "dashboard",
  "students",
  "admissions",
  "academics",
  "attendance",
  "exams",
  "fees",
  "transport",
  "library",
  "front-office",
  "timetable",
  "staff",
  "hr",
  "communication",
  "safety",
  "system-logs",
  "reports",
  "settings",
  "accounts",
  "reception",
  "health",
  "certificates",
  "scholarships",
  "lms",
  "homework",
  "petty-cash",
  "alumni",
  "hostel",
  "inventory",
  "recruitment",
] as const

export type Module = (typeof MODULES)[number]

export type Action = "view" | "create" | "edit" | "delete" | "export"

// ─── Permission Matrix ──────────────────────

type PermissionMatrix = Record<UserRole, Partial<Record<Module, Action[]>>>

const PERMISSIONS: PermissionMatrix = {
  SUPER_ADMIN: {
    dashboard: ["view"],
    students: ["view", "create", "edit", "delete", "export"],
    admissions: ["view", "create", "edit", "delete", "export"],
    academics: ["view", "create", "edit", "delete"],
    attendance: ["view", "create", "edit", "export"],
    exams: ["view", "create", "edit", "delete", "export"],
    fees: ["view", "create", "edit", "delete", "export"],
    transport: ["view", "create", "edit", "delete", "export"],
    library: ["view", "create", "edit", "delete"],
    "front-office": ["view", "create", "edit", "delete"],
    timetable: ["view", "create", "edit", "delete"],
    staff: ["view", "create", "edit", "delete", "export"],
    hr: ["view", "create", "edit", "delete", "export"],
    communication: ["view", "create", "edit", "delete"],
    safety: ["view", "create", "edit", "delete"],
    "system-logs": ["view", "export"],
    reports: ["view", "export"],
    settings: ["view", "create", "edit", "delete"],
    accounts: ["view", "create", "edit", "delete", "export"],
    reception: ["view", "create", "edit", "delete", "export"],
    health: ["view", "create", "edit", "delete", "export"],
    certificates: ["view", "create", "export"],
    scholarships: ["view", "create", "edit", "delete", "export"],
    lms: ["view", "create", "edit", "delete"],
    homework: ["view", "create", "edit", "delete", "export"],
    "petty-cash": ["view", "create", "edit", "delete", "export"],
    alumni: ["view", "create", "edit", "delete", "export"],
    hostel: ["view", "create", "edit", "delete", "export"],
    inventory: ["view", "create", "edit", "delete", "export"],
    recruitment: ["view", "create", "edit", "delete", "export"],
  },
  ADMIN: {
    dashboard: ["view"],
    students: ["view", "create", "edit", "delete", "export"],
    admissions: ["view", "create", "edit", "delete", "export"],
    academics: ["view", "create", "edit", "delete"],
    attendance: ["view", "create", "edit", "export"],
    exams: ["view", "create", "edit", "delete", "export"],
    fees: ["view", "create", "edit", "delete", "export"],
    transport: ["view", "create", "edit", "delete"],
    library: ["view", "create", "edit", "delete"],
    "front-office": ["view", "create", "edit", "delete"],
    timetable: ["view", "create", "edit"],
    staff: ["view", "create", "edit", "delete", "export"],
    hr: ["view", "create", "edit", "delete", "export"],
    communication: ["view", "create", "edit"],
    safety: ["view", "create", "edit", "delete"],
    "system-logs": ["view", "export"],
    reports: ["view", "export"],
    settings: ["view", "create", "edit", "delete"],
    accounts: ["view", "create", "edit", "delete", "export"],
    reception: ["view", "create", "edit", "delete", "export"],
    health: ["view", "create", "edit", "delete", "export"],
    certificates: ["view", "create", "export"],
    scholarships: ["view", "create", "edit", "delete", "export"],
    lms: ["view", "create", "edit", "delete"],
    homework: ["view", "create", "edit", "delete", "export"],
    "petty-cash": ["view", "create", "edit", "delete", "export"],
    alumni: ["view", "create", "edit", "delete", "export"],
    hostel: ["view", "create", "edit", "delete", "export"],
    inventory: ["view", "create", "edit", "delete", "export"],
    recruitment: ["view", "create", "edit", "delete", "export"],
  },
  TEACHER: {
    dashboard: ["view"],
    students: ["view"],
    academics: ["view", "edit"],
    attendance: ["view", "create", "edit"],
    exams: ["view", "create", "edit"],
    library: ["view"],
    communication: ["view", "create"],
    timetable: ["view"],
    reports: ["view"],
    lms: ["view"],
    homework: ["view", "create", "edit"],
    health: ["view"],
    alumni: ["view"],
    hostel: ["view"],
  },
  PARENT: {
    dashboard: ["view"],
    students: ["view"],
    academics: ["view"],
    attendance: ["view"],
    exams: ["view"],
    fees: ["view"],
    transport: ["view"],
    communication: ["view"],
    timetable: ["view"],
    reports: ["view"],
    alumni: ["view"],
  },
  STUDENT: {
    dashboard: ["view"],
    academics: ["view"],
    attendance: ["view"],
    exams: ["view"],
    fees: ["view"],
    library: ["view"],
    communication: ["view"],
    timetable: ["view"],
    reports: ["view"],
    alumni: ["view"],
    hostel: ["view"],
  },
  ACCOUNTS: {
    dashboard: ["view"],
    accounts: ["view", "create", "edit", "delete", "export"],
    students: ["view"],
    fees: ["view", "create", "edit", "delete", "export"],
    transport: ["view"],
    staff: ["view"],
    hr: ["view"],
    communication: ["view", "create"],
    reports: ["view", "export"],
    inventory: ["view", "create", "edit", "export"],
    recruitment: ["view"],
    hostel: ["view"],
  },
  RECEPTION: {
    dashboard: ["view"],
    reception: ["view", "create", "edit", "delete", "export"],
    students: ["view", "create"],
    admissions: ["view", "create", "edit"],
    attendance: ["view"],
    fees: ["view"],
    "front-office": ["view", "create", "edit", "delete"],
    safety: ["view", "create", "edit"],
    communication: ["view", "create"],
    reports: ["view"],
    alumni: ["view", "create", "edit"],
    hostel: ["view"],
  },
  TRANSPORT: {
    dashboard: ["view"],
    students: ["view"],
    transport: ["view", "create", "edit", "delete", "export"],
    communication: ["view", "create"],
    reports: ["view", "export"],
    hostel: ["view"],
  },
}

// ─── Public API ──────────────────────────────

/**
 * Check if a role has permission for a specific action on a module.
 */
export function hasPermission(
  role: UserRole,
  module: Module,
  action: Action
): boolean {
  const perms = PERMISSIONS[role]?.[module]
  return perms ? perms.includes(action) : false
}

/**
 * Get all allowed modules for a role (modules with at least one action).
 */
export function getAllowedModules(role: UserRole): Module[] {
  const rolePerms = PERMISSIONS[role]
  if (!rolePerms) return []
  return Object.entries(rolePerms)
    .filter(([, actions]) => actions && actions.length > 0)
    .map(([mod]) => mod as Module)
}

/**
 * Get all actions allowed for a role on a module.
 */
export function getAllowedActions(role: UserRole, module: Module): Action[] {
  return PERMISSIONS[role]?.[module] ?? []
}

// ─── Sidebar Menu Items ──────────────────────

export interface SidebarItem {
  label: string
  href: string // relative to /:tenantSlug/:role/
  icon: LucideIcon
  module: Module
}

const ALL_MENU_ITEMS: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, module: "dashboard" },
  { label: "Students", href: "/students", icon: Users, module: "students" },
  { label: "Admissions", href: "/admissions", icon: UserPlus, module: "admissions" },
  { label: "Academics", href: "/academics", icon: GraduationCap, module: "academics" },
  { label: "Attendance", href: "/attendance", icon: ClipboardList, module: "attendance" },
  { label: "Examinations", href: "/exams", icon: FileText, module: "exams" },
  { label: "Fee Management", href: "/fees", icon: IndianRupee, module: "fees" },
  { label: "Transport", href: "/transport", icon: Bus, module: "transport" },
  { label: "Library", href: "/library", icon: BookOpen, module: "library" },
  { label: "Front Office", href: "/front-office", icon: Building2, module: "front-office" },
  { label: "Timetable", href: "/timetable", icon: Calendar, module: "timetable" },
  { label: "Staff", href: "/staff", icon: Users, module: "staff" },
  { label: "HR & Payroll", href: "/hr", icon: Briefcase, module: "hr" },
  { label: "Communication", href: "/communication", icon: MessageSquare, module: "communication" },
  { label: "Safety & Security", href: "/safety", icon: Shield, module: "safety" },
  { label: "System Logs", href: "/system-logs", icon: ScrollText, module: "system-logs" },
  { label: "Reports", href: "/reports", icon: FileText, module: "reports" },
  { label: "Accounts", href: "/accounts", icon: Wallet, module: "accounts" },
  { label: "Reception", href: "/reception", icon: Phone, module: "reception" },
  { label: "Settings", href: "/settings", icon: Settings, module: "settings" },
  { label: "Health & Infirmary", href: "/health", icon: Heart, module: "health" },
  { label: "Certificates", href: "/certificates", icon: FileBadge, module: "certificates" },
  { label: "Scholarships", href: "/scholarships", icon: Award, module: "scholarships" },
  { label: "LMS Content", href: "/lms", icon: MonitorPlay, module: "lms" },
  { label: "Homework", href: "/homework", icon: FileText, module: "homework" },
  { label: "Petty Cash", href: "/petty-cash", icon: Receipt, module: "petty-cash" },
  { label: "Alumni", href: "/alumni", icon: UserRoundCheck, module: "alumni" },
  { label: "Hostel", href: "/hostel", icon: BedDouble, module: "hostel" },
  { label: "Inventory", href: "/inventory", icon: Package, module: "inventory" },
  { label: "Recruitment", href: "/recruitment", icon: Briefcase, module: "recruitment" },
]

/**
 * Returns filtered sidebar items for a given role.
 * Items without any permitted actions are excluded.
 */
export function getMenuForRole(role: UserRole): SidebarItem[] {
  return ALL_MENU_ITEMS.filter((item) => {
    const perms = PERMISSIONS[role]?.[item.module]
    return perms && perms.length > 0
  })
}

/**
 * Validate if a string is a valid UserRole.
 */
export function isValidRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole)
}

/**
 * Get the default redirect path for a role after login.
 */
export function getRoleRedirectPath(tenantSlug: string, role: UserRole): string {
  return `/${tenantSlug}/${role.toLowerCase()}/dashboard`
}
