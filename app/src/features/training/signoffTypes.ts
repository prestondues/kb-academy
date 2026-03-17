export type TrainingSessionSignoffRole = 'trainer' | 'trainee';

export type TrainingSessionSignoffRecord = {
  id: string;
  session_id: string;
  signer_id: string;
  signer_role: TrainingSessionSignoffRole;
  signed_at?: string | null;
};