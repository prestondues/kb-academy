export type TrainingModuleType = 'time_based' | 'sign_off';

export type TrainingModuleRecord = {
  id: string;
  title: string;
  description?: string | null;
  module_type: TrainingModuleType;
  department_id?: string | null;
  department?: { name?: string | null } | null;
  required_hours?: number | null;
  recert_frequency_days?: number | null;
  requires_quiz: boolean;
  allergen_flag: boolean;
  sqf_element?: string | null;
  is_active: boolean;
  created_at?: string | null;
};

export type TrainingModuleCardModel = {
  id: string;
  title: string;
  description: string;
  moduleType: 'Time Based' | 'Sign Off';
  department: string;
  requiredHours: string;
  recertFrequency: string;
  requiresQuiz: boolean;
  allergenFlag: boolean;
  sqfElement: string;
  status: 'Active' | 'Inactive';
};