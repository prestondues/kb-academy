import { supabase } from '../../lib/supabase';
import type { RawProfile } from './userMappers';

type SelectOption = {
  id: string;
  name: string;
};

export async function getUsers(): Promise<RawProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      employee_id,
      username,
      first_name,
      last_name,
      email,
      hire_date,
      birthday,
      probationary,
      trainer_enabled,
      is_active,
      role:roles!profiles_role_id_fkey(name),
      department:departments!profiles_home_department_id_fkey(name),
      shift:shifts!profiles_home_shift_id_fkey(name)
    `)
    .order('last_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as RawProfile[];
}

export async function getUserById(userId: string): Promise<RawProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      employee_id,
      username,
      first_name,
      last_name,
      email,
      hire_date,
      birthday,
      probationary,
      trainer_enabled,
      is_active,
      role:roles!profiles_role_id_fkey(name),
      department:departments!profiles_home_department_id_fkey(name),
      shift:shifts!profiles_home_shift_id_fkey(name)
    `)
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as unknown as RawProfile | null;
}

export async function getRoles(): Promise<SelectOption[]> {
  const { data, error } = await supabase
    .from('roles')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as SelectOption[];
}

export async function getDepartments(): Promise<SelectOption[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as SelectOption[];
}

export async function getShifts(): Promise<SelectOption[]> {
  const { data, error } = await supabase
    .from('shifts')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as SelectOption[];
}

type CreateUserInput = {
  employee_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  role_id: string;
  home_department_id: string;
  home_shift_id: string;
  hire_date?: string;
  birthday?: string;
  probationary: boolean;
  trainer_enabled: boolean;
};

export async function createUser(input: CreateUserInput) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      ...input,
      email: input.email || null,
      hire_date: input.hire_date || null,
      birthday: input.birthday || null,
      is_active: true,
      must_change_password: true,
      must_create_pin: true,
      pin_reset_required: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
type CreateManagedUserInput = {
  email: string;
  password: string;
  employee_id: string;
  username: string;
  first_name: string;
  last_name: string;
  role_id: string;
  home_department_id: string;
  home_shift_id: string;
  hire_date?: string;
  birthday?: string;
  probationary: boolean;
  trainer_enabled: boolean;
};

export async function createManagedUser(input: CreateManagedUserInput) {
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: input,
  });

  if (error) {
    console.error('FUNCTION INVOKE ERROR:', error);

    const response = (error as { context?: Response }).context;

    if (response instanceof Response) {
      const rawText = await response.text();

      try {
        const body = JSON.parse(rawText);
        throw new Error(body?.error || error.message);
      } catch {
        throw new Error(rawText || error.message);
      }
    }

    throw new Error(error.message || 'Failed to create managed user.');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}