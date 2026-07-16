-- Add CRUD + template columns to invoices table
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'invoice',
  ADD COLUMN IF NOT EXISTS items jsonb,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS terms text,
  ADD COLUMN IF NOT EXISTS validity_days integer;

-- Index for filtering by type (invoice vs quotation)
CREATE INDEX IF NOT EXISTS invoices_type_idx ON invoices (type);
