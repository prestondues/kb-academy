-- KB Academy
-- 006_system_settings_maintenance_mode.sql

create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  settings_key text not null unique,
  maintenance_mode boolean not null default false,
  maintenance_message text,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_system_settings_updated_at on public.system_settings;

create trigger trg_system_settings_updated_at
before update on public.system_settings
for each row
execute function public.set_updated_at();

alter table public.system_settings enable row level security;

drop policy if exists "dev read system_settings" on public.system_settings;
create policy "dev read system_settings"
on public.system_settings
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert system_settings" on public.system_settings;
create policy "dev insert system_settings"
on public.system_settings
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev update system_settings" on public.system_settings;
create policy "dev update system_settings"
on public.system_settings
for update
to anon, authenticated
using (true)
with check (true);

insert into public.system_settings (
  settings_key,
  maintenance_mode,
  maintenance_message
)
values (
  'global',
  false,
  'KB Academy is temporarily unavailable while updates are being made.'
)
on conflict (settings_key) do nothing;