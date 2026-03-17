import type {
  TrainingSessionCardModel,
  TrainingSessionRecord,
} from './sessionTypes';

function formatDateTime(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);

  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function mapTrainingSessionToCard(
  session: TrainingSessionRecord
): TrainingSessionCardModel {
  return {
    id: session.id,
    status: session.session_status === 'completed' ? 'Completed' : 'In Progress',
    moduleTitle: session.module?.title ?? 'Training Module',
    traineeName:
      `${session.trainee?.first_name ?? ''} ${session.trainee?.last_name ?? ''}`.trim() ||
      'Unknown Trainee',
    trainerName:
      `${session.trainer?.first_name ?? ''} ${session.trainer?.last_name ?? ''}`.trim() ||
      'Unknown Trainer',
    startedAt: formatDateTime(session.started_at),
    completedAt: formatDateTime(session.completed_at),
  };
}