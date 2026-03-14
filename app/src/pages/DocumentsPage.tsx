import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';

function DocumentsPage() {
  return (
    <PageContainer
      title="Documents"
      subtitle="Manage SOPs, policies, and supporting training documentation."
    >
      <ContentCard title="Documents Workspace">
        This section will hold document library views, versions, and linked training materials.
      </ContentCard>
    </PageContainer>
  );
}

export default DocumentsPage;