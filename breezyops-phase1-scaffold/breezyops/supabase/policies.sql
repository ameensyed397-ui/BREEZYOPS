-- =====================================================================
-- Breezyops — Row-Level Security = the RBAC matrix, enforced in the DB.
-- Apply after `pnpm db:push`.  See vault: RBAC-and-Security.
-- =====================================================================

-- Helper: current user's role from profiles
create or replace function current_role_name() returns text
language sql stable security definer set search_path = public as $$
  select role::text from public.profiles where id = auth.uid()
$$;

create or replace function is_admin() returns boolean
language sql stable as $$ select current_role_name() = 'admin' $$;

create or replace function is_staff() returns boolean
language sql stable as $$ select current_role_name() in ('admin','ops','b2b_manager','finance') $$;

-- Auto-create a profile (role=viewer) when a new auth user appears
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'viewer')
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Enable RLS
alter table profiles        enable row level security;
alter table customers       enable row level security;
alter table sites           enable row level security;
alter table leads           enable row level security;
alter table jobs            enable row level security;
alter table invoices        enable row level security;
alter table media           enable row level security;
alter table consents        enable row level security;
alter table service_catalog enable row level security;
alter table localities      enable row level security;
alter table activity_log    enable row level security;

-- profiles: read own; admin manages all
create policy profiles_self_read on profiles for select using (id = auth.uid() or is_staff());
create policy profiles_admin_all on profiles for all using (is_admin()) with check (is_admin());

-- leads: staff full; technician none
create policy leads_staff on leads for all using (is_staff()) with check (is_staff());

-- customers / sites / consents: staff full; technician read only the customer of an assigned job
create policy customers_staff on customers for all using (is_staff()) with check (is_staff());
create policy customers_tech_read on customers for select using (
  current_role_name() = 'technician' and exists (
    select 1 from jobs j where j.customer_id = customers.id and j.technician_id = auth.uid()
  )
);
create policy sites_staff on sites for all using (is_staff()) with check (is_staff());
create policy consents_staff on consents for all using (is_staff()) with check (is_staff());

-- jobs: staff full; technician only own jobs
create policy jobs_staff on jobs for all using (is_staff()) with check (is_staff());
create policy jobs_tech on jobs for all
  using (current_role_name() = 'technician' and technician_id = auth.uid())
  with check (current_role_name() = 'technician' and technician_id = auth.uid());

-- media: staff full; technician only own-job media
create policy media_staff on media for all using (is_staff()) with check (is_staff());
create policy media_tech on media for all using (
  current_role_name() = 'technician' and exists (
    select 1 from jobs j where j.id = media.job_id and j.technician_id = auth.uid())
) with check (
  current_role_name() = 'technician' and exists (
    select 1 from jobs j where j.id = media.job_id and j.technician_id = auth.uid()));

-- invoices: admin/finance/b2b_manager
create policy invoices_finance on invoices for all
  using (current_role_name() in ('admin','finance','b2b_manager'))
  with check (current_role_name() in ('admin','finance','b2b_manager'));

-- service_catalog: everyone reads NAME+PRICE via a view; base table (incl. cost) restricted.
revoke select on service_catalog from anon, authenticated;
create policy catalog_admin on service_catalog for all using (is_admin()) with check (is_admin());
create policy catalog_finance_read on service_catalog for select using (current_role_name() = 'finance');
create or replace view service_catalog_public as
  select id, name, segment, price, active from service_catalog where active;   -- NO cost column
grant select on service_catalog_public to authenticated;

-- localities: read all staff+tech; write admin
create policy localities_read on localities for select using (auth.uid() is not null);
create policy localities_admin on localities for all using (is_admin()) with check (is_admin());

-- activity_log: append-only; staff read
create policy audit_insert on activity_log for insert with check (auth.uid() is not null);
create policy audit_read on activity_log for select using (is_staff());
