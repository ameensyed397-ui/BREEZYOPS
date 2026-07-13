---
tags: [architecture, stack]
---
# Tech Stack

## Decision (one line)
**Next.js 15 + TypeScript + Tailwind + shadcn/ui** on the front, **Supabase** (Postgres + Auth + Storage + Realtime + Row-Level Security) as the owned backend, glued with **Drizzle ORM**, PDFs via **@react-pdf/renderer**, email via **Resend**, WhatsApp via **AiSensy**, hosted on **Vercel**. Everything free-tier, self-hostable, no Zoho.

## Why this stack
- **Matches the existing website** (Next.js 15 / TS / Tailwind / Vercel) — reuse brand tokens, components, DNS, deployment muscle memory. Zero new paradigms.
- **"Ours end-to-end"** — Supabase is open-source Postgres. Our data, our schema, our logic. Can be self-hosted on our own server the day we want to; nothing is locked in a SaaS silo.
- **RLS = RBAC at the database.** Supabase Row-Level Security enforces the [[RBAC-and-Security]] matrix in the database itself, not just the UI. A technician physically cannot query cost/margin columns — the safest place to enforce permissions.
- **One backend replaces many tools.** Supabase gives Auth + Postgres + object Storage + Realtime + cron in a single free project → replaces Zoho (invoicing/CRM), a separate auth provider, and a separate file host.
- **Free to launch.** See cost table below. ₹0 until real scale.

## The stack, layer by layer
| Layer | Choice | Free tier | Why |
|---|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Vercel Hobby | SSR + API routes + server actions in one repo |
| UI | Tailwind CSS + **shadcn/ui** | free (copy-in components) | Requested; owned components, no runtime dep, Radix a11y |
| DB | Supabase **Postgres** | 500MB, 2 projects | Relational — perfect for accounts→sites→contracts→jobs |
| Auth | Supabase Auth (magic link / OTP / password) | 50k MAU | Integrates with RLS; phone OTP suits India |
| Storage | Supabase Storage (S3-compatible buckets) | 1GB | Per-client folders for photos + documents |
| Realtime | Supabase Realtime | included | Live inbox, dashboard, dispatch board |
| ORM | **Drizzle ORM** | free | TS-first, lightweight, serverless-friendly, SQL-close |
| PDF | `@react-pdf/renderer` | free | Invoices, quotes, contracts as React → PDF, no headless Chrome |
| Email | **Resend** | 3k emails/mo | Owned templates, great DX; or Supabase SMTP |
| WhatsApp | **AiSensy** (BSP) | pay-per-use | WhatsApp Business API can't be self-built — regulated rail |
| Voice / chat | Bolna + Exotel / custom widget | existing | Feed leads via webhook into the inbox |
| Payments | UPI QR + **Razorpay** payment links | pay-per-use | Payment gateway can't be self-built — regulated rail |
| Jobs/cron | Vercel Cron + Supabase `pg_cron` | free | AMC visit generation, renewal & SLA reminders |
| Analytics | GA4 (public funnel) + in-app activity log | free | |

## What "owned" means here (honest boundary)
Everything that holds **operational data and logic is ours** — Postgres, storage, auth, invoicing, documents. Two things stay as external **rails** because they're legally/technically impossible to self-build:
- **Razorpay** (money movement is regulated) — but invoices, records and reconciliation live in our DB.
- **AiSensy** (WhatsApp Business API access requires a Meta BSP) — but message logs and leads route into our DB.
Neither holds our system of record. If we ever swap them, our data is untouched.

## Repo shape
`breezyops/` — Next.js monorepo (single app). `app/` (routes) · `components/ui` (shadcn) · `lib/db` (Drizzle schema + queries) · `lib/auth` · `lib/pdf` · `lib/integrations` · `app/api/webhooks/*` (Breezy/AiSensy/Razorpay) · `drizzle/` (migrations) · `supabase/` (RLS policies, storage rules).

## Related
[[System-Architecture]] · [[Data-Model]] · [[RBAC-and-Security]] · [[Integrations]] · [[Environments-and-Deployment]]
