---
tags: [userflow]
---
# UF1 — B2C Lead to Cash

**Actors:** customer, Breezy agent, admin/ops, technician.

## Flow
1. Lead arrives (any channel) → [[F01-Unified-Lead-Inbox]] with source, locality, urgency; SLA timer starts (30 min).
2. Qualify → customer created ([[F05-Customers-and-Accounts]]) → **Book** ([[F03-Appointments-and-Scheduling]]): service, slot, technician.
3. Confirmation to customer (WhatsApp/email, consent-checked); T-2h reminder.
4. Technician executes ([[F04-Jobs-and-Work-Orders]]): checklist → before/after photos → services logged → complete.
5. Draft invoice auto-created ([[F09-Invoicing-and-Payments]]) → UPI QR on-site → paid.
6. Follow-ups fire ([[F11-Followups-and-Automations]]): thank-you → review ask → AMC upsell.
7. Pipeline card lands in **retained**; photos filed ([[F10-Document-and-Media-Repository]]).

## Failure branches
- SLA breach → escalation notification.
- No-show → reschedule flow, lead not lost.
- Payment deferred → invoice `sent`, reminder cadence starts.
- Bad experience flagged in review step → suppress public review ask, open a service-recovery task instead.
