# Omni ERP — Deep System Architecture (InstiKit+ Level)

> **Core Philosophy**: Building an ERP is not about building isolated "modules". It is about building "Systems of Systems" connected by true **Workflow Chains**. The UI layers only expose the underlying Operating Systems.

## 1. Core Modules (UI Layer)
- Students 
- Admissions 
- Academics 
- Attendance 
- Exams 
- Fees 
- HR 
- Transport 
- Library 
- Communication 
- Reports 
- Settings 

## 2. ERP Sub-Systems (The Missing Layers)

These represent the actual interconnected system engines.

### A. 🎯 Student Lifecycle System (CRITICAL)
**Micro Modules:**
1. **Admission Funnel Engine**: Enquiry Capture, Lead Scoring, Follow-up Tracker, Admission Form Builder, Document Verification, Admission Approval Queue.
2. **Registration System**: Student Registration ID generator, Roll Number Engine, Class Allocation Rules, Section Allocation Rules.
3. **Academic Mapping Engine**: Subject Allocation per student, Elective selection system, Skill mapping (CBSE competency tagging).
4. **Student Profile Hub**: Personal Info, Academic History, Attendance Graph, Fee Ledger, Exam History, Discipline Records, Health Records, Documents, Transport Mapping, Parent Interaction Log.
5. **Lifecycle Transitions**: Promote Student, Transfer Student, Alumni Conversion, Dropout Tracking.

### B. 🏫 Academic Operating System
**Micro Modules:**
1. **Academic Structure Builder**: Department, Program, Course, Batch, Division, Section.
2. **Timetable Engine**: Period generator, Teacher allocation rules, Subject clash detection, Substitute teacher system, Weekly rotation scheduler.
3. **Lesson System**: Lesson Plan builder, Topic tracker, Completion status, Teacher notes.
4. **Curriculum System**: Syllabus mapping, Chapter tracking, CBSE/NEP alignment tagging.

### C. 💰 Finance Operating System (ERP CORE)
**Micro Modules:**
1. **Fee Structure Engine**: Fee Group, Fee Head, Fee Category, Installment planner.
2. **Ledger System**: Student ledger, School ledger, Transaction ledger, Adjustment entries.
3. **Payment System**: Cash, Online, Cheque, Partial payments, Refund system.
4. **Financial Intelligence**: Defaulter prediction, Fee overdue alerts, Revenue analytics.
5. **Receipt Engine**: Auto receipt generator, Receipt reprint system, Receipt audit trail.

### D. 🧾 Exam & Assessment System
**Micro Modules:**
1. **Exam Structure Builder**: Term system, Exam type, Weightage config.
2. **Assessment Engine**: Scholastic marks, Co-scholastic grading, Skill-based scoring.
3. **Exam Scheduling**: Timetable generator, Room allocation, Invigilator assignment.
4. **Result Engine**: Mark entry bulk system, Grade calculator, CBSE report generator.
5. **Online Exam System (Future)**: MCQ builder, Auto evaluation, Timer system.

### E. 👨‍🏫 HR Operating System
**Micro Modules:**
1. **Employee Lifecycle**: Hiring, Role assignment, Department mapping, Exit management.
2. **Attendance Engine**: Biometric integration, Manual attendance, Leave balance system.
3. **Payroll Engine**: Salary structure builder, PF / ESI logic, Slip generator.
4. **HR Workflow System**: Leave approval, Salary approval, Role change request.

### F. 📢 Communication Operating System
**Micro Modules:** Announcement engine, SMS gateway, WhatsApp automation, Email engine, Push notification system.
**Workflow Example**: Fee overdue → Trigger → Parents → WhatsApp → Success log.

### G. 🛡️ Safety & Discipline System
**Micro Modules:** Visitor entry system, Gate pass OTP, Incident reporting, Complaint system, Discipline tracking.

### H. 📚 Learning Management System (LMS)
**Micro Modules:** Digital syllabus, Assignment system, Upload/download center, Video lectures, Homework tracking, Student submission system.

### I. 📊 Approval Engine (Enterprise Gap)
**Micro Modules:** Request builder, Multi-level approvals, Status tracking, Role-based approval routing.
*(Used in fees discount, leave, admission, transfers).*

---

## 3. Micro Modules (System-Wide Engines)
These engines are reusable across the entire ERP:
1. **Notification Engine**: Event-based triggers, templates, logs.
2. **Audit Engine**: Tracking every change, before/after values.
3. **File & Document Engine**: Uploads, storage mapping, versioning.
4. **Workflow Engine**: Rule-based flows, status transitions.
5. **Report Engine**: PDF generator, Excel export, analytics builder.

---

## 4. Real ERP Workflow Chains (The Heart of the System)
1. **🎓 Student Flow**: Enquiry → Admission → Registration → Roll No → Fee Allocation → Attendance → Exams → Report Card → Promotion → Alumni
2. **💰 Fee Flow**: Structure → Assignment → Invoice → Payment → Ledger Update → Receipt → Audit → Report
3. **📚 Exam Flow**: Exam Setup → Timetable → Marks Entry → Calculation → Grade → Report Card → Publish → Archive
4. **🧑‍🏫 HR Flow**: Hire → Assign Role → Attendance → Leave → Payroll → Exit → Archive
5. **📢 Communication Flow**: Event Trigger → Rule Engine → Target Group → Channel → Delivery → Log → Report

---

## Phase Order Strategy

### 🔴 Phase 1 (Critical Gap Closure)
1. Student Lifecycle System
2. Fee Ledger System
3. Academic Structure Builder
4. Approval Engine
5. Reception CRM

### 🟠 Phase 2 (ERP Completeness)
1. LMS
2. Inventory
3. Helpdesk
4. Communication Automation

### 🟢 Phase 3 (Market Dominance)
1. AI Analytics
2. Mobile App
3. Online Exams
4. Smart Timetable Generator
