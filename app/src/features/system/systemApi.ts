import { supabase } from '../../lib/supabase';

export type SystemSettingsRecord = {
  id: string;
  settings_key: string;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  updated_at?: string | null;
};

export async function getSystemSettings(): Promise<SystemSettingsRecord | null> {
  const { data, error } = await supabase
    .from('system_settings')
    .select(`
      id,
      settings_key,
      maintenance_mode,
      maintenance_message,
      updated_at
    `)
    .eq('settings_key', 'global')
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as SystemSettingsRecord | null;
}

export async function updateSystemSettings(input: {
  maintenance_mode: boolean;
  maintenance_message: string | null;
}) {
  const { data, error } = await supabase
    .from('system_settings')
    .update({
      maintenance_mode: input.maintenance_mode,
      maintenance_message: input.maintenance_message,
    })
    .eq('settings_key', 'global')
    .select()
    .single();

  if (error) throw error;
  return data;
}