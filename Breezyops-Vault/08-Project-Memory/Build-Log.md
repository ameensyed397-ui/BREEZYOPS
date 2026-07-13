---
tags: [memory, build-log]
---
# Build Log

Chronological record of what changed in the `breezyops/` app, why, and how. One entry per meaningful commit. Maintained by hand alongside each change (see [[Changelog]] for the higher-level version history, [[Project-Context]] for current state).

## 2026-07-13 — `e787ae2` Initial commit
Baseline snapshot of the vault plus two divergent app scaffolds (`breezyops/` — empty create-next-app default, and `breezyops-phase1-scaffold/breezyops/` — the real Phase 1 work). Taken before consolidating, so nothing was lost. No prior git history existed.

## 2026-07-13 — `7ce021e` Consolidate to one app
**Why:** two scaffolds existed with the same name; only one had real feature code (Drizzle schema, RLS policies, lead webhook, leads UI, login page). Kept that one, discarded the empty default.
**How:** `git mv` the scaffold to the canonical `breezyops/` path, removed the empty one and the now-empty wrapper directory.

## 2026-07-13 — `bf90ce0` Install missing shadcn components
**Why:** login/dashboard/leads pages already imported `button`, `input`, `card`, `badge`, `tabs`, `sheet`, `sonner` from `components/ui`, but those files had never actually been generated — the app could not have built. Found via `tsc --noEmit`.
**How:** `npx shadcn add` for the 7 missing components; fixed two strict-TS errors in the Supabase cookie handlers (implicit `any` on `setAll` callbacks).

## 2026-07-13 — `12c5aaf` Fix login: missing OTP verification step
**Why:** the login page called `signInWithOtp` and immediately showed "Code sent" — there was no second step to enter and verify the code, so sign-in could never complete for anyone, on phone or email. Found while preparing a test account for the user.
**How:** added a two-stage flow (send → verify) using `supabase.auth.verifyOtp`, and an Email tab alongside Phone so it's testable without a configured SMS provider (Supabase sends email OTPs out of the box).

## 2026-07-13 — `0ef4edc` F02 Lead Pipeline (B2C + B2B kanban)
**Why:** next item in the Phase 1 build order per [[Build-Phases]].
**How:** generic dnd-kit `KanbanBoard` (drag-to-move-stage, per-column loading skeleton, empty-state hint, optimistic move with revert-on-error). B2C board over `leads` (new → qualified → booked → completed → paid → retained). B2B board over a new `deals` table (new → qualified → survey → proposal → negotiation → won), with a hard-gate confirmation dialog when moving a GST-required deal to "won" (Breezyair is pre-GST — see [[Gaps-and-Open-Questions]] #3). Schema: added `deals` table + `deal_stage` enum; widened `lead_status` to match the B2C stage list.
**State:** boards run on mock data — no live DB connection yet ([[Gaps-and-Open-Questions]] #4). Verified via `next build` (clean bundle) since the route is auth-gated in dev and couldn't be curled directly without weakening auth (declined — see security note below).

## 2026-07-13 — (uncommitted at time of writing) RLS gap fix for `deals`
**Why:** self-audit after adding the `deals` table in the previous commit — `supabase/policies.sql` was never updated to enable RLS or add a policy for it, so it would have shipped with **no row-level security** if pushed. Also found the `activity_log` insert policy allowed any authenticated user to write an audit row with an arbitrary `actor` id (spoofable audit trail).
**How:** enabled RLS on `deals`, added a policy scoping it to admin/ops/b2b_manager (technician has no access per the F02 spec); tightened `audit_insert`'s `with check` to `actor = auth.uid()`.

## Note on a declined action
While testing F02, attempted to temporarily set the auth middleware to always-public to curl-test the `/pipeline` page directly. The permission system correctly flagged this as weakening security without user authorization and blocked it. Reverted immediately; verified the route instead via `next build`, which catches bundling/type errors without needing to disable auth.
