---
tags: [sop]
---
# SOP — Payment Collection

## B2C (on completion)
1. Generate invoice in the job → show total on screen.
2. Preferred: UPI QR from the invoice screen → auto-reconciles via webhook.
3. Cash: record amount in the payment dialog immediately (no memory-based entry later).
4. Deferred payment (rare): invoice `sent` + Razorpay link; note the promise date.

## B2B (net terms)
1. Invoice with PO reference + due date; email to the billing contact.
2. Overdue: automated reminder at D+3, personal call at D+7, escalate at D+14.

## Rules
- No work marked complete without invoice raised.
- Refund/void: finance/admin only, always with a reason (audit-logged).
