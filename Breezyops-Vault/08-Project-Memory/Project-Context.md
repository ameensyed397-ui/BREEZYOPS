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
- **v0.8** (2026-07-14): Production-ready build. All 9 pages + settings wired to real Supabase DB via HTTPS client (direct PG blocked by IPv6). 19 query functions, 7 server actions with revalidation. RLS applied to live project (20 policies, 13 tables). Rate limiting on auth + webhook. Vitest with 21 tests. Security hardening complete. Zero mock data in production code paths. All `as any` casts removed, ESLint + React 19 strict mode compliant. ScrollArea, Table, Checkbox shadcn components applied. Optimistic state patterns throughout (no setState-in-effect). Build: 16 routes, zero errors. Commit `38eef8b` — 80 files, +9362/-1413 lines. Live feature-by-feature state: [[Build-Status]]. Change-by-change reasoning: [[Build-Log]].
- Asad is running opencode concurrently in the same working directory to parallelize feature-building. Working split in practice: Claude Code owns F01/F02/F03, schema/RLS additions, security audits, and vault docs; opencode has taken F04/F05/F09. Both edit `lib/db/schema.ts` — coordination has held up so far (additive changes only, reused the same customer/site/technician ids), verified by running `tsc --noEmit` + `next build` against the full combined tree before each commit.
- Next action: Phase 1 exit criteria (10 real jobs run fully through Breezyops). See [[Gaps-and-Open-Questions]] for remaining items.
