import { supabase } from '../../lib/supabase';
import type { TrainingModuleRecord } from './types';

type SelectOption = {
  id: string;
  name: string;
};

export async function getTrainingModules(): Promise<TrainingModuleRecord[]> {
  const { data, error } = await supabase
    .from('training_modules')
    .select(`
      id,
      title,
      description,
      module_type,
      required_hours,
      recert_frequency_days,
      requires_quiz,
      allergen_flag,
      sqf_element,
      is_active,
      created_at,
      department:departments!training_modules_department_id_fkey(name)
    `)
    .order('title', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as TrainingModuleRecord[];
}

export async function getTrainingModuleById(
  moduleId: string
): Promise<TrainingModuleRecord | null> {
  const { data, error } = await supabase
    .from('training_modules')
    .select(`
      id,
      title,
      description,
      module_type,
      required_hours,
      recert_frequency_days,
      requires_quiz,
      allergen_flag,
      sqf_element,
      is_active,
      created_at,
      department:departments!training_modules_department_id_fkey(name)
    `)
    .eq('id', moduleId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as unknown as TrainingModuleRecord | null;
}

export async function getTrainingDepartments(): Promise<SelectOption[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as SelectOption[];
}

type CreateTrainingModuleInput = {
  title: string;
  description?: string;
  module_type: 'time_based' | 'sign_off';
  department_id?: string | null;
  required_hours?: number | null;
  recert_frequency_days?: number | null;
  requires_quiz: boolean;
  allergen_flag: boolean;
  sqf_element?: string | null;
};

export async function createTrainingModule(input: CreateTrainingModuleInput) {
  const { data, error } = await supabase
    .from('training_modules')
    .insert({
      ...input,
      department_id: input.department_id || null,
      description: input.description || null,
      required_hours:
        input.required_hours !== null && input.required_hours !== undefined
          ? input.required_hours
          : null,
      recert_frequency_days:
        input.recert_frequency_days !== null &&
        input.recert_frequency_days !== undefined
          ? input.recert_frequency_days
          : null,
      sqf_element: input.sqf_element || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}