# Omni Campus — Technical Specification
### Feature-Parity Blueprint from InstiKit ERP Analysis
**Generated:** May 1, 2026 | **Source:** InstiKit v5.6 Demo Audit | **Target Stack:** Next.js 15 · Prisma · PostgreSQL · Redis

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Academic Hierarchy (Foundation)](#2-academic-hierarchy)
3. [Module Specifications](#3-module-specifications)
4. [Complete Data Model](#4-complete-data-model)
5. [Role-Based Access Control](#5-rbac)
6. [Multi-Tenant Design](#6-multi-tenant)
7. [Integration Points](#7-integrations)
8. [Implementation Priority](#8-priority)

---

## 1. Architecture Overview

### Tech Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15 (App Router) | SSR, RSC, API routes |
| ORM | Prisma | Type-safe DB access |
| Database | PostgreSQL 15 | Primary data store |
| Cache | Redis 7 | Sessions, rate limiting, caching |
| Auth | NextAuth.js v5 | Multi-role authentication |
| PDF | Puppeteer/Chromium | Report cards, certificates, receipts |
| Storage | S3-compatible | Documents, photos, attachments |
| Realtime | WebSocket/SSE | Notifications, live updates |

### Multi-Tenant Architecture
```
Request → Subdomain Resolution → Tenant Context → Scoped Queries
         (school1.omni.edu)    (tenantId: uuid)   (WHERE tenantId = ?)
```
Every table includes `tenantId` for data isolation. Tenant context is injected via middleware.

---

## 2. Academic Hierarchy

This is the **most critical data structure** — virtually every module references it.

```
Tenant (Institution)
  └── Department (Science, Commerce, Arts)
       └── Program (CBSE, ICSE, State Board)
            └── Course (Grade I, Grade II, ... Grade XII)
                 └── Batch (Grade I Batch I, Grade I Batch II)
                      ├── Subject (Math, English, Science)
                      └── Student[] (enrolled students)
```

### Temporal Dimension
All data is scoped to an **AcademicPeriod** (e.g., "2026-2027"). Period switching allows historical data access without data loss.

---

## 3. Module Specifications

### 3.1 Dashboard
**Purpose:** Centralized overview of institutional metrics.

| Widget | Data Source | Type |
|--------|-----------|------|
| Student Count | Student table | Stat card |
| Staff Count | Employee table | Stat card |
| Fee Collection | Transaction table | Stat card + chart |
| Today's Attendance | AttendanceRecord | Pie chart |
| Upcoming Events | CalendarEvent | List |
| Birthday Alerts | Student/Employee DOB | List |
| Recent Admissions | Admission table | List |
| Fee Defaulters | FeeAllocation (balance > 0) | List |

---

### 3.2 Reception Module
**Sub-modules:** Enquiry, Visitor Log, Gate Pass, Complaint, Call Log, Correspondence

| Entity | Key Fields |
|--------|-----------|
| Enquiry | name, contact, source, courseInterest, status, followUpDate |
| VisitorLog | name, purpose, whomToMeet, inTime, outTime, idProof |
| GatePass | personId, personType, passType, reason, authorizedBy |
| Complaint | complainantId, category, description, status, assignedTo, resolution |

---

### 3.3 Admissions Module
**Workflow:** Online Form → Registration → Admission Approval → Student Creation → Fee Allocation

| Entity | Key Fields |
|--------|-----------|
| AdmissionForm | formFields[], isActive, periodId |
| Registration | applicantName, courseId, guardianInfo, status, registrationNumber, gender, DOB, contactNumber, previousInstitute |
| Admission | registrationId, studentId, admissionDate, admissionNumber |

**Key Feature:** Registration creates a provisional record; upon admission approval, a full `Student` record is created with linked guardians.
**Form Pattern:** Supports `New Student` / `Existing Student` toggle. Auto-generates Registration Number.

---

**Hub entity** — referenced by every other module.

| Detail Level | Data Fields |
|--------------|-------------|
| **Primary** | Full Name, Photo (Circular Avatar), Admission Code (e.g. MINTADM041) |
| **Academic** | Course + Batch (e.g. Grade I Batch I), Enrollment Type |
| **Personal** | Gender (M/F/O), DOB, Blood Group, Religion, Nationality, Mother Tongue |
| **Contact** | Phone, Email, Address (Street, City, State, Pin Code) |
| **Guardian** | Linked Guardians (Name, Contact, Relation: Father/Mother/Sibling/Other) |

**Additional Student Sub-modules:**
- **Roll Number:** Assignment of class roll numbers
- **Health Record:** Medical history, vaccinations, allergies
- **Elective Subject:** Selection of optional courses
- **Attendance:** Record of daily/subject-wise presence
- **Fee Allocation:** Assignment of fee structures + concessions
- **Promotion:** Batch-to-batch progression workflow
- **Requests:** Edit (profile update), Service, Leave, Transfer
- **Alumni:** Tracking graduated students
- **Report:** Date/Batch/Subject-wise attendance, daily access logs

---

### 3.5 Attendance Module
**Methods:** Batch-wise, Subject-wise

| Status | Code | Description |
|--------|------|-------------|
| Present | P | Standard |
| Absent | A | Standard |
| Holiday | H | Institution closed |
| Half Day | HD | Partial attendance |
| Prep Leave | PL | Exam preparation |
| Late | LT | Late arrival |
| Out of Station | OS | Authorized absence |

**Bulk Operations:** Backend must support creating/updating records for entire batch in single transaction.

---

### 3.6 Finance Module
**Core Architecture:** Double-entry ledger system.

| Sub-module | Purpose |
|-----------|---------|
| Payment Methods | Cash, Cheque, Bank Transfer, UPI, Online Gateway |
| Fee Groups | Logical groupings (Tuition, Activity, Transport) |
| Fee Heads | Individual charge items |
| Fee Concessions | Percentage/fixed discounts (scholarships, sibling) |
| Fee Structure | Template defining components + amounts + due dates |
| Ledger Types | Chart of accounts categories |
| Ledgers | Individual financial accounts |
| Transactions | Double-entry records (Payment/Receipt/Transfer/Journal) |
| Receipts | Collection records for misc payments |

**Fee Flow:**
```
Fee Structure (template) → Fee Allocation (per student) → Invoice → Payment → Transaction → Ledger
                                    ↑ Concession applied here
```

**Fee Structure Pattern:**
Supports repeatable **Installments** (Term 1, Q1, etc.) with:
- Due Date + Multiple Fee Head amounts
- Late Fee auto-calculation
- Transport Fee inclusion toggle

**Transaction Patterns:**
- **Category:** Income, Expense, Transfer
- **Double Entry:** Primary Ledger ↔ Secondary Ledger
- **Payment Methods:** Cash, Cheque, DD, Online, Bank Transfer
- **Action:** `Day Closure` button to lock daily records

---

### 3.7 Exam Module
**Hierarchy:** ExamTerm → Exam → ExamSchedule → ExamMark

| Sub-module | Purpose |
|-----------|---------|
| Exam Terms | Semester/term definitions |
| Exams | Individual exam instances |
| Exam Grades | Letter grade schemes (A+, A, B+, etc.) |
| Exam Assessment | Component types (Theory, Practical, Internal) |
| Observation Parameters | Behavioral evaluation (Discipline, Punctuality) |
| Competency Parameters | Skill evaluation (Reading, Logical Thinking) |
| Exam Schedule | Date/time/venue per exam-subject |
| Online Exam | Digital quiz with MCQ/True-False/Essay |
| Exam Form | Student exam registration |
| Admit Card | Printable hall tickets (PDF) |
| Exam Marks | Core marks entry interface |
| Marksheet | Report card generation (PDF) |

**Report Card Composition:**
```
Academic Marks (per subject, per assessment type)
+ Observation Scores (behavioral)
+ Competency Scores (skill-based)  
+ Attendance Summary
+ Teacher Comments
+ Signatures (Class Teacher, Principal, Examiner)
= Comprehensive Report Card (PDF)
```

**Exam Mark Entry Workflow:**
1. Filter: Exam → Batch → Subject
2. Fetch Student List (Table/Form hybrid)
3. Input Marks + Optional Remarks
4. Bulk Save

---

### 3.8 Employee / HR Module

| Sub-module | Purpose |
|-----------|---------|
| Employees | Profile management (mirrors Student structure) |
| Departments | Organizational units |
| Designations | Job titles with hierarchy levels |
| Attendance | Staff presence tracking with check-in/out times |
| Leave | Type definition, allocation, request/approval workflow |
| Payroll | Template-based salary computation, payslip generation |
| Edit Request | Self-service profile updates with approval |

**Employee Details:**
- Full Name, Photo, Employee Code (e.g. ESM001)
- Age (auto-calculated from DOB)
- Designation, Department
- Employment Type (Teaching/Non-Teaching)
- Status (Permanent, Contract, Probation, Part-time)
- Date of Joining → Date of Leaving (Present)

**Payroll Flow:**
```
Salary Template → Assign to Employee → Monthly Processing → Payslip (PDF)
  ├── Earnings (Basic, HRA, DA, TA, Allowances)
  └── Deductions (PF, ESI, TDS, Professional Tax)
```

---

### 3.9 Resource Module
| Entity | Purpose |
|--------|---------|
| Assignment | Homework with submission tracking and grading |
| LessonPlan | Teacher planning (topic, objectives, activities) |
| OnlineClass | Virtual classroom scheduling (Zoom/Meet links) |
| LearningMaterial | Uploadable resources per subject |
| StudentDiary | Daily diary entries |
| Syllabus | Course syllabus management |

---

### 3.10 Transport Module
| Entity | Purpose |
|--------|---------|
| TransportRoute | Routes with ordered stops |
| TransportCircle | Geographic zones for pricing |
| Vehicle | Fleet management with driver assignment |
| TransportFee | Per-circle/route fee definitions |
| StudentTransport | Student-route-stop assignments |

---

### 3.11 Communication Module
Multi-channel messaging with template support.

| Channel | Features |
|---------|----------|
| Announcement | Broadcast to All/Batch/Course targets |
| Email | SMTP integration, templates, attachments |
| SMS | Gateway integration, templates |
| WhatsApp | WhatsApp Business API integration |
| Push | Mobile app push notifications |

**Unified Schema:** All channels use `MessageLog` for delivery tracking and `MessageTemplate` for content management.

---

### 3.12 Other Modules

| Module | Key Entities |
|--------|-------------|
| Library | Book catalog, Issue/Return tracking, fines |
| Calendar | Holidays, Celebrations, Events |
| Inventory | Vendors, Items, Purchase Orders, Stock Movements |
| Store | Point-of-sale for campus store |
| Hostel | Hostel/Room management, student allocation |
| Mess | Menu items, meals, consumption logs |
| Discipline | Behavioral incidents, severity, actions |
| Helpdesk | FAQ knowledge base, support tickets |
| Approval | Configurable multi-step approval workflows |
| Recruitment | Job vacancies, applications |
| Blog/News/Gallery | CMS features |
| Form Builder | Custom survey/feedback forms |
| Asset | Building/infrastructure tracking |
| Site Builder | Page/Menu/Block for institution website |

---

## 4. UI/UX Patterns & Template Systems

### 4.1 Global UI Patterns
- **Card/List Toggle:** Unified data source with grid (card) and table (list) views.
- **Form Actions:** `Reset` | `Keep Adding` (save + reset) | `Cancel` | `Save`.
- **Empty States:** Descriptive guidance with "Add {Entity}" CTA.
- **Filter Sidebar:** Funnel icon opens a contextual filter panel.
- **Kebab Menu (⋮):** Row/Card actions (Edit, View, Delete, Print).

### 4.2 Certificate Template System
- **Engine:** WYSIWYG Editor + Custom CSS field.
- **Placeholders:** `#first_name#`, `#admission_number#`, `#course#`, etc.
- **Dimensions:** mm-based width/height for printable PDF output.
- **Standard Templates:** Character, Experience, Transfer, Bonafide.

### 4.3 ID Card Template System
- **Engine:** Server-side HTML templates (Layout files).
- **Features:** Circular/Rectangular photo, Barcode/QR integration, valid-until logic.
- **Output:** Multi-card layout PDF for bulk printing.

### 4.4 Reporting System
- **Pattern:** Universal `<ReportPage>` component.
- **Export:** One-click Print, Excel (.xlsx), PDF.
- **Filters:** Date ranges, Category, Department/Batch dropdowns.

---

## 5. Complete Data Model

### Core Entities (Tier 1 — Build First)
```prisma
model Tenant {
  id            String   @id @default(uuid())
  name          String
  subdomain     String   @unique
  logo          String?
  settings      Json
  createdAt     DateTime @default(now())
}

model AcademicPeriod {
  id        String   @id @default(uuid())
  tenantId  String
  name      String   // "2026-2027"
  startDate DateTime
  endDate   DateTime
  isDefault Boolean  @default(false)
  isActive  Boolean  @default(true)
}

model Department {
  id          String  @id @default(uuid())
  tenantId    String
  name        String
  code        String?
  description String?
}

model Program {
  id            String @id @default(uuid())
  tenantId      String
  name          String
  code          String?
  departmentId  String
  durationYears Int?
}

model Course {
  id        String @id @default(uuid())
  tenantId  String
  name      String
  code      String?
  programId String
  position  Int    @default(0)
}

model Batch {
  id                    String  @id @default(uuid())
  tenantId              String
  name                  String
  courseId               String
  periodId              String
  maxStrength           Int?
  classTeacherEmployeeId String?
}

model Subject {
  id          String  @id @default(uuid())
  tenantId    String
  name        String
  code        String?
  courseId     String
  subjectType String  // CORE, ELECTIVE, LANGUAGE, LAB
  creditHours Int?
  isElective  Boolean @default(false)
  position    Int     @default(0)
}

model Student {
  id              String   @id @default(uuid())
  tenantId        String
  name            String
  admissionNumber String
  registrationNumber String?
  batchId         String
  periodId        String
  gender          String?
  dob             DateTime?
  bloodGroup      String?
  religion        String?
  nationality     String?
  motherTongue    String?
  birthPlace      String?
  fatherName      String?
  motherName      String?
  house           String?
  studentType     String?  // NEW, OLD, TRANSFER
  photo           String?
  status          String   @default("ACTIVE")
  joinDate        DateTime @default(now())
}

model Guardian {
  id         String  @id @default(uuid())
  tenantId   String
  name       String
  relation   String
  contact    String?
  email      String?
  occupation String?
  address    String?
  photo      String?
}

model StudentGuardian {
  id         String  @id @default(uuid())
  studentId  String
  guardianId String
  isPrimary  Boolean @default(false)
}

model Employee {
  id             String   @id @default(uuid())
  tenantId       String
  name           String
  code           String
  departmentId   String
  designationId  String
  dateOfJoining  DateTime
  employmentType String   // FULL_TIME, PART_TIME, CONTRACT
  gender         String?
  dob            DateTime?
  photo          String?
  status         String   @default("ACTIVE")
}

model User {
  id           String   @id @default(uuid())
  tenantId     String
  email        String
  passwordHash String
  role         String   // SUPER_ADMIN, ADMIN, TEACHER, STUDENT, GUARDIAN
  personId     String?
  personType   String?  // STUDENT, EMPLOYEE, GUARDIAN
  isActive     Boolean  @default(true)
  lastLogin    DateTime?
}
```

### Module Entities (Tier 2 — Build per module)
```prisma
// --- ATTENDANCE ---
model AttendanceRecord {
  id        String   @id @default(uuid())
  tenantId  String
  studentId String
  batchId   String
  date      DateTime
  status    String   // PRESENT, ABSENT, HOLIDAY, HALF_DAY, PREP_LEAVE, LATE, OUT_OF_STATION
  remarks   String?
}

// --- FINANCE ---
model FeeHead {
  id         String @id @default(uuid())
  tenantId   String
  name       String
  feeGroupId String
}

model FeeStructure {
  id       String @id @default(uuid())
  tenantId String
  name     String
  periodId String
}

model FeeComponent {
  id             String   @id @default(uuid())
  feeStructureId String
  feeHeadId      String
  amount         Decimal
  dueDate        DateTime?
  installment    Int?
}

model FeeAllocation {
  id              String  @id @default(uuid())
  tenantId        String
  studentId       String
  feeStructureId  String
  concessionId    String?
  allocatedAmount Decimal
  paidAmount      Decimal @default(0)
  balance         Decimal
}

model Transaction {
  id              String   @id @default(uuid())
  tenantId        String
  date            DateTime
  type            String   // PAYMENT, RECEIPT, TRANSFER, JOURNAL
  amount          Decimal
  debitLedgerId   String
  creditLedgerId  String
  studentId       String?
  description     String?
  referenceNumber String?
  createdBy       String
}

// --- EXAMS ---
model ExamTerm {
  id        String   @id @default(uuid())
  tenantId  String
  name      String
  startDate DateTime
  endDate   DateTime
  periodId  String
}

model Exam {
  id         String @id @default(uuid())
  tenantId   String
  name       String
  examTermId String
  position   Int    @default(0)
}

model ExamSchedule {
  id            String   @id @default(uuid())
  tenantId      String
  examId        String
  subjectId     String
  batchId       String
  date          DateTime
  startTime     String
  endTime       String
  venue         String?
}

model ExamMark {
  id           String  @id @default(uuid())
  tenantId     String
  examId       String
  subjectId    String
  studentId    String
  assessmentId String
  obtainedMark Decimal
  remarks      String?
}

// --- HR ---
model LeaveRequest {
  id          String   @id @default(uuid())
  tenantId    String
  employeeId  String
  leaveTypeId String
  fromDate    DateTime
  toDate      DateTime
  reason      String
  status      String   // PENDING, APPROVED, REJECTED
  approvedBy  String?
}

model Payroll {
  id              String   @id @default(uuid())
  tenantId        String
  employeeId      String
  month           Int
  year            Int
  grossSalary     Decimal
  totalDeductions Decimal
  netSalary       Decimal
  status          String
  processedAt     DateTime?
}
```

---

## 5. Role-Based Access Control

| Role | Scope | Key Permissions |
|------|-------|----------------|
| **Super Admin** | System-wide | Tenant management, system config, all modules |
| **Admin** | Tenant-wide | All modules within their institution |
| **Principal** | Tenant-wide | Read all, approve workflows, reports |
| **Teacher** | Assigned batches | Attendance, marks entry, assignments, lesson plans |
| **Accountant** | Finance module | Fee management, transactions, receipts, reports |
| **Receptionist** | Reception module | Enquiries, visitors, gate passes |
| **Librarian** | Library module | Book management, issue/return |
| **Student** | Own data | View grades, attendance, fees, submit assignments |
| **Guardian** | Linked students | View children's data, pay fees, communicate |

---

## 6. Multi-Tenant Design

### Tenant Isolation Strategy
- **Database:** Shared database with `tenantId` column on every table
- **Middleware:** Extract tenant from subdomain, inject into Prisma context
- **Queries:** All queries automatically filtered by `tenantId`
- **Storage:** S3 paths prefixed with `tenants/{tenantId}/`

### Tenant Configuration
Each tenant can customize:
- Branding (logo, colors, name)
- Enabled modules (feature toggles)
- Academic hierarchy
- Fee structures
- Grading schemes
- Message templates
- Custom fields

---

## 7. Integration Points

| Integration | Protocol | Purpose |
|------------|----------|---------|
| Razorpay/PayU | REST API | Online fee payment |
| SMTP | SMTP | Email delivery |
| SMS Gateway | REST API | Bulk SMS |
| WhatsApp Business | REST API | WhatsApp messaging |
| Zoom/Google Meet | OAuth + REST | Online classes |
| Firebase/OneSignal | REST API | Push notifications |
| Biometric/RFID | TCP/REST | Attendance hardware |
| S3/MinIO | S3 API | File storage |

---

## 8. Implementation Priority

### Phase 1: Foundation (Weeks 1-4)
- [ ] Multi-tenant architecture + auth
- [ ] Academic hierarchy (Department → Program → Course → Batch → Subject)
- [ ] Student CRUD with profile tabs
- [ ] Guardian management
- [ ] Basic dashboard

### Phase 2: Core Operations (Weeks 5-8)
- [ ] Attendance (batch-wise entry + reports)
- [ ] Finance (fee structure, allocation, payment, transactions)
- [ ] Exam (terms, exams, marks entry, report cards)
- [ ] Employee (profiles, departments, designations)

### Phase 3: Extended Features (Weeks 9-12)
- [ ] Communication (announcements, email, SMS)
- [ ] Resource (assignments, lesson plans, online classes)
- [ ] HR (leave management, payroll)
- [ ] Timetable

### Phase 4: Support Modules (Weeks 13-16)
- [ ] Reception (enquiry, visitor log, gate pass)
- [ ] Transport (routes, vehicles, allocation)
- [ ] Library (catalog, issue/return)
- [ ] Inventory & Store
- [ ] Calendar & Events

### Phase 5: Advanced (Weeks 17-20)
- [ ] Online exams with question bank
- [ ] Hostel & Mess management
- [ ] Approval workflows
- [ ] Template Systems (Certificates, ID Cards)
- [ ] Advanced Reporting Suite
- [ ] Helpdesk & Discipline
- [ ] Recruitment
- [ ] Custom fields
- [ ] Form builder
- [ ] Blog/News/Gallery/Site builder

---

## 9. System Constants & Code Patterns

| Entity | Code Pattern | Example |
|--------|--------------|---------|
| Student | {PREFIX}ADM{NNN} | MINTADM041 |
| Employee | {PREFIX}ESM{NNN} | ESM001 |
| Receipt | REC-{YYYY}-{NNN} | REC-2026-001 |
| Registration | REG-{YYYY}-{NNN} | REG-2026-542 |

---

## Module Count Summary

| Category | Count |
|----------|-------|
| Core Modules | 8 (Dashboard, Reception, Academic, Student, Finance, Exam, Employee, Resource) |
| Secondary Modules | 10 (Transport, Calendar, Inventory, Store, Communication, Library, Approval, Task, Helpdesk, Discipline) |
| Supplementary | 10 (Gallery, Guardian, Contact, Mess, Activity, Hostel, Form, Asset, Site, Blog/News) |
| System | 4 (User, Custom Field, Utility, Config) |
| **Total** | **~34 modules** |
| **Database Models** | **~70+ tables** |
| **User Roles** | **9 roles** |

---

*This specification provides feature parity with InstiKit v5.6. Implementation should follow the phased approach above, building foundational entities first and layering modules progressively.*
