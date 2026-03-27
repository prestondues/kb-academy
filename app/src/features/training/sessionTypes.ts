export type TrainingSessionRecord = {
  id: string;
  module_id: string;
  trainee_id: string;
  trainer_id: string;
  session_status: 'in_progress' | 'completed';
  started_at?: string | null;
  completed_at?: string | null;
  duration_minutes?: number | null;
  archived_at?: string | null;
  archived_by?: string | null;
  archive_reason?: string | null;
  module?: {
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

export type TrainingSessionProgressRecord = {
  id: string;
  session_id: string;
  section_id: string;
  is_completed: boolean;
  completed_at?: string | null;
};

export type TrainingSessionCardModel = {
  id: string;
  moduleTitle: string;
  traineeName: string;
  trainerName: string;
  status: 'In Progress' | 'Completed';
  startedAt: string;
  completedAt: string;
  durationMinutes?: string;
};