import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';

function AdminPage() {
  return (
    <PageContainer
      title="Admin"
      subtitle="Configure KB Academy settings, permissions, branding, and system controls."
    >
      <ContentCard title="Admin Workspace">
        This section will hold organization settings, security, appearance, and app-wide controls.
      </ContentCard>
    </PageContainer>
  );
}

export default AdminPage;