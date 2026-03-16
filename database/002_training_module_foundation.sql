-- KB Academy
-- 002_training_module_foundation.sql

create table if not exists public.training_modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  module_type text not null check (module_type in ('time_based', 'sign_off')),
  department_id uuid references public.departments(id) on delete set null,
  required_hours numeric(6,2),
  recert_frequency_days integer,
  requires_quiz boolean not null default false,
  allergen_flag boolean not null default false,
  sqf_element text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_training_modules_updated_at on public.training_modules;

create trigger trg_training_modules_updated_at
before update on public.training_modules
for each row
execute function public.set_updated_at();

alter table public.training_modules enable row level security;

drop policy if exists "dev read training_modules" on public.training_modules;
create policy "dev read training_modules"
on public.training_modules
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert training_modules" on public.training_modules;
create policy "dev insert training_modules"
on public.training_modules
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev update training_modules" on public.training_modules;
create policy "dev update training_modules"
on public.training_modules
for update
to anon, authenticated
using (true)
with check (true);