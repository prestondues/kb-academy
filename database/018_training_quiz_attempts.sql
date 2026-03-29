-- KB Academy
-- 018_training_quiz_attempts.sql

create table if not exists public.training_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.training_quizzes(id) on delete cascade,
  module_id uuid not null references public.training_modules(id) on delete cascade,
  trainee_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score_percent numeric(5,2),
  passed boolean,
  status text not null default 'in_progress',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_quiz_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.training_quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.training_quiz_questions(id) on delete cascade,
  selected_option_id uuid references public.training_quiz_answer_options(id) on delete set null,
  answer_text text,
  is_correct boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(attempt_id, question_id)
);

drop trigger if exists trg_training_quiz_attempts_updated_at on public.training_quiz_attempts;
create trigger trg_training_quiz_attempts_updated_at
before update on public.training_quiz_attempts
for each row
execute function public.set_updated_at();

drop trigger if exists trg_training_quiz_attempt_answers_updated_at on public.training_quiz_attempt_answers;
create trigger trg_training_quiz_attempt_answers_updated_at
before update on public.training_quiz_attempt_answers
for each row
execute function public.set_updated_at();

alter table public.training_quiz_attempts enable row level security;
alter table public.training_quiz_attempt_answers enable row level security;

drop policy if exists "dev read training_quiz_attempts" on public.training_quiz_attempts;
create policy "dev read training_quiz_attempts"
on public.training_quiz_attempts
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert training_quiz_attempts" on public.training_quiz_attempts;
create policy "dev insert training_quiz_attempts"
on public.training_quiz_attempts
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev update training_quiz_attempts" on public.training_quiz_attempts;
create policy "dev update training_quiz_attempts"
on public.training_quiz_attempts
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "dev delete training_quiz_attempts" on public.training_quiz_attempts;
create policy "dev delete training_quiz_attempts"
on public.training_quiz_attempts
for delete
to anon, authenticated
using (true);

drop policy if exists "dev read training_quiz_attempt_answers" on public.training_quiz_attempt_answers;
create policy "dev read training_quiz_attempt_answers"
on public.training_quiz_attempt_answers
for select
to anon, authenticated
using (true);

drop policy if exists "dev insert training_quiz_attempt_answers" on public.training_quiz_attempt_answers;
create policy "dev insert training_quiz_attempt_answers"
on public.training_quiz_attempt_answers
for insert
to anon, authenticated
with check (true);

drop policy if exists "dev update training_quiz_attempt_answers" on public.training_quiz_attempt_answers;
create policy "dev update training_quiz_attempt_answers"
on public.training_quiz_attempt_answers
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "dev delete training_quiz_attempt_answers" on public.training_quiz_attempt_answers;
create policy "dev delete training_quiz_attempt_answers"
on public.training_quiz_attempt_answers
for delete
to anon, authenticated
using (true);

alter table public.training_quiz_attempts
drop constraint if exists training_quiz_attempts_status_check;

alter table public.training_quiz_attempts
add constraint training_quiz_attempts_status_check
check (status in ('in_progress', 'submitted'));