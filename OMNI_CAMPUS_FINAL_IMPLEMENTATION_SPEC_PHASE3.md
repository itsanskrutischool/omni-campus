# Omni Campus Final Implementation Spec (Phase 3)

This is the single execution file for building Omni Campus using the InstiKit crawl intelligence from Phase 1 and Phase 2, plus Phase 3 closure requirements.

## 1) Status Checkpoint

- Phase 1 complete: broad crawl and normalization complete.
- Phase 2 complete: parameterized route discovery complete with concrete UUID/slug mapping.
- Phase 3 purpose: convert discovery data into implementation contracts, priorities, and verifiable delivery gates.

## 2) Evidence Baseline (From Master Crawl)

- Base URL audited: `https://demo.instikit.com`
- Version observed: `5.6.0`
- Total routes: `1664`
- Concrete leaf pages audited: `589`
- Core roles captured: `Admin`, `Staff`, `Student`, `Guardian`
- High-signal modules from coverage: `student`, `academic`, `finance`, `employee`, `transport`, `library`, `inventory`, `reception`, `exam`, `resource`, `communication`, `approval`, `helpdesk`, `site`, `blog`, `news`
- Key known auth/API inconsistency: `/api/v1/auth/me` returned `404` in crawl context

## 3) Phase 3 Exit Criteria

Phase 3 is considered complete only when all below are complete:

1. Dynamic route coverage closure:
   - Every `:uuid`, `:slug`, and `:token` route has at least one real record-backed crawl or test case.
2. Role-differential verification:
   - Same route tested across `Admin`, `Staff`, `Student`, `Guardian` with expected access control outcomes.
3. Modal/hidden flow verification:
   - Modal-triggered CRUD and approval flows are explicitly tested and documented.
4. Implementation contracts frozen:
   - Data model, API contracts, RBAC matrix, numbering schemes, and config toggles locked in this file.
5. Delivery readiness:
   - Build order, migration plan, QA gates, and go-live checklist approved.

## 4) Canonical Product Scope for Omni Campus

Implement in this order to maximize early business value and reduce dependency blockers.

### Wave A (Foundation, mandatory)

- Identity, session, and tenant context
- User + role + permission engine
- Academic structure (`period`, `course`, `batch`, `section`, `subject`)
- Student and guardian lifecycle
- Employee baseline + attendance hooks
- Core dashboard + notification center

### Wave B (Revenue and operations)

- Fee structures, allocation, collection, dues
- Payment tracking + receipt lifecycle
- Reception workflows (visitor, enquiry, complaint)
- Exam setup, marks entry, result publication

### Wave C (Institution logistics)

- Transport (`vehicle`, `route`, `stop`, assignment)
- Library (catalog, issue/return, fines)
- Inventory and stock movement
- Resource/asset management

### Wave D (Communication and governance)

- Communication hub (notice, SMS/email/push adapters)
- Approval engine (requests, types, prerequisites)
- Task board and reminders
- Helpdesk + ticket routing

### Wave E (Public and growth)

- Site/CMS, blog, news, contact funnels
- Recruitment and form modules
- Parent/student self-service hardening
- Reporting and analytics expansion

## 5) Core Domain Model (Implementation Contract)

These entities are the minimum normalized model to support parity and future scaling.

- Tenant context: `organization`, `team/school`, `period/session`
- Identity: `user`, `role`, `permission`, `scope`
- Academics: `course`, `batch`, `section`, `subject`, `timetable`
- Student system: `student`, `guardian`, `admission`, `attendance`, `service_request`
- Employee system: `employee`, `designation`, `department`, `leave`, `attendance`, `payroll`
- Finance: `fee_head`, `fee_structure`, `fee_allocation`, `invoice/dues`, `payment`, `discount`, `fine`, `receipt`
- Exams: `exam`, `schedule`, `mark_entry`, `grade_scale`, `result`
- Ops modules: `transport`, `library`, `inventory`, `hostel/mess`, `resource`, `asset`
- Workflow modules: `approval_request`, `approval_type`, `task`, `helpdesk_ticket`
- Communication modules: `announcement`, `template`, `dispatch_log`, `notification`
- Public modules: `site_page`, `blog_post`, `news_post`, `contact_message`, `recruitment_application`
- Audit: `activity_log`, `failed_login_attempt`, `config_history`

## 6) RBAC Contract (Must-Enforce Matrix)

- Admin: full module CRUD + config + approval authority.
- Staff: role-limited academic/student/exam operations; no unrestricted finance/config access.
- Student: self-profile, attendance view, fee view/payment, assignments, notices.
- Guardian: linked student data, fee actions, communication, approvals where enabled.

Rules:

- Deny-by-default for every route/action.
- UI visibility and API authorization must both enforce permissions.
- Row-level restrictions required (self-data vs institution-wide data).

## 7) API Contract Strategy

Use versioned APIs and strict request validation.

- Prefix: `/api/v1/...`
- Pattern:
  - `GET` list/detail
  - `POST` create/action
  - `PUT/PATCH` update
  - `DELETE` remove/archive
- Mandatory filters:
  - Tenant/team/period context in every query boundary
- Error envelope:
  - Standard JSON error format with machine-readable codes

Auth note:

- Define one canonical current-user endpoint and enforce it everywhere (avoid InstiKit-style endpoint drift observed in crawl).

## 8) Configuration and Numbering Migration

Preserve these concepts from reference system while keeping keys vendor-neutral.

- Global config:
  - locale, timezone, date format, time format, currency
- Security config:
  - session lifetime, throttle attempts, verification toggles
- Feature toggles:
  - module-level enable/disable flags
- Numbering rules:
  - prefix + digit + suffix pattern per domain (`admission`, `registration`, `payroll`, `approval`, `ticket`, `task`, etc.)
- Payments:
  - abstract gateway adapter with gateway-specific credentials isolated in secure store

## 9) Phase 3 Gap Closure Plan (Actionable)

This directly closes crawl-reported gaps.

1. Record-driven parameter crawl/tests
   - Seed each param route with at least one valid record.
   - Auto-generate route fixtures from master route catalog.
2. Role-comparative crawler/tests
   - Replay same route set under all four roles.
   - Save delta report: allowed/forbidden/masked data mismatches.
3. Modal interaction harness
   - Trigger all create/edit/delete modals and capture API side effects.
   - Include optimistic UI and validation error paths.

## 10) Delivery Plan (Execution)

### Sprint 1-2
- Foundation auth, RBAC, tenant context, period/team context, user lifecycle.

### Sprint 3-4
- Academics + student/guardian + attendance + essential dashboard widgets.

### Sprint 5-6
- Finance core + receipts + dues + basic payment adapter.

### Sprint 7-8
- Employee/payroll baseline + exam module + reception module.

### Sprint 9-10
- Transport + library + inventory + resource/asset.

### Sprint 11
- Approval, task, communication, helpdesk.

### Sprint 12
- CMS/blog/news/recruitment + full regression + go-live prep.

## 11) QA Gates (Non-Negotiable)

- Unit coverage for business engines (fees, payroll, results, approvals)
- Integration tests for permission boundaries and tenant isolation
- E2E flows:
  - Admission -> Fee Allocation -> Payment -> Receipt
  - Exam Setup -> Marks -> Result Publish
  - Leave/Approval -> Decision -> Notification
- Security checks:
  - Broken access control, IDOR, privilege escalation, auth/session checks
- Performance:
  - P95 targets for list and dashboard endpoints

## 12) Final Definition of Done

Omni Campus implementation is accepted when:

- All Wave A-C modules are production stable.
- Wave D-E are feature-complete per agreed scope.
- Phase 3 closure items are marked complete with evidence.
- Route/API/RBAC parity matrix is green.
- No P1/P2 security defects remain open.

## 13) Source Inputs (Traceability)

- `C:\Users\admin\Downloads\iconify - Copy\instikit_master_spec.json`
- `MASTER_AI_IMPLEMENTATION_BLUEPRINT.md`

---

Owner note: Use this file as the single implementation command document. Any new requirement must be added here before development starts.
