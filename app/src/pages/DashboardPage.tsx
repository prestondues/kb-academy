import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import StatusBadge from '../components/StatusBadge';

function DashboardPage() {
  return (
    <PageContainer
      title="Dashboard"
      subtitle="Welcome to KB Academy. Here’s a snapshot of training, compliance, and operations."
      actions={<PrimaryButton>Start Training</PrimaryButton>}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <ContentCard title="Trainings Due">
          <div style={{ fontSize: '32px', fontWeight: 800 }}>12</div>
          <div style={{ marginTop: '8px' }}>
            <StatusBadge label="Needs attention" variant="warning" />
          </div>
        </ContentCard>

        <ContentCard title="Certifications Expiring">
          <div style={{ fontSize: '32px', fontWeight: 800 }}>5</div>
          <div style={{ marginTop: '8px' }}>
            <StatusBadge label="Within 30 days" variant="danger" />
          </div>
        </ContentCard>

        <ContentCard title="Today’s Place Charts">
          <div style={{ fontSize: '32px', fontWeight: 800 }}>3</div>
          <div style={{ marginTop: '8px' }}>
            <StatusBadge label="2 complete" variant="info" />
          </div>
        </ContentCard>

        <ContentCard title="Compliance Rate">
          <div style={{ fontSize: '32px', fontWeight: 800 }}>94%</div>
          <div style={{ marginTop: '8px' }}>
            <StatusBadge label="Above target" variant="success" />
          </div>
        </ContentCard>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.7fr 1fr',
          gap: '16px',
        }}
      >
        <ContentCard
          title="Operational Snapshot"
          subtitle="Quick actions and recent activity for your team."
        >
          <div style={{ display: 'grid', gap: '12px' }}>
            <div
              style={{
                padding: '14px',
                borderRadius: '14px',
                background: '#f7f9fc',
                border: '1px solid #dbe4ee',
              }}
            >
              GMP recertifications due for Packaging team this week.
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: '14px',
                background: '#f7f9fc',
                border: '1px solid #dbe4ee',
              }}
            >
              Baking 3rd Shift place chart still needs final review.
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: '14px',
                background: '#f7f9fc',
                border: '1px solid #dbe4ee',
              }}
            >
              4 users were certified in the last 24 hours.
            </div>
          </div>
        </ContentCard>

        <ContentCard
          title="KB Values"
          subtitle="A little brand personality built into the app."
        >
          <div style={{ display: 'grid', gap: '10px' }}>
            <StatusBadge label="Love" variant="info" />
            <StatusBadge label="Creativity" variant="success" />
            <StatusBadge label="Joy" variant="warning" />
            <StatusBadge label="Growth" variant="danger" />
          </div>

          <p style={{ marginTop: '16px', lineHeight: 1.6 }}>
            Live a Little. Learn a Lot.
          </p>
        </ContentCard>
      </div>
    </PageContainer>
  );
}

export default DashboardPage;