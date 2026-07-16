-- Step 8: Seed data - Customers & Sites
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

INSERT INTO sites (id, customer_id, label, address, locality_id) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Home', '402, Green Apts, Andheri West', 'a1111111-1111-1111-1111-111111111111'),
  ('d2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', 'Office HQ', '15th Floor, Techno Park, Powai', 'a4444444-4444-4444-4444-444444444444'),
  ('d3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'Branch Office', '5th Floor, Techno Park, Powai', 'a4444444-4444-4444-4444-444444444444'),
  ('d4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'Main Building', 'Green Valley, Juhu', 'a3333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

SELECT 'Step 8: Customers & sites seeded' as status;
