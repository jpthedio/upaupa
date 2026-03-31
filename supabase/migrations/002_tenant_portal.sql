-- ─── Tenant Portal Access ───────────────────────────────────
-- Tracks which tenants have been invited to the portal and their access status.
-- One record per tenant record. A single email can have multiple records (multi-unit).

create table tenant_portal_access (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references tenants(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  email text not null,
  status text not null default 'invited' check (status in ('invited', 'active', 'revoked')),
  invited_at timestamptz not null default now(),
  activated_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id)
);

-- Create the trigger function if it doesn't exist
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tenant_portal_access_updated_at before update on tenant_portal_access
  for each row execute function update_updated_at();

alter table tenant_portal_access enable row level security;

-- Owners/team members can manage portal access for their team
create policy "team manages portal access" on tenant_portal_access
  for all using (team_id in (select team_id from team_members where user_id = auth.uid()));

-- Tenants can read their own portal access record
create policy "tenants read own portal access" on tenant_portal_access
  for select using (auth_user_id = auth.uid());

-- Tenants can read their own tenant record
create policy "tenants read own tenant record" on tenants
  for select using (
    id in (
      select tenant_id from tenant_portal_access
      where auth_user_id = auth.uid() and status = 'active'
    )
  );

-- Tenants can read their own payments
create policy "tenants read own payments" on payments
  for select using (
    tenant_id in (
      select tenant_id from tenant_portal_access
      where auth_user_id = auth.uid() and status = 'active'
    )
  );

-- Tenants can read their own unit
create policy "tenants read own unit" on units
  for select using (
    id in (
      select unit_id from tenants
      where id in (
        select tenant_id from tenant_portal_access
        where auth_user_id = auth.uid() and status = 'active'
      )
    )
  );

-- Tenants can read their own building
create policy "tenants read own building" on buildings
  for select using (
    id in (
      select building_id from units
      where id in (
        select unit_id from tenants
        where id in (
          select tenant_id from tenant_portal_access
          where auth_user_id = auth.uid() and status = 'active'
        )
      )
    )
  );
