---
tags: [roadmap, decisions]
---
# Decision Log

| # | Decision | Why | Date/Status |
|---|---|---|---|
| D1 | Build custom (Breezyops) instead of Notion/Jobber | Owner wants end-to-end ownership; no Zoho; single place for both segments | Accepted |
| D2 | Supabase as backend | Open-source Postgres = ownership + free tier + RLS-native RBAC + storage + realtime in one | Accepted |
| D3 | shadcn/ui for all UI | Requested; owned copy-in components, Radix a11y, matches Tailwind stack | Accepted |
| D4 | Drizzle over Prisma | Lighter, TS-first, serverless-friendly, closer to SQL for RLS work | Accepted |
| D5 | @react-pdf/renderer for PDFs | No headless Chrome cost/complexity on Vercel; React templates match stack | Accepted |
| D6 | Keep Razorpay + AiSensy as rails | Payments + WhatsApp API are regulated; cannot be self-built. System of record stays ours | Accepted |
| D7 | Two pipelines (B2C fast / B2B deal) | Fundamentally different cycles; forcing one board loses B2B stages | Accepted |
| D8 | GST-ready schema from day one | Registration becomes a config flip, not a migration | Accepted |
| D9 | Mobile-first PWA, no native app v1 | Solo operator; installable PWA covers field use at zero store overhead | Accepted |
| D10 | RLS as primary RBAC enforcement | UI checks can be bypassed; the database cannot | Accepted |
| D11 | Retire Zoho after Phase 1 exit criteria | Run 10 real jobs through first — no big-bang cutover | Accepted |
