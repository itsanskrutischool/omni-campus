/**
 * Input Validation Schemas
 * ────────────────────────
 * Zod schemas for API input validation.
 */

import { z } from "zod"

// ─── Common Schemas ─────────────────────────

export const idSchema = z.string().cuid({ message: "Invalid ID format" })

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

// ─── Student Schemas ────────────────────────

export const createStudentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dob: z.string().datetime(),
  classRoomId: z.string().cuid(),
  sectionId: z.string().cuid().optional(),
  campusId: z.string().cuid().optional(),
  fatherName: z.string().min(2).max(100),
  motherName: z.string().min(2).max(100),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  email: z.string().email().optional(),
  address: z.string().max(255).optional(),
  category: z.enum(["GENERAL", "OBC", "SC", "ST", "EWS"]).default("GENERAL"),
  bloodGroup: z.string().optional(),
})

export const updateStudentSchema = createStudentSchema.partial()

// ─── Fee Schemas ────────────────────────────

export const recordPaymentSchema = z.object({
  recordId: z.string().cuid(),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["CASH", "CARD", "UPI", "CHEQUE", "BANK_TRANSFER"]),
  remarks: z.string().max(255).optional(),
})

export const applyWaiverSchema = z.object({
  recordId: z.string().cuid(),
  amount: z.number().positive("Waiver amount must be positive"),
  remarks: z.string().max(255).optional(),
})

// ─── Enquiry Schemas ────────────────────────

export const createEnquirySchema = z.object({
  studentName: z.string().min(2).max(100),
  parentName: z.string().min(2).max(100),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  email: z.string().email().optional(),
  classAppliedId: z.string().cuid(),
  source: z.string().optional(),
  notes: z.string().max(500).optional(),
})

// ─── Staff/HR Schemas ───────────────────────

export const createStaffSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  role: z.enum(["TEACHER", "ADMIN", "RECEPTION", "ACCOUNTS", "TRANSPORT"]),
  departmentName: z.string().optional(),
  designationName: z.string().optional(),
  joinDate: z.string().datetime(),
  basicSalary: z.number().positive().optional(),
})

// ─── Utility Types ──────────────────────────

export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>
export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>
export type CreateStaffInput = z.infer<typeof createStaffSchema>

// ─── Recruitment Schemas ────────────────────

export const createVacancySchema = z.object({
  tenantId: z.string().cuid(),
  action: z.literal("createVacancy"),
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  department: z.string().min(1, "Department is required").max(100),
  location: z.string().min(1, "Location is required").max(100),
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
  salary: z.string().optional(),
  startDate: z.string().datetime(),
})

export const createApplicationSchema = z.object({
  tenantId: z.string().cuid(),
  action: z.literal("createApplication"),
  vacancyId: z.string().cuid(),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  resume: z.string().url().optional(),
  coverLetter: z.string().max(2000).optional(),
})

// ─── Payroll Schemas ────────────────────────

export const generateBulkPayrollSchema = z.object({
  tenantId: z.string().cuid(),
  action: z.literal("generateBulkPayroll"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2030),
})

export const updatePayrollStatusSchema = z.object({
  tenantId: z.string().cuid(),
  payrollId: z.string().cuid(),
  status: z.enum(["PENDING", "PROCESSING", "PAID", "CANCELLED"]),
})

export const createPayHeadSchema = z.object({
  tenantId: z.string().cuid(),
  action: z.literal("createPayHead"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  type: z.enum(["EARNING", "DEDUCTION"]),
  amount: z.number().min(0, "Amount must be non-negative"),
})

// ─── Hostel Schemas ─────────────────────────

export const createHostelSchema = z.object({
  tenantId: z.string().cuid(),
  action: z.literal("createHostel"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  code: z.string().min(1, "Code is required").max(20),
  location: z.string().min(1, "Location is required").max(200),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
})

export const allocateRoomSchema = z.object({
  tenantId: z.string().cuid(),
  action: z.literal("allocateRoom"),
  roomId: z.string().cuid(),
  studentId: z.string().cuid(),
})

// ─── Inventory Schemas ──────────────────────

export const createItemSchema = z.object({
  tenantId: z.string().cuid(),
  action: z.literal("createItem"),
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  code: z.string().min(1, "Code is required").max(50),
  categoryId: z.string().cuid(),
  quantity: z.number().int().min(0, "Quantity must be non-negative"),
  unit: z.string().min(1, "Unit is required").max(20),
  storeId: z.string().cuid().optional(),
})

export const recordPurchaseSchema = z.object({
  tenantId: z.string().cuid(),
  action: z.literal("recordPurchase"),
  itemId: z.string().cuid(),
  storeId: z.string().cuid(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Price must be non-negative"),
})

// ─── Alumni Schemas ─────────────────────────

export const verifyAlumniSchema = z.object({
  tenantId: z.string().cuid(),
  action: z.literal("verifyAlumni"),
  alumniId: z.string().cuid(),
})

export const createEventSchema = z.object({
  tenantId: z.string().cuid(),
  action: z.literal("createEvent"),
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  date: z.string().datetime(),
  location: z.string().min(1, "Location is required").max(200),
})

// ─── Additional Utility Types ───────────────

export type CreateVacancyInput = z.infer<typeof createVacancySchema>
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type GenerateBulkPayrollInput = z.infer<typeof generateBulkPayrollSchema>
export type UpdatePayrollStatusInput = z.infer<typeof updatePayrollStatusSchema>
export type CreatePayHeadInput = z.infer<typeof createPayHeadSchema>
export type CreateHostelInput = z.infer<typeof createHostelSchema>
export type AllocateRoomInput = z.infer<typeof allocateRoomSchema>
export type CreateItemInput = z.infer<typeof createItemSchema>
export type RecordPurchaseInput = z.infer<typeof recordPurchaseSchema>
export type VerifyAlumniInput = z.infer<typeof verifyAlumniSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
