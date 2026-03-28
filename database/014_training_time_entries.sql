-- KB Academy
-- 014_training_time_entries.sql

create table if not exists public.training_time_entries (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid not null references public.profiles(id) on delete cascade,
  module_id uuid not null references public.training_modules(id) on delete cascade,
  session_id uuid references public.training_sessions(id) on delete set null,
  trainer_id uuid references public.profiles(id) on delete set null,
  entry_date date not null default current_date,
  minutes_logged integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (minutes_logged >= 0)
);

drop trigger if exists trg_training_time_entries_updated_at on public.training_time_entries;

create trigger trg_training_time_entries_updated_at
before update on public.training_time_entries
for each row
execute function public.set_updated_at();

alter table public.training_time_entries enable row level security;

drop policy if exists "dev read training_time_entries" on public.training_time_entries;
create policy "dev read training_time_entries"
on public.training_time_entries
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert training_time_entries" on public.training_time_entries;
create policy "dev insert training_time_entries"
on public.training_time_entries
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev update training_time_entries" on public.training_time_entries;
create policy "dev update training_time_entries"
on public.training_time_entries
for update
to anon, authenticated
using (true)
with check (true);