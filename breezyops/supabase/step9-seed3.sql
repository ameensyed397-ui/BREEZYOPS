-- Step 9: Seed data - Leads & Deals
INSERT INTO leads (id, channel, source, segment, name, phone, message, urgent, locality_id, status, assigned_to, sla_due_at, created_at) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'whatsapp', 'Website', 'b2c', 'Karan Malhotra', '+91 98100 11111', 'AC not cooling, need urgent repair', true, 'a1111111-1111-1111-1111-111111111111', 'new', 'b1111111-1111-1111-1111-111111111111', now() + interval '30 minutes', now() - interval '10 minutes'),
  ('e2222222-2222-2222-2222-222222222222', 'voice', 'Walk-in', 'b2c', 'Sunita Reddy', '+91 98100 22222', 'Water heater installation needed', false, 'a2222222-2222-2222-2222-222222222222', 'qualified', 'b1111111-1111-1111-1111-111111111111', now() + interval '2 hours', now() - interval '3 hours'),
  ('e3333333-3333-3333-3333-333333333333', 'webchat', 'Google Ads', 'b2b', 'Facility Manager - TechCorp', '+91 98100 33333', 'Annual maintenance contract for 3 buildings', false, 'a4444444-4444-4444-4444-444444444444', 'new', null, now() + interval '4 hours', now() - interval '30 minutes'),
  ('e4444444-4444-4444-4444-444444444444', 'referral', 'Amit Patel', 'b2c', 'Vikram Joshi', '+91 98100 44444', 'Referred by Amit for AC servicing', false, 'a3333333-3333-3333-3333-333333333333', 'booked', 'b2222222-2222-2222-2222-222222222222', now() + interval '1 day', now() - interval '1 day'),
  ('e5555555-5555-5555-5555-555555555555', 'webform', 'JustDial', 'b2c', 'Meera Nair', '+91 98100 55555', 'Pest control for 2BHK apartment', false, 'a5555555-5555-5555-5555-555555555555', 'new', null, now() + interval '4 hours', now() - interval '5 minutes'),
  ('e6666666-6666-6666-6666-666666666666', 'whatsapp', 'Referral', 'b2b', 'Admin - Metro Hospitals', '+91 98100 66666', 'HVAC maintenance for 2 floors', true, 'a2222222-2222-2222-2222-222222222222', 'new', 'b1111111-1111-1111-1111-111111111111', now() + interval '20 minutes', now() - interval '25 minutes')
ON CONFLICT DO NOTHING;

INSERT INTO deals (id, customer_id, lead_id, title, stage, value, locality_id, owner_id, gst_required, last_activity_at) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'e3333333-3333-3333-3333-333333333333', 'TechCorp Annual AMC', 'proposal', 480000, 'a4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', true, now() - interval '2 days'),
  ('f2222222-2222-2222-2222-222222222222', 'c4444444-4444-4444-4444-444444444444', null, 'Green Valley HVAC Upgrade', 'negotiation', 1250000, 'a3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', true, now() - interval '5 days'),
  ('f3333333-3333-3333-3333-333333333333', 'c7777777-7777-7777-7777-777777777777', 'e6666666-6666-6666-6666-666666666666', 'Metro Hospital HVAC Maintenance', 'survey', 360000, 'a2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', true, now() - interval '1 day'),
  ('f4444444-4444-4444-4444-444444444444', null, null, 'Bandra Office Complex', 'new', 750000, 'a2222222-2222-2222-2222-222222222222', null, false, now())
ON CONFLICT DO NOTHING;

SELECT 'Step 9: Leads & deals seeded' as status;
