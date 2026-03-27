-- KB Academy
-- 009_training_completion_outcomes.sql

alter table public.training_sessions
add column if not exists duration_minutes integer;

create table if not exists public.training_certifications (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid not null references public.profiles(id) on delete cascade,
  module_id uuid not null references public.training_modules(id) on delete cascade,
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  last_session_id uuid references public.training_sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(trainee_id, module_id)
);

drop trigger if exists trg_training_certifications_updated_at on public.training_certifications;

create trigger trg_training_certifications_updated_at
before update on public.training_certifications
for each row
execute function public.set_updated_at();

alter table public.training_certifications enable row level security;

drop policy if exists "dev read training_certifications" on public.training_certifications;
create policy "dev read training_certifications"
on public.training_certifications
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert training_certifications" on public.training_certifications;
create policy "dev insert training_certifications"
on public.training_certifications
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev update training_certifications" on public.training_certifications;
create policy "dev update training_certifications"
on public.training_certifications
for update
to anon, authenticated
using (true)
with check (true);