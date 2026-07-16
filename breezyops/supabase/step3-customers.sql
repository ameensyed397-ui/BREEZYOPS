-- Step 3: Main tables with FK references
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
  assigned_to UUID REFERENCES profiles(id),
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
  owner_id UUID REFERENCES profiles(id),
  gst_required BOOLEAN DEFAULT false,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  lost_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

SELECT 'Step 3: Customers, sites, leads, deals created' as status;
