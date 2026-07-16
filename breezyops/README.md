# Breezyops — HVAC Operations Platform

The internal operations platform for **Breezyair** HVAC & Home Services. Covers lead intake, pipeline management, scheduling, jobs, invoicing/quotations, customer records, and settings — all with Supabase RLS for RBAC.

Stack: Next.js 15 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Supabase (Postgres + Auth + Storage + RLS) · Drizzle ORM · jsPDF · @dnd-kit.

## Quick start
```bash
pnpm install            # or npm install

# 1. Add the shadcn primitives this scaffold imports:
npx shadcn@latest init   # accept defaults; uses components.json
npx shadcn@latest add button badge table sheet input textarea select \
  card tabs dropdown-menu sonner skeleton avatar separator dialog

# 2. Create a Supabase project (free tier), then set env:
cp .env.example .env.local   # fill in the values

# 3. Push schema + RLS policies:
pnpm db:push                              # creates tables
psql "$DATABASE_URL" -f supabase/policies.sql   # applies RLS
psql "$DATABASE_URL" -f supabase/seed.sql       # localities + catalog + sample leads

# 4. Run:
pnpm dev     # http://localhost:3000
```

> No Supabase yet? Every page falls back to sample data (`lib/db/mock.ts`) so you can see the full UI immediately.

## What's here

### Auth & RBAC
- `lib/supabase/*` — SSR auth clients + session middleware
- `lib/auth/roles.ts` — role helpers mirrored from RLS
- `app/login`, `app/signup`, `app/reset-password` — auth flows (email+password, phone OTP)

### Lead Inbox (F01)
- `app/(app)/leads` + `components/leads` — unified lead inbox with search, filters, detail sheet
- `app/api/webhooks/lead/route.ts` — single intake endpoint for Breezy/AiSensy/webform

### Pipeline Board (F02)
- `components/pipeline/kanban-board.tsx` — generic drag-and-drop board with Notion-style gripper handles
- `components/pipeline/b2b-board.tsx` / `b2c-board.tsx` — B2B deal and B2C lead boards
- `components/pipeline/deal-pipeline-card.tsx` / `lead-pipeline-card.tsx` — cards with stage/status labels
- `components/pipeline/deal-detail-sheet.tsx` / `lead-detail-pipeline-sheet.tsx` — click-to-open detail sheets
- GST confirmation dialog when moving deals to Won

### Scheduling (F03)
- `components/schedule/schedule-board.tsx` — Day / Week / Month views
- `components/schedule/month-view.tsx` — Notion-style month calendar grid
- `components/schedule/day-view.tsx` — time-grid day view with now indicator
- `components/schedule/week-view.tsx` — 7-column week overview
- `components/schedule/booking-sheet.tsx` — appointment creation form

### Jobs (F04)
- `components/jobs/job-list.tsx` — job list with status filters
- `components/jobs/job-detail-sheet.tsx` — tabs: Overview, Checklist, Photos

### Customers
- `components/customers/customer-list.tsx` — customer list (B2C/B2B filters)
- `components/customers/customer-detail-sheet.tsx` — tabs: Overview, Jobs, Invoices, Sites
- `app/(app)/customers/[id]/page.tsx` — full customer page

### Invoicing & Quotations (F09)
- `components/invoices/invoice-list.tsx` — invoice/quotation list with 5-tab filter
- `components/invoices/invoice-form-sheet.tsx` — create/edit form with line items, GST toggle
- `components/invoices/invoice-detail-sheet.tsx` — detail view with Preview, PDF download, status actions
- `components/invoices/template-selector.tsx` — Classic / Modern / Minimal template picker
- `lib/invoice/pdf-generator.ts` — jsPDF templates (all branded **BREEZYAIR**)
- `lib/db/queries.ts` — CRUD with mock fallback for offline mode

### Documents
- `components/docs/document-library.tsx` — document/photo library with filters
- `components/docs/document-detail-sheet.tsx` — detail view

### Settings
- `components/settings/settings-panel.tsx` — tabs: Catalog, Users, Localities, Integrations, Audit

### Data Layer
- `lib/db/schema.ts` — Drizzle schema (all tables + enums)
- `lib/db/mock.ts` — comprehensive mock data (leads, deals, jobs, customers, invoices, appointments)
- `lib/db/queries.ts` — Supabase queries with automatic mock fallback
- `supabase/policies.sql` — Row-Level Security = RBAC matrix
- `supabase/seed.sql` — localities, service catalog, sample data

## UI Patterns

### Sheet (Side Panel) Structure
All detail/form sheets follow a consistent pinned layout:
```
SheetHeader  (pinned top, border-b)
SheetBody    (flex-1, scrollable)
SheetFooter  (pinned bottom, border-t)
```

### Dark Mode
Full dark mode via next-themes (`attribute="class"`). All design tokens defined in `app/globals.css` with `.dark` overrides.

### Design Tokens
HSL CSS variables mapped via `@theme inline` in Tailwind v4. Colors: `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`.

## Project structure
```
app/
  (app)/           — authenticated layout (sidebar, header)
    leads/         — lead inbox
    pipeline/      — B2C/B2B kanban boards
    schedule/      — calendar (day/week/month)
    jobs/          — job list
    customers/     — customer list + detail pages
    invoices/      — invoices & quotations
    documents/     — document library
    settings/      — admin panel
  login/           — login (email + phone OTP)
  signup/          — registration
  reset-password/  — password reset
components/
  ui/              — shadcn primitives (sheet, tabs, card, etc.)
  layout/          — sidebar, header
  leads/           — lead inbox, detail sheet
  pipeline/        — kanban board, cards, detail sheets
  schedule/        — day/week/month views, booking sheet
  jobs/            — job list, detail sheet
  customers/       — customer list, detail sheet
  invoices/        — invoice list, form, detail, templates
  docs/            — document library, detail sheet
  settings/        — settings panel
lib/
  db/              — schema, queries, mock data
  invoice/         — PDF generator (jsPDF + autotable)
  supabase/        — SSR/CSR clients, middleware
  auth/            — role helpers
  format.ts        — currency, date formatters
```

## Next
- Wire work orders (F04 phase 2) per the roadmap
- Add AMC (Annual Maintenance Contract) management
- Map view for technician dispatch (Phase 2)
