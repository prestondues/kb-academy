import { Link } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';

function CertificationsPage() {
  return (
    <PageContainer
      title="Certifications"
      subtitle="Launch trainer-led certification events and review certification records."
      actions={
        <Link to="/certifications/start" style={{ textDecoration: 'none' }}>
          <PrimaryButton>Start Certification</PrimaryButton>
        </Link>
      }
    >
      <div style={{ display: 'grid', gap: '16px' }}>
        <ContentCard
          title="Certification Workflow"
          subtitle="Trainer-led certification quizzes and official signoff."
        >
          Use this area to launch certification events, review records, and manage upcoming
          recertifications.
        </ContentCard>

        <ContentCard
          title="Next Build"
          subtitle="This section will expand as we wire the certification flow."
        >
          Coming next:
          <div style={{ marginTop: '10px', lineHeight: 1.7 }}>
            <div>• Start certification</div>
            <div>• Certification quiz runner</div>
            <div>• Dual PIN finalization</div>
            <div>• Certification records and expiration tracking</div>
          </div>
        </ContentCard>
      </div>
    </PageContainer>
  );
}

export default CertificationsPage;