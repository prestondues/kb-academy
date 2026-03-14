-- KB Academy
-- 001_identity_foundation.sql

-- Enable useful extension
create extension if not exists "pgcrypto";

-- =========================
-- DEPARTMENTS
-- =========================
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================
-- SHIFTS
-- =========================
create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================
-- ROLES
-- =========================
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================
-- PERMISSIONS
-- =========================
create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  description text,
  category text not null,
  created_at timestamptz not null default now()
);

-- =========================
-- ROLE PERMISSIONS
-- =========================
create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  is_allowed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (role_id, permission_id)
);

-- =========================
-- PROFILES
-- =========================
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null unique,
  username text not null unique,
  first_name text not null,
  last_name text not null,
  email text,
  profile_photo_url text,
  role_id uuid references public.roles(id) on delete set null,
  home_department_id uuid references public.departments(id) on delete set null,
  home_shift_id uuid references public.shifts(id) on delete set null,
  home_supervisor_id uuid references public.profiles(id) on delete set null,
  hire_date date,
  birthday date,
  probationary boolean not null default false,
  trainer_enabled boolean not null default false,
  is_active boolean not null default true,
  must_change_password boolean not null default true,
  must_create_pin boolean not null default true,
  pin_reset_required boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- PROFILE DEPARTMENT ASSIGNMENTS
-- =========================
create table if not exists public.profile_department_assignments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  is_home boolean not null default false,
  created_at timestamptz not null default now(),
  unique (profile_id, department_id)
);

-- =========================
-- USER PERMISSION OVERRIDES
-- =========================
create table if not exists public.user_permission_overrides (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  is_allowed boolean not null,
  created_at timestamptz not null default now(),
  unique (profile_id, permission_id)
);

-- =========================
-- UPDATED_AT HELPER FUNCTION
-- =========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- =========================
-- SEED: DEPARTMENTS
-- =========================
insert into public.departments (name)
values
  ('Packaging'),
  ('Baking'),
  ('FSQA'),
  ('People Services')
on conflict (name) do nothing;

-- =========================
-- SEED: SHIFTS
-- =========================
insert into public.shifts (name, start_time, end_time)
values
  ('Packaging 1st Shift', '05:45', '16:30'),
  ('Baking 1st Shift', '07:30', '16:00'),
  ('Baking 3rd Shift', '22:45', '07:30')
on conflict (name) do nothing;

-- =========================
-- SEED: ROLES
-- =========================
insert into public.roles (name, description)
values
  ('Admin', 'Full system access'),
  ('Manager', 'Broad operational and reporting access'),
  ('Supervisor', 'Department-level oversight and workflow access'),
  ('Team Lead', 'Operational role with configurable permissions'),
  ('Operator', 'Own training and operational visibility'),
  ('Trainer', 'Training delivery and trainee support'),
  ('Team Member', 'Own training only'),
  ('FSQA', 'Quality and compliance oriented access'),
  ('People Services', 'Read-only and reporting-focused people access')
on conflict (name) do nothing;

-- =========================
-- SEED: PERMISSIONS
-- =========================
insert into public.permissions (code, label, description, category)
values
  ('view_dashboard', 'View Dashboard', 'Can view the dashboard', 'General'),
  ('view_training', 'View Training', 'Can view training screens', 'Training'),
  ('assign_training', 'Assign Training', 'Can assign training to users', 'Training'),
  ('edit_training_modules', 'Edit Training Modules', 'Can create and edit modules', 'Training'),
  ('deliver_training', 'Deliver Training', 'Can conduct training sessions', 'Training'),
  ('log_training_hours', 'Log Training Hours', 'Can log training hours', 'Training'),
  ('view_certifications', 'View Certifications', 'Can view certification records', 'Certifications'),
  ('approve_retakes', 'Approve Retakes', 'Can approve retake attempts', 'Certifications'),
  ('override_certification', 'Override Certification', 'Can manually override certification status', 'Certifications'),
  ('view_place_charts', 'View Place Charts', 'Can view place charts', 'Place Charts'),
  ('generate_place_charts', 'Generate Place Charts', 'Can generate place charts', 'Place Charts'),
  ('edit_place_charts', 'Edit Place Charts', 'Can modify place charts', 'Place Charts'),
  ('view_users', 'View Users', 'Can view user records', 'Users'),
  ('create_users', 'Create Users', 'Can create new users', 'Users'),
  ('edit_users', 'Edit Users', 'Can edit users', 'Users'),
  ('reset_passwords', 'Reset Passwords', 'Can reset user passwords', 'Users'),
  ('reset_pins', 'Reset PINs', 'Can reset user PINs', 'Users'),
  ('view_reports', 'View Reports', 'Can access reports', 'Reports'),
  ('export_reports', 'Export Reports', 'Can export reports', 'Reports'),
  ('view_documents', 'View Documents', 'Can access documents', 'Documents'),
  ('manage_documents', 'Manage Documents', 'Can manage documents', 'Documents'),
  ('view_admin', 'View Admin', 'Can access admin section', 'Admin'),
  ('edit_settings', 'Edit Settings', 'Can edit system settings', 'Admin'),
  ('view_audit_log', 'View Audit Log', 'Can view audit records', 'Admin'),
  ('impersonate_users', 'Impersonate Users', 'Can impersonate users for troubleshooting', 'Admin')
on conflict (code) do nothing;