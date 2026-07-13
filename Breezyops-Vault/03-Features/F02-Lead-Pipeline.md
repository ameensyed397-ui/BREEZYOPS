---
tags: [feature]
status: draft
phase: 1
---
# F02 — Lead Pipeline

## Purpose
Track conversion with **two separate boards** because B2C and B2B cycles differ fundamentally (see [[Userflow-Index]]). B2C is fast/pay-on-completion; B2B is survey→contract→terms.

## Users / roles
admin, ops (both boards) · b2b_manager (B2B board) · technician (none).

## User flows
1. **B2C board:** `new → qualified → booked → completed → paid → retained` (lost at any stage). Cards are leads/jobs; drag to move stage.
2. **B2B board (deals):** `new → qualified → survey → proposal → negotiation → won → lost`. On **won**, spawn a contract ([[F07-Contracts-and-Templates]]) + subscription ([[F08-AMC-Subscriptions]]).
3. Filter by locality, source, owner, value; search by name/phone.

## UI states
- **Empty:** per-column empty hint + "Add lead".
- **Loading:** column skeletons.
- **Populated:** kanban columns with cards (value, locality, age chip).
- **Error:** stage-change failure → card reverts + toast.
- **Edge:** stalled deal (no movement > N days) → "aging" red chip; won B2B missing GST decision → blocked with prompt.

## shadcn/ui components
`Tabs` (B2C / B2B), `Card`, `Badge`, `DropdownMenu`, `Dialog` (stage change + reason), `Select`, `Input` (search). Drag-drop via dnd-kit styled with shadcn tokens.

## Use cases
- B2C lead booked same day → moves to completed after service.
- B2B office AMC: survey scheduled, quote sent, negotiated, signed → auto-creates recurring contract.

## Edge cases
- Lead reopened after "lost" → re-enters pipeline with history intact.
- B2B deal with multiple sites → single deal, sites attached ([[F05-Customers-and-Accounts]]).
- Won B2B where `gst_required=true` but business is pre-GST → hard warning (see [[Gaps-and-Open-Questions]]).

## Workflow & automation
- Stage changes logged; aging timer per stage.
- **Won B2B** → trigger contract + subscription + onboarding checklist.
- Conversion metrics streamed to [[F12-Reports-and-Analytics]].

## Data touched
`leads`, `deals`, `customers`, `sites`, `activity_log`.

## Dependencies
[[F01-Unified-Lead-Inbox]] · [[F06-Quotes-and-Proposals]] · [[F07-Contracts-and-Templates]]
