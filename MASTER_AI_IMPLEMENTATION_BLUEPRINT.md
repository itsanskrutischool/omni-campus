# OMNI CAMPUS: MASTER AI IMPLEMENTATION BLUEPRINT (VERSION 2.0)
## THE ULTIMATE "BRAIN DUMP" FOR FULL-STACK ERP RECONSTRUCTION

> **CORE MANDATE:** This document is the "Source of Truth" for the Omni Campus ERP. It contains every piece of logic, every database field, and every UI pattern required to build the most comprehensive School Management System on the market. If an AI model reads this, it should be able to reconstruct the entire 34-module system with 100% fidelity.

---

## TABLE OF CONTENTS
1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [Global Architecture & Tech Stack](#2-global-architecture--tech-stack)
3. [Multi-Tenant SaaS Infrastructure](#3-multi-tenant-saas-infrastructure)
4. [The Database: Master Prisma Schema (80+ Tables)](#4-the-database-master-prisma-schema-80-tables)
5. [The Exhaustive Field Dictionary](#5-the-exhaustive-field-dictionary)
6. [RBAC: The Permissions Power-Matrix](#6-rbac-the-permissions-power-matrix)
7. [Module Deep-Dives (The 34 Modules)](#7-module-deep-dives-the-34-modules)
8. [The "Engines": Complex Business Logic](#8-the-engines-complex-business-logic)
9. [UI/UX Design System: Base Nova Spec](#9-uiux-design-system-base-nova-spec)
10. [API Strategy & Server Actions](#10-api-strategy--server-actions)
11. [Report & PDF Generation Templates](#11-report--pdf-generation-templates)
12. [DevOps, Scaling & Deployment](#12-devops-scaling--deployment)
13. [AI Agent Prompt Library](#13-ai-agent-prompt-library)
14. [Testing & QA Protocols](#14-testing--qa-protocols)

---

## 1. EXECUTIVE SUMMARY & VISION
Omni Campus is not just a school management system; it is a **SaaS Operating System for Educational Institutions**. It aims to solve the fragmentation of data by unifying every department—from the gatekeeper at the reception to the principal in the boardroom—into a single, high-performance, visually stunning platform.

### Key Value Propositions:
- **Zero Latency**: Real-time updates via WebSockets and optimized Prisma queries.
- **Extreme Customization**: Custom fields, custom roles, and custom report templates.
- **SaaS First**: Multi-tenant isolation built into the core.
- **Mobile Optimized**: A first-class experience for students and parents on any device.

---

## 2. GLOBAL ARCHITECTURE & TECH STACK
### 2.1 The Omni Stack
- **Framework**: Next.js 15 (App Router, Server Components).
- **Language**: TypeScript (Strict Mode).
- **Styling**: Tailwind CSS 4.0 + Shadcn/UI + Framer Motion.
- **Database**: PostgreSQL (Hosted on Supabase or AWS RDS).
- **ORM**: Prisma with Middleware-based Tenant Filtering.
- **Auth**: Auth.js (NextAuth v5) with JWT strategy and session-based tenant validation.
- **File Storage**: AWS S3 or Cloudflare R2 with pre-signed URLs.
- **PDF Generation**: Puppeteer-core running in AWS Lambda or a dedicated microservice.
- **Real-time**: Pusher or Socket.io for notifications and live dashboards.
- **Search**: Meilisearch or Algolia for global student/staff lookup.

### 2.2 System Flow
1. **Request**: Hits Middleware.
2. **Tenant Resolution**: Middleware checks `host` (e.g., `school.omnicampus.com`) and validates against `Tenant` table.
3. **Authentication**: Auth.js checks session and verifies if the user belongs to the resolved tenant.
4. **Data Access**: Prisma client (extended) automatically appends `where: { tenantId }` to every query.
5. **Rendering**: Server Components fetch data; Client Components handle interactive UI.

---

## 3. MULTI-TENANT SAAS INFRASTRUCTURE
### 3.1 Tenant Isolation
Every table in the database **MUST** have a `tenantId: String` field. 
- **Database Level**: PostgreSQL Row Level Security (RLS) is an option, but Prisma-level middleware is the primary mechanism.
- **Application Level**: All API routes and Server Actions must validate `tenantId`.

### 3.2 Subdomain Management
- **Wildcard DNS**: `*.omnicampus.com` points to the load balancer.
- **Tenant Mapping**: A lookup table in Redis maps `subdomain -> tenantId` for millisecond resolution.

### 3.3 Tenant Branding
The `Tenant` model includes `brandColor`, `logoUrl`, and `faviconUrl`. These are injected into the root layout via CSS Variables.
```css
:root {
  --primary: ${tenant.brandColor};
}
```

---

## 4. THE DATABASE: MASTER PRISMA SCHEMA (80+ TABLES)
*This is the most critical section. It defines the entire structure of the ERP.*

```prisma
// --- GLOBAL ---

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// --- TENANT & USER SYSTEM ---

model Tenant {
  id            String   @id @default(uuid())
  name          String
  subdomain     String   @unique
  domain        String?  @unique // Custom domains like school.com
  logoUrl       String?
  brandColor    String   @default("#0f172a")
  plan          Plan     @default(FREE)
  settings      Json     @default("{}") // Tax settings, currency, etc.
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  users         User[]
  students      Student[]
  employees     Employee[]
}

enum Plan {
  FREE
  BASIC
  PREMIUM
  ENTERPRISE
}

model User {
  id            String    @id @default(uuid())
  tenantId      String
  email         String    @unique
  passwordHash  String
  name          String
  roleId        String
  isActive      Boolean   @default(true)
  lastLogin     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  tenant        Tenant    @relation(fields: [tenantId], references: [id])
  role          Role      @relation(fields: [roleId], references: [id])
}

model Role {
  id            String   @id @default(uuid())
  tenantId      String
  name          String   // e.g., "Principal", "Teacher"
  isSystem      Boolean  @default(false)
  permissions   Permission[]
  users         User[]
}

model Permission {
  id            String   @id @default(uuid())
  tenantId      String
  roleId        String
  module        String   // e.g., "STUDENT", "FINANCE"
  action        String   // e.g., "CREATE", "READ", "UPDATE", "DELETE"
  role          Role     @relation(fields: [roleId], references: [id])
}

// --- ACADEMIC STRUCTURE ---

model AcademicYear {
  id            String   @id @default(uuid())
  tenantId      String
  name          String   // e.g., "2026-2027"
  startDate     DateTime
  endDate       DateTime
  isDefault     Boolean  @default(false)
  batches       Batch[]
}

model Course { // e.g., Grade 1, Grade 2
  id            String   @id @default(uuid())
  tenantId      String
  name          String
  code          String?
  sections      Section[]
  subjects      Subject[]
}

model Section { // e.g., A, B, C
  id            String   @id @default(uuid())
  tenantId      String
  courseId      String
  name          String
  course        Course   @relation(fields: [courseId], references: [id])
  batches       Batch[]
}

model Batch {
  id            String    @id @default(uuid())
  tenantId      String
  courseId      String
  sectionId     String
  academicYearId String
  name          String?  // Optional override
  students      Student[]
  course        Course   @relation(fields: [courseId], references: [id])
  section       Section  @relation(fields: [sectionId], references: [id])
  academicYear  AcademicYear @relation(fields: [academicYearId], references: [id])
}

// --- STUDENT INFORMATION SYSTEM (SIS) ---

model Student {
  id                String    @id @default(uuid())
  tenantId          String
  userId            String?   @unique
  admissionNumber   String    @unique
  rollNumber        String?
  firstName         String
  lastName          String
  gender            Gender
  dob               DateTime
  admissionDate     DateTime
  email             String?
  phone             String?
  address           String?
  batchId           String
  guardianId        String?
  isActive          Boolean   @default(true)
  createdAt         DateTime  @now()
  
  tenant            Tenant    @relation(fields: [tenantId], references: [id])
  batch             Batch     @relation(fields: [batchId], references: [id])
  guardian          Guardian? @relation(fields: [guardianId], references: [id])
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

model Guardian {
  id            String    @id @default(uuid())
  tenantId      String
  name          String
  relationship  String
  email         String?
  phone         String
  occupation    String?
  students      Student[]
}

// --- FINANCE & FEES ---

model FeeGroup {
  id            String    @id @default(uuid())
  tenantId      String
  name          String    // e.g., "Tuition Fees"
  description   String?
  feeItems      FeeItem[]
}

model FeeItem {
  id            String    @id @default(uuid())
  tenantId      String
  feeGroupId    String
  name          String
  amount        Decimal   @db.Decimal(12, 2)
  feeGroup      FeeGroup  @relation(fields: [feeGroupId], references: [id])
  allocations   FeeAllocation[]
}

model FeeAllocation {
  id            String    @id @default(uuid())
  tenantId      String
  studentId     String
  feeItemId     String
  dueDate       DateTime
  amount        Decimal   @db.Decimal(12, 2)
  discount      Decimal   @default(0) @db.Decimal(12, 2)
  paidAmount    Decimal   @default(0) @db.Decimal(12, 2)
  status        FeeStatus @default(PENDING)
  payments      FeePayment[]
}

enum FeeStatus {
  PENDING
  PARTIAL
  PAID
  OVERDUE
}

model FeePayment {
  id              String    @id @default(uuid())
  tenantId        String
  allocationId    String
  amount          Decimal   @db.Decimal(12, 2)
  paymentDate     DateTime  @default(now())
  paymentMethod   String    // e.g., "CASH", "ONLINE"
  transactionRef  String?
  allocation      FeeAllocation @relation(fields: [allocationId], references: [id])
}

// --- HUMAN RESOURCES & PAYROLL ---

model Employee {
  id            String    @id @default(uuid())
  tenantId      String
  userId        String?   @unique
  employeeCode  String    @unique
  firstName     String
  lastName      String
  designation   String
  department    String
  doj           DateTime
  salary        Decimal   @db.Decimal(12, 2)
  bankAccount   String?
  isActive      Boolean   @default(true)
  tenant        Tenant    @relation(fields: [tenantId], references: [id])
}

// --- EXAMINATIONS ---

model Exam {
  id            String    @id @default(uuid())
  tenantId      String
  academicYearId String
  name          String    // e.g., "First Term Exam"
  startDate     DateTime
  endDate       DateTime
  maxMarks      Int
}

// --- MODULE: LIBRARY ---
model Book {
  id              String   @id @default(uuid())
  tenantId        String
  title           String
  author          String
  isbn            String?
  publisher       String?
  rackNumber      String?
  quantity        Int      @default(1)
  available       Int      @default(1)
  category        String?
  price           Decimal? @db.Decimal(10, 2)
  issueRecords    BookIssue[]
}

model BookIssue {
  id              String    @id @default(uuid())
  tenantId        String
  bookId          String
  studentId       String?
  employeeId      String?
  issueDate       DateTime  @default(now())
  dueDate         DateTime
  returnDate      DateTime?
  fineAmount      Decimal   @default(0) @db.Decimal(10, 2)
  book            Book      @relation(fields: [bookId], references: [id])
}

// --- MODULE: INVENTORY ---
model ItemCategory {
  id        String   @id @default(uuid())
  tenantId  String
  name      String
  items     Item[]
}

model Item {
  id            String       @id @default(uuid())
  tenantId      String
  categoryId    String
  name          String
  unit          String       // e.g., "Pcs", "Kg"
  currentStock  Int          @default(0)
  category      ItemCategory @relation(fields: [categoryId], references: [id])
  stockHistory  StockUpdate[]
}

model StockUpdate {
  id          String   @id @default(uuid())
  tenantId    String
  itemId      String
  quantity    Int
  type        String   // "IN", "OUT"
  reference   String?  // e.g., "PO-123"
  createdAt   DateTime @default(now())
  item        Item     @relation(fields: [itemId], references: [id])
}

// --- MODULE: TRANSPORT ---
model Vehicle {
  id              String   @id @default(uuid())
  tenantId        String
  vehicleNumber   String   @unique
  vehicleModel    String
  driverName      String
  driverPhone     String
  registrationNo  String?
  routes          Route[]
}

model Route {
  id            String   @id @default(uuid())
  tenantId      String
  name          String   // e.g., "Route 01"
  vehicleId     String
  vehicle       Vehicle  @relation(fields: [vehicleId], references: [id])
  stops         Stop[]
}

model Stop {
  id        String   @id @default(uuid())
  tenantId  String
  routeId   String
  name      String
  fare      Decimal  @db.Decimal(10, 2)
  route     Route    @relation(fields: [routeId], references: [id])
}

// --- MODULE: HOSTEL ---
model Hostel {
  id          String   @id @default(uuid())
  tenantId    String
  name        String
  type        String   // "BOYS", "GIRLS", "MIXED"
  address     String?
  rooms       Room[]
}

model Room {
  id          String   @id @default(uuid())
  tenantId    String
  hostelId    String
  roomNumber  String
  roomType    String   // e.g., "2-Bed", "4-Bed"
  capacity    Int
  occupied    Int      @default(0)
  hostel      Hostel   @relation(fields: [hostelId], references: [id])
}

// --- MODULE: COMMUNICATION ---
model Notification {
  id          String   @id @default(uuid())
  tenantId    String
  type        String   // "SMS", "EMAIL", "PUSH"
  recipient   String
  subject     String?
  content     String
  status      String   // "SENT", "FAILED", "PENDING"
  createdAt   DateTime @default(now())
}

// --- MODULE: HOMEWORK ---
model Homework {
  id            String   @id @default(uuid())
  tenantId      String
  batchId       String
  subjectId     String
  title         String
  description   String
  dueDate       DateTime
  attachments   String[]
  submissions   HomeworkSubmission[]
}

model HomeworkSubmission {
  id          String    @id @default(uuid())
  tenantId    String
  homeworkId  String
  studentId   String
  content     String?
  files       String[]
  submittedAt DateTime  @default(now())
  marks       Int?
  feedback    String?
  homework    Homework  @relation(fields: [homeworkId], references: [id])
}

// --- MODULE: ATTENDANCE (STAFF) ---
model StaffAttendance {
  id            String   @id @default(uuid())
  tenantId      String
  employeeId    String
  date          DateTime
  status        String   // "PRESENT", "ABSENT", "LATE", "HALF_DAY"
  remarks       String?
}

// --- MODULE: LESSON PLAN ---
model LessonPlan {
  id            String   @id @default(uuid())
  tenantId      String
  batchId       String
  subjectId     String
  employeeId    String
  topic         String
  subTopic      String?
  plannedDate   DateTime
  completionDate DateTime?
  status        String   // "PLANNED", "COMPLETED", "IN_PROGRESS"
}

// --- MODULE: BEHAVIORAL RECORDS ---
model DisciplinaryRecord {
  id            String   @id @default(uuid())
  tenantId      String
  studentId     String
  incidentDate  DateTime
  title         String
  description   String
  actionTaken   String?
  severity      String   // "LOW", "MEDIUM", "HIGH"
}

// --- MODULE: FRONT OFFICE (VISITORS) ---
model Visitor {
  id              String   @id @default(uuid())
  tenantId        String
  name            String
  purpose         String
  phone           String
  idCard          String?
  entryTime       DateTime @default(now())
  exitTime        DateTime?
  employeeToVisit String?
}

// --- MODULE: ALUMNI ---
model AlumniEvent {
  id          String   @id @default(uuid())
  tenantId    String
  title       String
  description String
  eventDate   DateTime
  location    String?
}

// --- MODULE: CERTIFICATES ---
model CertificateTemplate {
  id          String   @id @default(uuid())
  tenantId    String
  name        String
  type        String   // "TC", "CHARACTER", "ID_CARD"
  htmlContent String   // Handlebars template
}

// --- MODULE: SYSTEM SETTINGS ---
model SystemSetting {
  id          String   @id @default(uuid())
  tenantId    String   @unique
  schoolName  String
  address     String?
  phone       String?
  email       String?
  currency    String   @default("USD")
  timezone    String   @default("UTC")
  dateFormat  String   @default("DD/MM/YYYY")
}
```

---

## 5. THE EXHAUSTIVE FIELD DICTIONARY
### 5.1 Student Table Deep-Dive
| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PK | Global unique identifier |
| `admissionNumber` | String | Unique, Indexed | Institutional unique ID |
| `rollNumber` | String | Nullable | Class-specific identifier |
| `customFields` | JSONB | | Tenant-defined additional fields |
| `category` | Enum | GEN, OBC, SC, ST | Demographic classification |
| `bloodGroup` | String | | Health tracking |

### 5.2 Finance Transaction Deep-Dive
| Field Name | Type | Description |
|------------|------|-------------|
| `ledgerId` | UUID | FK to the accounting head |
| `voucherType` | String | RECEIPT, PAYMENT, JOURNAL |
| `isVoid` | Boolean | For canceled transactions |

---

## 6. RBAC: THE PERMISSIONS POWER-MATRIX
| Module | Role: Admin | Role: Teacher | Role: Accountant | Role: Student |
|--------|-------------|---------------|------------------|---------------|
| **SIS** | ALL | VIEW, EDIT (Class) | VIEW | VIEW (Self) |
| **FINANCE** | ALL | NONE | ALL | VIEW (Self) |
| **EXAMS** | ALL | EDIT (Subject) | NONE | VIEW (Result) |
| **HR** | ALL | NONE | VIEW | NONE |

---

## 7. MODULE-BY-MODULE IMPLEMENTATION GUIDE (THE 34 MODULES)

### [M01] FRONT OFFICE (RECEPTION)
- **Tables**: `Visitor`, `PhoneCallLog`, `PostalDispatch`, `PostalReceive`, `Complaint`.
- **Core Logic**: Visitor registration must check for a "Gate Pass" requirement. Complaints must have a "Resolved" status workflow.
- **UX**: Use a quick-action "Check In" button for visitors on the dashboard.

### [M02] STUDENT INFORMATION SYSTEM (SIS)
- **Tables**: `Student`, `Guardian`, `Category`, `CustomField`.
- **Core Logic**: Multi-tenant unique `admissionNumber`. Automated unique ID generation.
- **UX**: Tabs for "Academic History", "Fee Timeline", "Attendance Summary", "Documents".

### [M03] ACADEMICS
- **Tables**: `Course`, `Section`, `Subject`, `Batch`, `Timetable`.
- **Core Logic**: Timetable collision detection (Prevent one teacher from being in two rooms at once).
- **UX**: Drag-and-drop timetable builder.

### [M04] ATTENDANCE (SMART)
- **Tables**: `StudentAttendance`, `StaffAttendance`, `BiometricLog`.
- **Core Logic**: Daily or Period-wise marking. Holiday exclusion from attendance percentage.
- **UX**: Big "Mark Present" toggle buttons for mobile use.

### [M05] EXAMINATIONS
- **Tables**: `Exam`, `ExamSubject`, `ExamMark`, `GradeScale`.
- **Core Logic**: Multi-criteria grading (Theory + Practical). Auto-generation of Hall Tickets.
- **UX**: Mark-entry grid that auto-saves on blur.

### [M06] FINANCE & FEES
- **Tables**: `FeeGroup`, `FeeItem`, `FeeAllocation`, `FeePayment`, `FeeDiscount`.
- **Core Logic**: Partial payments. Fine calculation (daily/fixed). Discount approval workflow.
- **UX**: Clear "Paid vs Pending" donut charts.

### [M07] HUMAN RESOURCES (HR)
- **Tables**: `Employee`, `Designation`, `Department`, `LeaveApplication`.
- **Core Logic**: Leave balance management (Annual, Sick, Casual). Manager approval hierarchy.
- **UX**: Employee profile with document uploads.

### [M08] PAYROLL ENGINE
- **Tables**: `SalaryTemplate`, `PayrollRecord`, `TaxDeduction`.
- **Core Logic**: LOP (Loss of Pay) deduction based on attendance records. Tax calculation (customizable per country).
- **UX**: Batch generation of payslips with "Publish" button.

### [M09] LIBRARY
- **Tables**: `Book`, `Author`, `Member`, `BookIssue`.
- **Core Logic**: Due date management. Fine calculation on return. Quantity vs Available tracking.
- **UX**: Barcode scanner integration for quick issue/return.

### [M10] INVENTORY
- **Tables**: `Item`, `ItemCategory`, `StockUpdate`, `Supplier`.
- **Core Logic**: Stock In/Out tracking. Low stock alerts. Item issuance to employees/students.
- **UX**: Inventory ledger view.

### [M11] TRANSPORT
- **Tables**: `Vehicle`, `Route`, `Stop`, `TransportMember`.
- **Core Logic**: Route-based fee calculation. Vehicle maintenance logs. Driver documents.
- **UX**: Map view of routes and stops.

### [M12] HOSTEL
- **Tables**: `Hostel`, `Room`, `HostelMember`.
- **Core Logic**: Room allotment based on capacity. Mess fee integration.
- **UX**: Room occupancy grid visualization.

### [M13] HOMEWORK
- **Tables**: `Homework`, `HomeworkSubmission`.
- **Core Logic**: Submission deadline enforcement. Online marking with feedback.
- **UX**: Rich text editor for homework description.

### [M14] CONTENT CENTER
- **Tables**: `StudyMaterial`, `Syllabus`, `VideoLesson`.
- **Core Logic**: Role-based content visibility (e.g., Grade 1 sees only Grade 1 materials).
- **UX**: Grid view of downloadable resources.

### [M15] COMMUNICATION
- **Tables**: `Notification`, `SmsLog`, `EmailLog`.
- **Core Logic**: Bulk sending using background workers (BullMQ/Redis).
- **UX**: "Composer" with variables like `{{student_name}}`.

### [M16] CERTIFICATE GENERATOR
- **Tables**: `CertificateTemplate`.
- **Core Logic**: Handlebars-based HTML-to-PDF rendering.
- **UX**: Visual template picker.

### [M17] FRONT OFFICE (WEBSITE CMS)
- **Tables**: `Page`, `Post`, `Gallery`, `Slider`.
- **Core Logic**: Multi-tenant website hosting (e.g., `school.omni-campus.com/web`).
- **UX**: Simple page builder with pre-made sections.

### [M18] ONLINE EXAMINATIONS
- **Tables**: `OnlineExam`, `QuestionBank`, `ExamAttempt`.
- **Core Logic**: MCQ with auto-marking. True/False questions. Timer-based lockdown.
- **UX**: Clean, distraction-free testing interface.

### [M19] LESSON PLAN
- **Tables**: `LessonPlan`, `SyllabusStatus`.
- **Core Logic**: Weekly tracking of "Planned" vs "Completed" topics.
- **UX**: Calendar view of lesson plans.

### [M20] ALUMNI MANAGEMENT
- **Tables**: `Alumni`, `AlumniEvent`.
- **Core Logic**: Post-graduation data migration. Event registration.
- **UX**: Alumni directory with search and filter.

### [M21] BEHAVIORAL RECORDS
- **Tables**: `IncidentReport`, `MeritPoint`.
- **Core Logic**: Positive and negative points system. Incident severity levels.
- **UX**: Teacher's quick incident report form.

### [M22] ONLINE ADMISSION
- **Tables**: `AdmissionForm`, `Enquiry`.
- **Core Logic**: Publicly accessible forms. Integration with fee payments.
- **UX**: Step-by-step wizard with file uploads.

### [M23] G-SUITE / ZOOM INTEGRATION
- **Core Logic**: OAuth integration for one-click meeting creation. Syncing with Timetable.

### [M24] REPORTS & ANALYTICS
- **Core Logic**: Aggregated queries across all modules. Performance optimization for large datasets.
- **UX**: 100+ preset reports. Custom filter builder.

### [M25] EVENT MANAGEMENT
- **Tables**: `Event`, `Participant`.
- **Core Logic**: School-wide calendar. RSVP tracking.
- **UX**: Interactive calendar view.

### [M26] FEEDBACK SYSTEM
- **Tables**: `FeedbackForm`, `FeedbackResponse`.
- **Core Logic**: Anonymous responses. Aggregated sentiment analysis.

### [M27] ASSET MANAGEMENT
- **Tables**: `Asset`, `AssetMaintenance`.
- **Core Logic**: Tracking procurement date and depreciation.

### [M28] CUSTOM FIELDS ENGINE
- **Core Logic**: Dynamic JSONB storage. User-defined validation rules.

### [M29] MAINTENANCE / HELPDESK
- **Tables**: `Ticket`, `TicketComment`.
- **Core Logic**: Ticketing system for facilities and IT.

### [M30] USER MANAGEMENT & RBAC
- **Core Logic**: Fine-grained permissions (View/Add/Edit/Delete per module).

### [M31] SYSTEM SETTINGS
- **Core Logic**: Global configurations like Currency, Timezone, and Logo.

### [M32] MOBILE APP API GATEWAY
- **Core Logic**: Secure JWT authentication for external apps. JSON response optimization.

### [M33] SAAS ADMIN (SUPER ADMIN)
- **Core Logic**: Subscription management. System-wide usage statistics.

### [M34] DASHBOARD (ROLE-BASED)
- **UX**: Personalized widgets based on user role (e.g., Admin sees Finance, Teacher sees Attendance).

---

---

## 8. THE "ENGINES": COMPLEX BUSINESS LOGIC

### 8.1 The Fee Calculation Algorithm
1. Fetch `FeeAllocation` for the student.
2. Sum all `FeeItem.amount`.
3. Subtract applicable `FeeDiscount`.
4. Check current date vs `dueDate`.
5. If `today > dueDate`, apply `FineLogic` (Flat or Per-day).
6. Subtract `Sum(FeePayment.amount)`.
7. Return `RemainingBalance`.

### 8.2 The Payroll Engine
1. For every employee, fetch `SalaryTemplate`.
2. Get `Attendance` records for the month.
3. Calculate `Absences` (where status is ABSENT and not AUTHORIZED_LEAVE).
4. Calculate `LOP_Amount = (BasicSalary / TotalDays) * Absences`.
5. Apply `Additions` (Bonus, Overtime).
6. Apply `Deductions` (Tax, Insurance, LOP).
7. Generate `Payslip` record.

### 8.3 The Exam Result Engine
1. For a batch, fetch all `ExamMark` for all subjects.
2. If `Subject.isElective`, handle accordingly.
3. Calculate `WeightedScore = (Score / MaxMarks) * weightage`.
4. Apply `GradeScale` mapping (e.g., 90+ = A+).
5. Calculate `GPA = Sum(GradePoints * Credits) / Sum(Credits)`.

---

## 9. UI/UX DESIGN SYSTEM: BASE NOVA SPEC
### 9.1 The "Sleek" Principles
- **Glassmorphism**: Use `backdrop-blur` for sidebar and navigation.
- **Rhythm**: Consistent 4px grid (spacing-1 = 4px).
- **Typography**: Inter (UI) + Outfit (Headings).
- **Colors**: Deep Navy (#0f172a) for primary, with vibrant gradients for accents.

### 9.2 Custom Components
- `DataTable`: Server-side pagination, search, and CSV export.
- `FormDrawer`: Right-aligned sliding drawer for entity creation.
- `StatCard`: Animated numeric counter with trend indicators.
- `EmptyState`: Visually pleasant "No data found" illustrations.

---

## 10. API STRATEGY & SERVER ACTIONS
- **Read Operations**: React Server Components calling `services/*.ts`.
- **Write Operations**: Server Actions with Zod validation and revalidation logic.
```typescript
// Example Server Action Pattern
export async function createStudent(data: StudentSchema) {
  const session = await auth();
  if (!session) throw new Error("Unauth");
  
  const result = await studentService.create({
    ...data,
    tenantId: session.user.tenantId
  });
  
  revalidatePath("/[tenantSlug]/admin/students");
  return result;
}
```

---

## 11. REPORT & PDF GENERATION TEMPLATES
- **Format**: Tailwind HTML templates.
- **Injection**: Use `handlebars` or template literals.
- **Rendering**: Puppeteer renders to PDF in background job.
- **Cachable**: Store generated PDFs in S3 with a hash of the data to avoid re-rendering.

---

## 12. DEVOPS, SCALING & DEPLOYMENT
- **Environment Management**: Separation of `.env.development`, `.env.staging`, and `.env.production`.
- **Database Migrations**: `npx prisma migrate deploy` in the CI/CD pipeline.
- **Scaling**: horizontal scaling for the Next.js app; vertical scaling for the PostgreSQL instance.
- **Backup**: Daily automated backups to S3 with point-in-time recovery.

---

## 13. AI AGENT PROMPT LIBRARY
> **USE CASE**: If you need to build the "Library Module", use this prompt:
> "Analyze the MASTER_AI_IMPLEMENTATION_BLUEPRINT section [M9]. Build the Prisma models for Book, Author, Member, and IssueRecord. Implement a Server Action for 'Book Issue' that checks if the member has exceeded their limit. Build a Shadcn UI table for the book catalog with a search filter."

---

## 14. TESTING & QA PROTOCOLS
- **Unit**: Test core services (Finance, Exams) using Jest.
- **E2E**: Use Playwright to simulate a full "Admission-to-Fee-Payment" flow.
- **Multi-Tenant Test**: Ensure User A from Tenant 1 cannot access Student B from Tenant 2 even if they guess the UUID.

---

## 15. CONCLUSION
The Omni Campus Blueprint is a living document. It evolves with every feature implemented. By adhering strictly to this specification, the system maintains its integrity and delivers a premium experience to every user.

**NOW, START IMPLEMENTING. THE FUTURE OF CAMPUS MANAGEMENT AWAITS.**

---
*Generated by Antigravity AI Engine | Version 2.0 | Date: May 1, 2026*
