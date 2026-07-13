---
tags: [memory, status]
---
# Build Status (live)

Snapshot of what's actually built in `breezyops/` vs. the [[Feature-Index|13-feature spec]]. Update this after every feature lands — this is the "state of the world" for the code, same role [[Project-Context]] plays for the business. See [[Build-Log]] for the change-by-change history and reasoning.

**Last updated:** 2026-07-13, after F03 (+ F04/F05/F09 UI from a concurrent opencode session in the same working tree).

## Phase 1 progress

```mermaid
flowchart TB
    F01["F01 Unified Lead Inbox\n🟡 partial"]
    F02["F02 Lead Pipeline\n🟢 built (mock data)"]
    F03["F03 Appointments & Scheduling\n🟢 built (mock data)"]
    F04["F04 Jobs & Work Orders\n🟡 list+detail UI (mock data), no checklist/photo capture yet"]
    F05["F05 Customers & Accounts\n🟡 list+detail UI (mock data)"]
    F09["F09 Invoicing & Payments\n🟡 list+detail UI (mock data), no PDF/UPI/Razorpay yet"]
    F10["F10 Document & Media Repo\n⬜ not started"]
    F13["F13 Admin RBAC & Settings\n🟡 partial (schema+auth only)"]

    F01 --> F02 --> F03 --> F04 --> F09
    F04 --> F10
    F13 -.RLS/roles underlie all.-> F01
    F13 -.-> F02
    F13 -.-> F03
    F13 -.-> F04
    F13 -.-> F09

    classDef built fill:#14B5F8,color:#000,stroke:#0D47A1;
    classDef partial fill:#FFD580,color:#000,stroke:#B8860B;
    classDef todo fill:#eee,color:#666,stroke:#999;
    class F02,F03 built;
    class F01,F04,F05,F09,F13 partial;
    class F10 todo;
```

**Attribution note:** F01/F02/F03 and the schema/RLS/docs work in this file are Claude Code's. F04 (Jobs list/detail), F05 (Customers list/detail), and F09 (Invoices list/detail) were built by a second AI tool (opencode) the user is running concurrently in the same working directory — described here at the same level of scrutiny as everything else, not verified line-by-line by Claude Code beyond `tsc --noEmit` + `next build` passing on the combined tree.

## What's real vs. mock right now

| Layer | State |
|---|---|
| Auth (login) | 🟢 Real — Supabase email/phone OTP, two-stage send→verify, working end to end |
| Database | 🔴 Not connected — no `DATABASE_URL`; app falls back to mock data everywhere. See [[Gaps-and-Open-Questions]] #4 |
| RLS policies | 🟡 Written (`supabase/policies.sql`), covers all tables incl. `deals`, never applied to a live project yet |
| Lead webhook intake | 🟡 Code complete, untested against a real DB |
| Leads inbox UI (F01) | 🟢 Built, mock data, actions are stubs (toast only, no real qualify/book/lose) |
| Pipeline boards (F02) | 🟢 Built, mock data, drag-and-drop persists only in local state |
| Schedule (F03) | 🟢 Built, mock data, day/week view, booking sheet with real double-booking conflict guard |
| Customers/Jobs/Invoices (F05/F04/F09) | 🟡 List + detail UI built (opencode), mock data, not yet cross-checked against their feature specs by Claude Code |
| Dashboard KPIs | 🔴 Hardcoded sample numbers, not wired to any query |

## Feature IA — F02 Lead Pipeline (built this session)

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

## Feature IA — F03 Appointments & Scheduling (built this session)

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
    Conflict -->|no| Create["Appointment added\n(local state only)"]
```

## Known gaps to close before "Phase 1 exit criteria"
Per [[Build-Phases]], exit criteria is *10 real jobs run fully through Breezyops*. Still required:
1. Real Supabase project wired (`DATABASE_URL` + service role key), schema pushed, RLS applied
2. F10 Document Repo not started; F04/F05/F09 need a Claude Code pass against their specs (built by opencode, not yet spec-checked)
3. F13 admin setup wizard + service catalog + audit log UI
4. Pipeline/inbox/schedule actions wired to real mutations (currently toast-only / local-state-only stubs)
5. Regression pass + UX audit once the above land — not meaningful to run against mock-only screens
