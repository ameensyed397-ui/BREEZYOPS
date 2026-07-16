const postgres = require("postgres");

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL required"); process.exit(1); }

const sql = postgres(url, { connect_timeout: 10, ip4: true });

async function main() {
  const tables = await sql.unsafe(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`);
  console.log("Existing tables:", tables.map(t => t.tablename));

  // Drop old drizzle tables if any
  await sql.unsafe(`DROP SCHEMA IF EXISTS drizzle CASCADE`);

  // Enums
  await sql.unsafe(`DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'ops', 'technician', 'b2b_manager', 'finance', 'viewer');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await sql.unsafe(`DO $$ BEGIN
    CREATE TYPE segment AS ENUM ('b2c', 'b2b');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await sql.unsafe(`DO $$ BEGIN
    CREATE TYPE lead_channel AS ENUM ('voice', 'whatsapp', 'webchat', 'webform', 'referral', 'walkin');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await sql.unsafe(`DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM ('new', 'qualified', 'booked', 'completed', 'paid', 'retained', 'lost');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await sql.unsafe(`DO $$ BEGIN
    CREATE TYPE deal_stage AS ENUM ('new', 'qualified', 'survey', 'proposal', 'negotiation', 'won', 'lost');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await sql.unsafe(`DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('scheduled', 'dispatched', 'in_progress', 'completed', 'cancelled');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await sql.unsafe(`DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'void');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await sql.unsafe(`DO $$ BEGIN
    CREATE TYPE media_category AS ENUM ('before', 'after', 'issue', 'other');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await sql.unsafe(`DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('invoice', 'quote', 'contract', 'sop', 'report', 'other');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  await sql.unsafe(`DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'rescheduled', 'cancelled', 'no_show', 'done');
  EXCEPTION WHEN duplicate_object THEN null; END $$`);

  // Tables
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS localities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY,
      full_name TEXT,
      role user_role NOT NULL DEFAULT 'viewer',
      phone TEXT,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    )`);

  await sql.unsafe(`
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
    )`);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS sites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
      label TEXT,
      address TEXT,
      locality_id UUID REFERENCES localities(id),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`);

  await sql.unsafe(`
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
      assigned_to UUID REFERENCES profiles(id),
      sla_due_at TIMESTAMPTZ,
      lost_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS deals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID REFERENCES customers(id),
      lead_id UUID REFERENCES leads(id),
      title TEXT NOT NULL,
      stage deal_stage NOT NULL DEFAULT 'new',
      value NUMERIC,
      locality_id UUID REFERENCES localities(id),
      owner_id UUID REFERENCES profiles(id),
      gst_required BOOLEAN DEFAULT false,
      last_activity_at TIMESTAMPTZ DEFAULT now(),
      lost_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS service_catalog (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      segment segment DEFAULT 'b2c',
      price NUMERIC,
      cost NUMERIC,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`);

  await sql.unsafe(`
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
    )`);

  await sql.unsafe(`
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
    )`);

  await sql.unsafe(`
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
    )`);

  await sql.unsafe(`
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
    )`);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS media (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID REFERENCES customers(id),
      job_id UUID REFERENCES jobs(id),
      category media_category DEFAULT 'other',
      storage_path TEXT,
      created_by UUID REFERENCES profiles(id),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS consents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID REFERENCES customers(id),
      channel TEXT,
      opted_in BOOLEAN DEFAULT false,
      source TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`);

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      actor UUID REFERENCES profiles(id),
      entity TEXT,
      entity_id UUID,
      action TEXT,
      meta JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    )`);

  // Indexes
  const indexes = [
    `CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status)`,
    `CREATE INDEX IF NOT EXISTS leads_channel_idx ON leads(channel)`,
    `CREATE INDEX IF NOT EXISTS leads_assigned_to_idx ON leads(assigned_to)`,
    `CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at)`,
    `CREATE INDEX IF NOT EXISTS leads_sla_due_at_idx ON leads(sla_due_at)`,
    `CREATE INDEX IF NOT EXISTS deals_stage_idx ON deals(stage)`,
    `CREATE INDEX IF NOT EXISTS deals_owner_id_idx ON deals(owner_id)`,
    `CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs(status)`,
    `CREATE INDEX IF NOT EXISTS jobs_technician_id_idx ON jobs(technician_id)`,
    `CREATE INDEX IF NOT EXISTS jobs_scheduled_at_idx ON jobs(scheduled_at)`,
    `CREATE INDEX IF NOT EXISTS jobs_customer_id_idx ON jobs(customer_id)`,
    `CREATE INDEX IF NOT EXISTS appointments_technician_id_idx ON appointments(technician_id)`,
    `CREATE INDEX IF NOT EXISTS appointments_start_at_idx ON appointments(start_at)`,
    `CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status)`,
    `CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status)`,
    `CREATE INDEX IF NOT EXISTS invoices_customer_id_idx ON invoices(customer_id)`,
    `CREATE INDEX IF NOT EXISTS invoices_number_idx ON invoices(number)`,
    `CREATE INDEX IF NOT EXISTS documents_customer_id_idx ON documents(customer_id)`,
    `CREATE INDEX IF NOT EXISTS documents_type_idx ON documents(type)`,
    `CREATE INDEX IF NOT EXISTS customers_locality_id_idx ON customers(locality_id)`,
    `CREATE INDEX IF NOT EXISTS customers_deleted_at_idx ON customers(deleted_at)`,
    `CREATE INDEX IF NOT EXISTS activity_log_entity_idx ON activity_log(entity, entity_id)`,
  ];

  for (const idx of indexes) {
    await sql.unsafe(idx);
  }

  console.log("Schema pushed successfully!");

  // Verify
  const tables2 = await sql.unsafe(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`);
  console.log("Tables now:", tables2.map(t => t.tablename));

  const idxCount = await sql.unsafe(`SELECT count(*) as cnt FROM pg_indexes WHERE schemaname = 'public'`);
  console.log("Index count:", idxCount[0].cnt);

  await sql.end();
}

main().catch(e => { console.error(e); process.exit(1); });
