---
tags: [prd, rbac]
---
# Personas & Roles

## Personas
- **Asad (Owner/Admin)** — solo master technician & business owner. Runs everything today. Needs the full picture, financials, and a fast field workflow.
- **Syed (Super-admin / Architect)** — builds and configures the system. Full access + settings + integrations.
- **Future Technician** — field-only. Sees assigned jobs, runs checklists, uploads photos, collects payment. Must NOT see margins or the full customer base.
- **Future Ops/Dispatch** — assigns jobs, manages calendar and pipeline.
- **Future B2B Account Manager** — owns commercial deals, quotes, contracts.
- **Future Finance / CA (viewer)** — reads financials for books/tax; no operational edit rights.
- **Customer (B2C & B2B)** — receives comms, invoices, service confirmations. No login in v1.

## Role → capability matrix
See [[RBAC-and-Security]] for the enforced permission matrix and row-level-security rules.

## Activation plan
- **Now:** Admin (Asad + Syed) + Technician defined.
- **Trigger to activate more roles:** 2nd technician hired OR 15+ active B2B contracts (matches the business's existing upgrade trigger).
