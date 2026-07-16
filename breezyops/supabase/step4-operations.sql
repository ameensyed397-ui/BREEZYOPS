-- Step 4: Operations tables
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

SELECT 'Step 4: Operations tables created' as status;
