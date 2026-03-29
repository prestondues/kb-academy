-- KB Academy
-- 017_training_quiz_question_types.sql

alter table public.training_quiz_questions
add column if not exists question_type text not null default 'multiple_choice';

alter table public.training_quiz_questions
add column if not exists scale_min integer;

alter table public.training_quiz_questions
add column if not exists scale_max integer;

alter table public.training_quiz_questions
drop constraint if exists training_quiz_questions_question_type_check;

alter table public.training_quiz_questions
add constraint training_quiz_questions_question_type_check
check (question_type in ('multiple_choice', 'true_false', 'scaled'));

alter table public.training_quiz_questions
drop constraint if exists training_quiz_questions_scaled_range_check;

alter table public.training_quiz_questions
add constraint training_quiz_questions_scaled_range_check
check (
  question_type <> 'scaled'
  or (
    scale_min is not null
    and scale_max is not null
    and scale_min < scale_max
  )
);