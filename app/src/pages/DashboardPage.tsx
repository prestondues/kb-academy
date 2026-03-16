import { Link } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../features/auth/useAuth';
import { theme } from '../styles/theme';

function DashboardPage() {
  const { profile } = useAuth();

  const firstName = profile?.first_name ?? 'there';
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 18
      ? 'Good afternoon'
      : hour < 22
      ? 'Good evening'
      : 'Burning the midnight brownie?';

  return (
    <PageContainer
      title="Dashboard"
      subtitle="Your daily snapshot of training, compliance, and operations."
      actions={
        <Link to="/users/new" style={{ textDecoration: 'none' }}>
          <PrimaryButton>Create User</PrimaryButton>
        </Link>
      }
    >
      <div
        style={{
          background:
            'linear-gradient(135deg, #081f2d 0%, #194f91 52%, #a2c7e2 100%)',
          borderRadius: '24px',
          padding: '28px',
          color: '#ffffff',
          marginBottom: '20px',
          boxShadow: '0 20px 50px rgba(8, 31, 45, 0.18)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 0.9fr',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                opacity: 0.88,
                marginBottom: '12px',
              }}
            >
              KB Academy
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: '36px',
                lineHeight: 1.08,
              }}
            >
              {greeting}, {firstName}.
            </h2>

            <p
              style={{
                margin: '14px 0 0 0',
                maxWidth: '580px',
                lineHeight: 1.7,
                fontSize: '16px',
                opacity: 0.94,
              }}
            >
              Here’s what needs attention today across training, certifications,
              and operations.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: '20px',
              padding: '18px',
            }}
          >
            <div style={{ fontSize: '12px', opacity: 0.82, marginBottom: '6px' }}>
              Today’s Focus
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>
              Keep compliance visible and the floor ready.
            </div>
            <div style={{ marginTop: '12px' }}>
              <StatusBadge label="Operations Ready" variant="info" />
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <StatCard
          title="Trainings Due"
          value="12"
          badgeLabel="Needs attention"
          badgeVariant="warning"
        />
        <StatCard
          title="Certifications Expiring"
          value="5"
          badgeLabel="Within 30 days"
          badgeVariant="danger"
        />
        <StatCard
          title="Today’s Place Charts"
          value="3"
          badgeLabel="2 complete"
          badgeVariant="info"
        />
        <StatCard
          title="Compliance Rate"
          value="94%"
          badgeLabel="Above target"
          badgeVariant="success"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.15fr 1fr',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <ContentCard
          title="Quick Actions"
          subtitle="Jump into the most common tasks."
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '12px',
            }}
          >
            <QuickAction
              title="Create User"
              description="Add a new employee account."
              to="/users/new"
            />
            <QuickAction
              title="View Users"
              description="Open user directory and profiles."
              to="/users"
            />
            <QuickAction
              title="Training"
              description="Review modules and assignments."
              to="/training"
            />
            <QuickAction
              title="Reports"
              description="Check compliance and progress."
              to="/reports"
            />
          </div>
        </ContentCard>

        <ContentCard
          title="Announcements"
          subtitle="Important updates for your team."
        >
          <div style={{ display: 'grid', gap: '12px' }}>
            <AnnouncementItem
              title="GMP refreshers due this week"
              body="Packaging team refreshers should be completed before Friday."
              badge="Priority"
            />
            <AnnouncementItem
              title="Baking 3rd Shift staffing review"
              body="Review line readiness and training coverage before chart finalization."
            />
            <AnnouncementItem
              title="New KB Academy onboarding flow live"
              body="New users now complete first-login password and PIN setup directly in the app."
            />
          </div>
        </ContentCard>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.35fr 0.9fr',
          gap: '16px',
        }}
      >
        <ContentCard
          title="Operational Snapshot"
          subtitle="Recent activity and important follow-up items."
        >
          <div style={{ display: 'grid', gap: '12px' }}>
            <SnapshotRow
              title="GMP recertifications due for Packaging"
              subtitle="5 employees are approaching expiration within 30 days."
              status="warning"
            />
            <SnapshotRow
              title="Baking 3rd Shift place chart needs review"
              subtitle="Chart generated but awaiting final supervisor confirmation."
              status="info"
            />
            <SnapshotRow
              title="4 users certified in the last 24 hours"
              subtitle="Recent completions are improving line flexibility."
              status="success"
            />
          </div>
        </ContentCard>

        <ContentCard
          title="KB Values"
          subtitle="The foundation behind how we train and lead."
        >
          <div style={{ display: 'grid', gap: '12px' }}>
            <ValueRow
              title="Love"
              description="Train with patience, respect, and care for the team."
            />
            <ValueRow
              title="Creativity"
              description="Build smarter systems and better learning experiences."
            />
            <ValueRow
              title="Joy"
              description="Keep the work human, positive, and energizing."
            />
            <ValueRow
              title="Growth"
              description="Use every training moment to raise the standard."
            />
          </div>

          <div
            style={{
              marginTop: '18px',
              paddingTop: '16px',
              borderTop: `1px solid ${theme.colors.border}`,
              color: theme.colors.mutedText,
              fontSize: '14px',
              lineHeight: 1.6,
            }}
          >
            Live a Little. Learn a Lot.
          </div>
        </ContentCard>
      </div>
    </PageContainer>
  );
}

function StatCard({
  title,
  value,
  badgeLabel,
  badgeVariant,
}: {
  title: string;
  value: string;
  badgeLabel: string;
  badgeVariant: 'success' | 'warning' | 'danger' | 'info';
}) {
  return (
    <ContentCard title={title}>
      <div style={{ fontSize: '34px', fontWeight: 800 }}>{value}</div>
      <div style={{ marginTop: '10px' }}>
        <StatusBadge label={badgeLabel} variant={badgeVariant} />
      </div>
    </ContentCard>
  );
}

function QuickAction({
  title,
  description,
  to,
}: {
  title: string;
  description: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div
        style={{
          border: `1px solid ${theme.colors.border}`,
          background: '#f7f9fc',
          borderRadius: '16px',
          padding: '16px',
          minHeight: '110px',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '6px' }}>
          {title}
        </div>
        <div
          style={{
            fontSize: '14px',
            color: theme.colors.mutedText,
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      </div>
    </Link>
  );
}

function AnnouncementItem({
  title,
  body,
  badge,
}: {
  title: string;
  body: string;
  badge?: string;
}) {
  return (
    <div
      style={{
        padding: '14px',
        borderRadius: '16px',
        background: '#f7f9fc',
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ fontWeight: 800 }}>{title}</div>
        {badge ? <StatusBadge label={badge} variant="warning" /> : null}
      </div>
      <div
        style={{
          marginTop: '8px',
          fontSize: '14px',
          lineHeight: 1.55,
          color: theme.colors.mutedText,
        }}
      >
        {body}
      </div>
    </div>
  );
}

function SnapshotRow({
  title,
  subtitle,
  status,
}: {
  title: string;
  subtitle: string;
  status: 'success' | 'warning' | 'danger' | 'info';
}) {
  return (
    <div
      style={{
        padding: '14px',
        borderRadius: '16px',
        border: `1px solid ${theme.colors.border}`,
        background: '#f7f9fc',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ fontWeight: 700 }}>{title}</div>
        <StatusBadge label="Update" variant={status} />
      </div>
      <div
        style={{
          marginTop: '8px',
          fontSize: '14px',
          color: theme.colors.mutedText,
          lineHeight: 1.55,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

function ValueRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        padding: '14px',
        borderRadius: '16px',
        border: `1px solid ${theme.colors.border}`,
        background: '#f7f9fc',
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: '6px' }}>{title}</div>
      <div
        style={{
          fontSize: '14px',
          color: theme.colors.mutedText,
          lineHeight: 1.55,
        }}
      >
        {description}
      </div>
    </div>
  );
}

export default DashboardPage;