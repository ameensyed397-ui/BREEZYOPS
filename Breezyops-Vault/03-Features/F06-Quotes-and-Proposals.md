---
tags: [feature]
status: draft
phase: 2
---
# F06 — Quotes & Proposals (B2B)

## Purpose
Build, preview, send and track branded B2B quotes/proposals for VRF/VRV maintenance and installs — the step a kanban card can't hold.

## Users / roles
b2b_manager, admin (full) · finance (view) · others none.

## User flows
1. From a B2B deal (survey stage) → **New quote** → add line items from `service_catalog` + custom lines → set validity, terms, `gst_required` flag.
2. **Preview** the branded PDF (@react-pdf) → send via email/WhatsApp (consent-checked) → status `sent`.
3. Track: viewed / accepted / rejected → on accept, convert to contract ([[F07-Contracts-and-Templates]]).

## UI states
- **Empty:** "No quotes for this deal."
- **Loading:** builder skeleton.
- **Populated:** line-item builder with live total + PDF preview pane.
- **Error:** PDF render failure → retry; send failure → resend.
- **Edge:** price change after sending → versioned; old quote locked, new version issued.

## shadcn/ui components
`Table` (line items), `Input`/`Select`, `Card`, `Dialog` (preview), `Badge` (status), `Button`, `Tabs` (details/preview/history).

## Use cases
- Quarterly VRF maintenance proposal for an office in Whitefield.
- Multi-site quote with per-site line items.

## Edge cases
- Client demands GST invoice, business pre-GST → surfaced before send.
- Discount approval beyond a threshold → admin approval gate.
- Quote expired → auto-mark expired, one-click renew.

## Workflow & automation
- Quote-viewed tracking (link open).
- Accepted → spawn contract + subscription.

## Data touched
`quotes`, `quote_items`, `deals`, `service_catalog`, `customers`, `documents`.

## Dependencies
[[F02-Lead-Pipeline]] · [[F07-Contracts-and-Templates]] · [[F09-Invoicing-and-Payments]]
