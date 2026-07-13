---
tags: [feature]
status: draft
phase: 1
---
# F01 — Unified Lead Inbox

## Purpose
One queue for **every** inbound lead — Breezy voice, WhatsApp, web chat, web form, referral, walk-in — with source attribution, urgency and locality. Zero lead leakage.

## Users / roles
admin, ops (full) · b2b_manager (B2B only) · technician (none) · finance (view).

## User flows
1. Lead arrives on any channel → webhook `POST /api/webhooks/lead` → row in `leads` → appears live in inbox (Supabase Realtime).
2. Staff opens inbox → sees new leads sorted by urgency + SLA timer → clicks a lead → side panel with details, transcript/message, channel, locality.
3. Triage: **Qualify** (convert to customer + create job/deal), **Snooze**, or **Mark lost** (reason captured).
4. On qualify → creates/links `customer`, routes to [[F02-Lead-Pipeline]] and optionally books via [[F03-Appointments-and-Scheduling]].

## UI states
- **Empty:** "No new leads — you're all caught up." Illustration + link to sources.
- **Loading:** skeleton rows.
- **Populated:** DataTable/list with channel badge, name, locality, urgency chip, SLA countdown.
- **Error:** channel webhook failure banner + retry; degraded mode still shows cached leads.
- **Edge:** duplicate lead (same phone <10 min) auto-merged with a "merged" badge; unknown locality flagged for manual set.

## shadcn/ui components
`Sidebar`, `DataTable`, `Sheet` (lead detail), `Badge` (channel/urgency), `Command` (quick actions), `Tooltip`, `Sonner` (toast on new lead), `Tabs` (All / Urgent / B2B / B2C).

## Use cases
- Emergency AC failure via WhatsApp at 10pm → urgent flag → SLA timer starts → notify admin.
- Voice call captured by Bolna → transcript attached → staff qualifies next morning.
- Web "Call Me" callback request → appears with 15-min callback SLA.

## Edge cases
- Webhook retries → idempotency key prevents duplicates.
- Spam/junk lead → one-click mark-as-spam (excluded from metrics).
- Lead with no phone (chat only) → allow follow-up via same channel thread.
- Channel down → leads buffer; on recovery, backfill without dupes.

## Workflow & automation
- SLA timer set on create (`urgent` → 30 min; callback → 15 min). Cron flags overdue.
- New-lead notification to on-duty role via WhatsApp/email.
- Source + campaign captured for [[F12-Reports-and-Analytics]] ROI.

## Data touched
`leads`, `customers`, `localities`, `activity_log`.

## Dependencies
[[F02-Lead-Pipeline]] · [[F03-Appointments-and-Scheduling]] · [[Integrations]]
