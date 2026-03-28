-- KB Academy
-- 011_profile_department_shift_visibility.sql

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  start_time time not null default '00:00:00',
  end_time time not null default '00:00:00',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shifts
add column if not exists name text;

alter table public.shifts
add column if not exists start_time time not null default '00:00:00';

alter table public.shifts
add column if not exists end_time time not null default '00:00:00';

alter table public.shifts
add column if not exists sort_order integer not null default 0;

alter table public.shifts
add column if not exists is_active boolean not null default true;

alter table public.shifts
add column if not exists created_at timestamptz not null default now();

alter table public.shifts
add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_shifts_updated_at on public.shifts;

create trigger trg_shifts_updated_at
before update on public.shifts
for each row
execute function public.set_updated_at();

alter table public.shifts enable row level security;

drop policy if exists "dev read shifts" on public.shifts;
create policy "dev read shifts"
on public.shifts
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert shifts" on public.shifts;
create policy "dev insert shifts"
on public.shifts
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev update shifts" on public.shifts;
create policy "dev update shifts"
on public.shifts
for update
to anon, authenticated
using (true)
with check (true);

alter table public.profiles
add column if not exists department_id uuid references public.departments(id) on delete set null;

alter table public.profiles
add column if not exists shift_id uuid references public.shifts(id) on delete set null;

insert into public.shifts (name, start_time, end_time, sort_order)
values
  ('1st Shift', '06:00:00', '14:00:00', 1),
  ('2nd Shift', '14:00:00', '22:00:00', 2),
  ('3rd Shift', '22:00:00', '06:00:00', 3)
on conflict (name) do update
set
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  sort_order = excluded.sort_order;