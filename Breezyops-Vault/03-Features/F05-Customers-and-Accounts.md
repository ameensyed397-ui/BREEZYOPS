---
tags: [feature]
status: draft
phase: 1
---
# F05 — Customers & Accounts (360° CRM)

## Purpose
A persistent record of every customer — B2C household or B2B company with multiple sites and contacts — holding full history: jobs, invoices, contracts, AMC, documents, photos, comms.

## Users / roles
admin, ops (full) · b2b_manager (B2B accounts) · technician (only the assigned job's customer) · finance (view).

## User flows
1. Auto-created on lead conversion, or added manually. `segment` = b2c/b2b.
2. B2B: attach `sites` and `contacts` (facility manager, procurement); set `gst_required`.
3. Open a customer → 360° timeline: jobs, invoices, AMC status, documents, photos, consent status.
4. Segment/filter (locality, AMC active, last service > N months) → export a reactivation list ([[F11-Followups-and-Automations]]).

## UI states
- **Empty:** "No customers yet — convert a lead."
- **Loading:** profile skeleton.
- **Populated:** header (contact, tags) + tabbed 360° (Overview / Jobs / Invoices / AMC / Docs / Photos / Comms).
- **Error:** merge conflict on duplicate → guided merge.
- **Edge:** same phone across B2C + B2B → separate records, cross-linked.

## shadcn/ui components
`Tabs`, `Card`, `Table`, `Badge`, `Avatar`, `Sheet` (edit), `Command` (search), `DropdownMenu` (actions), `Separator`.

## Use cases
- B2B office chain: one account, five sites, one contract, many jobs.
- B2C repeat customer: technician sees prior repairs before arriving.

## Edge cases
- Duplicate detection on create (phone match) → suggest merge.
- Consent withdrawn → excluded from all marketing sends.
- Deleted customer → soft delete; history preserved for audit.

## Workflow & automation
- Reactivation segments recompute nightly.
- Last-service + AMC status kept current for renewal logic.

## Data touched
`customers`, `sites`, `contacts`, `jobs`, `invoices`, `subscriptions`, `documents`, `media`, `consents`.

## Dependencies
[[F02-Lead-Pipeline]] · [[F08-AMC-Subscriptions]] · [[F10-Document-and-Media-Repository]] · [[F11-Followups-and-Automations]]
