-- KB Academy
-- 007_profile_pin_fields.sql

alter table public.profiles
add column if not exists pin text;

alter table public.profiles
add column if not exists must_create_pin boolean not null default true;

alter table public.profiles
add column if not exists pin_reset_required boolean not null default false;