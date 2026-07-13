---
tags: [architecture]
---
# System Architecture

## Shape
A **Next.js monolith** on Vercel talking to a **single Supabase project**. No microservices — deliberately. One repo, one DB, one storage account. Simplicity is the feature at this scale.

## Flow of a request
1. **Browser (PWA)** → Next.js route / server action.
2. Server action → **Drizzle** → **Supabase Postgres** (RLS enforces role).
3. Files → **Supabase Storage** (signed URLs; per-client folders).
4. Live updates → **Supabase Realtime** channels (inbox, dispatch board).
5. Outbound → **Resend** (email), **AiSensy** (WhatsApp), **Razorpay** (payment links).
6. Inbound → `/api/webhooks/*` receive events from Breezy agent, AiSensy, Razorpay → write to DB.
7. **Cron** (Vercel + `pg_cron`) → generate AMC visits, fire renewal/SLA/follow-up jobs.

## Lead intake ("one brain, many channels")
The **Breezy** agent (voice, WhatsApp, web chat) is the front door. Each channel posts to a single `POST /api/webhooks/lead` endpoint with a normalised payload → one row in `leads`. The unified inbox ([[F01-Unified-Lead-Inbox]]) is the only place staff triage leads, regardless of channel.

```
Voice (Bolna/Exotel) ─┐
WhatsApp (AiSensy) ────┤→ /api/webhooks/lead → leads table → Unified Inbox
Web chat widget ───────┤
Web form / Call Me ────┘
```

## Storage layout (per-client folders)
```
bucket: client-media/
  {customer_id}/
    photos/{job_id}/before/*.jpg
    photos/{job_id}/after/*.jpg
    photos/{job_id}/issue/*.jpg
  documents/
    {customer_id}/contracts/*.pdf
    {customer_id}/invoices/*.pdf
    {customer_id}/reports/*.pdf
```
Access via signed URLs; Storage RLS mirrors table RLS (technician sees only assigned-job folders). See [[F10-Document-and-Media-Repository]].

## Key architectural choices
- **Server actions over REST** for internal mutations; REST webhooks only for external callers.
- **RLS as the security backbone** — never trust the client; the DB decides. See [[RBAC-and-Security]].
- **Soft deletes + activity log** everywhere for dispute protection and auditability.
- **GST-ready schema now** — invoice tables carry nullable GST fields so registration is a config flip, not a migration.
- **Mobile-first PWA** — installable, offline-tolerant for the technician flow (patchy signal on rooftops/basements). See [[Gaps-and-Open-Questions]].

## Related
[[Tech-Stack]] · [[Data-Model]] · [[Integrations]] · [[Environments-and-Deployment]]
