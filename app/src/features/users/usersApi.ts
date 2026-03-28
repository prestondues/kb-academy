import { supabase } from '../../lib/supabase';
import type { LookupOption, UserRecord } from './types';

export async function getUsers(): Promise<UserRecord[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      username,
      employee_id,
      email,
      probationary,
      trainer_enabled,
      is_active,
      must_change_password,
      must_create_pin,
      pin_reset_required,
      role_id,
      department_id,
      shift_id,
      role:roles(id, name),
      department:departments!profiles_department_id_fkey(id, name),
      shift:shifts!profiles_shift_id_fkey(id, name)
    `)
    .order('last_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as UserRecord[];
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      username,
      employee_id,
      email,
      probationary,
      trainer_enabled,
      is_active,
      must_change_password,
      must_create_pin,
      pin_reset_required,
      role_id,
      department_id,
      shift_id,
      role:roles(id, name),
      department:departments!profiles_department_id_fkey(id, name),
      shift:shifts!profiles_shift_id_fkey(id, name)
    `)
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as UserRecord | null;
}

export async function getRoles(): Promise<LookupOption[]> {
  const { data, error } = await supabase
    .from('roles')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as LookupOption[];
}

export async function getDepartments(): Promise<LookupOption[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as LookupOption[];
}

export async function getShifts(): Promise<LookupOption[]> {
  const { data, error } = await supabase
    .from('shifts')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as LookupOption[];
}

export async function updateUser(
  userId: string,
  input: {
    first_name: string;
    last_name: string;
    username: string;
    employee_id?: string | null;
    email?: string | null;
    role_id?: string | null;
    department_id?: string | null;
    shift_id?: string | null;
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
      employee_id: input.employee_id || null,
      email: input.email || null,
      role_id: input.role_id || null,
      department_id: input.department_id || null,
      shift_id: input.shift_id || null,
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