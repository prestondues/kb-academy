import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import {
  completeTrainingSession,
  getTrainingModuleById,
  getTrainingSections,
  getTrainingSessionById,
  getTrainingSessionProgress,
  markTrainingSessionSectionComplete,
} from '../features/training/trainingApi';
import type { TrainingSectionRecord } from '../features/training/sectionTypes';

type ProgressMap = Record<
  string,
  {
    progressId: string;
    isCompleted: boolean;
  }
>;

function TrainingSessionRunnerPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [moduleTitle, setModuleTitle] = useState('Training Session');
  const [sections, setSections] = useState<TrainingSectionRecord[]>([]);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [loading, setLoading] = useState(true);
  const [savingSectionId, setSavingSectionId] = useState<string | null>(null);
  const [completingSession, setCompletingSession] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!sessionId) return;

      try {
        const session = await getTrainingSessionById(sessionId);
        if (!session) {
          setLoading(false);
          return;
        }

        const [moduleData, sectionData, progressData] = await Promise.all([
          getTrainingModuleById(session.module_id),
          getTrainingSections(session.module_id),
          getTrainingSessionProgress(sessionId),
        ]);

        if (moduleData) {
          setModuleTitle(moduleData.title);
        }

        setSections(sectionData);

        const map: ProgressMap = {};
        progressData.forEach((progress) => {
          map[progress.section_id] = {
            progressId: progress.id,
            isCompleted: progress.is_completed,
          };
        });

        setProgressMap(map);
      } catch (error) {
        console.error('LOAD SESSION RUNNER ERROR:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [sessionId]);

  const requiredSections = useMemo(
    () => sections.filter((section) => section.is_required),
    [sections]
  );

  const allRequiredCompleted = requiredSections.every(
    (section) => progressMap[section.id]?.isCompleted
  );

  async function toggleSection(sectionId: string, checked: boolean) {
    const progress = progressMap[sectionId];
    if (!progress) return;

    try {
      setSavingSectionId(sectionId);

      await markTrainingSessionSectionComplete(progress.progressId, checked);

      setProgressMap((prev) => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          isCompleted: checked,
        },
      }));
    } catch (error) {
      console.error('TOGGLE SESSION SECTION ERROR:', error);
      alert('Failed to save section progress.');
    } finally {
      setSavingSectionId(null);
    }
  }

  async function handleCompleteSession() {
    if (!sessionId) return;

    try {
      setCompletingSession(true);
      await completeTrainingSession(sessionId);
      navigate('/training');
    } catch (error) {
      console.error('COMPLETE SESSION ERROR:', error);
      alert('Failed to complete session.');
    } finally {
      setCompletingSession(false);
    }
  }

  if (loading) {
    return (
      <PageContainer title="Loading session..." subtitle="Please wait.">
        <ContentCard title="Loading">Fetching training session.</ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={moduleTitle}
      subtitle="Run the module, track section completion, and resume as needed."
      actions={
        <PrimaryButton
          onClick={handleCompleteSession}
          disabled={!allRequiredCompleted || completingSession}
        >
          {completingSession ? 'Completing...' : 'Complete Session'}
        </PrimaryButton>
      }
    >
      <ContentCard
        title="Session Progress"
        subtitle="Mark each section complete as the trainer and trainee work through the module."
      >
        <div style={{ display: 'grid', gap: '12px' }}>
          {sections.map((section) => {
            const progress = progressMap[section.id];
            const checked = progress?.isCompleted ?? false;

            return (
              <label
                key={section.id}
                style={{
                  display: 'grid',
                  gap: '8px',
                  padding: '16px',
                  border: '1px solid #dbe4ee',
                  borderRadius: '16px',
                  background: checked ? '#f7fbff' : '#ffffff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '16px',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800 }}>
                      {section.sort_order}. {section.title}
                    </div>
                    <div style={{ marginTop: '6px', color: '#5f6b76', fontSize: '14px' }}>
                      {section.section_type}
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={savingSectionId === section.id}
                    onChange={(e) => toggleSection(section.id, e.target.checked)}
                  />
                </div>

                {section.body_text ? (
                  <div style={{ color: '#5f6b76', lineHeight: 1.6 }}>
                    {section.body_text}
                  </div>
                ) : null}

                {section.media_url ? (
                  <div style={{ color: '#194f91', fontSize: '13px', wordBreak: 'break-word' }}>
                    {section.media_url}
                  </div>
                ) : null}
              </label>
            );
          })}
        </div>
      </ContentCard>
    </PageContainer>
  );
}

export default TrainingSessionRunnerPage;