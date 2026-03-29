-- KB Academy
-- 016_training_quiz_builder.sql

create table if not exists public.training_quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.training_modules(id) on delete cascade,
  title text not null,
  description text,
  pass_score integer not null default 80,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(module_id)
);

create table if not exists public.training_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.training_quizzes(id) on delete cascade,
  question_text text not null,
  sort_order integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_quiz_answer_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.training_quiz_questions(id) on delete cascade,
  option_text text not null,
  sort_order integer not null default 1,
  is_correct boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_training_quizzes_updated_at on public.training_quizzes;
create trigger trg_training_quizzes_updated_at
before update on public.training_quizzes
for each row
execute function public.set_updated_at();

drop trigger if exists trg_training_quiz_questions_updated_at on public.training_quiz_questions;
create trigger trg_training_quiz_questions_updated_at
before update on public.training_quiz_questions
for each row
execute function public.set_updated_at();

drop trigger if exists trg_training_quiz_answer_options_updated_at on public.training_quiz_answer_options;
create trigger trg_training_quiz_answer_options_updated_at
before update on public.training_quiz_answer_options
for each row
execute function public.set_updated_at();

alter table public.training_quizzes enable row level security;
alter table public.training_quiz_questions enable row level security;
alter table public.training_quiz_answer_options enable row level security;

drop policy if exists "dev read training_quizzes" on public.training_quizzes;
create policy "dev read training_quizzes"
on public.training_quizzes
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert training_quizzes" on public.training_quizzes;
create policy "dev insert training_quizzes"
on public.training_quizzes
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev update training_quizzes" on public.training_quizzes;
create policy "dev update training_quizzes"
on public.training_quizzes
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "dev delete training_quizzes" on public.training_quizzes;
create policy "dev delete training_quizzes"
on public.training_quizzes
for delete
to anon, authenticated
using (true);

drop policy if exists "dev read training_quiz_questions" on public.training_quiz_questions;
create policy "dev read training_quiz_questions"
on public.training_quiz_questions
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert training_quiz_questions" on public.training_quiz_questions;
create policy "dev insert training_quiz_questions"
on public.training_quiz_questions
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev update training_quiz_questions" on public.training_quiz_questions;
create policy "dev update training_quiz_questions"
on public.training_quiz_questions
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "dev delete training_quiz_questions" on public.training_quiz_questions;
create policy "dev delete training_quiz_questions"
on public.training_quiz_questions
for delete
to anon, authenticated
using (true);

drop policy if exists "dev read training_quiz_answer_options" on public.training_quiz_answer_options;
create policy "dev read training_quiz_answer_options"
on public.training_quiz_answer_options
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert training_quiz_answer_options" on public.training_quiz_answer_options;
create policy "dev insert training_quiz_answer_options"
on public.training_quiz_answer_options
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev update training_quiz_answer_options" on public.training_quiz_answer_options;
create policy "dev update training_quiz_answer_options"
on public.training_quiz_answer_options
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "dev delete training_quiz_answer_options" on public.training_quiz_answer_options;
create policy "dev delete training_quiz_answer_options"
on public.training_quiz_answer_options
for delete
to anon, authenticated
using (true);