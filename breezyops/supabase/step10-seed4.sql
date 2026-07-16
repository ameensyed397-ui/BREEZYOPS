-- Step 10: Seed data - Jobs & Appointments (FIXED: valid hex UUIDs)
INSERT INTO jobs (id, customer_id, site_id, lead_id, technician_id, status, scheduled_at, summary, warranty_until) VALUES
  ('0a111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', null, 'b2222222-2222-2222-2222-222222222222', 'scheduled', now() + interval '1 day', 'AC gas top-up and filter cleaning', null),
  ('0a222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', null, 'b2222222-2222-2222-2222-222222222222', 'in_progress', now() - interval '2 hours', 'HVAC quarterly maintenance - Tower A', '2027-01-15'),
  ('0a333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', null, 'e2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'completed', now() - interval '3 days', 'Water heater installation - 25L', null),
  ('0a444444-4444-4444-4444-444444444444', 'c5555555-5555-5555-5555-555555555555', null, null, 'b2222222-2222-2222-2222-222222222222', 'completed', now() - interval '7 days', 'Washing machine repair', null),
  ('0a555555-5555-5555-5555-555555555555', 'c6666666-6666-6666-6666-666666666666', null, null, 'b2222222-2222-2222-2222-222222222222', 'dispatched', now(), 'AC deep cleaning', null),
  ('0a666666-6666-6666-6666-666666666666', 'c8888888-8888-8888-8888-888888888888', null, null, 'b2222222-2222-2222-2222-222222222222', 'scheduled', now() + interval '2 days', 'Refrigerator gas refill', null),
  ('0a777777-7777-7777-7777-777777777777', 'c4444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', null, 'b2222222-2222-2222-2222-222222222222', 'completed', now() - interval '10 days', 'Generator servicing', null)
ON CONFLICT DO NOTHING;

INSERT INTO appointments (id, job_id, customer_id, site_id, technician_id, locality_id, service_name, start_at, end_at, status, notes) VALUES
  ('1a111111-1111-1111-1111-111111111111', '0a111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'AC gas top-up', now() + interval '1 day' + time '10:00', now() + interval '1 day' + time '12:00', 'scheduled', 'Bring R410A gas'),
  ('1a222222-2222-2222-2222-222222222222', '0a555555-5555-5555-5555-555555555555', 'c6666666-6666-6666-6666-666666666666', null, 'b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'AC deep cleaning', now() + time '14:00', now() + time '16:00', 'scheduled', null),
  ('1a333333-3333-3333-3333-333333333333', '0a666666-6666-6666-6666-666666666666', 'c8888888-8888-8888-8888-888888888888', null, 'b2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', 'Refrigerator gas refill', now() + interval '2 days' + time '11:00', now() + interval '2 days' + time '13:00', 'scheduled', null),
  ('1a444444-4444-4444-4444-444444444444', null, 'c2222222-2222-2222-2222-222222222222', null, 'b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'Water heater follow-up', now() - interval '3 days' + time '10:00', now() - interval '3 days' + time '11:00', 'done', null),
  ('1a555555-5555-5555-5555-555555555555', '0a222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444', 'HVAC quarterly maintenance', now() - interval '2 hours', now() + interval '1 hour', 'scheduled', 'Tower A, floors 10-15'),
  ('1a666666-6666-6666-6666-666666666666', null, 'c5555555-5555-5555-5555-555555555555', null, 'b2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', 'Washing machine repair', now() - interval '7 days' + time '15:00', now() - interval '7 days' + time '17:00', 'done', null)
ON CONFLICT DO NOTHING;

SELECT 'Step 10: Jobs & appointments seeded' as status;
