import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';

function ReportsPage() {
  return (
    <PageContainer
      title="Reports"
      subtitle="View training gaps, compliance, certification timelines, and saved reports."
    >
      <ContentCard title="Reports Workspace">
        This section will hold matrix reports, compliance views, exports, and custom reporting.
      </ContentCard>
    </PageContainer>
  );
}

export default ReportsPage;