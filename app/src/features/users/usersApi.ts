import { supabase } from '../../lib/supabase';

export type UserRecord = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  employee_id: string | null;
  email: string | null;
  is_active: boolean;
  probationary: boolean;
  trainer_enabled: boolean;
  role_id: string | null;
  department_id: string | null;
  shift_id: string | null;
  role?: { id: string; name: string } | null;
  department?: { id: string; name: string } | null;
  shift?: { id: string; name: string } | null;
};

type ProfileRow = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  employee_id: string | null;
  email: string | null;
  is_active: boolean;
  probationary: boolean;
  trainer_enabled: boolean;
  role_id: string | null;
};

type LookupRow = {
  id: string;
  name: string;
};

function enrichUsers(
  profiles: ProfileRow[],
  roles: LookupRow[]
): UserRecord[] {
  const roleMap = new Map(roles.map((item) => [item.id, item]));

  return profiles.map((profile) => ({
    ...profile,
    department_id: null,
    shift_id: null,
    role: profile.role_id ? roleMap.get(profile.role_id) ?? null : null,
    department: null,
    shift: null,
  }));
}

export async function getUsers(): Promise<UserRecord[]> {
  const [
    { data: profiles, error: profilesError },
    { data: roles, error: rolesError },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        username,
        employee_id,
        email,
        is_active,
        probationary,
        trainer_enabled,
        role_id
      `)
      .order('last_name', { ascending: true }),
    supabase.from('roles').select('id, name'),
  ]);

  if (profilesError) throw profilesError;
  if (rolesError) throw rolesError;

  return enrichUsers(
    (profiles ?? []) as ProfileRow[],
    (roles ?? []) as LookupRow[]
  );
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  const [
    { data: profile, error: profileError },
    { data: roles, error: rolesError },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        username,
        employee_id,
        email,
        is_active,
        probationary,
        trainer_enabled,
        role_id
      `)
      .eq('id', userId)
      .maybeSingle(),
    supabase.from('roles').select('id, name'),
  ]);

  if (profileError) throw profileError;
  if (rolesError) throw rolesError;

  if (!profile) return null;

  return enrichUsers(
    [profile as ProfileRow],
    (roles ?? []) as LookupRow[]
  )[0];
}

export async function getRoleOptions() {
  const { data, error } = await supabase
    .from('roles')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getDepartmentOptions() {
  return [];
}

export async function getShiftOptions() {
  return [];
}

export async function updateUser(
  userId: string,
  input: {
    first_name: string;
    last_name: string;
    username: string;
    employee_id: string | null;
    email: string | null;
    role_id: string | null;
    department_id: string | null;
    shift_id: string | null;
    probationary: boolean;
    trainer_enabled: boolean;
    is_active: boolean;
  }
) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      first_name: input.first_name,
      last_name: input.last_name,
      username: input.username,
      employee_id: input.employee_id,
      email: input.email,
      role_id: input.role_id,
      probationary: input.probationary,
      trainer_enabled: input.trainer_enabled,
      is_active: input.is_active,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deactivateUser(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}