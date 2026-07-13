---
tags: [feature]
status: draft
phase: 2
---
# F12 — Reports & Analytics

## Purpose
Dashboards answering the questions in [[Success-Metrics]]: where leads come from, how fast we respond, what converts, revenue by segment/locality, AMC health, technician utilisation.

## Users / roles
admin (all) · finance (financial) · ops (operational) · b2b_manager (B2B revenue) · technician (own utilisation only).

## User flows
1. Open dashboard → date-range picker → cards + charts render from SQL views.
2. Drill: click a metric → filtered underlying table (e.g. "12 overdue invoices" → invoice list).
3. Export CSV for the CA / planning.

## UI states
- **Empty:** "Not enough data yet" per widget with what feeds it.
- **Loading:** chart skeletons.
- **Populated:** KPI cards (response time, conversion, revenue, AMC renewals), line/bar charts, locality heat-list.
- **Error:** query timeout → per-widget retry, rest of dashboard unaffected.
- **Edge:** date range predating data → graceful zero-state, not an error.

## shadcn/ui components
`Card` (KPIs), `Tabs` (Funnel/Revenue/Ops/AMC), `Select`/`Calendar` (range), `Table` (drill-down), charts via Recharts styled with shadcn tokens, `Skeleton`.

## Use cases
- Monday review: last week's leads by channel, response-time median vs 30-min promise.
- Deciding ad spend: source ROI before switching on paid channels (Day 30–90 GTM gate).

## Edge cases
- Role-scoped data (RLS applies to report queries too — a technician's dashboard physically can't aggregate others' jobs).
- Timezone: all reporting in IST regardless of server TZ.

## Workflow & automation
- Materialised views refreshed nightly for heavy aggregates; light KPIs live.
- Weekly digest email to admin (optional).

## Data touched
Read-only over most tables via reporting views; `activity_log`.

## Dependencies
[[Success-Metrics]] · [[F13-Admin-RBAC-Settings]]
