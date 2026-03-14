import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';

function AnnouncementsPage() {
  return (
    <PageContainer
      title="Announcements"
      subtitle="Post updates to departments, roles, and company-wide audiences."
    >
      <ContentCard title="Announcements Workspace">
        This section will hold announcements, targeting, read receipts, and pinned posts.
      </ContentCard>
    </PageContainer>
  );
}

export default AnnouncementsPage;