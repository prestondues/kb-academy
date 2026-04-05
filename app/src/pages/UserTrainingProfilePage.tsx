import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import {
  getTrainingCertificationsByUser,
  getTrainingHourProgressByUser,
  getTrainingQuizAttemptsByUser,
  getTrainingSessionsByUser,
  getTrainingTimeEntriesByUser,
  getUserTrainingProfile,
  type TrainingCertificationRecord,
  type TrainingHourProgressRecord,
  type TrainingQuizAttemptRecord,
  type TrainingTimeEntryRecord,
  type UserTrainingProfileRecord,
} from '../features/training/trainingApi';
import type { TrainingSessionRecord } from '../features/training/sessionTypes';
import { theme } from '../styles/theme';

type CertificationRow = {
  id: string;
  moduleTitle: string;
  departmentName: string;
  issuedAt: string;
  expiresAt: string;
  status: 'Current' | 'Expired';
};

type QuizAttemptRow = {
  id: string;
  moduleTitle: string;
  quizTitle: string;
  scorePercent: string;
  result: 'Pass' | 'Fail' | 'In Progress';
  submittedAt: string;
};

function formatDate(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString([], {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

function getCertificationStatus(expiresAt?: string | null): 'Current' | 'Expired' {
  if (!expiresAt) return 'Current';

  const expires = new Date(expiresAt);
  if (Number.isNaN(expires.getTime())) return 'Current';

  return expires < new Date() ? 'Expired' : 'Current';
}

function mapCertification(record: TrainingCertificationRecord): CertificationRow {
  return {
    id: record.id,
    moduleTitle: record.module?.title ?? 'Untitled Module',
    departmentName: record.module?.department?.name ?? '—',
    issuedAt: formatDate(record.issued_at),
    expiresAt: record.expires_at ? formatDate(record.expires_at) : 'No expiration',
    status: getCertificationStatus(record.expires_at),
  };
}

function mapQuizAttempt(record: TrainingQuizAttemptRecord): QuizAttemptRow {
  let result: 'Pass' | 'Fail' | 'In Progress' = 'In Progress';

  if (record.status === 'submitted') {
    result = record.passed ? 'Pass' : 'Fail';
  }

  return {
    id: record.id,
    moduleTitle: record.module?.title ?? 'Untitled Module',
    quizTitle: record.quiz?.title ?? 'Untitled Quiz',
    scorePercent:
      typeof record.score_percent === 'number' ? `${record.score_percent}%` : '—',
    result,
    submittedAt: record.submitted_at ? formatDate(record.submitted_at) : '—',
  };
}

function UserTrainingProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserTrainingProfileRecord | null>(null);
  const [hourProgress, setHourProgress] = useState<TrainingHourProgressRecord[]>([]);
  const [timeEntries, setTimeEntries] = useState<TrainingTimeEntryRecord[]>([]);
  const [sessions, setSessions] = useState<TrainingSessionRecord[]>([]);
  const [certifications, setCertifications] = useState<CertificationRow[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!userId) {
        setError('User not found.');
        setLoading(false);
        return;
      }

      try {
        const [
          profileData,
          hourProgressData,
          timeEntriesData,
          sessionsData,
          certificationData,
          quizAttemptData,
        ] = await Promise.all([
          getUserTrainingProfile(userId),
          getTrainingHourProgressByUser(userId),
          getTrainingTimeEntriesByUser(userId),
          getTrainingSessionsByUser(userId),
          getTrainingCertificationsByUser(userId),
          getTrainingQuizAttemptsByUser(userId),
        ]);

        setProfile(profileData);
        setHourProgress(hourProgressData);
        setTimeEntries(timeEntriesData);
        setSessions(sessionsData);
        setCertifications(certificationData.map(mapCertification));
        setQuizAttempts(quizAttemptData.map(mapQuizAttempt));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load user training profile.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  const currentCertifications = useMemo(
    () => certifications.filter((item) => item.status === 'Current'),
    [certifications]
  );

  const expiredCertifications = useMemo(
    () => certifications.filter((item) => item.status === 'Expired'),
    [certifications]
  );

  const passedAttempts = useMemo(
    () => quizAttempts.filter((item) => item.result === 'Pass'),
    [quizAttempts]
  );

  const failedAttempts = useMemo(
    () => quizAttempts.filter((item) => item.result === 'Fail'),
    [quizAttempts]
  );

  if (loading) {
    return (
      <PageContainer title="User Training Profile" subtitle="Loading training profile...">
        <ContentCard title="Loading">Please wait.</ContentCard>
      </PageContainer>
    );
  }

  if (error || !profile) {
    return (
      <PageContainer title="User Training Profile" subtitle="Unable to load profile.">
        <ContentCard title="Unavailable">{error ?? 'User not found.'}</ContentCard>
      </PageContainer>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim();

  return (
    <PageContainer
      title={fullName}
      subtitle={`${profile.department?.name ?? '—'} • ${profile.shift?.name ?? '—'}`}
      actions={
        <div style={actionsStyle}>
          <PrimaryButton onClick={() => navigate(-1)}>Back</PrimaryButton>
        </div>
      }
    >
      <div style={layoutStyle}>
        <ContentCard title="Profile Summary" subtitle="User training and certification overview.">
          <div style={summaryGridStyle}>
            <SummaryItem label="Username" value={`@${profile.username}`} />
            <SummaryItem label="Role" value={profile.role?.name ?? '—'} />
            <SummaryItem label="Department" value={profile.department?.name ?? '—'} />
            <SummaryItem label="Shift" value={profile.shift?.name ?? '—'} />
            <SummaryItem
              label="Current Certifications"
              value={String(currentCertifications.length)}
            />
            <SummaryItem
              label="Expired Certifications"
              value={String(expiredCertifications.length)}
            />
            <SummaryItem label="Passed Quiz Attempts" value={String(passedAttempts.length)} />
            <SummaryItem label="Failed Quiz Attempts" value={String(failedAttempts.length)} />
            <SummaryItem label="Training Sessions" value={String(sessions.length)} />
            <SummaryItem label="Time Entries" value={String(timeEntries.length)} />
          </div>
        </ContentCard>

        <ContentCard
          title="Certification Records"
          subtitle={`${certifications.length} certification record${certifications.length === 1 ? '' : 's'}`}
        >
          {certifications.length === 0 ? (
            <div style={emptyStyle}>No certification records found.</div>
          ) : (
            <div style={tableWrapStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Module</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Issued</th>
                    <th style={thStyle}>Expires</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {certifications.map((record) => (
                    <tr key={record.id}>
                      <td style={tdStyle}>{record.moduleTitle}</td>
                      <td style={tdStyle}>{record.departmentName}</td>
                      <td style={tdStyle}>{record.issuedAt}</td>
                      <td style={tdStyle}>{record.expiresAt}</td>
                      <td style={tdStyle}>
                        <span
                          style={
                            record.status === 'Current'
                              ? currentBadgeStyle
                              : expiredBadgeStyle
                          }
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ContentCard>

        <ContentCard
          title="Quiz Attempt History"
          subtitle={`${quizAttempts.length} quiz attempt${quizAttempts.length === 1 ? '' : 's'}`}
        >
          {quizAttempts.length === 0 ? (
            <div style={emptyStyle}>No quiz attempts found.</div>
          ) : (
            <div style={tableWrapStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Module</th>
                    <th style={thStyle}>Quiz</th>
                    <th style={thStyle}>Score</th>
                    <th style={thStyle}>Result</th>
                    <th style={thStyle}>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {quizAttempts.map((record) => (
                    <tr key={record.id}>
                      <td style={tdStyle}>{record.moduleTitle}</td>
                      <td style={tdStyle}>{record.quizTitle}</td>
                      <td style={tdStyle}>{record.scorePercent}</td>
                      <td style={tdStyle}>
                        <span
                          style={
                            record.result === 'Pass'
                              ? currentBadgeStyle
                              : record.result === 'Fail'
                              ? expiredBadgeStyle
                              : neutralBadgeStyle
                          }
                        >
                          {record.result}
                        </span>
                      </td>
                      <td style={tdStyle}>{record.submittedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ContentCard>

        <ContentCard
          title="Hours Progress"
          subtitle={`${hourProgress.length} tracked module${hourProgress.length === 1 ? '' : 's'}`}
        >
          {hourProgress.length === 0 ? (
            <div style={emptyStyle}>No hour-based progress found.</div>
          ) : (
            <div style={progressListStyle}>
              {hourProgress.map((item) => (
                <div key={item.moduleId} style={progressCardStyle}>
                  <div style={progressTopStyle}>
                    <div style={progressTitleStyle}>{item.moduleTitle}</div>
                    <div style={progressPercentStyle}>{item.percentComplete}%</div>
                  </div>
                  <div style={progressMetaStyle}>
                    Logged {item.loggedHours} / {item.requiredHours} hours
                  </div>
                  <div style={progressBarTrackStyle}>
                    <div
                      style={{
                        ...progressBarFillStyle,
                        width: `${Math.min(item.percentComplete, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ContentCard>
      </div>
    </PageContainer>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={summaryCardStyle}>
      <div style={summaryLabelStyle}>{label}</div>
      <div style={summaryValueStyle}>{value}</div>
    </div>
  );
}

const actionsStyle: CSSProperties = {
  display: 'flex',
  gap: '10px',
};

const layoutStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
};

const summaryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: '12px',
};

const summaryCardStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  padding: '14px',
  background: '#ffffff',
};

const summaryLabelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.colors.mutedText,
  marginBottom: '6px',
};

const summaryValueStyle: CSSProperties = {
  fontSize: '17px',
  fontWeight: 800,
  color: theme.colors.text,
};

const emptyStyle: CSSProperties = {
  color: theme.colors.mutedText,
  lineHeight: 1.6,
};

const tableWrapStyle: CSSProperties = {
  overflowX: 'auto',
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '12px',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.colors.mutedText,
  borderBottom: `1px solid ${theme.colors.border}`,
};

const tdStyle: CSSProperties = {
  padding: '14px 12px',
  borderBottom: `1px solid ${theme.colors.border}`,
  verticalAlign: 'top',
  color: theme.colors.text,
};

const currentBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#e8f7ee',
  color: '#18794e',
  fontWeight: 800,
  fontSize: '12px',
};

const expiredBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#fff4e8',
  color: '#9a5b13',
  fontWeight: 800,
  fontSize: '12px',
};

const neutralBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#eef3f8',
  color: '#4b5b6a',
  fontWeight: 800,
  fontSize: '12px',
};

const progressListStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
};

const progressCardStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  padding: '14px',
  background: '#ffffff',
};

const progressTopStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'center',
};

const progressTitleStyle: CSSProperties = {
  fontWeight: 800,
  color: theme.colors.text,
};

const progressPercentStyle: CSSProperties = {
  fontWeight: 800,
  color: '#194f91',
};

const progressMetaStyle: CSSProperties = {
  marginTop: '6px',
  color: theme.colors.mutedText,
  fontSize: '14px',
};

const progressBarTrackStyle: CSSProperties = {
  marginTop: '12px',
  width: '100%',
  height: '10px',
  borderRadius: '999px',
  background: '#e9eef4',
  overflow: 'hidden',
};

const progressBarFillStyle: CSSProperties = {
  height: '100%',
  borderRadius: '999px',
  background: '#194f91',
};

export default UserTrainingProfilePage;