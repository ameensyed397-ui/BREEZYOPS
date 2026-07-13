---
tags: [memory]
---
# Project Context (living memory)

> Update this note as the project evolves — it's the "state of the world" snapshot for anyone (or any AI session) picking up the project.

## The business
- **Breezyair** — Bengaluru AC repair/maintenance; founder-operator **Asad Khan** (+91 86601 74569, asadkhanassu000@gmail.com), 15+ yrs, solo master technician.
- Areas: Koramangala, HSR Layout, Indiranagar, Whitefield, Bellandur. Segments: B2C residential + B2B commercial VRF/VRV.
- **Pre-GST** (shapes invoicing & B2B qualification). Domain: **breezyair.co** (GoDaddy; .in taken).
- Brand: doodle mascot system; Sky Blue `#14B5F8`, Navy `#0D47A1`, Charcoal `#1A1A1A`. Voice: playful-neighbourly, Kanglish/Hinglish OK.

## Existing assets Breezyops builds on
- Website: Next.js 15/TS/Tailwind v4 on Vercel (repo `ameensyed397-ui/wa`), breezyair.co live.
- **Breezy** AI agent: one brain, three channels — Bolna+Exotel (voice), AiSensy (WhatsApp), custom web chat widget (Anthropic API).
- Payments: Razorpay + UPI (kept as rails). Zoho Invoice: **being retired** by Breezyops Phase 1.
- CRM today: Notion (to be migrated). Automation: Make.com (superseded by in-app cron/webhooks).
- Full brand asset library: mascot poses, icon system, van wrap, posters, sticker pack, uniforms, IG carousel system.

## Operating principles (from working history)
- Test-first before paid infrastructure; free tiers until proven.
- Reactivation of past customers > new acquisition (highest near-term ROI).
- One clear recommendation, not menus of options.
- TRAI/DND compliance + AI disclosure are non-negotiable.
- Upgrade triggers pre-agreed: 2nd technician OR 15+ B2B contracts OR GST registration.

## Current status
- Breezyops fully specified in this vault (PRD, architecture, 13 features, 6 userflows, 7 SOPs, 5 template sets, 3-phase roadmap).
- Code build started 2026-07-13: real Supabase auth (email/phone OTP), F01 Lead Inbox (partial, mock data), F02 Lead Pipeline (B2C+B2B kanban, mock data) built and committed. Live feature-by-feature state: [[Build-Status]]. Change-by-change reasoning: [[Build-Log]].
- Asad supplied a live Supabase project (URL + anon key only so far); DB not yet connected (`DATABASE_URL`/service role key still needed) — everything currently runs on mock data. Asad is focused on getting the marketing site to prod in parallel; DB wiring is deferred until he's ready.
- Asad is also running a second AI coding tool (opencode) concurrently in the same working directory to parallelize feature-building. Coordination note: both tools editing the same shared files (`lib/db/schema.ts`, `lib/db/mock.ts`, nav layout) at once risks silent overwrites — recommend splitting by feature/file ownership and committing frequently.
- Next action: continue Phase 1 features in order (F03 Appointments, F04 Jobs, F05 Customers, F09 Invoicing, F10 Documents, F13 admin UI), then wire the real DB once Asad provides `DATABASE_URL` + service role key, then regression test + UX audit before declaring Phase 1 prod-ready. See [[Gaps-and-Open-Questions]] #4 for the still-pending data importer.
