import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import {
  getTrainingCertificationsByUser,
  getTrainingSessionsByUser,
  getUserTrainingProfile,
} from '../features/training/trainingApi';
import { mapTrainingSessionToCard } from '../features/training/sessionMappers';
import type { TrainingSessionCardModel } from '../features/training/sessionTypes';
import type {
  TrainingCertificationRecord,
  UserTrainingProfileRecord,
} from '../features/training/trainingApi';
import TrainingSubnav from '../features/training/TrainingSubnav';
import { theme } from '../styles/theme';

function UserTrainingProfilePage() {
  const { userId } = useParams();

  const [user, setUser] = useState<UserTrainingProfileRecord | null>(null);
  const [certifications, setCertifications] = useState<TrainingCertificationRecord[]>([]);
  const [sessions, setSessions] = useState<TrainingSessionCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!userId) return;

      try {
        const [userData, certificationData, sessionData] = await Promise.all([
          getUserTrainingProfile(userId),
          getTrainingCertificationsByUser(userId),
          getTrainingSessionsByUser(userId),
        ]);

        setUser(userData);
        setCertifications(certificationData);
        setSessions(sessionData.map(mapTrainingSessionToCard));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load user training profile.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  const currentCertifications = useMemo(() => {
    const now = new Date();

    return certifications.filter((cert) => {
      if (!cert.expires_at) return true;
      const expires = new Date(cert.expires_at);
      return Number.isNaN(expires.getTime()) || expires >= now;
    });
  }, [certifications]);

  const expiredCertifications = useMemo(() => {
    const now = new Date();

    return certifications.filter((cert) => {
      if (!cert.expires_at) return false;
      const expires = new Date(cert.expires_at);
      return !Number.isNaN(expires.getTime()) && expires < now;
    });
  }, [certifications]);

  const completedSessions = useMemo(
    () => sessions.filter((session) => session.status === 'Completed'),
    [sessions]
  );

  const inProgressSessions = useMemo(
    () => sessions.filter((session) => session.status === 'In Progress'),
    [sessions]
  );

  if (loading) {
    return (
      <PageContainer title="Loading training profile..." subtitle="Please wait.">
        <ContentCard title="Loading">Fetching user training profile.</ContentCard>
      </PageContainer>
    );
  }

  if (error || !user) {
    return (
      <PageContainer title="Training profile unavailable" subtitle="The requested user could not be loaded.">
        <ContentCard title="Unavailable">{error ?? 'User not found.'}</ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`${user.first_name} ${user.last_name}`.trim()}
      subtitle={`Training profile for @${user.username}`}
      actions={
        <Link to={`/users/${user.id}`} style={{ textDecoration: 'none' }}>
          <PrimaryButton>Open User Profile</PrimaryButton>
        </Link>
      }
    >
      <TrainingSubnav />

      <div style={layoutStyle}>
        <div style={{ display: 'grid', gap: '16px' }}>
          <ContentCard title="User Summary" subtitle="Training-related profile details.">
            <div style={summaryGridStyle}>
              <SummaryItem label="Role" value={user.role?.name ?? '—'} />
              <SummaryItem label="Department" value={user.department?.name ?? '—'} />
              <SummaryItem label="Shift" value={user.shift?.name ?? '—'} />
              <SummaryItem label="Employee ID" value={user.employee_id ?? '—'} />
              <SummaryItem label="Contact Email" value={user.email ?? '—'} />
              <SummaryItem label="Trainer Enabled" value={user.trainer_enabled ? 'Yes' : 'No'} />
              <SummaryItem label="Probationary" value={user.probationary ? 'Yes' : 'No'} />
              <SummaryItem label="Active" value={user.is_active ? 'Yes' : 'No'} />
            </div>
          </ContentCard>

          <ContentCard
            title="Completed Training Sessions"
            subtitle={`${completedSessions.length} completed`}
          >
            {completedSessions.length === 0 ? (
              <div style={emptyStyle}>No completed sessions found.</div>
            ) : (
              <div style={listStyle}>
                {completedSessions.map((session) => (
                  <Link
                    key={session.id}
                    to={`/training/sessions/${session.id}/view`}
                    style={recordLinkStyle}
                  >
                    <div style={recordTitleStyle}>{session.moduleTitle}</div>
                    <div style={recordMetaStyle}>
                      {session.departmentName} • {session.completedAt} • {session.durationMinutes ?? '—'}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </ContentCard>

          <ContentCard
            title="In Progress Sessions"
            subtitle={`${inProgressSessions.length} in progress`}
          >
            {inProgressSessions.length === 0 ? (
              <div style={emptyStyle}>No in-progress sessions found.</div>
            ) : (
              <div style={listStyle}>
                {inProgressSessions.map((session) => (
                  <Link
                    key={session.id}
                    to={`/training/sessions/${session.id}`}
                    style={recordLinkStyle}
                  >
                    <div style={recordTitleStyle}>{session.moduleTitle}</div>
                    <div style={recordMetaStyle}>
                      {session.departmentName} • {session.startedAt}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </ContentCard>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <ContentCard
            title="Current Certifications"
            subtitle={`${currentCertifications.length} current`}
          >
            {currentCertifications.length === 0 ? (
              <div style={emptyStyle}>No current certifications found.</div>
            ) : (
              <div style={listStyle}>
                {currentCertifications.map((cert) => (
                  <div key={cert.id} style={certCardStyle}>
                    <div style={recordTitleStyle}>{cert.module?.title ?? 'Untitled Module'}</div>
                    <div style={recordMetaStyle}>
                      {cert.module?.department?.name ?? '—'} • Issued {formatDateTime(cert.issued_at)}
                    </div>
                    <div style={recordMetaStyle}>
                      Expires {cert.expires_at ? formatDateTime(cert.expires_at) : 'No expiration'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ContentCard>

          <ContentCard
            title="Expired Certifications"
            subtitle={`${expiredCertifications.length} expired`}
          >
            {expiredCertifications.length === 0 ? (
              <div style={emptyStyle}>No expired certifications found.</div>
            ) : (
              <div style={listStyle}>
                {expiredCertifications.map((cert) => (
                  <div key={cert.id} style={certCardStyle}>
                    <div style={recordTitleStyle}>{cert.module?.title ?? 'Untitled Module'}</div>
                    <div style={recordMetaStyle}>
                      {cert.module?.department?.name ?? '—'} • Issued {formatDateTime(cert.issued_at)}
                    </div>
                    <div style={expiredTextStyle}>
                      Expired {cert.expires_at ? formatDateTime(cert.expires_at) : '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ContentCard>

          <ContentCard title="Quiz History" subtitle="Placeholder for upcoming quiz engine.">
            <div style={emptyStyle}>
              Quiz history will appear here once module quizzes are built.
            </div>
          </ContentCard>
        </div>
      </div>
    </PageContainer>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={summaryItemStyle}>
      <div style={summaryLabelStyle}>{label}</div>
      <div style={summaryValueStyle}>{value}</div>
    </div>
  );
}

function formatDateTime(value?: string | null) {
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

const layoutStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.9fr)',
  gap: '16px',
  alignItems: 'start',
};

const summaryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '12px',
};

const summaryItemStyle: CSSProperties = {
  padding: '14px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
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
  fontSize: '15px',
  fontWeight: 700,
  color: theme.colors.text,
};

const listStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
};

const recordLinkStyle: CSSProperties = {
  display: 'block',
  textDecoration: 'none',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  padding: '14px',
  background: '#ffffff',
};

const certCardStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  padding: '14px',
  background: '#ffffff',
};

const recordTitleStyle: CSSProperties = {
  fontWeight: 800,
  color: theme.colors.text,
  marginBottom: '6px',
};

const recordMetaStyle: CSSProperties = {
  fontSize: '13px',
  color: theme.colors.mutedText,
  lineHeight: 1.5,
};

const expiredTextStyle: CSSProperties = {
  fontSize: '13px',
  color: '#a12828',
  fontWeight: 700,
  marginTop: '4px',
};

const emptyStyle: CSSProperties = {
  color: theme.colors.mutedText,
  lineHeight: 1.6,
};

export default UserTrainingProfilePage;