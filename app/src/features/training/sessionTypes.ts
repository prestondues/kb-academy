export type TrainingSessionStatus = 'in_progress' | 'completed';

export type TrainingSessionRecord = {
  id: string;
  module_id: string;
  trainee_id: string;
  trainer_id: string;
  session_status: TrainingSessionStatus;
  started_at?: string | null;
  completed_at?: string | null;
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
  status: 'In Progress' | 'Completed';
  startedAt: string;
  completedAt: string;
};