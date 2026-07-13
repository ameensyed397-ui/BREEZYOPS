---
tags: [architecture, devops]
---
# Environments & Deployment

## Environments
- **Local** — Next.js dev + Supabase local (CLI) or a `dev` Supabase project.
- **Preview** — every PR gets a Vercel preview deploy against the `dev` DB.
- **Production** — Vercel prod + `prod` Supabase project; app at `ops.breezyair.co`.

## CI/CD
- GitHub → Vercel auto-deploy on merge to `main`.
- Drizzle migrations run in CI (`drizzle-kit push`) against the target DB.
- RLS policies + storage rules versioned in `supabase/` and applied via the Supabase CLI.

## Scheduled jobs (cron)
| Job | Schedule | Action |
|---|---|---|
| Generate AMC visits | daily | Create `subscription_visits` due in the window |
| Renewal reminders | daily | Notify renewals at T-30 / T-7 |
| SLA watch | every 15 min | Flag leads past `sla_due_at` |
| Follow-ups | hourly | Fire thank-you / review requests |
| Backup export | daily | `pg_dump` → our own storage |

## Cost posture
Launch: Vercel Hobby + Supabase Free + Resend free + GA4 = **₹0**. Variable only: AiSensy/Razorpay per-use. Upgrade triggers documented in [[Build-Phases]].

## Related
[[Tech-Stack]] · [[Integrations]] · [[RBAC-and-Security]]
