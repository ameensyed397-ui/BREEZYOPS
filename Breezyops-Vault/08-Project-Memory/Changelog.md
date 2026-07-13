---
tags: [memory]
---
# Changelog

- **v0.1** — Initial vault: full PRD, architecture (stack/system/data/RBAC/integrations/deploy), 13 feature specs with flows/UI states/use+edge cases, 6 userflows, 7 SOPs, contract/invoice/quote/comms templates, 3-phase roadmap, decision log, gaps analysis, project memory.
- **v0.2** (2026-07-13) — First real code: consolidated two divergent scaffolds into one `breezyops/` app, fixed a login flow that could never complete (missing OTP verify step), wired real Supabase auth (email + phone OTP), built F02 Lead Pipeline (B2C + B2B kanban, drag-to-move-stage). Added `deals` table + RLS policies. Git history started (previously uncommitted). Full detail in [[Build-Log]]; live status in [[Build-Status]].
- **v0.3** (2026-07-13) — Built F03 Appointments & Scheduling (day/week calendar, booking sheet with a real double-booking conflict guard). User started running a second AI tool (opencode) concurrently in the same working tree, which built F04 Jobs, F05 Customers, and F09 Invoicing (list+detail UI, mock data) in parallel. Verified the full combined app builds clean before committing. Closed an RLS gap on the new `deals` table and an audit-log spoofing gap found via self-audit.
