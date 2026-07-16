-- Step 12: Verify everything
SELECT 'ALL DONE' as result;
SELECT count(*) as localities FROM localities;
SELECT count(*) as profiles FROM profiles;
SELECT count(*) as customers FROM customers;
SELECT count(*) as sites FROM sites;
SELECT count(*) as leads FROM leads;
SELECT count(*) as deals FROM deals;
SELECT count(*) as jobs FROM jobs;
SELECT count(*) as appointments FROM appointments;
SELECT count(*) as invoices FROM invoices;
SELECT count(*) as documents FROM documents;
SELECT count(*) as media FROM media;
SELECT count(*) as service_catalog FROM service_catalog;
SELECT count(*) as indexes FROM pg_indexes WHERE schemaname = 'public' AND tablename NOT LIKE 'pg_%';
