import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';

function UsersPage() {
  return (
    <PageContainer
      title="Users"
      subtitle="Manage employees, permissions, profile details, and training access."
    >
      <ContentCard title="Users Workspace">
        This section will hold user lists, profiles, resets, department assignments, and permissions.
      </ContentCard>
    </PageContainer>
  );
}

export default UsersPage;