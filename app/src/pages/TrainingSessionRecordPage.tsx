import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import {
  archiveTrainingSession,
  getTrainingModuleById,
  getTrainingSessionById,
  getTrainingSessionProgress,
  getTrainingSessionSignoffs,
  getTrainingSections,
} from '../features/training/trainingApi';
import type { TrainingSectionRecord } from '../features/training/sectionTypes';
import { useAuth } from '../features/auth/useAuth';

type ProgressMap = Record<
  string,
  {
    progressId: string;
    isCompleted: boolean;
  }
>;

function TrainingSessionRecordPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [moduleTitle, setModuleTitle] = useState('Training Session');
  const [sections, setSections] = useState<TrainingSectionRecord[]>([]);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [sessionMeta, setSessionMeta] = useState<{
    traineeName: string;
    trainerName: string;
    status: string;
    startedAt: string;
    completedAt: string;
    durationMinutes: number | null;
    archivedAt: string | null;
    archiveReason: string | null;
  } | null>(null);
  const [trainerSignedAt, setTrainerSignedAt] = useState<string | null>(null);
  const [traineeSignedAt, setTraineeSignedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [archiveReason, setArchiveReason] = useState('');
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);

  const roleName = profile?.role?.name?.toLowerCase?.() ?? '';
  const isAdmin = roleName.includes('admin');

  useEffect(() => {
    async function loadData() {
      if (!sessionId) return;

      try {
        const session = await getTrainingSessionById(sessionId);
        if (!session) {
          setLoading(false);
          return;
        }

        setSessionMeta({
          traineeName:
            `${session.trainee?.first_name ?? ''} ${session.trainee?.last_name ?? ''}`.trim() ||
            'Unknown Trainee',
          trainerName:
            `${session.trainer?.first_name ?? ''} ${session.trainer?.last_name ?? ''}`.trim() ||
            'Unknown Trainer',
          status: session.session_status === 'completed' ? 'Completed' : 'In Progress',
          startedAt: formatDateTime(session.started_at),
          completedAt: formatDateTime(session.completed_at),
          durationMinutes: session.duration_minutes ?? null,
          archivedAt: session.archived_at ?? null,
          archiveReason: session.archive_reason ?? null,
        });

        const [moduleData, sectionData, progressData, signoffData] = await Promise.all([
          getTrainingModuleById(session.module_id),
          getTrainingSections(session.module_id),
          getTrainingSessionProgress(sessionId),
          getTrainingSessionSignoffs(sessionId),
        ]);

        if (moduleData) {
          setModuleTitle(moduleData.title);
        }

        setSections(sectionData);

        const map: ProgressMap = {};
        progressData.forEach((progress) => {
          map[progress.section_id] = {
            progressId: progress.id,
            isCompleted: progress.is_completed,
          };
        });

        setProgressMap(map);

        const trainerSignoff = signoffData.find((s) => s.signer_role === 'trainer');
        const traineeSignoff = signoffData.find((s) => s.signer_role === 'trainee');

        setTrainerSignedAt(trainerSignoff?.signed_at ?? null);
        setTraineeSignedAt(traineeSignoff?.signed_at ?? null);
      } catch (error) {
        console.error('LOAD SESSION RECORD ERROR:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [sessionId]);

  const completedSectionCount = useMemo(
    () => sections.filter((section) => progressMap[section.id]?.isCompleted).length,
    [sections, progressMap]
  );

  async function handleArchive() {
    if (!sessionId || !user?.id) return;

    if (!archiveReason.trim()) {
      setArchiveError('Archive reason is required.');
      return;
    }

    try {
      setArchiving(true);
      setArchiveError(null);

      await archiveTrainingSession({
        sessionId,
        archivedBy: user.id,
        reason: archiveReason.trim(),
      });

      navigate('/training/records');
    } catch (error: unknown) {
      console.error('ARCHIVE SESSION ERROR:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to archive session.';
      setArchiveError(message);
    } finally {
      setArchiving(false);
    }
  }

  if (loading) {
    return (
      <PageContainer title="Loading session..." subtitle="Please wait.">
        <ContentCard title="Loading">Fetching training session record.</ContentCard>
      </PageContainer>
    );
  }

  if (!sessionMeta) {
    return (
      <PageContainer title="Session not found" subtitle="No training session matched this record.">
        <ContentCard title="Missing Session">This training session could not be found.</ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={moduleTitle}
      subtitle="Read-only training session record."
      actions={
        <Link to="/training/records" style={{ textDecoration: 'none' }}>
          <PrimaryButton>Back to Records</PrimaryButton>
        </Link>
      }
    >
      <div style={gridStyle}>
        <div style={{ display: 'grid', gap: '16px' }}>
          <ContentCard title="Session Overview" subtitle="Historical record details.">
            <div style={detailGridStyle}>
              <DetailRow label="Trainee" value={sessionMeta.traineeName} />
              <DetailRow label="Trainer" value={sessionMeta.trainerName} />
              <DetailRow label="Status" value={sessionMeta.status} />
              <DetailRow label="Started" value={sessionMeta.startedAt} />
              <DetailRow label="Completed" value={sessionMeta.completedAt} />
              <DetailRow
                label="Duration"
                value={
                  sessionMeta.durationMinutes !== null
                    ? `${sessionMeta.durationMinutes} min`
                    : '—'
                }
              />
              <DetailRow
                label="Trainer Sign-Off"
                value={trainerSignedAt ? formatDateTime(trainerSignedAt) : 'Not signed'}
              />
              <DetailRow
                label="Trainee Sign-Off"
                value={traineeSignedAt ? formatDateTime(traineeSignedAt) : 'Not signed'}
              />
              <DetailRow
                label="Archived"
                value={sessionMeta.archivedAt ? formatDateTime(sessionMeta.archivedAt) : 'No'}
              />
              <DetailRow
                label="Archive Reason"
                value={sessionMeta.archiveReason ?? '—'}
              />
            </div>
          </ContentCard>

          <ContentCard
            title="Section Completion"
            subtitle={`${completedSectionCount} of ${sections.length} sections completed`}
          >
            <div style={{ display: 'grid', gap: '12px' }}>
              {sections.map((section) => {
                const checked = progressMap[section.id]?.isCompleted ?? false;

                return (
                  <div
                    key={section.id}
                    style={{
                      display: 'grid',
                      gap: '8px',
                      padding: '16px',
                      border: '1px solid #dbe4ee',
                      borderRadius: '16px',
                      background: checked ? '#f7fbff' : '#ffffff',
                    }}
                  >
                    <div style={sectionHeaderStyle}>
                      <div>
                        <div style={{ fontWeight: 800 }}>
                          {section.sort_order}. {section.title}
                        </div>
                        <div style={{ marginTop: '6px', color: '#5f6b76', fontSize: '14px' }}>
                          {section.section_type}
                          {section.is_required ? ' • required' : ' • optional'}
                        </div>
                      </div>

                      <div
                        style={{
                          ...statusPillStyle,
                          background: checked ? '#e8f7ee' : '#f7f9fc',
                          color: checked ? '#18794e' : '#5f6b76',
                        }}
                      >
                        {checked ? 'Completed' : 'Not Completed'}
                      </div>
                    </div>

                    {section.body_text ? (
                      <div style={{ color: '#5f6b76', lineHeight: 1.6 }}>
                        {section.body_text}
                      </div>
                    ) : null}

                    {section.media_url ? (
                      <div style={{ color: '#194f91', fontSize: '13px', wordBreak: 'break-word' }}>
                        {section.media_url}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </ContentCard>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <ContentCard title="Record Status" subtitle="Session record controls.">
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={infoPillStyle}>{sessionMeta.status}</div>
              {sessionMeta.archivedAt ? (
                <div style={archivedNoticeStyle}>This session has been archived.</div>
              ) : null}
            </div>
          </ContentCard>

          {isAdmin && !sessionMeta.archivedAt ? (
            <ContentCard title="Archive Session" subtitle="Admin-only soft archive action.">
              <div style={{ display: 'grid', gap: '12px' }}>
                <label style={labelStyle}>Archive Reason</label>
                <textarea
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  style={textAreaStyle}
                  rows={4}
                />

                {archiveError ? <div style={errorStyle}>{archiveError}</div> : null}

                <button
                  type="button"
                  onClick={handleArchive}
                  disabled={archiving}
                  style={archiveButtonStyle}
                >
                  {archiving ? 'Archiving...' : 'Archive Session'}
                </button>
              </div>
            </ContentCard>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}

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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={detailRowStyle}>
      <span style={detailLabelStyle}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 0.8fr)',
  gap: '16px',
  alignItems: 'start',
};

const detailGridStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
};

const detailRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  paddingBottom: '10px',
  borderBottom: '1px solid #eef3f8',
};

const detailLabelStyle: CSSProperties = {
  color: '#5f6b76',
  fontWeight: 700,
};

const sectionHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  alignItems: 'flex-start',
};

const statusPillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '10px 14px',
  borderRadius: '999px',
  fontWeight: 800,
  fontSize: '12px',
  flexShrink: 0,
};

const infoPillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '10px 14px',
  borderRadius: '999px',
  background: '#eef6ff',
  color: '#194f91',
  fontWeight: 800,
  fontSize: '12px',
};

const archivedNoticeStyle: CSSProperties = {
  padding: '12px 14px',
  borderRadius: '14px',
  background: '#fff7f7',
  color: '#a12828',
  fontWeight: 700,
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 700,
};

const textAreaStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #dbe4ee',
  borderRadius: '14px',
  padding: '12px 14px',
  fontSize: '14px',
  resize: 'vertical',
};

const archiveButtonStyle: CSSProperties = {
  border: '1px solid #f3cccc',
  background: '#fff7f7',
  color: '#a12828',
  borderRadius: '14px',
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const errorStyle: CSSProperties = {
  background: '#fdecec',
  color: '#a12828',
  padding: '12px 14px',
  borderRadius: '12px',
};

export default TrainingSessionRecordPage;