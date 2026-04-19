# OmniCampus ERP - API Documentation

This document provides a technical overview of the RESTful API endpoints available in the OmniCampus ERP system.

## Authentication & Multi-Tenancy
All administrative and academic routes are protected and tenant-scoped.
- **Base Headers**: `Cookie` (NextAuth session).
- **Tenant Isolation**: Most routes automatically resolve `tenantId` from the authenticated session.

---

## 1. Academic & Student Modules

### `GET /api/attendance`
Retrieves attendance records for a classroom/section.
- **Params**: `classRoomId`, `sectionId`, `date`.
- **Response**: List of student attendance statuses.

### `POST /api/attendance`
Bulk entry for attendance.
- **Body**: `{ date: string, attendance: Array<{ studentId: string, status: 'PRESENT'|'ABSENT'|'LATE' }> }`.

---

## 2. Examinations & Grading

### `POST /api/exams`
Creates a new examination schedule.
- **Body**: `{ name: string, type: string, term: number, startDate: Date, endDate: Date }`.

### `POST /api/exams/marks`
Entry of marks for students.
- **Body**: `{ examId: string, subjectId: string, marks: Array<{ studentId: string, marksObtained: number }> }`.

---

## 3. Financial Systems

### `GET /api/fees`
Retrieves fee status for a student or classroom.
- **Params**: `studentId` (optional), `classRoomId` (optional).

### `POST /api/fees/collect`
Records a fee payment at the Point-of-Sale.
- **Body**: `{ studentId: string, feeRecordId: string, amount: number, method: string }`.

---

## 4. School Operations

### `POST /api/leave`
Submits a staff leave request.
- **Body**: `{ from: Date, to: Date, reason: string }`.

### `PATCH /api/leave`
Admin approval/rejection of leaves.
- **Body**: `{ leaveId: string, status: 'APPROVED'|'REJECTED' }`.

### `POST /api/notice`
Publishes a notice to the communication board.
- **Body**: `{ title: string, body: string, audience: string }`.

---

## 5. Data Utilities

### `GET /api/utilities/export`
Generates a CSV snapshot of system data.
- **Params**: `type` ('students' | 'staff' | 'ledger').
- **Response**: CSV File download.

### `POST /api/utilities/import`
Bulk ingests data via CSV.
- **Body**: `FormData` containing the CSV file.
- **Validation**: Schema-safe upsert logic for classes/subjects.

---

## Design Principles
- **Schema Safety**: Driven by Zod and Prisma.
- **Performance**: Heavy relational queries (Exports) are optimized via service-layer mapping.
- **Glass-UI Support**: All API responses provide metadata suitable for the premium glassmorphism animations.
