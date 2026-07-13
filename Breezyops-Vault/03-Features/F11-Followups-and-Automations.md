---
tags: [feature]
status: draft
phase: 2
---
# F11 — Follow-ups & Automations

## Purpose
The retention engine: thank-you messages, review requests, next-service-due nudges, AMC renewal reminders, and **reactivation broadcasts** to segmented customer lists — all consent-checked (TRAI/DND).

## Users / roles
admin, ops (full) · b2b_manager (B2B sends) · technician none · finance none.

## User flows
1. **Automatic sequences:** job paid → T+2h thank-you ("filter coffee's on us ☕") → T+1d review request → T+30d AMC upsell if unsubscribed.
2. **Renewals:** subscription T-30/T-7 reminders → renew link.
3. **Reactivation broadcast:** build segment in [[F05-Customers-and-Accounts]] (e.g. "Koramangala, last service > 8 months, opted-in") → pick AiSensy template → preview audience → send → replies route back into [[F01-Unified-Lead-Inbox]] as warm leads.
4. **Sequence editor (admin):** enable/disable steps, edit timing and templates.

## UI states
- **Empty:** "No automations running."
- **Loading:** timeline skeleton.
- **Populated:** automation list with status, next-run, send stats; broadcast builder wizard.
- **Error:** AiSensy send failure → retry with backoff; failures surfaced per recipient.
- **Edge:** recipient opted out mid-sequence → remaining steps cancelled instantly.

## shadcn/ui components
`Switch` (enable/disable), `Card` (sequence steps), `Select`/`Slider` (timing), `Dialog` (broadcast wizard), `Table` (audience preview), `Progress` (send progress), `Badge`.

## Use cases
- Post-service review ask lifts Google review count → local SEO.
- Pre-summer reactivation blast to dormant customers = highest-ROI lead source.

## Edge cases
- **Consent is a hard gate:** every send checks `consents.opted_in`; broadcasts exclude opt-outs with a visible excluded-count.
- Duplicate sends prevented by per-(customer, template, window) idempotency.
- Quiet hours: no marketing sends 9pm–9am (TRAI-friendly default).
- WhatsApp template rejected by Meta → fallback to SMS/email or hold.

## Workflow & automation
- Cron-driven scheduler reads `follow_ups`/`automations` and dispatches.
- Every send logged with delivery status for [[F12-Reports-and-Analytics]].

## Data touched
`automations`, `follow_ups`, `consents`, `customers`, `subscriptions`, `reviews`, `leads`.

## Dependencies
[[F05-Customers-and-Accounts]] · [[F08-AMC-Subscriptions]] · [[Integrations]]
