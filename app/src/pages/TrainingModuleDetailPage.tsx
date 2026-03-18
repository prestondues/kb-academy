import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import StatusBadge from '../components/StatusBadge';
import {
  deleteTrainingSection,
  getTrainingModuleById,
  getTrainingSections,
  updateTrainingSectionSortOrder,
} from '../features/training/trainingApi';
import { mapTrainingModuleToCard } from '../features/training/trainingMappers';
import { mapTrainingSectionToCard } from '../features/training/sectionMappers';
import type { TrainingModuleCardModel } from '../features/training/types';
import type { TrainingSectionCardModel } from '../features/training/sectionTypes';
import TrainingSectionCard from '../features/training/TrainingSectionCard';

function TrainingModuleDetailPage() {
  const { moduleId } = useParams();
  const [module, setModule] = useState<TrainingModuleCardModel | null>(null);
  const [sections, setSections] = useState<TrainingSectionCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

  async function loadModuleData() {
    if (!moduleId) {
      setLoading(false);
      return;
    }

    try {
      const [moduleData, sectionData] = await Promise.all([
        getTrainingModuleById(moduleId),
        getTrainingSections(moduleId),
      ]);

      if (moduleData) {
        setModule(mapTrainingModuleToCard(moduleData));
      } else {
        setModule(null);
      }

      setSections(sectionData.map(mapTrainingSectionToCard));
    } catch (error) {
      console.error(error);
      setModule(null);
      setSections([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadModuleData();
  }, [moduleId]);

  async function handleDeleteSection(sectionId: string) {
    const confirmed = window.confirm('Delete this section?');
    if (!confirmed) return;

    try {
      await deleteTrainingSection(sectionId);
      await loadModuleData();
    } catch (error) {
      console.error('DELETE SECTION ERROR:', error);
      alert('Failed to delete section.');
    }
  }

  async function handleDrop(targetSectionId: string) {
    if (!draggedSectionId || draggedSectionId === targetSectionId) return;

    const currentSections = [...sections];
    const draggedIndex = currentSections.findIndex((s) => s.id === draggedSectionId);
    const targetIndex = currentSections.findIndex((s) => s.id === targetSectionId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedItem] = currentSections.splice(draggedIndex, 1);
    currentSections.splice(targetIndex, 0, draggedItem);

    const reordered = currentSections.map((section, index) => ({
      ...section,
      sortOrder: index + 1,
    }));

    setSections(reordered);
    setDraggedSectionId(null);

    try {
      await Promise.all(
        reordered.map((section, index) =>
          updateTrainingSectionSortOrder(section.id, index + 1)
        )
      );
      await loadModuleData();
    } catch (error) {
      console.error('DRAG REORDER ERROR:', error);
      alert('Failed to reorder sections.');
      await loadModuleData();
    }
  }

  if (loading) {
    return (
      <PageContainer title="Loading module..." subtitle="Please wait.">
        <ContentCard title="Loading">Fetching training module.</ContentCard>
      </PageContainer>
    );
  }

  if (!module) {
    return (
      <PageContainer
        title="Module not found"
        subtitle="No training module matched this route."
      >
        <ContentCard title="Missing Module">
          This training module could not be found.
        </ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={module.title}
      subtitle={`${module.moduleType} • ${module.department}`}
      actions={
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            to={`/training/conduct?moduleId=${module.id}`}
            style={{ textDecoration: 'none' }}
          >
            <PrimaryButton>Conduct Training</PrimaryButton>
          </Link>
          <Link
            to={`/training/${module.id}/sections/new`}
            style={{ textDecoration: 'none' }}
          >
            <PrimaryButton>Add Section</PrimaryButton>
          </Link>
        </div>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.35fr 1fr',
          gap: '16px',
          marginBottom: '18px',
        }}
      >
        <ContentCard
          title="Module Overview"
          subtitle="Core training module settings."
          actions={
            <Link
              to={`/training/${module.id}/edit`}
              style={{
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700,
                color: '#194f91',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>✎</span>
              <span>Edit</span>
            </Link>
          }
        >
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <div style={{ fontWeight: 800, marginBottom: '6px' }}>
                Description
              </div>
              <div style={{ color: '#5f6b76', lineHeight: 1.6 }}>
                {module.description}
              </div>
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
              <StatusBadge
                label={module.status}
                variant={module.status === 'Active' ? 'success' : 'danger'}
              />
              <StatusBadge
                label={module.requiresQuiz ? 'Quiz Required' : 'No Quiz'}
                variant={module.requiresQuiz ? 'info' : 'warning'}
              />
              <StatusBadge
                label={
                  module.allergenFlag
                    ? 'Allergen Flag On'
                    : 'No Allergen Flag'
                }
                variant={module.allergenFlag ? 'warning' : 'success'}
              />
            </div>
          </ContentCard>

          <ContentCard title="Section Summary">
            <div style={{ color: '#5f6b76', lineHeight: 1.6 }}>
              {sections.length} section{sections.length === 1 ? '' : 's'} currently
              configured.
            </div>
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#5f6b76' }}>
              Drag and drop sections to reorder them.
            </div>
          </ContentCard>
        </div>
      </div>

      <ContentCard
        title="Module Sections"
        subtitle="Ordered content blocks inside this training module."
      >
        {sections.length === 0 ? (
          <div style={{ padding: '10px 0', color: '#5f6b76' }}>
            No sections yet. Add your first section to begin building the module.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {sections.map((section) => (
              <TrainingSectionCard
                key={section.id}
                section={section}
                moduleId={module.id}
                onDelete={() => handleDeleteSection(section.id)}
                onDragStart={() => setDraggedSectionId(section.id)}
                onDragOver={() => {}}
                onDrop={() => handleDrop(section.id)}
                isDragging={draggedSectionId === section.id}
              />
            ))}
          </div>
        )}
      </ContentCard>
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