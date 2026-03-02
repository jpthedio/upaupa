-- UpaUpa initial schema
-- Run this in your Supabase SQL editor or via CLI

-- ─── Helper: auto-update updated_at ────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ─── Buildings ─────────────────────────────────────────────
create table buildings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  address text not null default '',
  total_units int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger buildings_updated_at before update on buildings
  for each row execute function update_updated_at();

alter table buildings enable row level security;
create policy "users own buildings" on buildings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Units ─────────────────────────────────────────────────
create table units (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  building_id uuid not null references buildings(id) on delete cascade,
  label text not null,
  floor int not null default 1,
  monthly_rent numeric not null default 0,
  status text not null default 'vacant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger units_updated_at before update on units
  for each row execute function update_updated_at();

alter table units enable row level security;
create policy "users own units" on units
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Tenants ───────────────────────────────────────────────
create table tenants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text not null default '',
  email text not null default '',
  move_in_date text not null default '',
  lease_end_date text not null default '',
  emergency_contact text not null default '',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tenants_updated_at before update on tenants
  for each row execute function update_updated_at();

alter table tenants enable row level security;
create policy "users own tenants" on tenants
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Payments ──────────────────────────────────────────────
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade,
  tenant_id uuid,
  month text not null,
  amount_due numeric not null default 0,
  amount_paid numeric not null default 0,
  status text not null default 'unpaid',
  method text not null default 'cash',
  date_paid text not null default '',
  receipt_url text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, unit_id, month)
);

create trigger payments_updated_at before update on payments
  for each row execute function update_updated_at();

alter table payments enable row level security;
create policy "users own payments" on payments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── User Settings ─────────────────────────────────────────
create table user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  due_day int not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_settings_updated_at before update on user_settings
  for each row execute function update_updated_at();

alter table user_settings enable row level security;
create policy "users own settings" on user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
