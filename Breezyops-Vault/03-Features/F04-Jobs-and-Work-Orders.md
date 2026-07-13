---
tags: [feature]
status: draft
phase: 1
---
# F04 — Jobs & Work Orders

## Purpose
The operational unit. A technician runs the digital checklist, captures before/after/issue photos, records services, and closes the job — feeding invoicing and content.

## Users / roles
technician (own jobs, full execute) · admin, ops (all) · finance (view).

## User flows
1. Technician opens assigned job (mobile PWA) → sees customer, site, services, history.
2. Runs **checklist** (from `checklist_templates`, e.g. Cooling Inspection) → each item pass/fail/note.
3. Captures **photos** by category (before / after / issue) → stored in the customer's folder ([[F10-Document-and-Media-Repository]]).
4. Adds services performed + parts; marks **complete** → triggers draft invoice ([[F09-Invoicing-and-Payments]]).
5. Collects payment on-site (UPI QR / cash) → marks paid.

## UI states
- **Empty:** "No jobs assigned."
- **Loading:** job card skeleton.
- **Populated:** job detail with checklist, photo grid, service list, status stepper.
- **Error:** photo upload failure → queued for retry (offline-tolerant).
- **Edge:** poor signal on rooftop/basement → offline mode caches checklist + photos, syncs on reconnect.

## shadcn/ui components
`Card`, `Checkbox`/`RadioGroup` (checklist), `Textarea` (notes), file `Input` + image grid, `Progress`/`Stepper`, `Button`, `Sheet` (add service), `AlertDialog` (complete/close).

## Use cases
- Deep AC clean: before/after photos become the IG carousel + build trust.
- Emergency repair: parts logged, warranty set (`warranty_until`), invoice raised on-site.

## Edge cases
- Job cancelled mid-service → partial record + reason retained.
- Additional issue found → upsell captured, optional new quote.
- Reassignment mid-day → new technician inherits context; old one loses access (RLS).

## Workflow & automation
- On complete → draft invoice + follow-up scheduled (thank-you, review).
- Warranty date computed from service type.
- Checklist + photos immutable after close (dispute protection).

## Data touched
`jobs`, `job_checklist_items`, `checklist_templates`, `media`, `service_catalog`, `invoices`, `activity_log`.

## Dependencies
[[F09-Invoicing-and-Payments]] · [[F10-Document-and-Media-Repository]] · [[F11-Followups-and-Automations]]
