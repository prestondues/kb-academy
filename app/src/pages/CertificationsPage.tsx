import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import {
  getTrainingCertificationRecords,
  type TrainingCertificationListRecord,
} from '../features/training/trainingApi';
import { theme } from '../styles/theme';

type CertificationStatus = 'Current' | 'Expiring Soon' | 'Expired';

type CertificationRow = {
  id: string;
  traineeName: string;
  username: string;
  moduleTitle: string;
  departmentName: string;
  issuedAt: string;
  expiresAt: string;
  expiresAtRaw: string | null;
  status: CertificationStatus;
  quizAttemptId: string | null;
};

function formatDateTime(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString([], {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

function getCertificationStatus(expiresAt?: string | null): CertificationStatus {
  if (!expiresAt) return 'Current';

  const expires = new Date(expiresAt);
  if (Number.isNaN(expires.getTime())) return 'Current';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiresDay = new Date(
    expires.getFullYear(),
    expires.getMonth(),
    expires.getDate()
  );

  if (expiresDay < today) return 'Expired';

  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  if (expiresDay <= thirtyDaysFromNow) return 'Expiring Soon';

  return 'Current';
}

function mapCertification(record: TrainingCertificationListRecord): CertificationRow {
  const firstName = record.trainee?.first_name ?? '';
  const lastName = record.trainee?.last_name ?? '';
  const username = record.trainee?.username ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Unknown User';
  const status = getCertificationStatus(record.expires_at);

  return {
    id: record.id,
    traineeName: fullName,
    username,
    moduleTitle: record.module?.title ?? 'Untitled Module',
    departmentName: record.module?.department?.name ?? '—',
    issuedAt: formatDateTime(record.issued_at),
    expiresAt: record.expires_at ? formatDateTime(record.expires_at) : 'No expiration',
    expiresAtRaw: record.expires_at ?? null,
    status,
    quizAttemptId: record.quiz_attempt_id ?? null,
  };
}

function CertificationsPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<CertificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getTrainingCertificationRecords();
        setRecords(data.map(mapCertification));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load certifications.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const currentCertifications = useMemo(
    () => records.filter((record) => record.status === 'Current'),
    [records]
  );

  const expiringSoonCertifications = useMemo(
    () => records.filter((record) => record.status === 'Expiring Soon'),
    [records]
  );

  const expiredCertifications = useMemo(
    () => records.filter((record) => record.status === 'Expired'),
    [records]
  );

  const attentionRecords = useMemo(
    () =>
      [...records]
        .filter(
          (record) =>
            record.status === 'Expiring Soon' || record.status === 'Expired'
        )
        .sort((a, b) => {
          const aTime = a.expiresAtRaw ? new Date(a.expiresAtRaw).getTime() : Number.MAX_SAFE_INTEGER;
          const bTime = b.expiresAtRaw ? new Date(b.expiresAtRaw).getTime() : Number.MAX_SAFE_INTEGER;
          return aTime - bTime;
        }),
    [records]
  );

  if (loading) {
    return (
      <PageContainer
        title="Certifications"
        subtitle="Loading certification records..."
        actions={
          <Link to="/certifications/start" style={{ textDecoration: 'none' }}>
            <PrimaryButton>Start Certification</PrimaryButton>
          </Link>
        }
      >
        <ContentCard title="Loading">Please wait.</ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Certifications"
      subtitle="Official certification records and trainer-led certification actions."
      actions={
        <Link to="/certifications/start" style={{ textDecoration: 'none' }}>
          <PrimaryButton>Start Certification</PrimaryButton>
        </Link>
      }
    >
      <div style={layoutStyle}>
        <ContentCard title="Certification Summary" subtitle="Current certification totals.">
          <div style={summaryGridStyle}>
            <SummaryItem label="Total Records" value={String(records.length)} />
            <SummaryItem label="Current" value={String(currentCertifications.length)} />
            <SummaryItem label="Expiring Soon" value={String(expiringSoonCertifications.length)} />
            <SummaryItem label="Expired" value={String(expiredCertifications.length)} />
          </div>

          {error ? <div style={errorStyle}>{error}</div> : null}
        </ContentCard>

        <ContentCard
          title="Needs Attention"
          subtitle="Certifications that are expired or expiring within 30 days."
        >
          {attentionRecords.length === 0 ? (
            <div style={emptyStyle}>No certifications currently need attention.</div>
          ) : (
            <div style={attentionListStyle}>
              {attentionRecords.map((record) => (
                <div key={record.id} style={attentionCardStyle}>
                  <div style={attentionTopRowStyle}>
                    <div>
                      <div style={attentionTitleStyle}>{record.traineeName}</div>
                      <div style={attentionMetaStyle}>
                        {record.moduleTitle} • {record.departmentName}
                      </div>
                    </div>

                    <span
                      style={
                        record.status === 'Expired'
                          ? expiredBadgeStyle
                          : warningBadgeStyle
                      }
                    >
                      {record.status}
                    </span>
                  </div>

                  <div style={attentionDatesStyle}>
                    Expires: {record.expiresAt}
                  </div>

                  <div style={reviewButtonsWrapStyle}>
                    <button
                      type="button"
                      style={reviewButtonStyle}
                      onClick={() => navigate(`/training/certifications/${record.id}`)}
                    >
                      Review Certification
                    </button>

                    <button
                      type="button"
                      style={reviewButtonStyle}
                      disabled={!record.quizAttemptId}
                      onClick={() => {
                        if (record.quizAttemptId) {
                          navigate(`/training/quiz-attempts/${record.quizAttemptId}`);
                        }
                      }}
                    >
                      Review Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ContentCard>

        <ContentCard
          title="Certification Records"
          subtitle={`${records.length} certification record${records.length === 1 ? '' : 's'}`}
        >
          {records.length === 0 ? (
            <div style={emptyStyle}>No certification records found yet.</div>
          ) : (
            <div style={tableWrapStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Trainee</th>
                    <th style={thStyle}>Module</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Issued</th>
                    <th style={thStyle}>Expires</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td style={tdStyle}>
                        <div style={primaryCellStyle}>{record.traineeName}</div>
                        <div style={secondaryCellStyle}>
                          {record.username ? `@${record.username}` : '—'}
                        </div>
                      </td>
                      <td style={tdStyle}>{record.moduleTitle}</td>
                      <td style={tdStyle}>{record.departmentName}</td>
                      <td style={tdStyle}>{record.issuedAt}</td>
                      <td style={tdStyle}>{record.expiresAt}</td>
                      <td style={tdStyle}>
                        <span
                          style={
                            record.status === 'Expired'
                              ? expiredBadgeStyle
                              : record.status === 'Expiring Soon'
                              ? warningBadgeStyle
                              : currentBadgeStyle
                          }
                        >
                          {record.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={reviewButtonsWrapStyle}>
                          <button
                            type="button"
                            style={reviewButtonStyle}
                            onClick={() => navigate(`/training/certifications/${record.id}`)}
                          >
                            Review Certification
                          </button>

                          <button
                            type="button"
                            style={reviewButtonStyle}
                            disabled={!record.quizAttemptId}
                            onClick={() => {
                              if (record.quizAttemptId) {
                                navigate(`/training/quiz-attempts/${record.quizAttemptId}`);
                              }
                            }}
                          >
                            Review Quiz
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

const layoutStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
};

const summaryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
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
  fontSize: '18px',
  fontWeight: 800,
  color: theme.colors.text,
};

const errorStyle: CSSProperties = {
  marginTop: '14px',
  background: '#fdecec',
  color: '#a12828',
  padding: '12px 14px',
  borderRadius: '12px',
};

const emptyStyle: CSSProperties = {
  color: theme.colors.mutedText,
  lineHeight: 1.6,
};

const attentionListStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
};

const attentionCardStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  padding: '14px',
  background: '#ffffff',
  display: 'grid',
  gap: '10px',
};

const attentionTopRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'flex-start',
};

const attentionTitleStyle: CSSProperties = {
  fontSize: '16px',
  fontWeight: 800,
  color: theme.colors.text,
};

const attentionMetaStyle: CSSProperties = {
  marginTop: '4px',
  fontSize: '13px',
  color: theme.colors.mutedText,
};

const attentionDatesStyle: CSSProperties = {
  fontSize: '14px',
  color: theme.colors.text,
  fontWeight: 600,
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

const primaryCellStyle: CSSProperties = {
  fontWeight: 700,
};

const secondaryCellStyle: CSSProperties = {
  marginTop: '4px',
  fontSize: '13px',
  color: theme.colors.mutedText,
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

const warningBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#fff4e8',
  color: '#9a5b13',
  fontWeight: 800,
  fontSize: '12px',
};

const expiredBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#fdecec',
  color: '#a12828',
  fontWeight: 800,
  fontSize: '12px',
};

const reviewButtonsWrapStyle: CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

const reviewButtonStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: '#ffffff',
  borderRadius: '10px',
  padding: '8px 10px',
  fontWeight: 700,
  cursor: 'pointer',
};

export default CertificationsPage;