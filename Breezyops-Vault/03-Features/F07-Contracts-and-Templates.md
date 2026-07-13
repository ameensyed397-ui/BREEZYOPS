---
tags: [feature]
status: draft
phase: 2
---
# F07 — Contracts & Templates

## Purpose
Generate service/AMC contracts from templates with live **preview**, capture approval/signature, and file them in the document repo. Owns the template library.

## Users / roles
admin, b2b_manager (full) · finance (view) · technician none.

## User flows
1. Pick a `contract_template` (Service Contract / AMC) → merge customer + terms → **live preview**.
2. Send for approval → customer approves (link / e-sign) → status `signed` → PDF filed under the client's folder.
3. On sign → create `subscription` ([[F08-AMC-Subscriptions]]) and onboarding job.

## UI states
- **Empty:** "No contracts."
- **Loading:** preview skeleton.
- **Populated:** template picker + merge fields + live PDF preview + status.
- **Error:** merge-field missing → highlighted; e-sign callback failure → retry.
- **Edge:** amendment to a signed contract → new version, old archived, history kept.

## shadcn/ui components
`Select` (template), `Form` (merge fields), `Dialog`/`ScrollArea` (preview), `Badge` (status), `Tabs`, `Button`.

## Use cases
- Annual AMC for a Bellandur commercial site with SLA clauses.
- B2C AMC plan agreement (Cool Starter / Bengaluru Pro / Villa Ultra).

## Edge cases
- Client edits terms → counter-version workflow.
- Contract expiry → renewal reminder + auto-draft renewal.
- Template updated → existing contracts unaffected (snapshot at sign time).

## Workflow & automation
- Signed → subscription + onboarding + filed document.
- Expiry/renewal reminders via cron.

## Data touched
`contracts`, `contract_templates`, `subscriptions`, `customers`, `documents`.

## Dependencies
[[F06-Quotes-and-Proposals]] · [[F08-AMC-Subscriptions]] · [[Template-Index]]
