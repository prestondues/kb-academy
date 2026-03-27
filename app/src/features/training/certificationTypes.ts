export type TrainingCertificationRecord = {
  id: string;
  trainee_id: string;
  module_id: string;
  issued_at: string;
  expires_at?: string | null;
  last_session_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};