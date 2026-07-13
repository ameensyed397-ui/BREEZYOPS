---
tags: [architecture, data]
---
# Data Model

Postgres via Drizzle. Every table has `id (uuid)`, `created_at`, `updated_at`, `created_by`, and (where relevant) `deleted_at` (soft delete). RLS policies reference `auth.uid()` and the user's role in `profiles`.

## Core entities & relationships
- `profiles` — app users, 1:1 with Supabase `auth.users`, holds `role`.
- `customers` — a household (B2C) **or** company (B2B), distinguished by `segment`.
- `sites` — physical locations under a customer (B2B multi-site; B2C usually one).
- `contacts` — people at a B2B customer (facility manager, procurement).
- `leads` — every inbound, any channel; converts into a customer + optional job/deal.
- `deals` — B2B opportunity records with stage (B2C uses `leads`→`jobs` directly).
- `appointments` — scheduled slots (link to job).
- `jobs` (work orders) — the operational unit of delivery.
- `job_checklist_items` + `checklist_templates` — standardised inspection.
- `service_catalog` — services with `price` and `cost` (cost hidden from technician via RLS → margin protection).
- `quotes` + `quote_items` — B2B proposals.
- `contracts` + `contract_templates` — service + AMC agreements, with preview/approval.
- `subscriptions` (AMC) + `subscription_visits` — plans and their auto-generated visits.
- `invoices` + `invoice_items` — in-house, pre-GST, GST-ready fields.
- `payments` — UPI/Razorpay/cash records; reconcile against invoices.
- `documents` — repository index (type, category, storage path, linked entity).
- `media` — photos (job_id, category before/after/issue, storage path).
- `automations` / `follow_ups` — scheduled comms (thank-you, review, renewal, reactivation).
- `consents` — WhatsApp/marketing opt-in/out for TRAI/DND compliance.
- `reviews` — capture + status (requested/left), feeds local SEO.
- `activity_log` — append-only audit of who did what.
- `localities` — the 5 service areas (routing + reporting).

## Schema sketch (abridged DDL)
```sql
create type user_role as enum ('admin','ops','technician','b2b_manager','finance','viewer');
create type segment as enum ('b2c','b2b');
create type lead_channel as enum ('voice','whatsapp','webchat','webform','referral','walkin');
create type lead_status as enum ('new','qualified','booked','won','lost');
create type job_status as enum ('scheduled','dispatched','in_progress','completed','cancelled');
create type deal_stage as enum ('new','qualified','survey','proposal','negotiation','won','lost');
create type invoice_status as enum ('draft','sent','paid','overdue','void');
create type media_category as enum ('before','after','issue','other');

create table profiles (
  id uuid primary key references auth.users,
  full_name text, role user_role not null default 'viewer',
  phone text, active boolean default true, created_at timestamptz default now());

create table customers (
  id uuid primary key default gen_random_uuid(),
  segment segment not null,
  name text not null, phone text, email text,
  locality_id uuid references localities, gst_required boolean default false,
  gstin text, notes text, deleted_at timestamptz, created_at timestamptz default now());

create table sites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers on delete cascade,
  label text, address text, locality_id uuid references localities);

create table leads (
  id uuid primary key default gen_random_uuid(),
  channel lead_channel not null, source text, segment segment default 'b2c',
  name text, phone text, message text, urgent boolean default false,
  locality_id uuid references localities, status lead_status default 'new',
  ai_disclosed boolean default true,       -- Breezy declared it was AI
  customer_id uuid references customers,    -- set on conversion
  assigned_to uuid references profiles, sla_due_at timestamptz,
  created_at timestamptz default now());

create table jobs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers, site_id uuid references sites,
  lead_id uuid references leads, subscription_id uuid references subscriptions,
  technician_id uuid references profiles, status job_status default 'scheduled',
  scheduled_at timestamptz, service_ids uuid[], summary text,
  warranty_until date, created_at timestamptz default now());

create table service_catalog (
  id uuid primary key default gen_random_uuid(),
  name text, segment segment, price numeric, cost numeric,   -- cost RLS-restricted
  active boolean default true);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers, job_id uuid references jobs,
  number text unique, status invoice_status default 'draft',
  subtotal numeric, gst_applicable boolean default false,    -- GST-ready
  gst_rate numeric, gst_amount numeric, total numeric,
  issued_at timestamptz, due_at timestamptz, pdf_path text);

create table subscriptions (              -- AMC (B2C plans + B2B contracts)
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers, plan text, segment segment,
  cycle text, price numeric, next_service_date date, renewal_date date,
  status text default 'active', contract_id uuid references contracts);

create table subscription_visits (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references subscriptions, due_date date,
  job_id uuid references jobs, status text default 'due');

create table media (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers, job_id uuid references jobs,
  category media_category, storage_path text, created_by uuid references profiles);

create table consents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers, channel text,
  opted_in boolean, source text, updated_at timestamptz default now());

create table activity_log (
  id bigint generated always as identity primary key,
  actor uuid references profiles, entity text, entity_id uuid,
  action text, meta jsonb, created_at timestamptz default now());
```
(Tables for `deals`, `quotes`, `quote_items`, `contracts`, `contract_templates`, `documents`, `appointments`, `checklist_templates`, `job_checklist_items`, `payments`, `automations`, `reviews`, `localities` follow the same pattern.)

## Notes
- **Margin protection:** `service_catalog.cost` is only selectable by `admin`/`finance` (column-level RLS via a view for technicians exposing `price` only).
- **GST-ready:** invoice GST fields are nullable/false now; flip `gst_applicable` + populate `gstin` after registration — no schema change.
- **Per-client media:** `media.storage_path` = `{customer_id}/photos/{job_id}/{category}/...` mirroring the bucket layout in [[System-Architecture]].

## Related
[[RBAC-and-Security]] · [[Feature-Index]] · [[F09-Invoicing-and-Payments]] · [[F10-Document-and-Media-Repository]]
