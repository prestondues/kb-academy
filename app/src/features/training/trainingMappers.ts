import type {
  TrainingModuleCardModel,
  TrainingModuleRecord,
} from './types';

export function mapTrainingModuleToCard(
  module: TrainingModuleRecord
): TrainingModuleCardModel {
  return {
    id: module.id,
    title: module.title,
    description: module.description ?? 'No description provided.',
    moduleType: module.module_type === 'time_based' ? 'Time Based' : 'Sign Off',
    department: module.department?.name ?? 'General',
    requiredHours:
      module.required_hours !== null && module.required_hours !== undefined
        ? `${module.required_hours} hrs`
        : '—',
    recertFrequency:
      module.recert_frequency_days !== null &&
      module.recert_frequency_days !== undefined
        ? `${module.recert_frequency_days} days`
        : 'None',
    requiresQuiz: module.requires_quiz,
    allergenFlag: module.allergen_flag,
    sqfElement: module.sqf_element ?? '—',
    status: module.is_active ? 'Active' : 'Inactive',
  };
}