-- KB Academy
-- 003_training_content_sections.sql

create table if not exists public.training_module_sections (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.training_modules(id) on delete cascade,
  title text not null,
  section_type text not null check (
    section_type in ('text', 'video', 'image', 'pdf', 'acknowledgement')
  ),
  body_text text,
  media_url text,
  sort_order integer not null default 0,
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_training_module_sections_updated_at on public.training_module_sections;

create trigger trg_training_module_sections_updated_at
before update on public.training_module_sections
for each row
execute function public.set_updated_at();

alter table public.training_module_sections enable row level security;

drop policy if exists "dev read training_module_sections" on public.training_module_sections;
create policy "dev read training_module_sections"
on public.training_module_sections
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert training_module_sections" on public.training_module_sections;
create policy "dev insert training_module_sections"
on public.training_module_sections
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev update training_module_sections" on public.training_module_sections;
create policy "dev update training_module_sections"
on public.training_module_sections
for update
to anon, authenticated
using (true)
with check (true);