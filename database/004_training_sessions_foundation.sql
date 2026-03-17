-- KB Academy
-- 004_training_sessions_foundation.sql

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.training_modules(id) on delete cascade,
  trainee_id uuid not null references public.profiles(id) on delete cascade,
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  session_status text not null check (
    session_status in ('in_progress', 'completed')
  ) default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_session_section_progress (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.training_sessions(id) on delete cascade,
  section_id uuid not null references public.training_module_sections(id) on delete cascade,
  is_completed boolean not null default false,
  completed_at timestamptz,
  unique(session_id, section_id)
);

drop trigger if exists trg_training_sessions_updated_at on public.training_sessions;

create trigger trg_training_sessions_updated_at
before update on public.training_sessions
for each row
execute function public.set_updated_at();

alter table public.training_sessions enable row level security;
alter table public.training_session_section_progress enable row level security;

drop policy if exists "dev read training_sessions" on public.training_sessions;
create policy "dev read training_sessions"
on public.training_sessions
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert training_sessions" on public.training_sessions;
create policy "dev insert training_sessions"
on public.training_sessions
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev update training_sessions" on public.training_sessions;
create policy "dev update training_sessions"
on public.training_sessions
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "dev read training_session_section_progress" on public.training_session_section_progress;
create policy "dev read training_session_section_progress"
on public.training_session_section_progress
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert training_session_section_progress" on public.training_session_section_progress;
create policy "dev insert training_session_section_progress"
on public.training_session_section_progress
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev update training_session_section_progress" on public.training_session_section_progress;
create policy "dev update training_session_section_progress"
on public.training_session_section_progress
for update
to anon, authenticated
using (true)
with check (true);