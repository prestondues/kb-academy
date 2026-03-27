import type { TrainingSessionCardModel, TrainingSessionRecord } from './sessionTypes';

function formatDateTime(value?: string | null): string {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString([], {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function mapTrainingSessionToCard(
  session: TrainingSessionRecord
): TrainingSessionCardModel {
  const traineeName =
    `${session.trainee?.first_name ?? ''} ${session.trainee?.last_name ?? ''}`.trim() ||
    'Unknown Trainee';

  const trainerName =
    `${session.trainer?.first_name ?? ''} ${session.trainer?.last_name ?? ''}`.trim() ||
    'Unknown Trainer';

  return {
    id: session.id,
    moduleTitle: session.module?.title ?? 'Untitled Module',
    traineeName,
    trainerName,
    status: session.session_status === 'completed' ? 'Completed' : 'In Progress',
    startedAt: formatDateTime(session.started_at),
    completedAt: formatDateTime(session.completed_at),
    durationMinutes:
      session.duration_minutes !== null && session.duration_minutes !== undefined
        ? `${session.duration_minutes} min`
        : '—',
  };
}