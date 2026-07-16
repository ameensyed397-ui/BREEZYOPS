-- Step 1: Enums
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

SELECT 'Step 1: Enums created' as status;
