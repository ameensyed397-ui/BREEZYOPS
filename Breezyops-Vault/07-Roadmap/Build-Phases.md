---
tags: [roadmap]
---
# Build Phases

## Phase 1 — Core loop (weeks 1–4) · ₹0
Goal: replace Notion/Zoho for daily ops. **Lead → book → job → invoice → paid**, end to end.
- Scaffold: Next.js 15 + shadcn/ui + Supabase + Drizzle; auth + roles (admin, technician); RLS baseline.
- [[F01-Unified-Lead-Inbox]] + lead webhook (Breezy/AiSensy/webform wired in).
- [[F02-Lead-Pipeline]] (B2C board first), [[F03-Appointments-and-Scheduling]] (calendar, no map yet).
- [[F04-Jobs-and-Work-Orders]] with checklist + photo capture (offline queue).
- [[F05-Customers-and-Accounts]] basic 360°.
- [[F09-Invoicing-and-Payments]] — in-house PDF invoice + UPI QR + Razorpay link + webhook reconcile.
- [[F10-Document-and-Media-Repository]] auto-filing.
- [[F13-Admin-RBAC-Settings]] setup wizard + catalog + audit log.
**Exit criteria:** 10 real jobs run fully through Breezyops; Zoho retired.

## Phase 2 — B2B + recurring + retention (weeks 5–10) · ₹0 + per-use comms
- B2B board + [[F06-Quotes-and-Proposals]] + [[F07-Contracts-and-Templates]] with preview.
- [[F08-AMC-Subscriptions]] with visit auto-generation + renewals.
- [[F11-Followups-and-Automations]] sequences + reactivation broadcast.
- [[F12-Reports-and-Analytics]] v1 dashboards; dispatch map view.
**Exit criteria:** first B2B contract fully managed in-app; first reactivation broadcast sent from the tool.

## Phase 3 — Scale & polish (when triggers hit)
Triggers: **2nd technician** OR **15+ B2B contracts** OR **GST registration**.
- Activate ops / b2b_manager / finance roles; MFA for admin.
- GST invoicing flip; e-sign integration for contracts; customer self-service portal (view invoices, book).
- Storage/DB paid tier if free caps near; consider self-hosting Supabase.

## Cost guardrails
| Trigger | Action |
|---|---|
| Supabase 500MB DB / 1GB storage nears | Pro tier (~$25/mo) or self-host |
| >3k emails/mo | Resend paid |
| Vercel Hobby limits | Pro (~$20/mo) |
Everything else stays per-use (AiSensy, Razorpay).
