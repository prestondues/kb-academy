import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import StatusBadge from '../components/StatusBadge';
import { getTrainingModuleById } from '../features/training/trainingApi';
import { mapTrainingModuleToCard } from '../features/training/trainingMappers';
import type { TrainingModuleCardModel } from '../features/training/types';

function TrainingModuleDetailPage() {
  const { moduleId } = useParams();
  const [module, setModule] = useState<TrainingModuleCardModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModule() {
      if (!moduleId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getTrainingModuleById(moduleId);
        if (data) {
          setModule(mapTrainingModuleToCard(data));
        } else {
          setModule(null);
        }
      } catch (error) {
        console.error(error);
        setModule(null);
      } finally {
        setLoading(false);
      }
    }

    loadModule();
  }, [moduleId]);

  if (loading) {
    return (
      <PageContainer title="Loading module..." subtitle="Please wait.">
        <ContentCard title="Loading">Fetching training module.</ContentCard>
      </PageContainer>
    );
  }

  if (!module) {
    return (
      <PageContainer title="Module not found" subtitle="No training module matched this route.">
        <ContentCard title="Missing Module">This training module could not be found.</ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={module.title}
      subtitle={`${module.moduleType} • ${module.department}`}
      actions={<PrimaryButton>Edit Module</PrimaryButton>}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.35fr 1fr',
          gap: '16px',
        }}
      >
        <ContentCard title="Module Overview" subtitle="Core training module settings.">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <div style={{ fontWeight: 800, marginBottom: '6px' }}>Description</div>
              <div style={{ color: '#5f6b76', lineHeight: 1.6 }}>{module.description}</div>
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Type</span>
              <span>{module.moduleType}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Department</span>
              <span>{module.department}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Required Hours</span>
              <span>{module.requiredHours}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Recertification</span>
              <span>{module.recertFrequency}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>SQF Element</span>
              <span>{module.sqfElement}</span>
            </div>
          </div>
        </ContentCard>

        <div style={{ display: 'grid', gap: '16px' }}>
          <ContentCard title="Module Flags">
            <div style={{ display: 'grid', gap: '12px' }}>
              <StatusBadge label={module.status} variant={module.status === 'Active' ? 'success' : 'danger'} />
              <StatusBadge label={module.requiresQuiz ? 'Quiz Required' : 'No Quiz'} variant={module.requiresQuiz ? 'info' : 'warning'} />
              <StatusBadge label={module.allergenFlag ? 'Allergen Flag On' : 'No Allergen Flag'} variant={module.allergenFlag ? 'warning' : 'success'} />
            </div>
          </ContentCard>

          <ContentCard title="Next Build Step">
            <p style={{ margin: 0, color: '#5f6b76', lineHeight: 1.6 }}>
              The next training phase will add module sections, content blocks,
              delivery flow, sign-off behavior, and certification logic.
            </p>
          </ContentCard>
        </div>
      </div>
    </PageContainer>
  );
}

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  paddingBottom: '10px',
  borderBottom: '1px solid #eef3f8',
};

const labelStyle = {
  color: '#5f6b76',
  fontWeight: 700,
};

export default TrainingModuleDetailPage;