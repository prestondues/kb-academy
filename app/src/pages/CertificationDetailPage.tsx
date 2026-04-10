import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import {
  getTrainingCertificationById,
  type TrainingCertificationDetailRecord,
} from '../features/training/trainingApi';
import { theme } from '../styles/theme';

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

function CertificationDetailPage() {
  const { certificationId } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState<TrainingCertificationDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!certificationId) {
        setError('Certification record not found.');
        setLoading(false);
        return;
      }

      try {
        const data = await getTrainingCertificationById(certificationId);
        setRecord(data);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to load certification detail.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [certificationId]);

  if (loading) {
    return (
      <PageContainer title="Certification Detail" subtitle="Loading certification detail...">
        <ContentCard title="Loading">Please wait.</ContentCard>
      </PageContainer>
    );
  }

  if (error || !record) {
    return (
      <PageContainer title="Certification Detail" subtitle="Unable to load certification.">
        <ContentCard title="Unavailable">
          {error ?? 'Certification record not found.'}
        </ContentCard>
      </PageContainer>
    );
  }

  const status = getCertificationStatus(record.expires_at);
  const traineeName =
    `${record.trainee?.first_name ?? ''} ${record.trainee?.last_name ?? ''}`.trim() ||
    'Unknown User';

  return (
    <PageContainer
      title="Certification Detail"
      subtitle={record.module?.title ?? 'Training Certification'}
      actions={
        <div style={actionsStyle}>
          <PrimaryButton onClick={() => navigate(-1)}>Back</PrimaryButton>
        </div>
      }
    >
      <div style={layoutStyle}>
        <ContentCard title="Certification Summary" subtitle="Official certification record.">
          <div style={summaryGridStyle}>
            <SummaryItem label="Trainee" value={traineeName} />
            <SummaryItem
              label="Username"
              value={record.trainee?.username ? `@${record.trainee.username}` : '—'}
            />
            <SummaryItem label="Department" value={record.module?.department?.name ?? '—'} />
            <SummaryItem label="Shift" value={record.trainee?.shift?.name ?? '—'} />
            <SummaryItem label="Module" value={record.module?.title ?? '—'} />
            <SummaryItem label="Module Type" value={record.module?.module_type ?? '—'} />
            <SummaryItem
              label="Quiz Required"
              value={record.module?.requires_quiz ? 'Yes' : 'No'}
            />
            <SummaryItem label="Issued" value={formatDate(record.issued_at)} />
            <SummaryItem
              label="Expires"
              value={record.expires_at ? formatDate(record.expires_at) : 'No expiration'}
            />
            <SummaryItem label="Status" value={status} />
          </div>
        </ContentCard>

        <ContentCard title="Record Details" subtitle="Additional certification information.">
          <div style={detailsListStyle}>
            <DetailRow
              label="Trainee Department"
              value={record.trainee?.department?.name ?? '—'}
            />
            <DetailRow
              label="Recert Frequency"
              value={
                typeof record.module?.recert_frequency_days === 'number'
                  ? `${record.module.recert_frequency_days} days`
                  : 'Not set'
              }
            />
            <DetailRow
              label="Last Session Reference"
              value={record.last_session_id ?? 'No linked training session'}
            />
            <DetailRow
              label="Linked Quiz Attempt"
              value={record.quiz_attempt_id ?? 'No linked quiz attempt'}
            />
            <DetailRow label="Created" value={formatDate(record.created_at)} />
            <DetailRow label="Updated" value={formatDate(record.updated_at)} />
          </div>

          <div style={actionsRowStyle}>
            <span style={status === 'Current' ? currentBadgeStyle : expiredBadgeStyle}>
              {status}
            </span>

            <button
              type="button"
              style={reviewButtonStyle}
              disabled={!record.quiz_attempt_id}
              onClick={() => {
                if (record.quiz_attempt_id) {
                  navigate(`/training/quiz-attempts/${record.quiz_attempt_id}`);
                }
              }}
            >
              Review Linked Quiz
            </button>

            <button
              type="button"
              style={actionButtonStyle}
              onClick={() =>
                navigate(`/certifications/start/${record.module_id}/${record.trainee_id}`)
              }
            >
              Start Recertification
            </button>
          </div>
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

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={detailRowStyle}>
      <div style={detailLabelStyle}>{label}</div>
      <div style={detailValueStyle}>{value}</div>
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
  fontSize: '16px',
  fontWeight: 800,
  color: theme.colors.text,
};

const detailsListStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
};

const detailRowStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '14px',
  background: '#ffffff',
};

const detailLabelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.colors.mutedText,
  marginBottom: '6px',
};

const detailValueStyle: CSSProperties = {
  color: theme.colors.text,
  fontWeight: 700,
};

const actionsRowStyle: CSSProperties = {
  marginTop: '16px',
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  flexWrap: 'wrap',
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

const reviewButtonStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: '#ffffff',
  borderRadius: '10px',
  padding: '8px 10px',
  fontWeight: 700,
  cursor: 'pointer',
};

const actionButtonStyle: CSSProperties = {
  border: '1px solid #d7e6fb',
  background: '#eef6ff',
  color: '#194f91',
  borderRadius: '10px',
  padding: '8px 10px',
  fontWeight: 700,
  cursor: 'pointer',
};

export default CertificationDetailPage;