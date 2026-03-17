-- KB Academy
-- 005_training_session_signoffs.sql

create table if not exists public.training_session_signoffs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.training_sessions(id) on delete cascade,
  signer_id uuid not null references public.profiles(id) on delete cascade,
  signer_role text not null check (signer_role in ('trainer', 'trainee')),
  signed_at timestamptz not null default now(),
  unique(session_id, signer_role)
);

alter table public.training_session_signoffs enable row level security;

drop policy if exists "dev read training_session_signoffs" on public.training_session_signoffs;
create policy "dev read training_session_signoffs"
on public.training_session_signoffs
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert training_session_signoffs" on public.training_session_signoffs;
create policy "dev insert training_session_signoffs"
on public.training_session_signoffs
for insert
to anon, authenticated
with check (true);