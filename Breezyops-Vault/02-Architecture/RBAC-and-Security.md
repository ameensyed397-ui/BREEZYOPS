---
tags: [architecture, rbac, security]
---
# RBAC & Security

## Roles
`admin` (Asad/Syed) · `technician` · `ops` · `b2b_manager` · `finance` · `viewer`. Active now: **admin + technician**; others defined and dormant (activate at 2nd tech / 15+ B2B contracts).

## Permission matrix (enforced in DB, not just UI)
| Capability | admin | technician | ops | b2b_manager | finance |
|---|---|---|---|---|---|
| Leads & pipeline | full | assigned only | full | B2B only | view |
| Customer PII / full DB | full | assigned job only | full | B2B accounts | view |
| Price vs **cost/margin** | both | **price only** | price only | both | both |
| Job checklist + photos | full | own jobs | view all | view | — |
| Quotes & contracts | full | — | — | full | view |
| Invoicing & payments | full | collect on-site | — | raise B2B | full + refunds |
| Reactivation broadcasts | full | — | send | send B2B | — |
| Financial reports | full | own utilisation | ops metrics | B2B revenue | full |
| Settings / RBAC | full | — | — | — | — |

## Enforcement model
- **Supabase RLS** on every table. Policies check `auth.uid()` → `profiles.role`.
- **Technician isolation:** `jobs` policy = `technician_id = auth.uid()`; media/checklist inherit via `job_id`. Storage RLS mirrors this so signed URLs can't leak other clients' folders.
- **Margin protection:** technicians query a `service_catalog_public` view (price, no cost). Direct `cost` select denied.
- **Least privilege by default:** new users land as `viewer`.

## Security baseline
- Auth: Supabase Auth (phone OTP + email magic link). MFA for admin (Phase 2).
- Secrets in Vercel/Supabase env vars; never in the repo.
- Webhooks verify signatures (Razorpay/AiSensy) before writing.
- Soft deletes + `activity_log` for audit and dispute defence.
- **PII & consent:** `consents` table tracks WhatsApp/marketing opt-in per TRAI/DND; broadcasts filter to opted-in only. AI disclosure (`leads.ai_disclosed`) recorded.
- Backups: Supabase daily backups + scheduled `pg_dump` export to our own storage (data-ownership insurance).

## Related
[[Data-Model]] · [[F13-Admin-RBAC-Settings]] · [[F11-Followups-and-Automations]] · [[Gaps-and-Open-Questions]]
