---
tags: [architecture, integrations]
---
# Integrations

All external systems are **rails**, not systems of record. Each writes into our DB via a signed webhook or is called via a server action. If any is swapped, our data is untouched.

| Integration | Direction | Endpoint / method | Purpose |
|---|---|---|---|
| Breezy agent (voice/chat) | inbound | `POST /api/webhooks/lead` | Normalised lead → `leads` |
| AiSensy (WhatsApp) | in + out | webhook in; API out | Inbound replies → leads; templated sends; broadcasts |
| Bolna + Exotel (voice) | inbound | webhook → lead endpoint | Call leads + transcripts |
| Razorpay | in + out | payment links out; `POST /api/webhooks/payment` in (signature-verified) | Collect + reconcile payments |
| Resend | outbound | server action | Transactional email (invoices, confirmations) |
| GA4 | outbound | client | Public funnel analytics |
| Google Business Profile | manual/out | (Phase 2) | Push review requests, capture ratings |

## Webhook contract (lead)
```json
{ "channel":"whatsapp|voice|webchat|webform",
  "source":"campaign/ref", "name":"", "phone":"+91...",
  "message":"", "urgent":false, "locality":"HSR Layout",
  "ai_disclosed":true, "segment":"b2c|b2b" }
```
Idempotency by `(phone, channel, created_at bucket)` to avoid duplicate leads from retries.

## Compliance hooks
- **TRAI/DND + consent:** every outbound WhatsApp/marketing send checks `consents.opted_in`. Broadcasts exclude opt-outs. See [[F11-Followups-and-Automations]].
- **AI disclosure:** Breezy must declare it's an AI; recorded on the lead.

## Related
[[System-Architecture]] · [[F01-Unified-Lead-Inbox]] · [[F09-Invoicing-and-Payments]]
