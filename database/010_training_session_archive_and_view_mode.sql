-- KB Academy
-- 010_training_session_archive_and_view_mode.sql

alter table public.training_sessions
add column if not exists archived_at timestamptz;

alter table public.training_sessions
add column if not exists archived_by uuid references public.profiles(id) on delete set null;

alter table public.training_sessions
add column if not exists archive_reason text;