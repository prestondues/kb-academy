import { supabase } from '../../lib/supabase';
import type { TrainingModuleRecord } from './types';
import type { TrainingSectionRecord } from './sectionTypes';

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
      department_id,
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

type UpdateTrainingModuleInput = {
  title: string;
  description?: string;
  module_type: 'time_based' | 'sign_off';
  department_id?: string | null;
  required_hours?: number | null;
  recert_frequency_days?: number | null;
  requires_quiz: boolean;
  allergen_flag: boolean;
  sqf_element?: string | null;
  is_active: boolean;
};

export async function updateTrainingModule(
  moduleId: string,
  input: UpdateTrainingModuleInput
) {
  const { data, error } = await supabase
    .from('training_modules')
    .update({
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
    })
    .eq('id', moduleId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTrainingSections(
  moduleId: string
): Promise<TrainingSectionRecord[]> {
  const { data, error } = await supabase
    .from('training_module_sections')
    .select(`
      id,
      module_id,
      title,
      section_type,
      body_text,
      media_url,
      sort_order,
      is_required
    `)
    .eq('module_id', moduleId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as TrainingSectionRecord[];
}

type CreateTrainingSectionInput = {
  module_id: string;
  title: string;
  section_type: 'text' | 'video' | 'image' | 'pdf' | 'acknowledgement';
  body_text?: string | null;
  media_url?: string | null;
  sort_order: number;
  is_required: boolean;
};

export async function createTrainingSection(input: CreateTrainingSectionInput) {
  const { data, error } = await supabase
    .from('training_module_sections')
    .insert({
      ...input,
      body_text: input.body_text || null,
      media_url: input.media_url || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}