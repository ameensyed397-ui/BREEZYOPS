-- Step 5: Documents, media, consents, activity log
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

SELECT 'Step 5: Documents, media, consents, activity_log created' as status;
