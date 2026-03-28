-- KB Academy
-- 012_shift_cleanup_and_user_form_requirements.sql

update public.shifts
set is_active = false
where lower(trim(name)) not in ('1st shift', '2nd shift', '3rd shift');

update public.shifts
set is_active = true
where lower(trim(name)) in ('1st shift', '2nd shift', '3rd shift');