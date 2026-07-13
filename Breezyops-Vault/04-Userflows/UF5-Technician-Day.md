---
tags: [userflow]
---
# UF5 — Technician Day (mobile PWA)

## Flow
1. Morning: opens PWA → **today's assigned jobs only** (RLS-enforced) with route order.
2. Taps job → customer, site, service history for that job's customer, checklist.
3. Navigates (map link) → on arrival taps **Start** → runs checklist → captures before photos.
4. Performs service → after photos → adds services/parts → **Complete**.
5. Shows UPI QR → payment recorded → next job.
6. End of day: own utilisation summary (jobs done, on-site time).

## Constraints honoured
- No pricing **cost**/margin visibility; no full customer DB; no other technicians' jobs.
- Offline-tolerant: checklist + photos queue and sync when signal returns.
