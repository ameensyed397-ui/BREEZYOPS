---
tags: [userflow]
---
# UF2 — B2B Contract Cycle

**Actors:** B2B contact (facility manager), b2b_manager/admin, technician.

## Flow
1. B2B lead → qualify: sites count, system type (VRF/VRV), **gst_required?** ([[F02-Lead-Pipeline]] B2B board).
2. **Survey** visit booked → findings logged as a job with photos.
3. **Quote** built + preview + sent ([[F06-Quotes-and-Proposals]]) → negotiation, versioned.
4. **Won** → contract generated from template, previewed, signed ([[F07-Contracts-and-Templates]]).
5. Subscription created ([[F08-AMC-Subscriptions]]) → recurring visits auto-scheduled across sites.
6. Invoices on net terms with PO reference; overdue tracking ([[F09-Invoicing-and-Payments]]).
7. T-60 renewal alert → renewal quote → cycle repeats.

## Failure branches
- `gst_required=true` while pre-GST → hard warning at qualify AND before quote send (don't chase undeliverable deals).
- Negotiation stalls → aging chip at N days; nudge task.
- Lost → reason captured; auto re-engage at next season.
