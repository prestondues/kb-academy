import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';

function TrainingPage() {
  return (
    <PageContainer
      title="Training"
      subtitle="Manage training modules, assignments, and in-progress sessions."
    >
      <ContentCard title="Training Workspace">
        This section will hold assigned modules, module builder tools, and active training sessions.
      </ContentCard>
    </PageContainer>
  );
}

export default TrainingPage;