import { supabase } from '../../lib/supabase';
import type { TrainingModuleRecord } from './types';
import type { TrainingSectionRecord } from './sectionTypes';
import type {
  TrainingSessionProgressRecord,
  TrainingSessionRecord,
} from './sessionTypes';
import type { TrainingSessionSignoffRecord } from './signoffTypes';

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

export async function getUserOptions(): Promise<SelectOption[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('is_active', true)
    .order('last_name', { ascending: true });

  if (error) throw error;

  type UserOptionRow = {
    id: string;
    first_name: string;
    last_name: string;
  };

  return ((data ?? []) as UserOptionRow[]).map((profile) => ({
    id: profile.id,
    name: `${profile.first_name} ${profile.last_name}`,
  }));
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

export async function getTrainingSectionById(
  sectionId: string
): Promise<TrainingSectionRecord | null> {
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
    .eq('id', sectionId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as unknown as TrainingSectionRecord | null;
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

type UpdateTrainingSectionInput = {
  title: string;
  section_type: 'text' | 'video' | 'image' | 'pdf' | 'acknowledgement';
  body_text?: string | null;
  media_url?: string | null;
  sort_order: number;
  is_required: boolean;
};

export async function updateTrainingSection(
  sectionId: string,
  input: UpdateTrainingSectionInput
) {
  const { data, error } = await supabase
    .from('training_module_sections')
    .update({
      ...input,
      body_text: input.body_text || null,
      media_url: input.media_url || null,
    })
    .eq('id', sectionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTrainingSection(sectionId: string) {
  const { error } = await supabase
    .from('training_module_sections')
    .delete()
    .eq('id', sectionId);

  if (error) throw error;
}

export async function updateTrainingSectionSortOrder(
  sectionId: string,
  sortOrder: number
) {
  const { data, error } = await supabase
    .from('training_module_sections')
    .update({ sort_order: sortOrder })
    .eq('id', sectionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

type CreateTrainingSessionInput = {
  module_id: string;
  trainee_id: string;
  trainer_id: string;
};

export async function createTrainingSession(input: CreateTrainingSessionInput) {
  const { data, error } = await supabase
    .from('training_sessions')
    .insert({
      module_id: input.module_id,
      trainee_id: input.trainee_id,
      trainer_id: input.trainer_id,
      session_status: 'in_progress',
    })
    .select()
    .single();

  if (error) throw error;

  const session = data as TrainingSessionRecord;
  const sections = await getTrainingSections(input.module_id);

  if (sections.length > 0) {
    const { error: progressError } = await supabase
      .from('training_session_section_progress')
      .insert(
        sections.map((section) => ({
          session_id: session.id,
          section_id: section.id,
          is_completed: false,
        }))
      );

    if (progressError) throw progressError;
  }

  return session;
}

export async function getTrainingSessionById(
  sessionId: string
): Promise<TrainingSessionRecord | null> {
  const { data, error } = await supabase
    .from('training_sessions')
    .select(`
      id,
      module_id,
      trainee_id,
      trainer_id,
      session_status,
      started_at,
      completed_at,
      module:training_modules!training_sessions_module_id_fkey(title),
      trainee:profiles!training_sessions_trainee_id_fkey(first_name, last_name),
      trainer:profiles!training_sessions_trainer_id_fkey(first_name, last_name)
    `)
    .eq('id', sessionId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as unknown as TrainingSessionRecord | null;
}

export async function getTrainingSessionProgress(
  sessionId: string
): Promise<TrainingSessionProgressRecord[]> {
  const { data, error } = await supabase
    .from('training_session_section_progress')
    .select(`
      id,
      session_id,
      section_id,
      is_completed,
      completed_at
    `)
    .eq('session_id', sessionId);

  if (error) throw error;
  return (data ?? []) as unknown as TrainingSessionProgressRecord[];
}

export async function markTrainingSessionSectionComplete(
  progressId: string,
  isCompleted: boolean
) {
  const { data, error } = await supabase
    .from('training_session_section_progress')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq('id', progressId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeTrainingSession(sessionId: string) {
  const { data, error } = await supabase
    .from('training_sessions')
    .update({
      session_status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInProgressTrainingSessions(): Promise<TrainingSessionRecord[]> {
  const { data, error } = await supabase
    .from('training_sessions')
    .select(`
      id,
      module_id,
      trainee_id,
      trainer_id,
      session_status,
      started_at,
      completed_at,
      module:training_modules!training_sessions_module_id_fkey(title),
      trainee:profiles!training_sessions_trainee_id_fkey(first_name, last_name),
      trainer:profiles!training_sessions_trainer_id_fkey(first_name, last_name)
    `)
    .eq('session_status', 'in_progress')
    .order('started_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as TrainingSessionRecord[];
}

export async function getCompletedTrainingSessions(): Promise<TrainingSessionRecord[]> {
  const { data, error } = await supabase
    .from('training_sessions')
    .select(`
      id,
      module_id,
      trainee_id,
      trainer_id,
      session_status,
      started_at,
      completed_at,
      module:training_modules!training_sessions_module_id_fkey(title),
      trainee:profiles!training_sessions_trainee_id_fkey(first_name, last_name),
      trainer:profiles!training_sessions_trainer_id_fkey(first_name, last_name)
    `)
    .eq('session_status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(8);

  if (error) throw error;
  return (data ?? []) as unknown as TrainingSessionRecord[];
}

export async function getTrainingSessionSignoffs(
  sessionId: string
): Promise<TrainingSessionSignoffRecord[]> {
  const { data, error } = await supabase
    .from('training_session_signoffs')
    .select(`
      id,
      session_id,
      signer_id,
      signer_role,
      signed_at
    `)
    .eq('session_id', sessionId);

  if (error) throw error;
  return (data ?? []) as unknown as TrainingSessionSignoffRecord[];
}

export async function createTrainingSessionSignoff(input: {
  session_id: string;
  signer_id: string;
  signer_role: 'trainer' | 'trainee';
}) {
  const { data, error } = await supabase
    .from('training_session_signoffs')
    .insert({
      session_id: input.session_id,
      signer_id: input.signer_id,
      signer_role: input.signer_role,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}