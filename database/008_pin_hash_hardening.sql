-- KB Academy
-- 008_pin_hash_hardening.sql

alter table public.profiles
add column if not exists pin_hash text;

-- Backfill any existing raw PIN values into pin_hash temporarily.
-- This is not true hashing yet at the SQL level; hashing will be handled by the Edge Function.
-- Existing users who already have a raw pin will need to reset/recreate PIN if you want full cleanup later.

update public.profiles
set pin_hash = pin
where pin is not null
  and pin_hash is null;