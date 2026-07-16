-- Step 7: Seed data - Localities & Profiles
INSERT INTO localities (id, name) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Andheri West'),
  ('a2222222-2222-2222-2222-222222222222', 'Bandra'),
  ('a3333333-3333-3333-3333-333333333333', 'Juhu'),
  ('a4444444-4444-4444-4444-444444444444', 'Powai'),
  ('a5555555-5555-5555-5555-555555555555', 'Thane')
ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, full_name, role, phone) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'Asad Khan', 'admin', '+91 98200 12345'),
  ('b2222222-2222-2222-2222-222222222222', 'Ravi Kumar', 'technician', '+91 98200 23456'),
  ('b3333333-3333-3333-3333-333333333333', 'Priya Sharma', 'ops', '+91 98200 34567')
ON CONFLICT DO NOTHING;

SELECT 'Step 7: Localities & profiles seeded' as status;
