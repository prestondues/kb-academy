import { supabase } from '../../lib/supabase';

export type CurrentProfile = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  must_change_password: boolean;
  must_create_pin: boolean;
  pin_reset_required: boolean;
  is_active: boolean;
  role?: {
    id?: string | null;
    name?: string | null;
  } | null;
  department?: {
    id?: string | null;
    name?: string | null;
  } | null;
  shift?: {
    id?: string | null;
    name?: string | null;
  } | null;
};

export async function getCurrentProfile(userId: string): Promise<CurrentProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      username,
      must_change_password,
      must_create_pin,
      pin_reset_required,
      is_active,
      role:roles(id, name),
      department:departments!profiles_department_id_fkey(id, name),
      shift:shifts!profiles_shift_id_fkey(id, name)
    `)
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as CurrentProfile | null;
}