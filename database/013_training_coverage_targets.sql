-- KB Academy
-- 013_training_coverage_targets.sql

create table if not exists public.training_coverage_targets (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.training_modules(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  shift_id uuid not null references public.shifts(id) on delete cascade,
  target_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(module_id, department_id, shift_id)
);

drop trigger if exists trg_training_coverage_targets_updated_at on public.training_coverage_targets;

create trigger trg_training_coverage_targets_updated_at
before update on public.training_coverage_targets
for each row
execute function public.set_updated_at();

alter table public.training_coverage_targets enable row level security;

drop policy if exists "dev read training_coverage_targets" on public.training_coverage_targets;
create policy "dev read training_coverage_targets"
on public.training_coverage_targets
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert training_coverage_targets" on public.training_coverage_targets;
create policy "dev insert training_coverage_targets"
on public.training_coverage_targets
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev update training_coverage_targets" on public.training_coverage_targets;
create policy "dev update training_coverage_targets"
on public.training_coverage_targets
for update
to anon, authenticated
using (true)
with check (true);