---
tags: [userflow]
---
# UF3 — AMC Lifecycle

## Flow
1. Subscription active (plan, cycle, entitlements) — [[F08-AMC-Subscriptions]].
2. Cron generates the next `subscription_visit` → auto-books calendar slot → customer notified.
3. Visit runs as a normal job; entitlement usage metered (e.g. wet services used 2/4).
4. T-30 renewal reminder → T-7 second nudge → renew (payment link) or lapse.
5. Lapse → win-back segment for [[UF4-Reactivation-Broadcast]].

## Edge branches
- Entitlement exhausted mid-cycle → extra work billed one-off with clear messaging.
- Customer pauses (travel) → visits skip, renewal date shifts.
- Payment fails on renewal → grace period, then lapse.
