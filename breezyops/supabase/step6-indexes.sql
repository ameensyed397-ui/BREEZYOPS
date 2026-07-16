-- Step 6: Indexes
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_channel_idx ON leads(channel);
CREATE INDEX IF NOT EXISTS leads_assigned_to_idx ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at);
CREATE INDEX IF NOT EXISTS leads_sla_due_at_idx ON leads(sla_due_at);
CREATE INDEX IF NOT EXISTS deals_stage_idx ON deals(stage);
CREATE INDEX IF NOT EXISTS deals_owner_id_idx ON deals(owner_id);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs(status);
CREATE INDEX IF NOT EXISTS jobs_technician_id_idx ON jobs(technician_id);
CREATE INDEX IF NOT EXISTS jobs_scheduled_at_idx ON jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS jobs_customer_id_idx ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS appointments_technician_id_idx ON appointments(technician_id);
CREATE INDEX IF NOT EXISTS appointments_start_at_idx ON appointments(start_at);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status);
CREATE INDEX IF NOT EXISTS invoices_customer_id_idx ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS invoices_number_idx ON invoices(number);
CREATE INDEX IF NOT EXISTS documents_customer_id_idx ON documents(customer_id);
CREATE INDEX IF NOT EXISTS documents_type_idx ON documents(type);
CREATE INDEX IF NOT EXISTS customers_locality_id_idx ON customers(locality_id);
CREATE INDEX IF NOT EXISTS customers_deleted_at_idx ON customers(deleted_at);
CREATE INDEX IF NOT EXISTS activity_log_entity_idx ON activity_log(entity, entity_id);

SELECT 'Step 6: Indexes created' as status;
