# Omni-Campus: AI Project Context

## Overview
Omni-Campus is a multi-tenant role-based school management system.

## Recent Work Completed
* **App Sidebar & Navigation**: The sidebar navigation (`src/components/layout/app-sidebar.tsx`) is dynamically loaded based on the `user.role` reading from `getMenuForRole`.
* **RBAC (Role Based Access Control)**: Managed centrally in `src/lib/permissions.ts`. Currently configured for `SUPER_ADMIN`, `ADMIN`, `TEACHER`, `PARENT`, `STUDENT`, `ACCOUNTS`, `RECEPTION`, and `TRANSPORT`.
* **Module Additions**: Added `Accounts` and `Reception` modules into the role matrix. Their icons are mapped (`Wallet` for Accounts, `Phone` for Reception).
* **Pages Created**: Created foundational pages for newly configured roles:
  * `src/app/[tenantSlug]/[role]/accounts/page.tsx`
  * `src/app/[tenantSlug]/[role]/reception/page.tsx`

## Current Architecture State
* **Next.js App Router**: using dynamic routes for `[tenantSlug]` and `[role]`.
* **UI Components**: using `shadcn/ui` with Tailwind CSS (e.g., Cards, Sidebar, Buttons).
* **Icons**: `lucide-react`.

## How to Resume
Whenever starting a new chat, tell the AI:
**"Wake up and read `AI_CONTEXT.md`"** to instantly restore your current project state, or simply continue your existing conversation thread.
