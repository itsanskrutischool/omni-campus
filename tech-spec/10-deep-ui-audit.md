# InstiKit ERP v5.6 — Deep UI Audit: Forms, Buttons, Reports & Templates

> **Audit Date:** May 2026  
> **Source:** Live demo at `demo.instikit.com` (Admin/Principal login)  
> **Purpose:** Exact field-level blueprint for Omni Campus feature parity

---

## 1. GLOBAL UI PATTERNS

### 1.1 List Page Pattern (Shared by ALL modules)

Every CRUD list page follows this exact layout:

| Element | Position | Details |
|---------|----------|---------|
| **Breadcrumb** | Top-left | `Dashboard > Module > Sub-module` |
| **Page Title** | Below breadcrumb | Module name (e.g., "Students") |
| **Action Buttons** | Top-right | `More ▼`, `Add {Entity}` |
| **Toolbar Icons** | Right of buttons | Filter (funnel), Settings (gear), List View (lines), Card View (grid), Kebab Menu (⋮) |
| **Content Area** | Center | Cards or table rows |
| **Pagination** | Bottom | `Showing 1 to 12 of N results` + `< 1 2 ... N >` |
| **Per-Page Selector** | Bottom-right | `10 per page ˅` dropdown |

### 1.2 Card View Pattern

Each entity card shows:
- **Avatar** (circular, left)
- **Name + Code** (e.g., "Aastha Jacob (MINTADM041)") with external link icon ↗
- **Primary Detail** (e.g., "Grade I Batch I")
- **Secondary Detail** (e.g., parent name)
- **Tertiary Detail** (e.g., phone number)

### 1.3 Form Page Pattern

Every create/edit form follows:
- **Page Title**: `Add {Entity}` 
- **List Button**: Top-right → `List all {Entity}`
- **Radio Toggle**: `New {Entity}` / `Existing {Entity}` (for linked entities)
- **Form Layout**: 2–3 column responsive grid
- **Action Row**: `Reset` | `☐ Keep Adding` | `Cancel` (red) | `Save` (blue)

### 1.4 Empty State Pattern

When no data exists:
- Centered icon (list icon)
- Title: `List all {Entity}`
- Description: `{Entity} are the records of... For example, ...`
- CTA Button: `Add {Entity}`

---

## 2. COMPLETE SIDEBAR NAVIGATION MAP

### Tier 1 Modules (Top-Level)
```
📊 Dashboard
📧 Reception          → Enquiry, Visitor Log, Call Log, Postal, Complaint
🎓 Academic           → Department, Program, Session, Period, Division, Course, 
                         Batch, Subject, Class Timing, Timetable, Book list,
                         Certificate, ID Card
👨‍🎓 Student            → Students, Registration, Roll Number, Health Record,
                         Elective Subject, Attendance, Fee Allocation,
                         Service Allocation, Promotion, Edit Request,
                         Service Request, Leave Request, Transfer Request,
                         Transfer, Alumni, Report
💰 Finance            → Payment Method, Fee Group, Fee Head, Fee Concession,
                         Fee Structure, Ledger Type, Ledger, Transaction,
                         Receipt, Report
📝 Exam               → Exam, Schedule, Observation, Assessment, Grade,
                         Exam Mark, Marksheet, Report
👔 Employee           → Employees, Department, Designation, Attendance,
                         Leave, Payroll, Edit Request
📁 Resource           → (file/document management)
🚌 Transport          → Vehicle, Route, Stop, Assignment
📅 Calendar           → Academic Calendar, Events
📦 Inventory          → Stock, Item Category, Item
🏪 Store              → Online Store items
📢 Communication      → Announcement, Notice, SMS, Email, WhatsApp
📚 Library            → Book, Issue, Return
✅ Approval           → Workflows
📋 Task               → Task management
🎧 Helpdesk           → Ticket management
⚖️ Discipline         → Incident, Action
🖼️ Gallery            → Photo albums
👨‍👩‍👧 Guardian           → Parent/guardian profiles
📞 Contact            → Address book
🍽️ Mess               → Mess/canteen management
🏃 Activity           → Extracurricular activities
🏨 Hostel             → Room, Floor, Block allocation
📄 Form               → Custom form builder
🔧 Asset              → Asset tracking
🌐 Site               → Website builder
📝 Blog               → Blog posts
```

---

## 3. FORM FIELD SPECIFICATIONS

### 3.1 Student Registration Form

**URL:** `/app/student/registrations/create`

| Section | Field | Type | Required | Options/Notes |
|---------|-------|------|----------|---------------|
| **Registration** | Period | Select | ✅ | Academic periods |
| | Course | Select | ✅ | Filtered by period |
| | Application Number | Text | ❌ | Auto-generated |
| | Enrollment Type | Select | ✅ | New Admission, Transfer, Re-Admission |
| | Date of Registration | Date picker | ✅ | Default: today |
| **Student** | Student Type | Radio | ✅ | `New Student` / `Existing Student` |
| | First Name | Text | ✅ | |
| | Last Name | Text | ❌ | |
| | Gender | Radio | ✅ | `Male` / `Female` / `Other` |
| | Birth Date | Date picker | ❌ | |
| | Contact Number | Text (phone) | ❌ | Validated format |
| | Previous Institute | Text | ❌ | |
| **Guardian** | Guardian Type | Radio | ✅ | `New Guardian` / `Existing Guardian` |
| | Guardian Name | Text | ✅ | |
| | Contact | Text (phone) | ✅ | |
| | Relation | Select | ✅ | Father, Mother, Brother, Sister, Uncle, Aunt, Grandfather, Grandmother, Other |

**Buttons:** `Reset` | `☐ Keep Adding` | `Cancel` | `Save`

### 3.2 Add Employee Form

**URL:** `/app/employees/create`

| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| Employee Type | Radio | ✅ | `New Employee` / `Existing Employee` |
| First Name | Text | ✅ | |
| Last Name | Text | ❌ | |
| Gender | Radio | ✅ | `Male` / `Female` / `Other` |
| Birth Date | Date picker | ❌ | |
| Contact Number | Text (phone) | ❌ | |
| Email | Text (email) | ❌ | Required if "Create User Account" is ON |
| Employee Code | Text | Auto | Auto-generated (e.g., ESM017) |
| Date of Joining | Date picker | ✅ | |
| Select Type | Select | ❌ | Teaching, Non-Teaching |
| Select Employment Status | Select | ✅ | Permanent, Contract, Probation, Part-time |
| Select Department | Select | ✅ | Linked to Academic departments |
| Select Designation | Select | ✅ | e.g., PGT, TGT, PRT, Helper, Driver, Manager |
| Create User Account | Toggle/Switch | ❌ | Warning: "Email is required to create account" |

**Buttons:** `Reset` | `☐ Keep Adding` | `Cancel` | `Save`  
**Alt Button:** `List all Employee` (top-right)

### 3.3 Fee Structure Form

**URL:** `/app/finance/fee-structures/create`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | Text | ✅ | e.g., "Annual Fee 2026-27" |
| Description | Textarea | ❌ | |
| **Installments** (Repeatable Section) | | | |
| → Title | Text | ✅ | e.g., "Term 1", "Q1" |
| → Due Date | Date picker | ✅ | |
| → Fee Heads | Number/Currency | ✅ | Multiple fee head amount inputs |
| → Include Transport Fee | Checkbox | ❌ | |
| → Apply Late Fee | Checkbox | ❌ | |

**Buttons:** `Add Fee Installment` (adds repeatable row) | `Save`

### 3.4 Transaction Form

**URL:** `/app/finance/transactions/create`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Transaction Category | Select | ✅ | Income, Expense |
| Ledger | Select | ✅ | Primary account |
| Date | Date picker | ✅ | |
| Secondary Ledger | Select | ✅ | Counter-entry account |
| Amount | Number/Currency | ✅ | |
| Payment Method | Select | ✅ | Cash, Cheque, DD, Online, Bank Transfer |
| Description | Textarea | ❌ | |
| Remarks | Textarea | ❌ | |
| Attachment | File upload | ❌ | Voucher/receipt scan |

**Header Buttons:** `Day Closure` | `Add Transaction`

### 3.5 Receipt Form

**URL:** `/app/finance/receipts/create`

Similar to Transaction but specifically for non-student income (Donations, Canteen Revenue, Miscellaneous).

---

## 4. EXAM & MARKS SYSTEM

### 4.1 Exam Mark Entry Interface

**URL:** `/app/exam/mark`

**Workflow:**
1. Select filters: **Exam** (Select) → **Batch** (Select) → **Subject** (Select)
2. Click `Fetch` / `Search`
3. Student list appears as a **table/form hybrid**:

| Column | Type | Notes |
|--------|------|-------|
| Student Name | Display | Read-only |
| Admission No. | Display | Read-only |
| Marks Obtained | Number input | Validated against max marks from grading system |
| Remarks | Text input | Optional per-student |

**Buttons:** `Save Marks` | `Reset`

### 4.2 Marksheet Generation

**URL:** `/app/exam/marksheet`

**Filters:**
| Filter | Type | Notes |
|--------|------|-------|
| Term | Select | Term 1, Term 2, Annual |
| Course | Select | Grade/Class |
| Batch | Select | Section A, B, C |
| Exam | Select | Specific exam |
| Marksheet Template | Select | Pre-defined layout templates |

**Capabilities:**
- Bulk PDF generation for entire batch
- Individual marksheet download
- Template-driven layout (header, student info, subject-wise marks, grades, remarks)
- Print button for batch printing

### 4.3 Grade System

**Configuration Fields:**
| Field | Type | Notes |
|-------|------|-------|
| Grade Name | Text | A+, A, B+, B, etc. |
| Min Percentage | Number | Lower bound |
| Max Percentage | Number | Upper bound |
| Grade Point | Number | GPA value |
| Description | Text | "Outstanding", "Very Good", etc. |

---

## 5. TEMPLATE SYSTEMS

### 5.1 Certificate Template System

**URL:** `/app/academic/certificate-templates/create`

**Pre-built Templates (3 defaults):**
| Name | For | Type |
|------|-----|------|
| Character Certificate | Student | Other |
| Experience Certificate | Employee | Other |
| Transfer Certificate | Student | Transfer Certificate |

**Template Creation Form:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | Text | ✅ | Template name |
| Type | Select | ✅ | e.g., Character, Transfer, Bonafide, Custom |
| For | Select | ✅ | `Student` / `Employee` |
| Width (mm) | Number | ✅ | Page dimensions |
| Height (mm) | Number | ✅ | Page dimensions |
| Body | WYSIWYG Editor | ✅ | Rich text with merge fields |
| Custom CSS | Textarea (code) | ❌ | Override styles |

**Merge Fields (Placeholders):**
```
Student: #first_name#, #last_name#, #admission_number#, #course#, 
         #batch#, #father_name#, #mother_name#, #birth_date#,
         #gender#, #contact_number#, #address#, #photo#
Employee: #first_name#, #last_name#, #employee_code#, #department#,
          #designation#, #date_of_joining#, #date_of_leaving#
Institute: #institute_name#, #institute_logo#, #institute_address#,
           #institute_phone#, #institute_email#
Date: #current_date#, #current_year#
```

**Generation Workflow:**
1. Go to Certificate page
2. Select student(s) or employee(s)
3. Choose template
4. Click `Generate` → Opens PDF preview
5. `Download PDF` or `Print`

### 5.2 ID Card Template System

**URL:** `/app/academic/id-card-templates`

**Template Form:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | Text | ✅ | Template name |
| For | Select | ✅ | `Student` / `Employee` |
| Custom Template File Name | Text | ❌ | Server-side file reference |

**Note:** Unlike certificates, ID cards use **server-side file templates** (not a WYSIWYG editor). The layout is pre-defined in template files with merge fields for data injection.

**ID Card Elements:**
- Photo (circular/rectangular)
- Name, Code/Admission No.
- Course/Batch or Department/Designation
- Blood Group, Contact Number
- Barcode/QR Code
- Institute Logo, Address
- Valid Until date

### 5.3 Marksheet Template System

Marksheet templates control the PDF layout for exam results:
- **Header:** Institute name, logo, address, exam title
- **Student Info:** Name, admission no., class/section, roll no.
- **Subject Table:** Subject name, max marks, marks obtained, grade, remarks
- **Footer:** Total, percentage, result (Pass/Fail), rank
- **Signatures:** Class teacher, Principal, Examiner

---

## 6. REPORT SPECIFICATIONS

### 6.1 Student Reports

**URL:** `/app/student/report`

| Report Name | Description | Filters |
|-------------|-------------|---------|
| Date-wise Attendance Report | Attendance for a specific date range | Date From, Date To, Course, Batch |
| Batch-wise Attendance Report | Summary by batch/section | Course, Batch, Month |
| Subject-wise Attendance Report | Attendance per subject | Course, Batch, Subject |
| Subject-wise Student Report | Students enrolled per subject | Course, Batch, Subject |
| Daily Access Report | Gate access logs for students/guardians | Date, Course, Batch |

**Export Options:** Print, Excel (.xlsx), PDF

### 6.2 Finance Reports

**URL:** `/app/finance/report`

| Report Name | Description | Filters |
|-------------|-------------|---------|
| Payment Method Report | Collections by payment method | Date Range, Method |
| Fee Group Report | Collections by fee group | Period, Fee Group |
| Fee Head Report | Revenue per fee head | Period, Fee Head |
| Fee Concession Report | Concessions/discounts applied | Period, Course, Batch |
| Ledger Report | Account-wise transaction log | Date Range, Ledger |
| Transaction Report | All financial transactions | Date Range, Category |
| Receipt Report | Non-student receipts | Date Range, Type |

**Export Options:** Print, Excel (.xlsx), PDF

### 6.3 Exam Reports

| Report Name | Description |
|-------------|-------------|
| Exam-wise Result | Pass/fail stats per exam |
| Subject-wise Result | Performance per subject |
| Topper List | Rank-wise student list |
| Grade Distribution | Grade-wise count charts |

---

## 7. ACTION BUTTONS INVENTORY

### 7.1 Student Module Buttons

| Context | Button Text | Action |
|---------|-------------|--------|
| Student List | `More ▼` | Dropdown: Documents, Accounts, Qualifications, Bulk Edit |
| Student List | Filter (funnel icon) | Opens filter sidebar |
| Student List | Settings (gear icon) | Column visibility toggle |
| Student List | List/Card toggle | Switch between views |
| Student Card | ↗ icon | View student detail page |
| Student Detail | `Edit` | Edit student info |
| Student Detail | `Delete` | Soft delete with confirmation |
| Student Detail | `Print` | Print student profile |
| Registration | `Add Registration` | Open registration form |

### 7.2 Finance Module Buttons

| Context | Button Text | Action |
|---------|-------------|--------|
| Transaction List | `Day Closure` | Close daily books |
| Transaction List | `Add Transaction` | Open transaction form |
| Receipt List | `Add Receipt` | Open receipt form |
| Fee Allocation | `Allocate Fee` | Assign fee structure to students |
| Fee Collection | `Collect Fee` | Record student payment |
| Fee Collection | `Print Receipt` | Generate fee receipt PDF |

### 7.3 Exam Module Buttons

| Context | Button Text | Action |
|---------|-------------|--------|
| Exam List | `Add Exam` | Create exam definition |
| Mark Entry | `Save Marks` | Bulk-save entered marks |
| Marksheet | `Generate` | Create PDF marksheets |
| Marksheet | `Download PDF` | Batch download |
| Marksheet | `Print` | Batch print |

### 7.4 Employee Module Buttons

| Context | Button Text | Action |
|---------|-------------|--------|
| Employee List | `More ▼` | Bulk operations |
| Employee List | `Add Employee` | Open employee form |
| Payroll | `Generate Payroll` | Monthly payroll generation |
| Payroll | `Print Payslip` | Individual payslip PDF |
| Leave | `Approve` / `Reject` | Leave request actions |

---

## 8. STUDENT LIST — COMPLETE CARD DATA FIELDS

From the verified screenshot (168 students):

| Field | Example | Notes |
|-------|---------|-------|
| Photo | Avatar (circular) | Default avatar if not uploaded |
| Full Name | "Aastha Jacob" | Clickable → detail view |
| Admission Code | "(MINTADM041)" | Auto-generated, unique |
| External Link | ↗ icon | Opens in new tab |
| Course + Batch | "Grade I Batch I" | Academic placement |
| Parent Name | "Ankita Jacob" | Primary guardian |
| Phone | "07571631782" | Contact number |

**Card Interaction:** Click name → Student Detail Page  
**Pagination:** 12 per page, 14 pages total

---

## 9. EMPLOYEE LIST — COMPLETE CARD DATA FIELDS

From the verified screenshot (18 employees):

| Field | Example | Notes |
|-------|---------|-------|
| Photo | Avatar (circular) | Default avatar if not uploaded |
| Full Name | "Radhika Oommen" | Clickable → detail view |
| Employee Code | "(ESM001)" | Auto-generated |
| External Link | ↗ icon | |
| Age | "46 Year Old" | Calculated from DOB |
| Designation | "Administrator" | From designation master |
| Date Range | "February 6, 2023 - Present" | Joining → Leaving dates |

**Employee Sidebar Sub-modules:**
- Employees
- Department
- Designation
- Attendance
- Leave
- Payroll
- Edit Request

---

## 10. ATTENDANCE SYSTEM

### 10.1 Student Attendance Entry

**Workflow:**
1. Select **Course** (dropdown)
2. Select **Batch** (dropdown)
3. Select **Date** (date picker)
4. Click `Fetch` → Student list loads

**Per-Student Fields:**

| Field | Type | Options |
|-------|------|---------|
| Student Name | Display | Read-only |
| Status | Radio Group | `Present` / `Absent` / `Late` / `Half Day` |
| Remark | Text | Optional note |

**Bulk Actions:** 
- `Mark All Present` button
- `Mark All Absent` button
- `Save Attendance` button

### 10.2 Employee Attendance

Similar interface filtered by Department instead of Course/Batch.

---

## 11. FEE COLLECTION WORKFLOW

### 11.1 Student Fee Collection

**Complete Workflow:**
1. Navigate to Finance → Fee Allocation → select student
2. System shows fee breakdown by installment:

| Column | Type |
|--------|------|
| Installment Title | Display |
| Due Date | Display |
| Fee Heads (breakdown) | Display |
| Amount Due | Display (calculated) |
| Amount Paid | Display |
| Balance | Display (calculated) |
| Concession | Display |
| Late Fee | Display (auto-calculated) |

3. Click `Collect Fee` → Payment form:

| Field | Type | Notes |
|-------|------|-------|
| Amount | Number | Can be partial payment |
| Payment Method | Select | Cash, Cheque, DD, Online Transfer, UPI |
| Payment Reference | Text | Cheque no., transaction ID |
| Date | Date | Default: today |
| Remarks | Textarea | |

4. On Save → **Fee Receipt** generated with:
   - Receipt Number (auto-generated)
   - Student Name, Admission No.
   - Fee breakdown by head
   - Amount paid, balance
   - Payment method details
   - Institute header + footer
   - **Print Receipt** button

---

## 12. ONLINE REGISTRATION (PUBLIC FORM)

**URL:** Public-facing (linked from institute website)

**Form Sections:**
1. **Personal Information**
   - First Name, Last Name, Gender, Date of Birth
   - Nationality, Religion, Category, Blood Group
   - Aadhaar Number, Birth Certificate Number
2. **Contact Information**
   - Phone, Email, Address (Street, City, State, Pin Code)
3. **Academic Information**
   - Applying for Course/Grade, Previous School, Last Grade Attended
   - Percentage/GPA, Board
4. **Guardian Information**
   - Father's Name, Occupation, Phone, Email
   - Mother's Name, Occupation, Phone, Email
   - Emergency Contact
5. **Documents Upload**
   - Photo (image upload)
   - Birth Certificate (file upload)
   - Previous School Records (file upload)
   - Transfer Certificate (file upload)
6. **Declaration**
   - Checkbox: Agreement to terms
   - Submit button

---

## 13. SIDEBAR CONFIGURATION / SETTINGS

### Institute Settings (Gear icon → top-right)

- **General:** Institute Name, Logo, Address, Phone, Email, Website
- **Academic:** Default Period, Grading System, Attendance Type
- **Finance:** Currency, Tax Settings, Invoice Prefix
- **Communication:** SMS Gateway Config, Email SMTP, WhatsApp API
- **Locale:** Date Format, Timezone, Language
- **Roles & Permissions:** RBAC matrix per module

---

## 14. DATA TABLE PATTERN (Universal)

When in **List View** (not Card View), tables follow:

| Feature | Implementation |
|---------|---------------|
| Column Headers | Sortable (↕ icon) |
| Column Width | Resizable |
| Column Visibility | Configurable via Settings (gear) |
| Row Selection | Checkbox (for bulk actions) |
| Row Actions | Kebab menu (⋮) → Edit, Delete, View |
| Search | Global text search in header |
| Filters | Sidebar panel with dropdowns and date ranges |
| Export | Print, Excel, PDF (from kebab menu) |
| Pagination | Bottom: count + page numbers |

---

## 15. PRINT / EXPORT CAPABILITIES

| Module | What's Printable | Format |
|--------|-----------------|--------|
| Students | Student Profile, Fee Receipt, ID Card | PDF |
| Finance | Fee Receipt, Transaction Voucher, Ledger Report | PDF, Excel |
| Exam | Marksheet, Report Card, Hall Ticket | PDF |
| Certificate | Character, Transfer, Bonafide, Experience | PDF |
| ID Card | Student ID, Employee ID | PDF (card layout) |
| Attendance | Daily Report, Monthly Summary | PDF, Excel |
| Employee | Employee Profile, Payslip, Experience Letter | PDF |
| Library | Book Issue Slip, Fine Receipt | PDF |
| Transport | Route List, Assignment List | PDF, Excel |
| Reports | All report types | PDF, Excel, Print |

---

## 16. KEY DESIGN DECISIONS FOR OMNI CAMPUS

Based on this deep audit:

### 16.1 Form System
- Use **React Hook Form** + **Zod** for validation
- Implement `New/Existing` radio toggle pattern as a reusable component
- `Keep Adding` checkbox = form reset on save without navigation
- All select fields use async search (linked to API endpoints)

### 16.2 Template Engine
- Use **Puppeteer** for server-side PDF generation
- Certificate/Marksheet templates: HTML+CSS with Handlebars merge fields
- ID Card templates: Pre-built layouts with data injection
- Store templates as HTML in database with CSS field

### 16.3 Report Engine
- Build a generic `<ReportPage>` component with:
  - Filter sidebar (configurable per report)
  - Data table with sorting/pagination
  - Export toolbar (Print, Excel via SheetJS, PDF via Puppeteer)
- All reports share the same API pattern: `GET /api/reports/{type}?filters`

### 16.4 List/Card View
- Default: **Card View** for entity lists (Student, Employee)
- Toggle: Switch to **Table View** for data-heavy lists
- Both views share the same data source and pagination

### 16.5 Code Auto-Generation
- Student: `MINTADM{NNN}` → Configurable prefix per institute
- Employee: `ESM{NNN}` → Configurable prefix
- Receipt: `REC-{YYYY}-{NNN}`
- All codes: Sequential, padded, institute-scoped

---

*End of Deep UI Audit — v1.0*
