import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';

function CertificationsPage() {
  return (
    <PageContainer
      title="Certifications"
      subtitle="Track certification readiness, quiz attempts, and retakes."
    >
      <ContentCard title="Certifications Workspace">
        This section will hold quiz management, certification results, and retake approvals.
      </ContentCard>
    </PageContainer>
  );
}

export default CertificationsPage;