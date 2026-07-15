---
tags: [memory, status]
---
# Build Status (live)

Snapshot of what's actually built in `breezyops/` vs. the [[Feature-Index|13-feature spec]]. Update this after every feature lands — this is the "state of the world" for the code, same role [[Project-Context]] plays for the business. See [[Build-Log]] for the change-by-change history and reasoning.

**Last updated:** 2026-07-14 (v0.8 — React 19 strict mode, ESLint compliant, all polish resolved)

## Phase 1 progress

```mermaid
flowchart TB
    F01["F01 Unified Lead Inbox\n🟢 built + wired to DB"]
    F02["F02 Lead Pipeline\n🟢 built + wired to DB"]
    F03["F03 Appointments & Scheduling\n🟢 built + wired to DB"]
    F04["F04 Jobs & Work Orders\n🟢 built + wired to DB"]
    F05["F05 Customers & Accounts\n🟢 built + wired to DB"]
    F09["F09 Invoicing & Payments\n🟢 built + wired to DB"]
    F10["F10 Document & Media Repo\n🟢 built + wired to DB"]
    F13["F13 Admin RBAC & Settings\n🟢 built + wired to DB"]

    F01 --> F02 --> F03 --> F04 --> F09
    F04 --> F10
    F13 -.RLS/roles underlie all.-> F01
    F13 -.-> F02
    F13 -.-> F03
    F13 -.-> F04
    F13 -.-> F09

    classDef built fill:#14B5F8,color:#000,stroke:#0D47A1;
    class F01,F02,F03,F04,F05,F09,F10,F13 built;
```

## What's live right now

| Layer | State |
|---|---|
| Auth (login) | 🟢 Real — Supabase email/phone OTP, two-stage send→verify, working end to end |
| Database | 🟢 Connected — Supabase JS client over HTTPS (direct PG blocked by IPv6). All data queries use real DB. |
| Schema | 🟢 Pushed — 14 tables, 10 enums, all indexes created via Supabase SQL Editor (12-step migration) |
| RLS policies | 🟢 Applied — 20 RBAC policies on all 13 tables, helper functions, auto-profile trigger, catalog_public view |
| Lead webhook intake | 🟢 Code complete, using Supabase JS client, timing-safe secret, error handling |
| Leads inbox UI (F01) | 🟢 Built, real DB data, mutations wired to server actions with revalidation |
| Pipeline boards (F02) | 🟢 Built, real DB data, drag-and-drop persists via `updateLeadStatusAction` / `updateDealStageAction` |
| Schedule (F03) | 🟢 Built, real DB data, day/week view, booking sheet wired to `createAppointmentAction` |
| Customers (F05) | 🟢 Built, real DB data — list (All/B2C/B2B tabs, search, revenue) + detail sheet + [id] page |
| Jobs (F04) | 🟢 Built, real DB data — list (All/Scheduled/Active/Done tabs, search) + detail sheet wired to `updateJobStatusAction` |
| Invoices (F09) | 🟢 Built, real DB data — list (All/Draft/Sent/Paid/Overdue tabs, search) + detail sheet wired to `updateInvoiceStatusAction` |
| Settings (F13) | 🟢 Built, wired to real DB — catalog (inline price/cost edit), users (profiles), localities (add/view), integrations, audit log |
| Dashboard KPIs | 🟢 Wired to real DB queries (leads, jobs, invoices, customers, appointments) |
| F10 Document & Media | 🟢 Built, real DB data — list (type tabs, search, upload) + detail sheet, improved download/delete UX |
| Rate limiting | 🟢 In-memory sliding-window rate limiter on auth/confirm (10/min) and webhook (30/min) |

## Pages

| Route | Feature | Description |
|---|---|---|
| `/` | Dashboard | Real KPIs from DB |
| `/leads` | F01 | Lead inbox — real DB data + detail sheet |
| `/pipeline` | F02 | B2C/B2B kanban boards, drag-drop |
| `/schedule` | F03 | Day/week view, booking sheet, conflict guard |
| `/customers` | F05 | List (tabs All/B2C/B2B, search, revenue) + detail sheet + [id] page |
| `/jobs` | F04 | List (tabs All/Scheduled/Active/Done, search) + detail sheet |
| `/invoices` | F09 | List (tabs All/Draft/Sent/Paid/Overdue, search) + detail sheet |
| `/settings` | F13 | Catalog table, users, localities, integrations, audit log |
| `/documents` | F10 | Document library — type tabs, search, upload stub, detail sheet |

## Components

| Directory | Files |
|---|---|
| `components/leads/` | `lead-inbox.tsx`, `lead-detail-sheet.tsx` |
| `components/pipeline/` | `kanban-board.tsx`, `b2c-board.tsx`, `b2b-board.tsx`, `lead-pipeline-card.tsx`, `deal-pipeline-card.tsx` |
| `components/schedule/` | `schedule-board.tsx`, `day-view.tsx`, `week-view.tsx`, `booking-sheet.tsx` |
| `components/customers/` | `customer-list.tsx`, `customer-detail-sheet.tsx` |
| `components/jobs/` | `job-list.tsx`, `job-detail-sheet.tsx` |
| `components/invoices/` | `invoice-list.tsx`, `invoice-detail-sheet.tsx` |
| `components/settings/` | `settings-panel.tsx` |
| `components/docs/` | `document-library.tsx`, `document-detail-sheet.tsx` |

## Schema (`lib/db/schema.ts`)

**Tables (14):** localities, profiles, customers, sites, leads, deals, serviceCatalog, jobs, appointments, invoices, documents, media, consents, activityLog

**Enums (10):** userRole, segment, leadChannel, leadStatus, dealStage, jobStatus, invoiceStatus, documentType, mediaCategory, appointmentStatus

## DB queries (`lib/db/queries.ts`)

All queries use Supabase JS client over HTTPS (direct PG connection blocked by IPv6 on this machine).

| Function | Returns | Notes |
|---|---|---|
| `fetchLeads()` | `LeadRow[]` | With locality name join |
| `fetchDeals()` | `DealRow[]` | With customer + locality join |
| `fetchAppointments()` | `AppointmentRow[]` | With customer, locality, technician join |
| `fetchJobs()` | `JobRow[]` | With customer, technician, site address join |
| `fetchCustomers()` | `CustomerRow[]` | Enriched with job count, revenue, sites |
| `fetchCustomerById(id)` | `CustomerRow \| null` | Full detail with jobs, invoices, sites |
| `fetchInvoices()` | `InvoiceRow[]` | With customer name join |
| `fetchDocuments()` | `DocumentRow[]` | With customer name join |
| `fetchMedia()` | `MediaRow[]` | With customer name join |
| `fetchDashboardKPIs()` | `DashboardKPIs` | All KPIs in one query batch |
| `fetchTechnicians()` | `{ id, fullName }[]` | Active profiles |
| `fetchLocalities()` | `Locality[]` | Active localities |
| `updateLeadStatus()` | `void` | With optional lost reason |
| `updateDealStage()` | `void` | |
| `createAppointment()` | `new appointment` | With conflict check |
| `updateJobStatus()` | `void` | |
| `updateInvoiceStatus()` | `void` | |
| `fetchProfiles()` | `{ id, name, role, active }[]` | Settings users tab |
| `fetchServiceCatalog()` | `{ id, name, segment, price, cost, active }[]` | Settings catalog tab |
| `fetchActivityLog()` | `{ id, actor, action, entity, time }[]` | Settings audit tab, last 20 |
| `fetchAllLocalities()` | `{ id, name, active }[]` | Settings localities (includes inactive) |
| `updateCatalogItem()` | `void` | Price/cost edit |
| `addLocality()` | `void` | New locality |

## Server Actions (`app/actions.ts`)

| Action | Revalidates | Notes |
|---|---|---|
| `updateLeadStatusAction` | /leads, /pipeline, / | With optional lost reason |
| `updateDealStageAction` | /pipeline, / | |
| `createAppointmentAction` | /schedule, / | Returns new appointment |
| `updateJobStatusAction` | /jobs, /schedule, / | |
| `updateInvoiceStatusAction` | /invoices, / | |
| `updateCatalogItemAction` | /settings | Price/cost edit |
| `addLocalityAction` | /settings | New locality |

## Mock data (`lib/db/mock.ts`)

Still exported but **no longer imported** by any component. Kept for reference/testing only.

| Export | Count |
|---|---|
| `mockLeads` | 6 |
| `mockDeals` | 4 |
| `mockCustomers` | 8 |
| `mockAppointments` | 6 |
| `mockJobs` | 7 |
| `mockInvoices` | 7 |
| `mockDocuments` | 8 |
| `mockMedia` | 6 |
| `mockTechnicians` | 4 |

## Feature IA — F02 Lead Pipeline

```mermaid
flowchart LR
    Page["/pipeline"] --> Tabs{Tabs}
    Tabs --> B2C["B2C board"]
    Tabs --> B2B["B2B board"]

    B2C --> Search1["Search: name/phone"]
    B2C --> Cols1["Columns: new → qualified → booked → completed → paid → retained"]
    Cols1 --> Card1["LeadPipelineCard\n(urgent flag, stalled badge)"]

    B2B --> Search2["Search: deal/customer"]
    B2B --> Cols2["Columns: new → qualified → survey → proposal → negotiation → won"]
    Cols2 --> Card2["DealPipelineCard\n(₹ value, GST badge, stalled badge)"]
    Cols2 -->|drop on 'won' + gst_required| Gate["GST confirmation dialog"]
    Gate -->|confirm| Won["stage = won"]
```

## Feature IA — F03 Appointments & Scheduling

```mermaid
flowchart LR
    Page["/schedule"] --> Board["ScheduleBoard"]
    Board --> Nav["Date nav: prev/next, popover calendar, Today"]
    Board --> ViewTabs{Day / Week}
    ViewTabs --> Day["DayView\n(sorted list, empty/loading states)"]
    ViewTabs --> Week["WeekView\n(7-day grid, click day -> Day view)"]
    Board --> NewBtn["New appointment"] --> Sheet["BookingSheet"]
    Sheet --> Conflict{"Same technician,\noverlapping time?"}
    Conflict -->|yes| Block["Blocked: conflict toast"]
    Conflict -->|no| Create["Appointment added\n(persisted to DB)"]
```

## Known gaps to close before "Phase 1 exit criteria"
Per [[Build-Phases]], exit criteria is *10 real jobs run fully through Breezyops*. All infrastructure work is complete. Remaining:
1. ~~Wire client-side mutations~~ ✅ done
2. ~~RLS policies applied to live project~~ ✅ done
3. ~~Settings page wired to real DB~~ ✅ done
4. ~~Rate limiting~~ ✅ done
5. ~~Test framework~~ ✅ Vitest, 21 tests passing
6. ~~Security: open redirect fix~~ ✅ done
7. ~~Regression pass + UX audit~~ ✅ done (v0.7 — all 37 UX issues resolved)
8. ~~LOW polish sweep~~ ✅ done (v0.8 — as any casts, typing, ScrollArea, Table, ESLint)
9. ~~React 19 strict mode compliance~~ ✅ done (v0.8 — no setState-in-effect, no impure render)

| Gap | Status |
|---|---|
| Mobile nav | ✅ resolved |
| loading.tsx | ✅ resolved |
| Keyboard DnD | ✅ resolved |
| Accessibility (aria-labels, form labels) | ✅ resolved |
| Lead search | ✅ resolved |
| Responsive tables | ✅ resolved |
| SLA timer | ✅ resolved |
| Login improvements | ✅ resolved |
| Dark mode | ✅ resolved |
| as any type safety | ✅ resolved |
| ESLint + React 19 strict mode | ✅ resolved |

**Remaining:** E2E test framework (Playwright/Cypress), command palette
