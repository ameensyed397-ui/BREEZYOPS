---
tags: [feature]
status: draft
phase: 1
---
# F13 — Admin, RBAC & Settings

## Purpose
The control room: users & roles, service catalog & pricing (incl. cost), checklist & document templates, localities, integrations, GST switch, and the audit log.

## Users / roles
admin only (finance can view audit + catalog).

## User flows
1. **Users:** invite by phone/email → assign role → active/deactivate. Role changes take effect immediately (RLS).
2. **Service catalog:** manage services with `price` + `cost` (cost never exposed to technician views), segment tagging, activate/retire.
3. **Templates:** manage checklist templates, contract templates, invoice numbering & branding, WhatsApp/email templates.
4. **Localities:** manage the 5 service areas (extensible).
5. **Integrations:** webhook secrets, AiSensy/Razorpay/Resend keys, test-ping buttons.
6. **GST switch:** enter GSTIN + enable `gst_applicable` default → invoices start carrying GST lines (no migration).
7. **Audit log:** filterable activity trail (who/what/when).

## UI states
- **Empty:** first-run setup wizard (create admin, add localities, seed catalog, connect channels).
- **Loading:** settings section skeletons.
- **Populated:** settings nav with sections; forms with save states.
- **Error:** invalid key on integration test → inline failure detail.
- **Edge:** demoting the last admin blocked; deactivating a technician with open jobs prompts reassignment.

## shadcn/ui components
`Sidebar` (settings nav), `Form` + `Input`/`Select`/`Switch`, `Table` (users/catalog/audit), `AlertDialog` (destructive actions), `Badge` (role), `Sonner` (save toasts).

## Use cases
- Day 1: seed the catalog from the existing pricing sheet (₹999 deep clean, ₹499 quick repair, ₹799 energy audit, AMC plans).
- GST registration day: flip the switch, invoices become GST invoices.

## Edge cases
- Secret rotation without downtime (dual-key window).
- Catalog price change mid-quote → existing quotes keep snapshot prices.
- Audit log is append-only; no delete even for admin.

## Workflow & automation
- Every mutation across the app writes to `activity_log` automatically (Postgres trigger).

## Data touched
`profiles`, `service_catalog`, `checklist_templates`, `contract_templates`, `localities`, `activity_log`, config tables.

## Dependencies
[[RBAC-and-Security]] · [[Data-Model]] · [[Integrations]]
