import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';

function PlaceChartsPage() {
  return (
    <PageContainer
      title="Place Charts"
      subtitle="Generate and review staffing charts by department, line, and shift."
    >
      <ContentCard title="Place Chart Workspace">
        This section will hold chart setup, roster selection, generation, and TV display mode.
      </ContentCard>
    </PageContainer>
  );
}

export default PlaceChartsPage;