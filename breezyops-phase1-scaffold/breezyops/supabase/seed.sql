-- Service areas
insert into localities (name) values
  ('Koramangala'), ('HSR Layout'), ('Indiranagar'), ('Whitefield'), ('Bellandur');

-- Service catalog (from existing pricing) — cost is illustrative, RLS-hidden from technicians
insert into service_catalog (name, segment, price, cost) values
  ('Deep AC Cleaning', 'b2c', 999, 350),
  ('Quick Repair',     'b2c', 499, 150),
  ('Energy Audit',     'b2c', 799, 200),
  ('AC Repair & Maintenance', 'b2c', 0, 0),
  ('VRF/VRV Maintenance (per unit)', 'b2b', 0, 0);

-- Sample leads (so the inbox has data without a webhook)
insert into leads (channel, source, segment, name, phone, message, urgent, status)
values
  ('whatsapp','reactivation','b2c','Priya K.','+919800000210','AC not cooling since morning, HSR Layout Sector 2.', true, 'new'),
  ('voice','google','b2c','Rahul S.','+919600000455','Wants deep clean before guests this weekend.', false, 'new'),
  ('webform','website','b2b','Anish M. (Indiranagar office)','+918000000901','Quarterly VRF maintenance, 3 floors. GST invoice?', false, 'new');
