# Omni-Campus: AI Project Context

## Overview
Omni-Campus is a multi-tenant role-based school management system.

## Stack
* **Frontend**: Next.js App Router, React 19, Tailwind CSS, shadcn/ui
* **Backend**: Next.js API routes
* **Database**: Prisma
* **Auth**: NextAuth v5 style `auth()` export from `src/lib/auth.ts`

## Graphify Memory
* Graphify was run on **April 21, 2026**.
* Output lives in:
  * `graphify-out/GRAPH_REPORT.md`
  * `graphify-out/graph.html`
  * `graphify-out/graph.json`
* Graphify is useful as a repo map, but not as a source of truth for feature completeness.

## Current Product State
* The codebase is much larger than the older context snapshot and includes substantial ERP functionality.
* Core modules that clearly exist in code: students, fees, exams, attendance, library, health, scholarships, gate pass, visitors, payroll, inventory, hostel, alumni, recruitment, reports, certificates, communication, and transport.
* Newer advanced modules also exist in schema/services/routes: counseling, lesson plans, quiz, payment service, SMS service, WhatsApp service, timetable generator, admission CRM groundwork, and bus/GPS-related models.

## Verified Audit Snapshot (May 1, 2026)
* **Reality**: strong implementation progress, but not yet in a clean production-ready state.
* **Build status**: `npm run build` currently fails.
* **Lint status**: `npm run lint` currently fails.
* **TypeScript status**: `npx tsc --noEmit` currently fails.
* **Jest status**: `npx jest --runInBand` currently fails before tests run because `jest-environment-jsdom` is missing.

## Critical Audit Findings
* **Auth/build mismatch**: `src/app/api/streams/route.ts` and `src/app/api/sections/route.ts` still use `getServerSession(authOptions)` even though the active auth system exports `auth()` from `src/lib/auth.ts`. This is a direct build blocker.
* **Multi-tenant safety risk**: `streams` and `sections` routes are not properly tenant-scoped. Some handlers trust request `tenantId` or operate by raw record `id` without verifying tenant ownership.
* **Test drift**: some tests no longer match current service contracts, especially `src/services/__tests__/student.service.test.ts`.
* **Type drift**: `src/app/[tenantSlug]/[role]/academics/structure/manage/page.tsx` has state typing issues around nullable `classRoomId`/`streamId`.
* **E2E typing issue**: `e2e/full-system-test.spec.ts` uses `execSync(..., { detached: true })`, which is invalid for the current TypeScript typing.

## Integration Reality
* **Payments**: service exists, but runs in demo mode when Razorpay env vars are absent. Payment history is currently derived from audit logs instead of a dedicated payment table.
* **SMS**: service and route exist, but template support is still TODO-level.
* **WhatsApp**: service exists and supports log mode plus API calls, but analytics and persistence are still partial/stubbed.
* **Timetable**: generator service exists, but this should be treated as partial until verified end-to-end in UI and production workflows.

## Current Architecture State
* **Next.js App Router**: using dynamic routes for `[tenantSlug]` and `[role]`.
* **UI Components**: using `shadcn/ui` with Tailwind CSS (e.g., Cards, Sidebar, Buttons).
* **Icons**: `lucide-react`.

## How to Resume
Whenever starting a new chat, tell the AI:
**"Wake up and read `AI_CONTEXT.md`"** to instantly restore your current project state, or simply continue your existing conversation thread.
