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
      is_active
    `)
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as CurrentProfile | null;
}