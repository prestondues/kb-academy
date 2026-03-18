import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import SignoffModal from '../components/SignoffModal';
import {
  completeTrainingSession,
  createTrainingSessionSignoff,
  getProfilePinStatus,
  getTrainingModuleById,
  getTrainingSessionById,
  getTrainingSessionProgress,
  getTrainingSessionSignoffs,
  getTrainingSections,
  markTrainingSessionSectionComplete,
  setProfilePin,
  verifyProfilePin,
} from '../features/training/trainingApi';
import type { TrainingSectionRecord } from '../features/training/sectionTypes';
import { useAuth } from '../features/auth/useAuth';

type ProgressMap = Record<
  string,
  {
    progressId: string;
    isCompleted: boolean;
  }
>;

type SignoffTarget = 'trainer' | 'trainee' | null;
type ModalMode = 'verify' | 'create';

function TrainingSessionRunnerPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [moduleTitle, setModuleTitle] = useState('Training Session');
  const [sections, setSections] = useState<TrainingSectionRecord[]>([]);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [trainerSigned, setTrainerSigned] = useState(false);
  const [traineeSigned, setTraineeSigned] = useState(false);
  const [sessionMeta, setSessionMeta] = useState<{
    traineeId: string;
    trainerId: string;
    traineeName: string;
    trainerName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSectionId, setSavingSectionId] = useState<string | null>(null);
  const [completingSession, setCompletingSession] = useState(false);

  const [signoffModalOpen, setSignoffModalOpen] = useState(false);
  const [signoffTarget, setSignoffTarget] = useState<SignoffTarget>(null);
  const [signoffMode, setSignoffMode] = useState<ModalMode>('verify');
  const [signoffLoading, setSignoffLoading] = useState(false);
  const [signoffError, setSignoffError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!sessionId) return;

      try {
        const session = await getTrainingSessionById(sessionId);
        if (!session) {
          setLoading(false);
          return;
        }

        setSessionMeta({
          traineeId: session.trainee_id,
          trainerId: session.trainer_id,
          traineeName:
            `${session.trainee?.first_name ?? ''} ${session.trainee?.last_name ?? ''}`.trim() ||
            'Unknown Trainee',
          trainerName:
            `${session.trainer?.first_name ?? ''} ${session.trainer?.last_name ?? ''}`.trim() ||
            'Unknown Trainer',
        });

        const [moduleData, sectionData, progressData, signoffData] = await Promise.all([
          getTrainingModuleById(session.module_id),
          getTrainingSections(session.module_id),
          getTrainingSessionProgress(sessionId),
          getTrainingSessionSignoffs(sessionId),
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
        setTrainerSigned(signoffData.some((s) => s.signer_role === 'trainer'));
        setTraineeSigned(signoffData.some((s) => s.signer_role === 'trainee'));
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

  const completedRequiredCount = requiredSections.filter(
    (section) => progressMap[section.id]?.isCompleted
  ).length;

  const allRequiredCompleted =
    requiredSections.length > 0 &&
    requiredSections.every((section) => progressMap[section.id]?.isCompleted);

  const readyToFinalize = allRequiredCompleted && trainerSigned && traineeSigned;

  const roleName = profile?.role?.name?.toLowerCase?.() ?? '';
  const isAdmin = roleName.includes('admin');

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

  async function openSignoffFlow(target: 'trainer' | 'trainee') {
    if (!sessionMeta) return;

    setSignoffError(null);

    if (target === 'trainer') {
      const canSignAsTrainer = user?.id === sessionMeta.trainerId || isAdmin;

      if (!canSignAsTrainer) {
        setSignoffError('Only the assigned trainer or an admin can sign as trainer.');
        setSignoffTarget('trainer');
        setSignoffMode('verify');
        setSignoffModalOpen(true);
        return;
      }
    }

    const profileId = target === 'trainer' ? sessionMeta.trainerId : sessionMeta.traineeId;

    try {
      const pinStatus = await getProfilePinStatus(profileId);
      setSignoffTarget(target);
      setSignoffMode(pinStatus.hasPin ? 'verify' : 'create');
      setSignoffModalOpen(true);
    } catch (error: unknown) {
      console.error('LOAD PIN STATUS ERROR:', error);
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      setSignoffError(`Failed to load PIN status: ${message}`);
      setSignoffTarget(target);
      setSignoffMode('verify');
      setSignoffModalOpen(true);
    }
  }

  async function completeSignoff(target: 'trainer' | 'trainee') {
    if (!sessionId || !sessionMeta) return;

    const signerId = target === 'trainer' ? sessionMeta.trainerId : sessionMeta.traineeId;

    await createTrainingSessionSignoff({
      session_id: sessionId,
      signer_id: signerId,
      signer_role: target,
    });

    if (target === 'trainer') setTrainerSigned(true);
    if (target === 'trainee') setTraineeSigned(true);

    setSignoffModalOpen(false);
    setSignoffTarget(null);
    setSignoffError(null);
  }

  async function handleVerifySignoff(pin: string) {
    if (!signoffTarget || !sessionMeta) return;

    const signerId = signoffTarget === 'trainer' ? sessionMeta.trainerId : sessionMeta.traineeId;

    try {
      setSignoffLoading(true);
      setSignoffError(null);

      const valid = await verifyProfilePin(signerId, pin);

      if (!valid) {
        setSignoffError(
          signoffTarget === 'trainer'
            ? 'Incorrect trainer PIN.'
            : 'Incorrect trainee PIN.'
        );
        return;
      }

      await completeSignoff(signoffTarget);
    } catch (error: unknown) {
      console.error('VERIFY SIGNOFF ERROR:', error);
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      setSignoffError(`Failed to verify PIN: ${message}`);
    } finally {
      setSignoffLoading(false);
    }
  }

  async function handleCreatePinAndSign(pin: string) {
    if (!signoffTarget || !sessionMeta) return;

    const signerId = signoffTarget === 'trainer' ? sessionMeta.trainerId : sessionMeta.traineeId;

    try {
      setSignoffLoading(true);
      setSignoffError(null);

      await setProfilePin(signerId, pin);
      await completeSignoff(signoffTarget);
    } catch (error) {
      console.error('CREATE PIN AND SIGN ERROR:', error);
      setSignoffError('Failed to create PIN and complete sign-off.');
    } finally {
      setSignoffLoading(false);
    }
  }

  function getSignerName() {
    if (!sessionMeta || !signoffTarget) return 'Unknown Signer';
    return signoffTarget === 'trainer' ? sessionMeta.trainerName : sessionMeta.traineeName;
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

  function handleSaveAndFinishLater() {
    navigate('/training');
  }

  function handleCloseModal() {
    setSignoffModalOpen(false);
    setSignoffTarget(null);
    setSignoffError(null);
  }

  if (loading) {
    return (
      <PageContainer title="Loading session..." subtitle="Please wait.">
        <ContentCard title="Loading">Fetching training session.</ContentCard>
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer
        title={moduleTitle}
        subtitle="Run the module, track section completion, and capture final sign-off."
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleSaveAndFinishLater}
              style={secondaryButtonStyle}
            >
              Save & Finish Later
            </button>

            <PrimaryButton
              onClick={handleCompleteSession}
              disabled={!readyToFinalize || completingSession}
            >
              {completingSession ? 'Completing...' : 'Complete Session'}
            </PrimaryButton>
          </div>
        }
      >
        <div
          style={{
            marginBottom: '16px',
            padding: '16px 18px',
            border: '1px solid #dbe4ee',
            borderRadius: '16px',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px' }}>Required Progress</div>
            <div style={{ marginTop: '6px', color: '#5f6b76', fontSize: '14px' }}>
              {completedRequiredCount} of {requiredSections.length} required sections complete
            </div>
          </div>

          <div
            style={{
              padding: '10px 14px',
              borderRadius: '999px',
              background: readyToFinalize ? '#e8f7ee' : '#f7f9fc',
              color: readyToFinalize ? '#18794e' : '#5f6b76',
              fontWeight: 800,
              fontSize: '13px',
              opacity: readyToFinalize ? 1 : 0.8,
            }}
          >
            {readyToFinalize ? 'Ready to Complete' : 'Completion Locked'}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 0.8fr',
            gap: '16px',
            marginBottom: '16px',
          }}
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
                          {section.is_required ? ' • required' : ' • optional'}
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
                      <div
                        style={{
                          color: '#194f91',
                          fontSize: '13px',
                          wordBreak: 'break-word',
                        }}
                      >
                        {section.media_url}
                      </div>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </ContentCard>

          <ContentCard
            title="Final Sign-Off"
            subtitle="Both sign-offs are required before session completion."
          >
            <div style={{ display: 'grid', gap: '12px' }}>
              <SignoffRow
                title="Trainer Sign-Off"
                complete={trainerSigned}
                buttonLabel={trainerSigned ? 'Signed' : 'Sign as Trainer'}
                onClick={() => openSignoffFlow('trainer')}
                disabled={trainerSigned || !allRequiredCompleted}
              />

              <SignoffRow
                title="Trainee Sign-Off"
                complete={traineeSigned}
                buttonLabel={traineeSigned ? 'Signed' : 'Sign as Trainee'}
                onClick={() => openSignoffFlow('trainee')}
                disabled={traineeSigned || !allRequiredCompleted}
              />
            </div>
          </ContentCard>
        </div>
      </PageContainer>

      <SignoffModal
        open={signoffModalOpen}
        signerLabel={signoffTarget ?? 'trainer'}
        signerName={getSignerName()}
        mode={signoffMode}
        loading={signoffLoading}
        errorMessage={signoffError}
        onClose={handleCloseModal}
        onSubmitVerify={handleVerifySignoff}
        onSubmitCreate={handleCreatePinAndSign}
      />
    </>
  );
}

function SignoffRow({
  title,
  complete,
  buttonLabel,
  onClick,
  disabled,
}: {
  title: string;
  complete: boolean;
  buttonLabel: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        padding: '14px',
        border: '1px solid #dbe4ee',
        borderRadius: '16px',
        background: complete ? '#f7fbff' : '#ffffff',
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: '10px' }}>{title}</div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{
          width: '100%',
          border: '1px solid #dbe4ee',
          borderRadius: '12px',
          padding: '10px 12px',
          background: complete ? '#e8f7ee' : '#ffffff',
          color: complete ? '#18794e' : '#081f2d',
          fontWeight: 700,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled && !complete ? 0.6 : 1,
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

const secondaryButtonStyle: React.CSSProperties = {
  border: '1px solid #dbe4ee',
  background: '#ffffff',
  borderRadius: '14px',
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

export default TrainingSessionRunnerPage;