# Breezyops — Phase 1 scaffold

The operations platform for Breezyair. This is the **Phase 1 core**: auth + RBAC (via Supabase RLS), the data model (Drizzle), the unified **lead inbox**, and the lead intake webhook. See the [Breezyops vault] PRD for the full spec.

Stack: Next.js 15 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Supabase (Postgres + Auth + Storage + RLS) · Drizzle ORM.

## Quick start
```bash
pnpm install            # or npm install

# 1. Add the shadcn primitives this scaffold imports:
npx shadcn@latest init   # accept defaults; uses components.json
npx shadcn@latest add button badge table sheet input textarea select \
  card tabs dropdown-menu sonner skeleton avatar separator

# 2. Create a Supabase project (free tier), then set env:
cp .env.example .env.local   # fill in the values

# 3. Push schema + RLS policies:
pnpm db:push                              # creates tables
psql "$DATABASE_URL" -f supabase/policies.sql   # applies RLS
psql "$DATABASE_URL" -f supabase/seed.sql       # localities + catalog + sample leads

# 4. Run:
pnpm dev     # http://localhost:3000
```

> No Supabase yet? The lead inbox falls back to sample data (`lib/db/mock.ts`) so you can see the UI immediately. Everything else needs the DB.

## What's here
- `lib/db/schema.ts` — Drizzle schema (Phase 1 tables + enums)
- `supabase/policies.sql` — Row-Level Security = the RBAC matrix, enforced in the DB
- `supabase/seed.sql` — service areas, service catalog, sample leads
- `app/api/webhooks/lead/route.ts` — single intake endpoint for Breezy/AiSensy/webform
- `app/(app)/leads` + `components/leads` — the unified lead inbox
- `lib/supabase/*` — SSR auth clients + session middleware
- `lib/auth/roles.ts` — role helpers mirrored from RLS

## Next
Wire the pipeline (F02), scheduling (F03), work orders (F04) and in-house invoicing (F09) per the roadmap.
