-- KB Academy
-- 015_training_time_log_workflow.sql

create table if not exists public.training_time_logs (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid not null references public.profiles(id) on delete cascade,
  module_id uuid not null references public.training_modules(id) on delete cascade,
  trainer_id uuid not null references public.profiles(id) on delete restrict,
  entry_date date not null default current_date,
  minutes_logged integer not null default 0,
  notes text,
  log_status text not null default 'pending',
  official_time_entry_id uuid references public.training_time_entries(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (minutes_logged >= 0),
  check (log_status in ('pending', 'completed', 'voided'))
);

create table if not exists public.training_time_log_signoffs (
  id uuid primary key default gen_random_uuid(),
  time_log_id uuid not null references public.training_time_logs(id) on delete cascade,
  signer_id uuid not null references public.profiles(id) on delete restrict,
  signer_role text not null,
  signed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (signer_role in ('trainer', 'trainee')),
  unique(time_log_id, signer_role)
);

drop trigger if exists trg_training_time_logs_updated_at on public.training_time_logs;
create trigger trg_training_time_logs_updated_at
before update on public.training_time_logs
for each row
execute function public.set_updated_at();

alter table public.training_time_logs enable row level security;
alter table public.training_time_log_signoffs enable row level security;

drop policy if exists "dev read training_time_logs" on public.training_time_logs;
create policy "dev read training_time_logs"
on public.training_time_logs
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert training_time_logs" on public.training_time_logs;
create policy "dev insert training_time_logs"
on public.training_time_logs
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev update training_time_logs" on public.training_time_logs;
create policy "dev update training_time_logs"
on public.training_time_logs
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "dev read training_time_log_signoffs" on public.training_time_log_signoffs;
create policy "dev read training_time_log_signoffs"
on public.training_time_log_signoffs
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert training_time_log_signoffs" on public.training_time_log_signoffs;
create policy "dev insert training_time_log_signoffs"
on public.training_time_log_signoffs
for insert
to anon, authenticated
with check (true);