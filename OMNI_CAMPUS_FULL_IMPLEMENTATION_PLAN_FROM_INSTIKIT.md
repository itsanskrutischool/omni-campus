# Omni Campus Final One-Go Master Implementation Plan

## Final File Notice

This is the single authoritative implementation file for Omni Campus.

- Primary source reference: `C:\Users\admin\Downloads\iconify - Copy\instikit_master_spec.json`
- Use only this document for execution planning and delivery.
- This file supersedes all other planning/spec markdown files in the repo.

---

# Omni Campus Full Implementation Plan (Derived from `instikit_master_spec.json`)

## 1. Objective and Scope

Build Omni Campus as a production-grade, multi-role campus ERP using the observed InstiKit reference behavior and configuration model, while improving architecture consistency, security, and maintainability.

Reference baseline used:

- Source: `C:\Users\admin\Downloads\iconify - Copy\instikit_master_spec.json`
- Base app observed: `https://demo.instikit.com`
- Version observed: `5.6.0`
- Coverage observed: `1664` routes, `589` audited pages, `55` route modules
- Roles observed: `Admin`, `Staff`, `Student`, `Guardian`
- Phase 2 parameterized data: `729` parameterized routes, `8` concrete deep routes

---

## 2. Program Principles (Non-Negotiable)

1. Tenant-safe and role-safe by default (deny-by-default).
2. API contracts first, then UI implementation.
3. Configuration-driven modules and numbering patterns.
4. Every module ships with test evidence (unit + integration + E2E).
5. Delivery by waves with strict acceptance gates.

---

## 3. Architecture Blueprint

## 3.1 Application Layers

- Presentation layer: role-specific dashboards and module UIs
- API layer: versioned REST endpoints `/api/v1/...`
- Domain services layer: business logic isolated from controllers
- Data layer: normalized relational schema + audit logs
- Integration layer: payment gateways, notification adapters, file storage

## 3.2 Identity, Session, and Access

- Session-based auth with refresh strategy and secure cookie policies
- Central current-user endpoint (canonicalize around one endpoint; avoid drift like observed `/api/v1/auth/me` 404)
- RBAC matrix per module and action (`view`, `create`, `update`, `delete`, `approve`, `export`)
- Optional row-scope rules (self/team/organization)

## 3.3 Configuration System

Create a config service with these groups:

- `system`, `auth`, `feature`, `notification`, `general`, `assets`
- module config groups matching source (`student`, `employee`, `finance`, `reception`, `exam`, `resource`, `transport`, `library`, `approval`, `task`, `helpdesk`, etc.)

Include:

- Runtime cache and cache invalidation
- Config versioning and rollback
- Config change audit logs

---

## 4. Data Model Implementation Plan

Implement entities by dependency order.

## 4.1 Foundation Entities

- `organization`
- `team` (school)
- `period` (session/year)
- `user`
- `role`
- `permission`
- `user_scope`
- `activity_log`

## 4.2 Academic Core

- `course`
- `section`
- `batch`
- `subject`
- `timetable`
- `class_teacher_mapping`

## 4.3 Student Domain

- `student_profile`
- `guardian_profile`
- `student_guardian_link`
- `admission_record`
- `student_attendance`
- `student_service_request`
- `student_document`

Numbering contracts to implement from source:

- registration: prefix `SM`, digits `3`
- admission: prefix `SM`, digits `3`
- transfer request: prefix `TR`, digits `3`
- transfer: prefix `T`, digits `3`
- service request: prefix `SR`, digits `3`
- provisional admission (if enabled): prefix `PSM`, digits `3`

## 4.4 Employee Domain

- `employee_profile`
- `employee_attendance`
- `employee_timesheet`
- `leave_application`
- `payroll_record`
- `salary_components`

Numbering contracts:

- employee code: prefix `ESM`, digits `3`
- payroll number: prefix `PSM`, digits `3`

## 4.5 Finance Domain

- `fee_head`
- `fee_structure`
- `fee_allocation`
- `fee_installment`
- `fee_payment`
- `fee_receipt`
- `fee_discount`
- `fee_fine_rule`
- `finance_transfer`
- `bank_transfer`

Numbering contracts:

- payment prefix `TP%YEAR_SHORT%%MONTH_NUMBER_SHORT%`
- receipt prefix `TR%YEAR_SHORT%%MONTH_NUMBER_SHORT%`
- transfer prefix `TT%YEAR_SHORT%%MONTH_NUMBER_SHORT%`
- bank transfer prefix `BT%YEAR_SHORT%%MONTH_NUMBER_SHORT%`
- online transaction prefix `OT%YEAR_SHORT%%MONTH_NUMBER_SHORT%`

## 4.6 Reception and Front Office

- `visitor_log`
- `enquiry`
- `query`
- `complaint`
- `gate_pass`

Numbering contracts:

- visitor log `RVLSM`
- enquiry `RESM`
- query `RQSM`
- complaint `RCSM`
- gate pass `RGPSM`

## 4.7 Exam Domain

- `exam`
- `exam_schedule`
- `exam_subject`
- `marks_entry`
- `grade_scale`
- `result_publish`

## 4.8 Logistics and Support

- Transport: `vehicle`, `vehicle_document`, `vehicle_expense`, `route`, `stop`, `route_member`
- Library: `library_transaction`, `book`, `book_issue_return`
- Inventory: `item_category`, `item`, `stock_movement`, `store_request`
- Resource: `resource_file`, `resource_assignment`
- Approval: `approval_type`, `approval_pre_requisite`, `approval_request`, `approval_history`
- Task: `task_board`, `task_item`, `task_comment`
- Helpdesk: `ticket`, `ticket_comment`, `faq`

Numbering contracts:

- library transaction prefix `SML`, digits `3`
- approval request prefix `AR`, digits `3`
- task code prefix `TM`, digits `3`
- helpdesk ticket prefix `HT`, digits `3`

---

## 5. API Implementation Plan

## 5.1 Endpoint Convention

- Base: `/api/v1`
- Naming: resource-oriented plural nouns
- Query standards: pagination, sorting, filtering, search
- Error standard:
  - `code`
  - `message`
  - `details`
  - `traceId`

## 5.2 Mandatory Context Filters

All module queries must include:

- `organizationId` / `teamId`
- `periodId` where applicable
- role and row-scope checks

## 5.3 API Packages by Module

Implement package order:

1. auth + users + roles + permissions
2. organizations/teams/periods
3. academic/student/guardian
4. employee/payroll
5. finance
6. reception
7. exam
8. logistics modules
9. approval/task/helpdesk
10. site/blog/news/recruitment/forms

## 5.4 Route Coverage Plan from Crawl

From source:

- total routes: `1664`
- parameter routes: `729`

Implementation requirement:

- maintain machine-readable route inventory file
- mark each route as:
  - `implemented`
  - `guarded`
  - `tested`
  - `parity-verified`

---

## 6. RBAC and Role Experience Plan

## 6.1 Role Matrix (Initial)

- Admin
  - full access to all setup/config/core modules
  - approval authority and user/role management
- Staff
  - constrained academic/student/exam workflows
  - no unrestricted config and billing controls
- Student
  - self profile, attendance, notices, fees, documents, tasks
- Guardian
  - linked-student visibility, fee and communication interactions

## 6.2 Enforcement Model

- Menu and button visibility by permission
- API middleware hard-block unauthorized requests
- Every write endpoint logs actor, entity, before/after snapshot

---

## 7. Module-by-Module Delivery Plan (From Coverage Priority)

Top observed modules by page volume from source are treated as higher parity priority.

## 7.1 Tier 1 (Highest)

- `/student` (62)
- `/academic` (49)
- `/finance` (47)
- `/employee` (46)
- `/transport` (39)
- `/exam` (32)
- `/inventory` (30)
- `/reception` (28)
- `/library` (25)
- `/resource` (23)

## 7.2 Tier 2

- `/config` (19)
- `/approval`, `/communication`, `/helpdesk` (13 each)
- `/contact` (11)
- `/hostel`, `/tasks` (10 each)
- `/calendar` (8)
- `/mess`, `/site`, `/utility` (7 each)

## 7.3 Tier 3

- `/asset`, `/user`, `/activity`, `/blogs`, `/discipline`, `/news`, `/recruitment`, `/store`
- remaining low-frequency modules and utility routes

---

## 8. Configuration Migration Plan

Implement config import mapping in three phases:

1. Schema mapping:
   - map source keys to Omni config namespaces
2. Validation:
   - type-safe parsing and defaults
3. Runtime:
   - config caching + admin edit UI + audit trail

Critical source toggles to preserve:

- auth:
  - `session_lifetime`, `login_throttle_max_attempts`, `enable_email_verification`, `enable_account_approval`
- feature:
  - `enable_todo`, `enable_backup`, `enable_activity_log`, `enable_guest_payment`
- notification:
  - `enable_pusher_notification`, notification bar toggles
- system:
  - locale/timezone/date format/time format/currency and UI preferences

---

## 9. Payment and Finance Gateway Plan

Observed enabled provider set includes:

- PayPal
- Stripe
- Razorpay
- Paystack
- CCAvenue
- Billdesk
- Billplz
- Amwalpay/Hubtel flags present in config model

Implementation approach:

- provider adapter interface
- per-provider credential vault
- environment mode switch (sandbox/live)
- transaction idempotency key
- webhook signature validation
- reconciliation job and failure retry queue

---

## 10. Phase 3 Gap Closure Plan (Strict)

Source gaps to close:

1. parameterized route depth
2. modal-only flows
3. role-differential route behavior

Execution:

- Generate route fixtures for all `:uuid/:slug/:token` patterns
- Build role replay suite over shared route list
- Build modal trigger automation set for each module CRUD
- Store evidence snapshots per route and role

Acceptance:

- 100% parameter route classes covered by at least one real record
- no unauthorized data leak in role replay
- all modal write actions traced to expected API calls

---

## 11. QA and Test Strategy

## 11.1 Unit Tests

- numbering generator
- fee/fine calculations
- payroll calculation
- marks and grading
- approval transition rules

## 11.2 Integration Tests

- auth/session lifecycle
- RBAC permission boundaries
- tenant and team scoping
- payment callback handling

## 11.3 E2E Journeys

1. Admission -> Student creation -> Fee allocation -> Payment -> Receipt
2. Staff attendance -> Payroll generation -> Payslip export
3. Exam setup -> Marks entry -> Result publish -> Student view
4. Approval request -> multi-step approval -> notification
5. Helpdesk ticket -> assignment -> resolution

## 11.4 Security Test Set

- IDOR and row-level leakage
- privilege escalation attempts
- brute-force/login throttle checks
- session fixation and token expiry checks
- file upload validation and malware scan hooks

## 11.5 Performance Targets

- P95 list endpoints < 600ms (baseline target)
- P95 dashboard aggregates < 1000ms
- async job queue lag < 30s under normal load

---

## 12. DevOps and Delivery Plan

## 12.1 Environments

- local
- staging
- preprod
- production

## 12.2 CI/CD Gates

- lint + type-check
- unit + integration tests
- migration dry-run
- smoke tests on deploy
- rollback verification

## 12.3 Observability

- structured logs with `traceId`
- metrics per module and endpoint
- alerting for auth failure spikes, payment failure spikes, queue lag

---

## 13. 12-Sprint Execution Plan

## Sprint 1

- auth core
- users/roles/permissions schema
- current user endpoint
- base app shell and route guards

## Sprint 2

- organization/team/period setup
- config service baseline
- activity log framework

## Sprint 3

- academic core (course/section/batch/subject)
- timetable baseline

## Sprint 4

- student + guardian + admissions + student numbering
- student attendance v1

## Sprint 5

- employee core + attendance + leave v1
- employee numbering rules

## Sprint 6

- finance fee structure/allocation/payment/receipt
- receipt numbering and reconciliation

## Sprint 7

- reception modules (visitor, enquiry, complaint, gate pass)
- exam core + marks entry

## Sprint 8

- exam result publish + report cards
- approval engine core

## Sprint 9

- transport + library
- inventory stock movement

## Sprint 10

- resource + asset + helpdesk + task
- communication dispatch adapters

## Sprint 11

- site/blog/news/contact/recruitment/forms
- parent/student self-service hardening

## Sprint 12

- parity closure for parameterized routes
- full regression + security pass + go-live rehearsal

---

## 14. Definition of Done (Project-Level)

Project is done only when all are true:

- Tier 1 and Tier 2 modules are production-usable.
- Route inventory marks implemented/guarded/tested for critical paths.
- Phase 3 gap closure evidence is complete.
- No unresolved P1/P2 bugs or vulnerabilities.
- Runbook, rollback plan, and handover docs signed off.

---

## 15. Immediate Next Actions (This Week)

1. Freeze this plan and assign module owners.
2. Create sprint board from sections 7 and 13.
3. Start Sprint 1 deliverables (auth + RBAC + route guard + user endpoint).
4. Define API schemas for Wave A modules before UI work.
5. Set up CI gates and test scaffolding before first major merge.

---

## 16. Notes on Fidelity vs Improvement

This plan intentionally preserves high-value behavior from InstiKit while improving:

- API consistency (current user/auth endpoint contract)
- security posture (strict RBAC and row-level protections)
- implementation maintainability (domain services, adapter patterns)
- operational reliability (observability, CI/CD guardrails)

---

## 17. Exhaustive Parity Appendices (No-Left-Behind)

This section exists specifically to satisfy full reverse-engineering parity goals. It ensures nothing from the source system is ignored during implementation.

## 17.1 Full Observed Module Coverage Inventory (55)

Use this as the implementation parity backlog source:

- `/student`: 62
- `/academic`: 49
- `/finance`: 47
- `/employee`: 46
- `/transport`: 39
- `/exam`: 32
- `/inventory`: 30
- `/reception`: 28
- `/library`: 25
- `/resource`: 23
- `/config`: 19
- `/approval`: 13
- `/communication`: 13
- `/employees`: 13
- `/helpdesk`: 13
- `/contact`: 11
- `/hostel`: 10
- `/tasks`: 10
- `/calendar`: 8
- `/mess`: 7
- `/site`: 7
- `/utility`: 7
- `/asset`: 6
- `/user`: 6
- `/activity`: 5
- `/blogs`: 5
- `/discipline`: 5
- `/news`: 5
- `/recruitment`: 5
- `/store`: 3
- `/attendance`: 2
- `/contacts`: 2
- `/custom-fields`: 2
- `/devices`: 2
- `/exams`: 2
- `/forms`: 2
- `/galleries`: 2
- `/guardians`: 2
- `/inventories`: 2
- `/organizations`: 2
- `/reminders`: 2
- `/users`: 2
- `/bulk-upload`: 1
- `/dashboard`: 1
- `/failed-login-attempts`: 1
- `/form`: 1
- `/gallery`: 1
- `/home`: 1
- `/notifications`: 1
- `/post`: 1
- `/posts`: 1
- `/students`: 1
- `/support`: 1
- `/task`: 1
- `/teams`: 1

Rule: each item above must have an explicit parity status in delivery tracking:

- `not-started`
- `in-progress`
- `parity-achieved`
- `parity-improved`

## 17.2 Full Config Domain Inventory (Observed in Source)

All config domains that must be mapped into Omni Campus config service:

- `academic`
- `approval`
- `assets`
- `auth`
- `authenticated`
- `blog`
- `calendar`
- `chat`
- `communication`
- `contact`
- `employee`
- `exam`
- `feature`
- `finance`
- `form`
- `gallery`
- `general`
- `guardian`
- `helpdesk`
- `inventory`
- `is_impersonating`
- `layout`
- `library`
- `mail`
- `mess`
- `module`
- `notification`
- `organizations`
- `periods`
- `post`
- `reception`
- `recruitment`
- `resource`
- `site`
- `sms`
- `social_network`
- `store`
- `student`
- `system`
- `task`
- `teams`
- `terminology`
- `transport`
- `user_scopes`
- `utility`
- `whatsapp`

## 17.3 Critical Numbering and Identifier Contracts (Observed)

Student:

- registration: `SM` + 3 digits
- admission: `SM` + 3 digits
- transfer request: `TR` + 3 digits
- transfer: `T` + 3 digits
- service request: `SR` + 3 digits
- provisional admission: `PSM` + 3 digits

Employee:

- code: `ESM` + 3 digits
- payroll: `PSM` + 3 digits

Finance:

- payment: `TP%YEAR_SHORT%%MONTH_NUMBER_SHORT%` + 3 digits
- receipt: `TR%YEAR_SHORT%%MONTH_NUMBER_SHORT%` + 3 digits
- transfer: `TT%YEAR_SHORT%%MONTH_NUMBER_SHORT%` + 3 digits
- bank transfer: `BT%YEAR_SHORT%%MONTH_NUMBER_SHORT%` + 3 digits
- online transaction: `OT%YEAR_SHORT%%MONTH_NUMBER_SHORT%` + 3 digits

Reception:

- visitor log: `RVLSM` + 3 digits
- enquiry: `RESM` + 3 digits
- query: `RQSM` + 3 digits
- complaint: `RCSM` + 3 digits
- gate pass: `RGPSM` + 3 digits

Other modules:

- library transaction: `SML` + 3 digits
- approval request: `AR` + 3 digits
- task code: `TM` + 3 digits
- helpdesk ticket: `HT` + 3 digits

## 17.4 Security and Auth Controls to Preserve/Upgrade

Observed auth controls to map:

- `session_lifetime`
- `login_throttle_max_attempts`
- `login_throttle_lock_timeout`
- `enable_reset_password`
- `reset_password_token_lifetime`
- `enable_email_verification`
- `enable_account_approval`
- optional controls (`enable_two_factor_security`, OTP toggles, screen lock toggles)

Required Omni improvements:

- canonical `/api/v1/auth/user` style endpoint contract for current user
- no endpoint drift between frontend auth checks and backend contracts
- strict rate-limits + audit entries on failed auth attempts

## 17.5 Payment Gateway Parity Matrix

Gateway family present in config model:

- PayPal
- Stripe
- Razorpay
- Paystack
- CCAvenue
- Billdesk
- Billplz
- Payzone (flag present)
- Amwalpay (flag present)
- Hubtel (flag present)

Implementation requirement:

- same enable/live-mode pattern per gateway
- secure secrets management, not plain config exposure
- webhook signature verification and reconciliation

## 17.6 Parameterized Route Closure Requirements

Source indicates:

- parameterized routes: `729`
- concrete deep pages in phase2: `8`
- remaining closure scope: broad

Mandatory closure pipeline:

1. export parameterized route templates from source route list
2. map each template to one or more seed records
3. execute crawl/test by role (`Admin`, `Staff`, `Student`, `Guardian`)
4. store evidence for each template:
   - rendered page state
   - HTTP/API calls observed
   - permission outcome
5. mark route as parity-pass only after all evidence exists

## 17.7 Modal-Only Flow Parity Requirements

For every module with modal CRUD:

- create flow (success + validation fail)
- edit flow (success + conflict/validation fail)
- delete/archive flow (success + permission deny case)
- side effects (table refresh, activity log, toast/alert behavior)

Each modal flow must produce:

- pre-state snapshot
- request payload snapshot
- response snapshot
- post-state verification

## 17.8 Role-Differential Verification Requirements

For each shared route group:

- Admin expected: full visibility and write controls
- Staff expected: partial visibility, constrained writes
- Student expected: self scope only
- Guardian expected: linked-student scope only

Verification artifacts:

- route-by-role access matrix
- masked-field matrix (what fields are hidden by role)
- forbidden-action matrix (what actions are blocked by role)

## 17.9 No-Gap Completion Checklist

Mark project incomplete if any item is false:

- all 55 module groups have explicit parity state
- all critical numbering rules implemented and tested
- all configured auth controls mapped or deliberately superseded with rationale
- all enabled payment modes have working adapters or approved defer plan
- parameter route classes are evidence-closed
- modal flow classes are evidence-closed
- role-differential tests are green
- P1/P2 vulnerabilities are zero at release gate

## 17.10 Governance Rule

No sprint can close until new module work updates:

- module parity state
- API contract map
- RBAC matrix impact
- test evidence links
- known gap register

---

## 18. Single-File Execution Registers (No External Tracker Needed)

This section removes the need for separate CSV/JSON tracker files. Keep all progress updates in this file only.

## 18.1 Master Parity Register Rules

- Every implementation task must be mapped to one of these register IDs:
  - `RTE-*` route parity
  - `PRM-*` parameterized route parity
  - `API-*` endpoint parity
  - `CFG-*` config parity
  - `RBAC-*` role/access parity
  - `MOD-*` module completion parity
- Status values allowed: `todo`, `in-progress`, `blocked`, `done`, `improved`.
- Every `done` item must include evidence pointer (PR link, test name, screenshot path, or log reference).

## 18.2 Route Parity Register (Source Coverage: 1664)

Use this table as the canonical route implementation ledger. Add rows continuously.

| ID | Route Group | Source Count | Implemented | Guarded | Tested | Parity Status | Evidence |
|---|---|---:|---:|---:|---:|---|---|
| RTE-001 | `/student` | 62 | 0 | 0 | 0 | todo | |
| RTE-002 | `/academic` | 49 | 0 | 0 | 0 | todo | |
| RTE-003 | `/finance` | 47 | 0 | 0 | 0 | todo | |
| RTE-004 | `/employee` | 46 | 0 | 0 | 0 | todo | |
| RTE-005 | `/transport` | 39 | 0 | 0 | 0 | todo | |
| RTE-006 | `/exam` | 32 | 0 | 0 | 0 | todo | |
| RTE-007 | `/inventory` | 30 | 0 | 0 | 0 | todo | |
| RTE-008 | `/reception` | 28 | 0 | 0 | 0 | todo | |
| RTE-009 | `/library` | 25 | 0 | 0 | 0 | todo | |
| RTE-010 | `/resource` | 23 | 0 | 0 | 0 | todo | |
| RTE-011 | `/config` | 19 | 0 | 0 | 0 | todo | |
| RTE-012 | `/approval` | 13 | 0 | 0 | 0 | todo | |
| RTE-013 | `/communication` | 13 | 0 | 0 | 0 | todo | |
| RTE-014 | `/employees` | 13 | 0 | 0 | 0 | todo | |
| RTE-015 | `/helpdesk` | 13 | 0 | 0 | 0 | todo | |
| RTE-016 | `/contact` | 11 | 0 | 0 | 0 | todo | |
| RTE-017 | `/hostel` | 10 | 0 | 0 | 0 | todo | |
| RTE-018 | `/tasks` | 10 | 0 | 0 | 0 | todo | |
| RTE-019 | `/calendar` | 8 | 0 | 0 | 0 | todo | |
| RTE-020 | `/mess` | 7 | 0 | 0 | 0 | todo | |
| RTE-021 | `/site` | 7 | 0 | 0 | 0 | todo | |
| RTE-022 | `/utility` | 7 | 0 | 0 | 0 | todo | |
| RTE-023 | `/asset` | 6 | 0 | 0 | 0 | todo | |
| RTE-024 | `/user` | 6 | 0 | 0 | 0 | todo | |
| RTE-025 | `/activity` | 5 | 0 | 0 | 0 | todo | |
| RTE-026 | `/blogs` | 5 | 0 | 0 | 0 | todo | |
| RTE-027 | `/discipline` | 5 | 0 | 0 | 0 | todo | |
| RTE-028 | `/news` | 5 | 0 | 0 | 0 | todo | |
| RTE-029 | `/recruitment` | 5 | 0 | 0 | 0 | todo | |
| RTE-030 | `/store` | 3 | 0 | 0 | 0 | todo | |
| RTE-031 | remaining low-frequency modules | 38 | 0 | 0 | 0 | todo | |

Formula for RTE completion:

- `Implemented == Source Count`
- `Guarded == Source Count`
- `Tested == Source Count`
- `Parity Status` can be `done` only when all three above are true.

## 18.3 Parameterized Route Register (Source: 729)

Track dynamic route closure here. Start with known concrete samples from phase2 and expand to all patterns.

| ID | Route Template | Seed Record Type | Role Replay Complete | Modal Checked | API Checked | Status | Evidence |
|---|---|---|---|---|---|---|---|
| PRM-001 | `/blogs/:uuid/edit` | blog UUID | no | no | no | todo | |
| PRM-002 | `/news/:uuid/edit` | news UUID | no | no | no | todo | |
| PRM-003 | `/users/:uuid/edit` | user UUID | no | no | no | todo | |
| PRM-004 | `/blogs/:uuid` | blog UUID | no | no | no | todo | |
| PRM-005 | `/news/:uuid` | news UUID | no | no | no | todo | |
| PRM-006 | `/users/:uuid` | user UUID | no | no | no | todo | |
| PRM-007 | `/chat/:uuid` | chat UUID | no | n/a | no | todo | |
| PRM-008 | all remaining parameterized templates | mixed | no | no | no | todo | |

Completion rule:

- `PRM-008` cannot be `done` until total covered templates equals source parameterized template count.

## 18.4 API Parity Register

Track endpoint contract implementation and behavior parity.

| ID | Endpoint Group | Source Seen | Implemented | Auth Guarded | Test Coverage | Status | Evidence |
|---|---|---:|---:|---:|---:|---|---|
| API-001 | Auth endpoints | yes | 0 | 0 | 0 | todo | |
| API-002 | Config endpoints | yes | 0 | 0 | 0 | todo | |
| API-003 | Student endpoints | yes | 0 | 0 | 0 | todo | |
| API-004 | Employee endpoints | yes | 0 | 0 | 0 | todo | |
| API-005 | Finance endpoints | yes | 0 | 0 | 0 | todo | |
| API-006 | Reception endpoints | yes | 0 | 0 | 0 | todo | |
| API-007 | Exam endpoints | yes | 0 | 0 | 0 | todo | |
| API-008 | Transport/Library/Inventory | yes | 0 | 0 | 0 | todo | |
| API-009 | Approval/Task/Helpdesk | yes | 0 | 0 | 0 | todo | |
| API-010 | Site/Blog/News/Form/Recruitment | yes | 0 | 0 | 0 | todo | |

Auth consistency gate:

- `API-001` blocked until current-user endpoint contract is finalized and consumed by frontend.

## 18.5 Config Parity Register

Track full mapping from source config domains into Omni config service.

| ID | Config Domain | Source Present | Mapped | Runtime-Editable | Audited | Status | Notes |
|---|---|---|---|---|---|---|---|
| CFG-001 | system | yes | no | no | no | todo | |
| CFG-002 | auth | yes | no | no | no | todo | |
| CFG-003 | feature | yes | no | no | no | todo | |
| CFG-004 | notification | yes | no | no | no | todo | |
| CFG-005 | general/assets/layout | yes | no | no | no | todo | |
| CFG-006 | student | yes | no | no | no | todo | |
| CFG-007 | employee | yes | no | no | no | todo | |
| CFG-008 | finance | yes | no | no | no | todo | |
| CFG-009 | reception | yes | no | no | no | todo | |
| CFG-010 | exam/resource/transport/library | yes | no | no | no | todo | |
| CFG-011 | approval/task/helpdesk | yes | no | no | no | todo | |
| CFG-012 | site/blog/contact/recruitment/form | yes | no | no | no | todo | |
| CFG-013 | organizations/teams/periods/user_scopes | yes | no | no | no | todo | |
| CFG-014 | sms/mail/whatsapp/social_network | yes | no | no | no | todo | |

## 18.6 RBAC Parity Register

| ID | Route/API Group | Admin | Staff | Student | Guardian | Verified | Status | Evidence |
|---|---|---|---|---|---|---|---|---|
| RBAC-001 | auth + home + dashboard | allow | allow | allow | allow | no | todo | |
| RBAC-002 | student | full | limited | self | linked | no | todo | |
| RBAC-003 | academic | full | limited | view | view | no | todo | |
| RBAC-004 | finance | full | limited | self-fee | linked-fee | no | todo | |
| RBAC-005 | employee | full | limited-self | deny | deny | no | todo | |
| RBAC-006 | exam | full | limited | result-view | linked-result | no | todo | |
| RBAC-007 | reception | full | partial | deny | deny | no | todo | |
| RBAC-008 | transport/library/inventory | full | partial | view-self | linked-view | no | todo | |
| RBAC-009 | approval/task/helpdesk | full | partial | partial-self | partial-linked | no | todo | |
| RBAC-010 | config/admin utilities | full | deny | deny | deny | no | todo | |

## 18.7 One-File Final Readiness Gate

Project can be marked complete only when all conditions below are true:

- all `RTE-*` rows are `done` or approved `improved`
- `PRM-008` is `done` with numeric evidence against source parameterized count
- all `API-*` rows are `done`
- all `CFG-*` rows are `done`
- all `RBAC-*` rows are `verified=yes` and `status=done`
- P1/P2 bug and security backlog = 0

When complete, add final sign-off block here:

| Sign-off Item | Owner | Date | Result |
|---|---|---|---|
| Engineering sign-off |  |  |  |
| QA sign-off |  |  |  |
| Security sign-off |  |  |  |
| Product sign-off |  |  |  |

