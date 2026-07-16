-- Breezyops Schema Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

-- Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'ops', 'technician', 'b2b_manager', 'finance', 'viewer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE segment AS ENUM ('b2c', 'b2b');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE lead_channel AS ENUM ('voice', 'whatsapp', 'webchat', 'webform', 'referral', 'walkin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('new', 'qualified', 'booked', 'completed', 'paid', 'retained', 'lost');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE deal_stage AS ENUM ('new', 'qualified', 'survey', 'proposal', 'negotiation', 'won', 'lost');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM ('scheduled', 'dispatched', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'void');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE media_category AS ENUM ('before', 'after', 'issue', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE document_type AS ENUM ('invoice', 'quote', 'contract', 'sop', 'report', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('scheduled', 'rescheduled', 'cancelled', 'no_show', 'done');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Tables
CREATE TABLE IF NOT EXISTS localities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment segment NOT NULL DEFAULT 'b2c',
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  locality_id UUID REFERENCES localities(id),
  gst_required BOOLEAN DEFAULT false,
  gstin TEXT,
  notes TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  label TEXT,
  address TEXT,
  locality_id UUID REFERENCES localities(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel lead_channel NOT NULL,
  source TEXT,
  segment segment DEFAULT 'b2c',
  name TEXT,
  phone TEXT,
  message TEXT,
  urgent BOOLEAN DEFAULT false,
  locality_id UUID REFERENCES localities(id),
  status lead_status DEFAULT 'new',
  ai_disclosed BOOLEAN DEFAULT true,
  customer_id UUID REFERENCES customers(id),
  assigned_to UUID REFERENCES profiles.id,
  sla_due_at TIMESTAMPTZ,
  lost_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  lead_id UUID REFERENCES leads(id),
  title TEXT NOT NULL,
  stage deal_stage NOT NULL DEFAULT 'new',
  value NUMERIC,
  locality_id UUID REFERENCES localities(id),
  owner_id UUID REFERENCES profiles.id,
  gst_required BOOLEAN DEFAULT false,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  lost_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  segment segment DEFAULT 'b2c',
  price NUMERIC,
  cost NUMERIC,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  site_id UUID REFERENCES sites(id),
  lead_id UUID REFERENCES leads(id),
  technician_id UUID REFERENCES profiles(id),
  status job_status DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ,
  summary TEXT,
  warranty_until DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  customer_id UUID REFERENCES customers(id),
  site_id UUID REFERENCES sites(id),
  technician_id UUID REFERENCES profiles(id),
  locality_id UUID REFERENCES localities(id),
  service_name TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  job_id UUID REFERENCES jobs(id),
  number TEXT UNIQUE,
  status invoice_status DEFAULT 'draft',
  subtotal NUMERIC,
  gst_applicable BOOLEAN DEFAULT false,
  gst_rate NUMERIC,
  gst_amount NUMERIC,
  total NUMERIC,
  issued_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  pdf_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  job_id UUID REFERENCES jobs(id),
  type document_type NOT NULL,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  job_id UUID REFERENCES jobs(id),
  category media_category DEFAULT 'other',
  storage_path TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  channel TEXT,
  opted_in BOOLEAN DEFAULT false,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor UUID REFERENCES profiles(id),
  entity TEXT,
  entity_id UUID,
  action TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_channel_idx ON leads(channel);
CREATE INDEX IF NOT EXISTS leads_assigned_to_idx ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at);
CREATE INDEX IF NOT EXISTS leads_sla_due_at_idx ON leads(sla_due_at);
CREATE INDEX IF NOT EXISTS deals_stage_idx ON deals(stage);
CREATE INDEX IF NOT EXISTS deals_owner_id_idx ON deals(owner_id);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs(status);
CREATE INDEX IF NOT EXISTS jobs_technician_id_idx ON jobs(technician_id);
CREATE INDEX IF NOT EXISTS jobs_scheduled_at_idx ON jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS jobs_customer_id_idx ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS appointments_technician_id_idx ON appointments(technician_id);
CREATE INDEX IF NOT EXISTS appointments_start_at_idx ON appointments(start_at);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status);
CREATE INDEX IF NOT EXISTS invoices_customer_id_idx ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS invoices_number_idx ON invoices(number);
CREATE INDEX IF NOT EXISTS documents_customer_id_idx ON documents(customer_id);
CREATE INDEX IF NOT EXISTS documents_type_idx ON documents(type);
CREATE INDEX IF NOT EXISTS customers_locality_id_idx ON customers(locality_id);
CREATE INDEX IF NOT EXISTS customers_deleted_at_idx ON customers(deleted_at);
CREATE INDEX IF NOT EXISTS activity_log_entity_idx ON activity_log(entity, entity_id);

-- Seed data (from mock.ts)
-- Localities
INSERT INTO localities (id, name) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Andheri West'),
  ('a2222222-2222-2222-2222-222222222222', 'Bandra'),
  ('a3333333-3333-3333-3333-333333333333', 'Juhu'),
  ('a4444444-4444-4444-4444-444444444444', 'Powai'),
  ('a5555555-5555-5555-5555-555555555555', 'Thane')
ON CONFLICT DO NOTHING;

-- Profiles (technicians / admin)
INSERT INTO profiles (id, full_name, role, phone) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'Asad Khan', 'admin', '+91 98200 12345'),
  ('b2222222-2222-2222-2222-222222222222', 'Ravi Kumar', 'technician', '+91 98200 23456'),
  ('b3333333-3333-3333-3333-333333333333', 'Priya Sharma', 'ops', '+91 98200 34567')
ON CONFLICT DO NOTHING;

-- Customers
INSERT INTO customers (id, segment, name, phone, email, locality_id, gst_required, notes) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'b2c', 'Amit Patel', '+91 98200 11111', 'amit@email.com', 'a1111111-1111-1111-1111-111111111111', false, 'Regular customer, AC maintenance'),
  ('c2222222-2222-2222-2222-222222222222', 'b2c', 'Neha Gupta', '+91 98200 22222', 'neha@email.com', 'a2222222-2222-2222-2222-222222222222', false, null),
  ('c3333333-3333-3333-3333-333333333333', 'b2b', 'TechCorp Solutions', '+91 98200 33333', 'info@techcorp.in', 'a4444444-4444-4444-4444-444444444444', true, 'Enterprise client, 3 office buildings'),
  ('c4444444-4444-4444-4444-444444444444', 'b2b', 'Green Valley Society', '+91 98200 44444', 'admin@greenvalley.in', 'a3333333-3333-3333-3333-333333333333', true, 'Residential complex, 200+ units'),
  ('c5555555-5555-5555-5555-555555555555', 'b2c', 'Sanjay Mehta', '+91 98200 55555', 'sanjay@email.com', 'a5555555-5555-5555-5555-555555555555', false, null),
  ('c6666666-6666-6666-6666-666666666666', 'b2c', 'Fatima Sheikh', '+91 98200 66666', 'fatima@email.com', 'a1111111-1111-1111-1111-111111111111', false, 'Referred by Amit Patel'),
  ('c7777777-7777-7777-7777-777777777777', 'b2b', 'Metro Hospitals', '+91 98200 77777', 'facilities@metro.in', 'a2222222-2222-2222-2222-222222222222', true, 'Hospital chain, SLA critical'),
  ('c8888888-8888-8888-8888-888888888888', 'b2c', 'Rajesh Singh', '+91 98200 88888', 'rajesh@email.com', 'a5555555-5555-5555-5555-555555555555', false, null)
ON CONFLICT DO NOTHING;

-- Sites
INSERT INTO sites (id, customer_id, label, address, locality_id) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Home', '402, Green Apts, Andheri West', 'a1111111-1111-1111-1111-111111111111'),
  ('d2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', 'Office HQ', '15th Floor, Techno Park, Powai', 'a4444444-4444-4444-4444-444444444444'),
  ('d3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'Branch Office', '5th Floor, Techno Park, Powai', 'a4444444-4444-4444-4444-444444444444'),
  ('d4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'Main Building', 'Green Valley, Juhu', 'a3333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- Leads
INSERT INTO leads (id, channel, source, segment, name, phone, message, urgent, locality_id, status, assigned_to, sla_due_at, created_at) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'whatsapp', 'Website', 'b2c', 'Karan Malhotra', '+91 98100 11111', 'AC not cooling, need urgent repair', true, 'a1111111-1111-1111-1111-111111111111', 'new', 'b1111111-1111-1111-1111-111111111111', now() + interval '30 minutes', now() - interval '10 minutes'),
  ('e2222222-2222-2222-2222-222222222222', 'voice', 'Walk-in', 'b2c', 'Sunita Reddy', '+91 98100 22222', 'Water heater installation needed', false, 'a2222222-2222-2222-2222-222222222222', 'qualified', 'b1111111-1111-1111-1111-111111111111', now() + interval '2 hours', now() - interval '3 hours'),
  ('e3333333-3333-3333-3333-333333333333', 'webchat', 'Google Ads', 'b2b', 'Facility Manager - TechCorp', '+91 98100 33333', 'Annual maintenance contract for 3 buildings', false, 'a4444444-4444-4444-4444-444444444444', 'new', null, now() + interval '4 hours', now() - interval '30 minutes'),
  ('e4444444-4444-4444-4444-444444444444', 'referral', 'Amit Patel', 'b2c', 'Vikram Joshi', '+91 98100 44444', 'Referred by Amit for AC servicing', false, 'a3333333-3333-3333-3333-333333333333', 'booked', 'b2222222-2222-2222-2222-222222222222', now() + interval '1 day', now() - interval '1 day'),
  ('e5555555-5555-5555-5555-555555555555', 'webform', 'JustDial', 'b2c', 'Meera Nair', '+91 98100 55555', 'Pest control for 2BHK apartment', false, 'a5555555-5555-5555-5555-555555555555', 'new', null, now() + interval '4 hours', now() - interval '5 minutes'),
  ('e6666666-6666-6666-6666-666666666666', 'whatsapp', 'Referral', 'b2b', 'Admin - Metro Hospitals', '+91 98100 66666', 'HVAC maintenance for 2 floors', true, 'a2222222-2222-2222-2222-222222222222', 'new', 'b1111111-1111-1111-1111-111111111111', now() + interval '20 minutes', now() - interval '25 minutes')
ON CONFLICT DO NOTHING;

-- Deals (B2B)
INSERT INTO deals (id, customer_id, lead_id, title, stage, value, locality_id, owner_id, gst_required, last_activity_at) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'e3333333-3333-3333-3333-333333333333', 'TechCorp Annual AMC', 'proposal', 480000, 'a4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', true, now() - interval '2 days'),
  ('f2222222-2222-2222-2222-222222222222', 'c4444444-4444-4444-4444-444444444444', null, 'Green Valley HVAC Upgrade', 'negotiation', 1250000, 'a3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', true, now() - interval '5 days'),
  ('f3333333-3333-3333-3333-333333333333', 'c7777777-7777-7777-7777-777777777777', 'e6666666-6666-6666-6666-666666666666', 'Metro Hospital HVAC Maintenance', 'survey', 360000, 'a2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', true, now() - interval '1 day'),
  ('f4444444-4444-4444-4444-444444444444', null, null, 'Bandra Office Complex', 'new', 750000, 'a2222222-2222-2222-2222-222222222222', null, false, now())
ON CONFLICT DO NOTHING;

-- Jobs
INSERT INTO jobs (id, customer_id, site_id, lead_id, technician_id, status, scheduled_at, summary, warranty_until) VALUES
  ('g1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', null, 'b2222222-2222-2222-2222-222222222222', 'scheduled', now() + interval '1 day', 'AC gas top-up and filter cleaning', null),
  ('g2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', null, 'b2222222-2222-2222-2222-222222222222', 'in_progress', now() - interval '2 hours', 'HVAC quarterly maintenance - Tower A', '2027-01-15'),
  ('g3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', null, 'e2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'completed', now() - interval '3 days', 'Water heater installation - 25L', null),
  ('g4444444-4444-4444-4444-444444444444', 'c5555555-5555-5555-5555-555555555555', null, null, 'b2222222-2222-2222-2222-222222222222', 'completed', now() - interval '7 days', 'Washing machine repair', null),
  ('g5555555-5555-5555-5555-555555555555', 'c6666666-6666-6666-6666-666666666666', null, null, 'b2222222-2222-2222-2222-222222222222', 'dispatched', now(), 'AC deep cleaning', null),
  ('g6666666-6666-6666-6666-666666666666', 'c8888888-8888-8888-8888-888888888888', null, null, 'b2222222-2222-2222-2222-222222222222', 'scheduled', now() + interval '2 days', 'Refrigerator gas refill', null),
  ('g7777777-7777-7777-7777-777777777777', 'c4444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', null, 'b2222222-2222-2222-2222-222222222222', 'completed', now() - interval '10 days', 'Generator servicing', null)
ON CONFLICT DO NOTHING;

-- Appointments
INSERT INTO appointments (id, job_id, customer_id, site_id, technician_id, locality_id, service_name, start_at, end_at, status, notes) VALUES
  ('h1111111-1111-1111-1111-111111111111', 'g1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'AC gas top-up', now() + interval '1 day' + time '10:00', now() + interval '1 day' + time '12:00', 'scheduled', 'Bring R410A gas'),
  ('h2222222-2222-2222-2222-222222222222', 'g5555555-5555-5555-5555-555555555555', 'c6666666-6666-6666-6666-666666666666', null, 'b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'AC deep cleaning', now() + time '14:00', now() + time '16:00', 'scheduled', null),
  ('h3333333-3333-3333-3333-333333333333', 'g6666666-6666-6666-6666-666666666666', 'c8888888-8888-8888-8888-888888888888', null, 'b2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', 'Refrigerator gas refill', now() + interval '2 days' + time '11:00', now() + interval '2 days' + time '13:00', 'scheduled', null),
  ('h4444444-4444-4444-4444-444444444444', null, 'c2222222-2222-2222-2222-222222222222', null, 'b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'Water heater follow-up', now() - interval '3 days' + time '10:00', now() - interval '3 days' + time '11:00', 'done', null),
  ('h5555555-5555-5555-5555-555555555555', 'g2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444', 'HVAC quarterly maintenance', now() - interval '2 hours', now() + interval '1 hour', 'scheduled', 'Tower A, floors 10-15'),
  ('h6666666-6666-6666-6666-666666666666', null, 'c5555555-5555-5555-5555-555555555555', null, 'b2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', 'Washing machine repair', now() - interval '7 days' + time '15:00', now() - interval '7 days' + time '17:00', 'done', null)
ON CONFLICT DO NOTHING;

-- Invoices
INSERT INTO invoices (id, customer_id, job_id, number, status, subtotal, gst_applicable, gst_rate, gst_amount, total, issued_at, due_at) VALUES
  ('i1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'g1111111-1111-1111-1111-111111111111', 'BRZ-2026-001', 'draft', 2500, false, null, null, 2500, null, now() + interval '30 days'),
  ('i2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', 'g2222222-2222-2222-2222-222222222222', 'BRZ-2026-002', 'sent', 45000, true, 18, 8100, 53100, now() - interval '5 days', now() + interval '25 days'),
  ('i3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'g3333333-3333-3333-3333-333333333333', 'BRZ-2026-003', 'paid', 8500, false, null, null, 8500, now() - interval '3 days', now() - interval '1 day'),
  ('i4444444-4444-4444-4444-444444444444', 'c5555555-5555-5555-5555-555555555555', 'g4444444-4444-4444-4444-444444444444', 'BRZ-2026-004', 'paid', 3200, false, null, null, 3200, now() - interval '7 days', now() - interval '5 days'),
  ('i5555555-5555-5555-5555-555555555555', 'c4444444-4444-4444-4444-444444444444', 'g7777777-7777-7777-7777-777777777777', 'BRZ-2026-005', 'overdue', 12000, true, 18, 2160, 14160, now() - interval '30 days', now() - interval '10 days'),
  ('i6666666-6666-6666-6666-666666666666', 'c3333333-3333-3333-3333-333333333333', null, 'BRZ-2026-006', 'sent', 28000, true, 18, 5040, 33040, now() - interval '2 days', now() + interval '28 days'),
  ('i7777777-7777-7777-7777-777777777777', 'c7777777-7777-7777-7777-777777777777', null, 'BRZ-2026-007', 'draft', 15000, true, 18, 2700, 17700, null, null)
ON CONFLICT DO NOTHING;

-- Service catalog
INSERT INTO service_catalog (id, name, segment, price, cost, active) VALUES
  ('s1111111-1111-1111-1111-111111111111', 'AC Gas Top-up', 'b2c', 2500, 800, true),
  ('s2222222-2222-2222-2222-222222222222', 'AC Deep Cleaning', 'b2c', 1500, 400, true),
  ('s3333333-3333-3333-3333-333333333333', 'Water Heater Installation', 'b2c', 8500, 5000, true),
  ('s4444444-4444-4444-4444-444444444444', 'Refrigerator Repair', 'b2c', 3200, 1200, true),
  ('s5555555-5555-5555-5555-555555555555', 'HVAC Quarterly Maintenance', 'b2b', 45000, 15000, true),
  ('s6666666-6666-6666-6666-666666666666', 'Annual Maintenance Contract', 'b2b', 480000, 180000, true),
  ('s7777777-7777-7777-7777-777777777777', 'Generator Servicing', 'b2b', 12000, 4500, true),
  ('s8888888-8888-8888-8888-888888888888', 'Pest Control - 2BHK', 'b2c', 2200, 600, true)
ON CONFLICT DO NOTHING;

-- Documents
INSERT INTO documents (id, customer_id, job_id, type, name, storage_path, created_by) VALUES
  ('j1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'g2222222-2222-2222-2222-222222222222', 'invoice', 'BRZ-2026-002.pdf', 'c3/invoices/BRZ-2026-002.pdf', 'b1111111-1111-1111-1111-111111111111'),
  ('j2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', null, 'contract', 'AMC_TechCorp_2026.pdf', 'c3/contracts/AMC_TechCorp_2026.pdf', 'b1111111-1111-1111-1111-111111111111'),
  ('j3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'g3333333-3333-3333-3333-333333333333', 'invoice', 'BRZ-2026-003.pdf', 'c2/invoices/BRZ-2026-003.pdf', 'b1111111-1111-1111-1111-111111111111'),
  ('j4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', null, 'report', 'Maintenance_Report_Q1.pdf', 'c1/reports/Maintenance_Report_Q1.pdf', 'b2222222-2222-2222-2222-222222222222'),
  ('j5555555-5555-5555-5555-555555555555', 'c4444444-4444-4444-4444-444444444444', null, 'contract', 'Green_Valley_Proposal.pdf', 'c4/contracts/Green_Valley_Proposal.pdf', 'b1111111-1111-1111-1111-111111111111'),
  ('j6666666-6666-6666-6666-666666666666', 'c3333333-3333-3333-3333-333333333333', 'g2222222-2222-2222-2222-222222222222', 'other', 'Site_Photos_TowerA.zip', 'c3/photos/Site_Photos_TowerA.zip', 'b2222222-2222-2222-2222-222222222222'),
  ('j7777777-7777-7777-7777-777777777777', 'c5555555-5555-5555-5555-555555555555', 'g4444444-4444-4444-4444-444444444444', 'receipt', 'Receipt_WashingMachine.pdf', 'c5/receipts/Receipt_WashingMachine.pdf', 'b2222222-2222-2222-2222-222222222222'),
  ('j8888888-8888-8888-8888-888888888888', 'c7777777-7777-7777-7777-777777777777', null, 'sop', 'Hospital_HVAC_SOP.pdf', 'c7/sops/Hospital_HVAC_SOP.pdf', 'b1111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Media
INSERT INTO media (id, customer_id, job_id, category, storage_path, created_by) VALUES
  ('k1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'g1111111-1111-1111-1111-111111111111', 'before', 'c1/photos/ac_before.jpg', 'b2222222-2222-2222-2222-222222222222'),
  ('k2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'g1111111-1111-1111-1111-111111111111', 'issue', 'c1/photos/ac_issue.jpg', 'b2222222-2222-2222-2222-222222222222'),
  ('k3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'g2222222-2222-2222-2222-222222222222', 'before', 'c3/photos/hvac_tower_a.jpg', 'b2222222-2222-2222-2222-222222222222'),
  ('k4444444-4444-4444-4444-444444444444', 'c5555555-5555-5555-5555-555555555555', 'g4444444-4444-4444-4444-444444444444', 'after', 'c5/photos/washing_machine_after.jpg', 'b2222222-2222-2222-2222-222222222222'),
  ('k5555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 'g3333333-3333-3333-3333-333333333333', 'after', 'c2/photos/heater_installed.jpg', 'b2222222-2222-2222-2222-222222222222'),
  ('k6666666-6666-6666-6666-666666666666', 'c4444444-4444-4444-4444-444444444444', 'g7777777-7777-7777-7777-777777777777', 'other', 'c4/photos/generator_service.jpg', 'b2222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- Verify
SELECT 'Schema + seed data applied successfully!' as result;
SELECT count(*) as locality_count FROM localities;
SELECT count(*) as customer_count FROM customers;
SELECT count(*) as lead_count FROM leads;
SELECT count(*) as deal_count FROM deals;
SELECT count(*) as job_count FROM jobs;
SELECT count(*) as appointment_count FROM appointments;
SELECT count(*) as invoice_count FROM invoices;
