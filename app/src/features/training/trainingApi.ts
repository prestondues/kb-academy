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

type ProfilePinRecord = {
  id: string;
  pin: string | null;
  pin_hash?: string | null;
  must_create_pin?: boolean | null;
  pin_reset_required?: boolean | null;
};

export type TrainingQuizRecord = {
  id: string;
  module_id: string;
  title: string;
  description?: string | null;
  pass_score: number;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TrainingQuizQuestionType = 'multiple_choice' | 'true_false' | 'scaled';

export type TrainingQuizQuestionRecord = {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: TrainingQuizQuestionType;
  sort_order: number;
  is_active: boolean;
  scale_min?: number | null;
  scale_max?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TrainingQuizAnswerOptionRecord = {
  id: string;
  question_id: string;
  option_text: string;
  sort_order: number;
  is_correct: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TrainingQuizAttemptRecord = {
  id: string;
  quiz_id: string;
  module_id: string;
  trainee_id: string;
  started_at: string;
  submitted_at?: string | null;
  score_percent?: number | null;
  passed?: boolean | null;
  status: 'in_progress' | 'submitted';
  created_at?: string | null;
  updated_at?: string | null;
  quiz?: {
    title?: string | null;
    pass_score?: number | null;
  } | null;
  module?: {
    title?: string | null;
  } | null;
};

export type TrainingQuizAttemptAnswerRecord = {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id?: string | null;
  answer_text?: string | null;
  is_correct?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TrainingCertificationRecord = {
  id: string;
  trainee_id: string;
  module_id: string;
  issued_at: string;
  expires_at?: string | null;
  last_session_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  module?: {
    id?: string | null;
    title?: string | null;
    department?: {
      name?: string | null;
    } | null;
  } | null;
};

export type TrainingCertificationListRecord = {
  id: string;
  trainee_id: string;
  module_id: string;
  issued_at: string;
  expires_at?: string | null;
  last_session_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  trainee?: {
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
  } | null;
  module?: {
    id?: string | null;
    title?: string | null;
    department?: {
      name?: string | null;
    } | null;
  } | null;
};

export type TrainingCoverageTargetRecord = {
  id: string;
  module_id: string;
  department_id: string;
  shift_id: string;
  target_count: number;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  module?: {
    id?: string | null;
    title?: string | null;
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

export type TrainingTimeEntryRecord = {
  id: string;
  trainee_id: string;
  module_id: string;
  session_id?: string | null;
  trainer_id?: string | null;
  entry_date: string;
  minutes_logged: number;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  module?: {
    id?: string | null;
    title?: string | null;
  } | null;
  trainer?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null;
};

export type TrainingTimeLogRecord = {
  id: string;
  trainee_id: string;
  module_id: string;
  trainer_id: string;
  entry_date: string;
  minutes_logged: number;
  notes?: string | null;
  log_status: 'pending' | 'completed' | 'voided';
  official_time_entry_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  module?: {
    id?: string | null;
    title?: string | null;
  } | null;
  trainee?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  trainer?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null;
};

export type TrainingTimeLogSignoffRecord = {
  id: string;
  time_log_id: string;
  signer_id: string;
  signer_role: 'trainer' | 'trainee';
  signed_at: string;
};

export type TrainingHourProgressRecord = {
  moduleId: string;
  moduleTitle: string;
  requiredHours: number;
  loggedMinutes: number;
  loggedHours: number;
  remainingMinutes: number;
  remainingHours: number;
  percentComplete: number;
};

type ProfileMatrixRecord = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  is_active: boolean;
  department?: {
    id?: string | null;
    name?: string | null;
  } | null;
  shift?: {
    id?: string | null;
    name?: string | null;
  } | null;
};

export type UserTrainingProfileRecord = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email?: string | null;
  employee_id?: string | null;
  trainer_enabled?: boolean | null;
  probationary?: boolean | null;
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

export async function getShifts(): Promise<SelectOption[]> {
  const { data, error } = await supabase
    .from('shifts')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as SelectOption[];
}

export async function getUserOptions(): Promise<SelectOption[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, username')
    .eq('is_active', true)
    .order('last_name', { ascending: true });

  if (error) throw error;

  type UserOptionRow = {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
  };

  return ((data ?? []) as UserOptionRow[]).map((profile) => ({
    id: profile.id,
    name: `${profile.first_name} ${profile.last_name} (@${profile.username})`,
  }));
}

export async function getTrainerOptions(): Promise<SelectOption[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, username')
    .eq('is_active', true)
    .eq('trainer_enabled', true)
    .order('last_name', { ascending: true });

  if (error) throw error;

  type UserOptionRow = {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
  };

  return ((data ?? []) as UserOptionRow[]).map((profile) => ({
    id: profile.id,
    name: `${profile.first_name} ${profile.last_name} (@${profile.username})`,
  }));
}

export async function getMatrixUsers(): Promise<ProfileMatrixRecord[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      username,
      is_active,
      department:departments!profiles_department_id_fkey(id, name),
      shift:shifts!profiles_shift_id_fkey(id, name)
    `)
    .eq('is_active', true)
    .order('last_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ProfileMatrixRecord[];
}

export async function getTrainingQuizByModule(
  moduleId: string
): Promise<TrainingQuizRecord | null> {
  const { data, error } = await supabase
    .from('training_quizzes')
    .select('*')
    .eq('module_id', moduleId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as TrainingQuizRecord | null;
}

export async function createTrainingQuiz(input: {
  module_id: string;
  title: string;
  description?: string | null;
  pass_score: number;
  is_active: boolean;
}) {
  const { data, error } = await supabase
    .from('training_quizzes')
    .insert({
      module_id: input.module_id,
      title: input.title,
      description: input.description ?? null,
      pass_score: input.pass_score,
      is_active: input.is_active,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TrainingQuizRecord;
}

export async function updateTrainingQuiz(
  quizId: string,
  input: {
    title: string;
    description?: string | null;
    pass_score: number;
    is_active: boolean;
  }
) {
  const { data, error } = await supabase
    .from('training_quizzes')
    .update({
      title: input.title,
      description: input.description ?? null,
      pass_score: input.pass_score,
      is_active: input.is_active,
    })
    .eq('id', quizId)
    .select()
    .single();

  if (error) throw error;
  return data as TrainingQuizRecord;
}

export async function getTrainingQuizQuestions(
  quizId: string
): Promise<TrainingQuizQuestionRecord[]> {
  const { data, error } = await supabase
    .from('training_quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as TrainingQuizQuestionRecord[];
}

export async function createTrainingQuizQuestion(input: {
  quiz_id: string;
  question_text: string;
  question_type: TrainingQuizQuestionType;
  sort_order: number;
  is_active: boolean;
  scale_min?: number | null;
  scale_max?: number | null;
}) {
  const { data, error } = await supabase
    .from('training_quiz_questions')
    .insert({
      quiz_id: input.quiz_id,
      question_text: input.question_text,
      question_type: input.question_type,
      sort_order: input.sort_order,
      is_active: input.is_active,
      scale_min: input.scale_min ?? null,
      scale_max: input.scale_max ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TrainingQuizQuestionRecord;
}

export async function updateTrainingQuizQuestion(
  questionId: string,
  input: {
    question_text: string;
    question_type: TrainingQuizQuestionType;
    sort_order: number;
    is_active: boolean;
    scale_min?: number | null;
    scale_max?: number | null;
  }
) {
  const { data, error } = await supabase
    .from('training_quiz_questions')
    .update({
      question_text: input.question_text,
      question_type: input.question_type,
      sort_order: input.sort_order,
      is_active: input.is_active,
      scale_min: input.scale_min ?? null,
      scale_max: input.scale_max ?? null,
    })
    .eq('id', questionId)
    .select()
    .single();

  if (error) throw error;
  return data as TrainingQuizQuestionRecord;
}

export async function reorderTrainingQuizQuestions(
  items: Array<{ id: string; sort_order: number }>
) {
  for (const item of items) {
    const { error } = await supabase
      .from('training_quiz_questions')
      .update({ sort_order: item.sort_order })
      .eq('id', item.id);

    if (error) throw error;
  }
}

export async function deleteTrainingQuizQuestion(questionId: string) {
  const { error } = await supabase
    .from('training_quiz_questions')
    .delete()
    .eq('id', questionId);

  if (error) throw error;
}

export async function getTrainingQuizAnswerOptions(
  questionId: string
): Promise<TrainingQuizAnswerOptionRecord[]> {
  const { data, error } = await supabase
    .from('training_quiz_answer_options')
    .select('*')
    .eq('question_id', questionId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as TrainingQuizAnswerOptionRecord[];
}

export async function createTrainingQuizAnswerOption(input: {
  question_id: string;
  option_text: string;
  sort_order: number;
  is_correct: boolean;
}) {
  const { data, error } = await supabase
    .from('training_quiz_answer_options')
    .insert({
      question_id: input.question_id,
      option_text: input.option_text,
      sort_order: input.sort_order,
      is_correct: input.is_correct,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TrainingQuizAnswerOptionRecord;
}

export async function updateTrainingQuizAnswerOption(
  optionId: string,
  input: {
    option_text: string;
    sort_order: number;
    is_correct: boolean;
  }
) {
  const { data, error } = await supabase
    .from('training_quiz_answer_options')
    .update({
      option_text: input.option_text,
      sort_order: input.sort_order,
      is_correct: input.is_correct,
    })
    .eq('id', optionId)
    .select()
    .single();

  if (error) throw error;
  return data as TrainingQuizAnswerOptionRecord;
}

export async function deleteTrainingQuizAnswerOption(optionId: string) {
  const { error } = await supabase
    .from('training_quiz_answer_options')
    .delete()
    .eq('id', optionId);

  if (error) throw error;
}

export async function getTrainingQuizAttemptsByUser(
  userId: string
): Promise<TrainingQuizAttemptRecord[]> {
  const { data, error } = await supabase
    .from('training_quiz_attempts')
    .select(`
      id,
      quiz_id,
      module_id,
      trainee_id,
      started_at,
      submitted_at,
      score_percent,
      passed,
      status,
      created_at,
      updated_at,
      quiz:training_quizzes!training_quiz_attempts_quiz_id_fkey(
        title,
        pass_score
      ),
      module:training_modules!training_quiz_attempts_module_id_fkey(
        title
      )
    `)
    .eq('trainee_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as TrainingQuizAttemptRecord[];
}

export async function getTrainingQuizAttemptById(
  attemptId: string
): Promise<TrainingQuizAttemptRecord | null> {
  const { data, error } = await supabase
    .from('training_quiz_attempts')
    .select(`
      id,
      quiz_id,
      module_id,
      trainee_id,
      started_at,
      submitted_at,
      score_percent,
      passed,
      status,
      created_at,
      updated_at,
      quiz:training_quizzes!training_quiz_attempts_quiz_id_fkey(
        title,
        pass_score
      ),
      module:training_modules!training_quiz_attempts_module_id_fkey(
        title
      )
    `)
    .eq('id', attemptId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as TrainingQuizAttemptRecord | null;
}

export async function createTrainingQuizAttempt(input: {
  quiz_id: string;
  module_id: string;
  trainee_id: string;
}) {
  const { data, error } = await supabase
    .from('training_quiz_attempts')
    .insert({
      quiz_id: input.quiz_id,
      module_id: input.module_id,
      trainee_id: input.trainee_id,
      status: 'in_progress',
    })
    .select()
    .single();

  if (error) throw error;
  return data as TrainingQuizAttemptRecord;
}

export async function getTrainingQuizAttemptAnswers(
  attemptId: string
): Promise<TrainingQuizAttemptAnswerRecord[]> {
  const { data, error } = await supabase
    .from('training_quiz_attempt_answers')
    .select(`
      id,
      attempt_id,
      question_id,
      selected_option_id,
      answer_text,
      is_correct,
      created_at,
      updated_at
    `)
    .eq('attempt_id', attemptId);

  if (error) throw error;
  return (data ?? []) as TrainingQuizAttemptAnswerRecord[];
}

export async function upsertTrainingQuizAttemptAnswer(input: {
  attempt_id: string;
  question_id: string;
  selected_option_id?: string | null;
  answer_text?: string | null;
  is_correct?: boolean | null;
}) {
  const { data, error } = await supabase
    .from('training_quiz_attempt_answers')
    .upsert(
      {
        attempt_id: input.attempt_id,
        question_id: input.question_id,
        selected_option_id: input.selected_option_id ?? null,
        answer_text: input.answer_text ?? null,
        is_correct: input.is_correct ?? null,
      },
      {
        onConflict: 'attempt_id,question_id',
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data as TrainingQuizAttemptAnswerRecord;
}

export async function submitTrainingQuizAttempt(input: {
  attempt_id: string;
  score_percent: number;
  passed: boolean;
}) {
  const { data, error } = await supabase
    .from('training_quiz_attempts')
    .update({
      submitted_at: new Date().toISOString(),
      score_percent: input.score_percent,
      passed: input.passed,
      status: 'submitted',
    })
    .eq('id', input.attempt_id)
    .select()
    .single();

  if (error) throw error;
  return data as TrainingQuizAttemptRecord;
}

export async function getTrainingCertifications(): Promise<TrainingCertificationRecord[]> {
  const { data, error } = await supabase
    .from('training_certifications')
    .select(`
      id,
      trainee_id,
      module_id,
      issued_at,
      expires_at,
      last_session_id,
      created_at,
      updated_at,
      module:training_modules!training_certifications_module_id_fkey(
        id,
        title,
        department:departments!training_modules_department_id_fkey(name)
      )
    `);

  if (error) throw error;
  return (data ?? []) as TrainingCertificationRecord[];
}

export async function getTrainingCertificationsByUser(
  userId: string
): Promise<TrainingCertificationRecord[]> {
  const { data, error } = await supabase
    .from('training_certifications')
    .select(`
      id,
      trainee_id,
      module_id,
      issued_at,
      expires_at,
      last_session_id,
      created_at,
      updated_at,
      module:training_modules!training_certifications_module_id_fkey(
        id,
        title,
        department:departments!training_modules_department_id_fkey(name)
      )
    `)
    .eq('trainee_id', userId)
    .order('issued_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as TrainingCertificationRecord[];
}

export async function getTrainingCertificationRecords(): Promise<TrainingCertificationListRecord[]> {
  const { data, error } = await supabase
    .from('training_certifications')
    .select(`
      id,
      trainee_id,
      module_id,
      issued_at,
      expires_at,
      last_session_id,
      created_at,
      updated_at,
      trainee:profiles!training_certifications_trainee_id_fkey(
        first_name,
        last_name,
        username
      ),
      module:training_modules!training_certifications_module_id_fkey(
        id,
        title,
        department:departments!training_modules_department_id_fkey(name)
      )
    `)
    .order('issued_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as TrainingCertificationListRecord[];
}

export async function upsertTrainingCertification(input: {
  trainee_id: string;
  module_id: string;
  last_session_id?: string | null;
  issued_at: string;
  expires_at?: string | null;
}) {
  const { data, error } = await supabase
    .from('training_certifications')
    .upsert(
      {
        trainee_id: input.trainee_id,
        module_id: input.module_id,
        issued_at: input.issued_at,
        expires_at: input.expires_at ?? null,
        last_session_id: input.last_session_id ?? null,
      },
      {
        onConflict: 'trainee_id,module_id',
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data as TrainingCertificationRecord;
}

export async function getUserTrainingProfile(
  userId: string
): Promise<UserTrainingProfileRecord | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      username,
      email,
      employee_id,
      trainer_enabled,
      probationary,
      is_active,
      role:roles(id, name),
      department:departments!profiles_department_id_fkey(id, name),
      shift:shifts!profiles_shift_id_fkey(id, name)
    `)
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as UserTrainingProfileRecord | null;
}

export async function getTrainingCoverageTargets(): Promise<TrainingCoverageTargetRecord[]> {
  const { data, error } = await supabase
    .from('training_coverage_targets')
    .select(`
      id,
      module_id,
      department_id,
      shift_id,
      target_count,
      is_active,
      created_at,
      updated_at,
      module:training_modules!training_coverage_targets_module_id_fkey(id, title),
      department:departments!training_coverage_targets_department_id_fkey(id, name),
      shift:shifts!training_coverage_targets_shift_id_fkey(id, name)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as TrainingCoverageTargetRecord[];
}

export async function upsertTrainingCoverageTarget(input: {
  module_id: string;
  department_id: string;
  shift_id: string;
  target_count: number;
}) {
  const { data, error } = await supabase
    .from('training_coverage_targets')
    .upsert(
      {
        module_id: input.module_id,
        department_id: input.department_id,
        shift_id: input.shift_id,
        target_count: input.target_count,
        is_active: true,
      },
      {
        onConflict: 'module_id,department_id,shift_id',
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data as TrainingCoverageTargetRecord;
}

export async function updateTrainingCoverageTarget(input: {
  id: string;
  module_id: string;
  department_id: string;
  shift_id: string;
  target_count: number;
}) {
  const { data, error } = await supabase
    .from('training_coverage_targets')
    .update({
      module_id: input.module_id,
      department_id: input.department_id,
      shift_id: input.shift_id,
      target_count: input.target_count,
    })
    .eq('id', input.id)
    .select()
    .single();

  if (error) throw error;
  return data as TrainingCoverageTargetRecord;
}

export async function deleteTrainingCoverageTarget(id: string) {
  const { data, error } = await supabase
    .from('training_coverage_targets')
    .update({
      is_active: false,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as TrainingCoverageTargetRecord;
}

export async function getTrainingTimeEntriesByUser(
  userId: string
): Promise<TrainingTimeEntryRecord[]> {
  const { data, error } = await supabase
    .from('training_time_entries')
    .select(`
      id,
      trainee_id,
      module_id,
      session_id,
      trainer_id,
      entry_date,
      minutes_logged,
      notes,
      created_at,
      updated_at,
      module:training_modules!training_time_entries_module_id_fkey(id, title),
      trainer:profiles!training_time_entries_trainer_id_fkey(first_name, last_name)
    `)
    .eq('trainee_id', userId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as TrainingTimeEntryRecord[];
}

export async function createTrainingTimeEntry(input: {
  trainee_id: string;
  module_id: string;
  session_id?: string | null;
  trainer_id?: string | null;
  entry_date?: string;
  minutes_logged: number;
  notes?: string | null;
}) {
  const { data, error } = await supabase
    .from('training_time_entries')
    .insert({
      trainee_id: input.trainee_id,
      module_id: input.module_id,
      session_id: input.session_id ?? null,
      trainer_id: input.trainer_id ?? null,
      entry_date: input.entry_date ?? new Date().toISOString().slice(0, 10),
      minutes_logged: input.minutes_logged,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TrainingTimeEntryRecord;
}

export async function getTrainingTimeLogs(): Promise<TrainingTimeLogRecord[]> {
  const { data, error } = await supabase
    .from('training_time_logs')
    .select(`
      id,
      trainee_id,
      module_id,
      trainer_id,
      entry_date,
      minutes_logged,
      notes,
      log_status,
      official_time_entry_id,
      created_at,
      updated_at,
      module:training_modules!training_time_logs_module_id_fkey(id, title),
      trainee:profiles!training_time_logs_trainee_id_fkey(first_name, last_name),
      trainer:profiles!training_time_logs_trainer_id_fkey(first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as TrainingTimeLogRecord[];
}

export async function getTrainingTimeLogsByUser(
  userId: string
): Promise<TrainingTimeLogRecord[]> {
  const { data, error } = await supabase
    .from('training_time_logs')
    .select(`
      id,
      trainee_id,
      module_id,
      trainer_id,
      entry_date,
      minutes_logged,
      notes,
      log_status,
      official_time_entry_id,
      created_at,
      updated_at,
      module:training_modules!training_time_logs_module_id_fkey(id, title),
      trainee:profiles!training_time_logs_trainee_id_fkey(first_name, last_name),
      trainer:profiles!training_time_logs_trainer_id_fkey(first_name, last_name)
    `)
    .eq('trainee_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as TrainingTimeLogRecord[];
}

export async function getTrainingTimeLogById(
  logId: string
): Promise<TrainingTimeLogRecord | null> {
  const { data, error } = await supabase
    .from('training_time_logs')
    .select(`
      id,
      trainee_id,
      module_id,
      trainer_id,
      entry_date,
      minutes_logged,
      notes,
      log_status,
      official_time_entry_id,
      created_at,
      updated_at,
      module:training_modules!training_time_logs_module_id_fkey(id, title),
      trainee:profiles!training_time_logs_trainee_id_fkey(first_name, last_name),
      trainer:profiles!training_time_logs_trainer_id_fkey(first_name, last_name)
    `)
    .eq('id', logId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as TrainingTimeLogRecord | null;
}

export async function createTrainingTimeLog(input: {
  trainee_id: string;
  module_id: string;
  trainer_id: string;
  entry_date?: string;
  minutes_logged: number;
  notes?: string | null;
}) {
  const { data, error } = await supabase
    .from('training_time_logs')
    .insert({
      trainee_id: input.trainee_id,
      module_id: input.module_id,
      trainer_id: input.trainer_id,
      entry_date: input.entry_date ?? new Date().toISOString().slice(0, 10),
      minutes_logged: input.minutes_logged,
      notes: input.notes ?? null,
      log_status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data as TrainingTimeLogRecord;
}

export async function voidTrainingTimeLog(logId: string) {
  const { data, error } = await supabase
    .from('training_time_logs')
    .update({
      log_status: 'voided',
    })
    .eq('id', logId)
    .select()
    .single();

  if (error) throw error;
  return data as TrainingTimeLogRecord;
}

export async function getTrainingTimeLogSignoffs(
  logId: string
): Promise<TrainingTimeLogSignoffRecord[]> {
  const { data, error } = await supabase
    .from('training_time_log_signoffs')
    .select(`
      id,
      time_log_id,
      signer_id,
      signer_role,
      signed_at
    `)
    .eq('time_log_id', logId);

  if (error) throw error;
  return (data ?? []) as TrainingTimeLogSignoffRecord[];
}

export async function createTrainingTimeLogSignoff(input: {
  time_log_id: string;
  signer_id: string;
  signer_role: 'trainer' | 'trainee';
}) {
  const { data, error } = await supabase
    .from('training_time_log_signoffs')
    .insert({
      time_log_id: input.time_log_id,
      signer_id: input.signer_id,
      signer_role: input.signer_role,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TrainingTimeLogSignoffRecord;
}

export async function finalizeTrainingTimeLog(logId: string) {
  const [log, signoffs] = await Promise.all([
    getTrainingTimeLogById(logId),
    getTrainingTimeLogSignoffs(logId),
  ]);

  if (!log) {
    throw new Error('Training time log not found.');
  }

  if (log.log_status !== 'pending') {
    throw new Error('Only pending time logs can be finalized.');
  }

  const hasTrainerSignoff = signoffs.some((item) => item.signer_role === 'trainer');
  const hasTraineeSignoff = signoffs.some((item) => item.signer_role === 'trainee');

  if (!hasTrainerSignoff || !hasTraineeSignoff) {
    throw new Error('Both trainer and trainee signoff are required.');
  }

  const officialEntry = await createTrainingTimeEntry({
    trainee_id: log.trainee_id,
    module_id: log.module_id,
    trainer_id: log.trainer_id,
    entry_date: log.entry_date,
    minutes_logged: log.minutes_logged,
    notes: log.notes ?? 'Manual training time log.',
  });

  const { data, error } = await supabase
    .from('training_time_logs')
    .update({
      log_status: 'completed',
      official_time_entry_id: officialEntry.id,
    })
    .eq('id', logId)
    .select()
    .single();

  if (error) throw error;
  return data as TrainingTimeLogRecord;
}

export async function getTrainingHourProgressByUser(
  userId: string
): Promise<TrainingHourProgressRecord[]> {
  const [modules, entries] = await Promise.all([
    getTrainingModules(),
    getTrainingTimeEntriesByUser(userId),
  ]);

  const timeBasedModules = modules.filter((module) => module.module_type === 'time_based');

  return timeBasedModules.map((module) => {
    const loggedMinutes = entries
      .filter((entry) => entry.module_id === module.id)
      .reduce((sum, entry) => sum + (entry.minutes_logged ?? 0), 0);

    const requiredHours = Number(module.required_hours ?? 0);
    const requiredMinutes = Math.max(0, Math.round(requiredHours * 60));
    const remainingMinutes = Math.max(requiredMinutes - loggedMinutes, 0);
    const percentComplete =
      requiredMinutes > 0
        ? Math.min(100, Math.round((loggedMinutes / requiredMinutes) * 100))
        : 0;

    return {
      moduleId: module.id,
      moduleTitle: module.title,
      requiredHours,
      loggedMinutes,
      loggedHours: Number((loggedMinutes / 60).toFixed(2)),
      remainingMinutes,
      remainingHours: Number((remainingMinutes / 60).toFixed(2)),
      percentComplete,
    };
  });
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
      duration_minutes,
      archived_at,
      archived_by,
      archive_reason,
      module:training_modules!training_sessions_module_id_fkey(
        title,
        department:departments!training_modules_department_id_fkey(name)
      ),
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

function calculateDurationMinutes(
  startedAt?: string | null,
  completedAt?: string | null
): number | null {
  if (!startedAt || !completedAt) return null;

  const started = new Date(startedAt).getTime();
  const completed = new Date(completedAt).getTime();

  if (Number.isNaN(started) || Number.isNaN(completed) || completed < started) {
    return null;
  }

  return Math.max(1, Math.round((completed - started) / 60000));
}

function calculateExpiresAt(
  issuedAtIso: string,
  recertFrequencyDays?: number | null
): string | null {
  if (!recertFrequencyDays || recertFrequencyDays <= 0) return null;

  const issued = new Date(issuedAtIso);
  issued.setDate(issued.getDate() + recertFrequencyDays);
  return issued.toISOString();
}

export async function completeTrainingSession(sessionId: string) {
  const session = await getTrainingSessionById(sessionId);

  if (!session) {
    throw new Error('Training session not found.');
  }

  const completedAt = new Date().toISOString();
  const durationMinutes = calculateDurationMinutes(session.started_at, completedAt);

  const { data, error } = await supabase
    .from('training_sessions')
    .update({
      session_status: 'completed',
      completed_at: completedAt,
      duration_minutes: durationMinutes,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;

  if (durationMinutes && durationMinutes > 0) {
    const module = await getTrainingModuleById(session.module_id);

    if (module?.module_type === 'time_based') {
      await createTrainingTimeEntry({
        trainee_id: session.trainee_id,
        module_id: session.module_id,
        session_id: sessionId,
        trainer_id: session.trainer_id,
        entry_date: completedAt.slice(0, 10),
        minutes_logged: durationMinutes,
        notes: 'Auto-logged from completed training session.',
      });
    }
  }

  const module = await getTrainingModuleById(session.module_id);

  const expiresAt = calculateExpiresAt(
    completedAt,
    module?.recert_frequency_days ?? null
  );

  await upsertTrainingCertification({
    trainee_id: session.trainee_id,
    module_id: session.module_id,
    last_session_id: sessionId,
    issued_at: completedAt,
    expires_at: expiresAt,
  });

  return data;
}

export async function archiveTrainingSession(input: {
  sessionId: string;
  archivedBy: string;
  reason: string;
}) {
  const { data, error } = await supabase
    .from('training_sessions')
    .update({
      archived_at: new Date().toISOString(),
      archived_by: input.archivedBy,
      archive_reason: input.reason,
    })
    .eq('id', input.sessionId)
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
      duration_minutes,
      archived_at,
      archived_by,
      archive_reason,
      module:training_modules!training_sessions_module_id_fkey(
        title,
        department:departments!training_modules_department_id_fkey(name)
      ),
      trainee:profiles!training_sessions_trainee_id_fkey(first_name, last_name),
      trainer:profiles!training_sessions_trainer_id_fkey(first_name, last_name)
    `)
    .eq('session_status', 'in_progress')
    .is('archived_at', null)
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
      duration_minutes,
      archived_at,
      archived_by,
      archive_reason,
      module:training_modules!training_sessions_module_id_fkey(
        title,
        department:departments!training_modules_department_id_fkey(name)
      ),
      trainee:profiles!training_sessions_trainee_id_fkey(first_name, last_name),
      trainer:profiles!training_sessions_trainer_id_fkey(first_name, last_name)
    `)
    .eq('session_status', 'completed')
    .is('archived_at', null)
    .order('completed_at', { ascending: false })
    .limit(8);

  if (error) throw error;
  return (data ?? []) as unknown as TrainingSessionRecord[];
}

export async function getAllTrainingSessions(): Promise<TrainingSessionRecord[]> {
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
      duration_minutes,
      archived_at,
      archived_by,
      archive_reason,
      module:training_modules!training_sessions_module_id_fkey(
        title,
        department:departments!training_modules_department_id_fkey(name)
      ),
      trainee:profiles!training_sessions_trainee_id_fkey(first_name, last_name),
      trainer:profiles!training_sessions_trainer_id_fkey(first_name, last_name)
    `)
    .is('archived_at', null)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as TrainingSessionRecord[];
}

export async function getTrainingSessionsByUser(
  userId: string
): Promise<TrainingSessionRecord[]> {
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
      duration_minutes,
      archived_at,
      archived_by,
      archive_reason,
      module:training_modules!training_sessions_module_id_fkey(
        title,
        department:departments!training_modules_department_id_fkey(name)
      ),
      trainee:profiles!training_sessions_trainee_id_fkey(first_name, last_name),
      trainer:profiles!training_sessions_trainer_id_fkey(first_name, last_name)
    `)
    .eq('trainee_id', userId)
    .order('started_at', { ascending: false });

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

export async function getProfilePinStatus(profileId: string): Promise<{
  hasPin: boolean;
  mustCreatePin: boolean;
  pinResetRequired: boolean;
}> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, pin_hash, pin, must_create_pin, pin_reset_required')
    .eq('id', profileId)
    .maybeSingle();

  if (error) throw error;

  const profile = data as ProfilePinRecord | null;

  return {
    hasPin: Boolean(profile?.pin_hash || profile?.pin),
    mustCreatePin: Boolean(profile?.must_create_pin),
    pinResetRequired: Boolean(profile?.pin_reset_required),
  };
}

export async function setProfilePin(profileId: string, pin: string) {
  const { data, error } = await supabase.functions.invoke('set-pin', {
    body: {
      profileId,
      pin,
    },
  });

  if (error) throw error;
  return data;
}

export async function verifyProfilePin(
  profileId: string,
  enteredPin: string
): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('verify-pin', {
    body: {
      profileId,
      pin: enteredPin,
    },
  });

  if (error) throw error;

  return Boolean(data?.valid);
}