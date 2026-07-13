---
tags: [feature]
status: draft
phase: 1
---
# F09 — Invoicing & Payments (in-house)

## Purpose
Fully **owned** invoicing — no Zoho. Generate branded invoices (pre-GST, GST-ready), send them, collect via UPI/Razorpay, and reconcile. Recurring billing for AMC.

## Users / roles
admin, finance (full) · b2b_manager (raise B2B) · technician (collect on-site only) · ops none.

## User flows
1. Job completed → **draft invoice** auto-created from services/parts.
2. Review → generate branded PDF (@react-pdf) → send (email/WhatsApp, consent-checked) → status `sent`.
3. Customer pays: UPI QR on-site, Razorpay link remotely, or cash → record `payment` → status `paid`.
4. B2B: net-terms invoice, PO reference, due date; overdue tracking.
5. AMC: recurring invoice per cycle.

## UI states
- **Empty:** "No invoices."
- **Loading:** builder skeleton.
- **Populated:** invoice builder + live PDF preview + payment status.
- **Error:** PDF/render or webhook failure → retry; partial payment handled.
- **Edge:** refund/void (finance only, reason logged); credit note for adjustments.

## shadcn/ui components
`Table` (line items), `Form`, `Dialog` (preview), `Badge` (status: draft/sent/paid/overdue), `Button` (send/collect), `Tabs`.

## Use cases
- On-site B2C: invoice + UPI QR, paid before the technician leaves.
- B2B net-30 with PO and overdue reminders.

## Edge cases
- **Pre-GST:** `gst_applicable=false`; enabling it post-registration is a config flip (see [[Data-Model]]).
- Partial/split payments → track balance.
- Duplicate payment webhook → idempotent reconcile.
- Disputed charge → link back to job checklist + photos as evidence.

## Workflow & automation
- Auto-draft on job complete; overdue reminders via cron.
- Razorpay webhook (signature-verified) marks paid + reconciles.
- Numbering sequence per financial year.

## Data touched
`invoices`, `invoice_items`, `payments`, `jobs`, `subscriptions`, `customers`, `documents`.

## Dependencies
[[F04-Jobs-and-Work-Orders]] · [[F08-AMC-Subscriptions]] · [[Integrations]] · [[Invoice-Template]]
