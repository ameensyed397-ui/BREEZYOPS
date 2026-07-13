---
tags: [feature]
status: draft
phase: 2
---
# F08 — AMC / Subscriptions

## Purpose
The recurring-revenue engine. Plans (B2C: Cool Starter ₹1,999 / Bengaluru Pro ₹3,499 / Villa Ultra ₹5,999; B2B contracts) that **auto-generate scheduled visits** and **never miss a renewal**.

## Users / roles
admin, ops (full) · b2b_manager (B2B) · finance (billing) · technician (assigned visits only).

## User flows
1. Subscription created (from contract or direct sale) → plan, cycle, `next_service_date`, `renewal_date`.
2. Cron generates `subscription_visits` due in window → auto-book onto the calendar ([[F03-Appointments-and-Scheduling]]).
3. Visit serviced as a normal job; usage (gas refills, spares) tracked against plan entitlements.
4. Renewal reminder at T-30/T-7 → one-tap renew or lapse → win-back list.

## UI states
- **Empty:** "No active subscriptions."
- **Loading:** list skeleton.
- **Populated:** subscriptions table (plan, next visit, renewal, status, usage bar).
- **Error:** visit-generation failure surfaced to admin.
- **Edge:** entitlements exhausted (e.g. 4 wet services used) → extra billed as one-off; paused subscription skips generation.

## shadcn/ui components
`Table`, `Badge` (status), `Progress` (entitlement usage), `Card`, `Dialog` (renew/cancel), `Calendar` (visit view).

## Use cases
- Bengaluru Pro: unlimited gas refills, zero service charge, priority dispatch.
- B2B quarterly VRF maintenance across sites.

## Edge cases
- Customer moves house/site → transfer subscription.
- Renewal payment fails → grace period + reminder before lapse.
- Overlapping one-off + AMC visit same day → merge into one trip.

## Workflow & automation
- Daily visit generation; renewal + lapse automations; usage metering.
- Feeds retention metrics in [[F12-Reports-and-Analytics]].

## Data touched
`subscriptions`, `subscription_visits`, `jobs`, `contracts`, `invoices`, `payments`.

## Dependencies
[[F07-Contracts-and-Templates]] · [[F03-Appointments-and-Scheduling]] · [[F09-Invoicing-and-Payments]]
