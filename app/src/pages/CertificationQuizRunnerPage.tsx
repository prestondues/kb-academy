import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../features/auth/useAuth';
import {
  createTrainingQuizAttempt,
  getTrainingCertificationsByUser,
  getTrainingModuleById,
  getTrainingQuizAttemptAnswers,
  getTrainingQuizAttemptsByUser,
  getTrainingQuizAnswerOptions,
  getTrainingQuizByModule,
  getTrainingQuizQuestions,
  getUserOptions,
  submitTrainingQuizAttempt,
  upsertTrainingCertification,
  upsertTrainingQuizAttemptAnswer,
  verifyProfilePin,
  type TrainingCertificationRecord,
  type TrainingQuizAnswerOptionRecord,
  type TrainingQuizAttemptAnswerRecord,
  type TrainingQuizAttemptRecord,
  type TrainingQuizQuestionRecord,
  type TrainingQuizQuestionType,
  type TrainingQuizRecord,
} from '../features/training/trainingApi';
import { theme } from '../styles/theme';

type RawModule = {
  id?: string | null;
  title?: string | null;
  recert_frequency_days?: number | null;
};

type ModuleLite = {
  id: string;
  title: string;
  recertFrequencyDays: number | null;
};

type QuestionWithOptions = TrainingQuizQuestionRecord & {
  options: TrainingQuizAnswerOptionRecord[];
};

type ResponseState = {
  questionId: string;
  selectedOptionIds: string[];
};

function mapModule(moduleData: RawModule | null): ModuleLite | null {
  if (!moduleData?.id) return null;
  return {
    id: moduleData.id,
    title: moduleData.title ?? 'Untitled Module',
    recertFrequencyDays:
      typeof moduleData.recert_frequency_days === 'number'
        ? moduleData.recert_frequency_days
        : null,
  };
}

function arraysEqualAsSets(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const aSet = new Set(a);
  const bSet = new Set(b);
  if (aSet.size !== bSet.size) return false;
  for (const value of aSet) {
    if (!bSet.has(value)) return false;
  }
  return true;
}

function getQuestionTypeLabel(type: TrainingQuizQuestionType) {
  if (type === 'multiple_choice') return 'Multiple Choice';
  if (type === 'true_false') return 'True / False';
  return 'Scaled';
}

function parseSavedAnswer(answer: TrainingQuizAttemptAnswerRecord): string[] {
  if (answer.selected_option_id) {
    return [answer.selected_option_id];
  }

  if (!answer.answer_text) return [];

  try {
    const parsed: unknown = JSON.parse(answer.answer_text);

    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }

    return [];
  } catch {
    return [];
  }
}

function calculateExpiresAt(
  issuedAtIso: string,
  recertFrequencyDays?: number | null
): string | null {
  if (!recertFrequencyDays || recertFrequencyDays <= 0) return null;

  const issued = new Date(issuedAtIso);
  issued.setDate(issued.getDate() + recertFrequencyDays);
  return issued.toISOString();
}

function isCertificationCurrent(certification: TrainingCertificationRecord) {
  if (!certification.expires_at) return true;

  const expires = new Date(certification.expires_at);
  if (Number.isNaN(expires.getTime())) return true;

  return expires >= new Date();
}

function CertificationQuizRunnerPage() {
  const { moduleId, traineeId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [module, setModule] = useState<ModuleLite | null>(null);
  const [quiz, setQuiz] = useState<TrainingQuizRecord | null>(null);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [attempt, setAttempt] = useState<TrainingQuizAttemptRecord | null>(null);
  const [responses, setResponses] = useState<Record<string, ResponseState>>({});
  const [traineeName, setTraineeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [result, setResult] = useState<{
    scorePercent: number;
    passed: boolean;
    totalQuestions: number;
    correctAnswers: number;
  } | null>(null);
  const [certificationRecord, setCertificationRecord] =
    useState<TrainingCertificationRecord | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [trainerPin, setTrainerPin] = useState('');
  const [traineePin, setTraineePin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trainerId = (profile as { id?: string } | null)?.id ?? null;

  useEffect(() => {
    async function loadData() {
      if (!moduleId || !traineeId) return;

      try {
        const [moduleData, quizData, userOptions, certifications] = await Promise.all([
          getTrainingModuleById(moduleId),
          getTrainingQuizByModule(moduleId),
          getUserOptions(),
          getTrainingCertificationsByUser(traineeId),
        ]);

        setModule(mapModule(moduleData as unknown as RawModule | null));

        const trainee = userOptions.find((user) => user.id === traineeId);
        setTraineeName(trainee?.name ?? 'Selected trainee');
        setQuiz(quizData);

        const existingCertification =
          certifications.find(
            (item) => item.module_id === moduleId && isCertificationCurrent(item)
          ) ?? null;

        setCertificationRecord(existingCertification);

        if (quizData) {
          const questionRows = await getTrainingQuizQuestions(quizData.id);
          const questionWithOptions = await Promise.all(
            questionRows.map(async (question) => ({
              ...question,
              options: await getTrainingQuizAnswerOptions(question.id),
            }))
          );
          setQuestions(questionWithOptions);

          const attempts = await getTrainingQuizAttemptsByUser(traineeId);
          const matchingAttempts = attempts.filter(
            (item) => item.quiz_id === quizData.id && item.module_id === moduleId
          );

          const inProgressAttempt = matchingAttempts.find((item) => item.status === 'in_progress');
          const latestSubmittedAttempt = matchingAttempts.find(
            (item) => item.status === 'submitted'
          );

          if (inProgressAttempt) {
            setAttempt(inProgressAttempt);
            const savedAnswers = await getTrainingQuizAttemptAnswers(inProgressAttempt.id);
            const nextResponses: Record<string, ResponseState> = {};
            savedAnswers.forEach((answer) => {
              nextResponses[answer.question_id] = {
                questionId: answer.question_id,
                selectedOptionIds: parseSavedAnswer(answer),
              };
            });
            setResponses(nextResponses);
            setResult(null);
          } else if (latestSubmittedAttempt) {
            setAttempt(latestSubmittedAttempt);
            setResponses({});
            setResult({
              scorePercent: Number(latestSubmittedAttempt.score_percent ?? 0),
              passed: Boolean(latestSubmittedAttempt.passed),
              totalQuestions: questionWithOptions.length,
              correctAnswers: Math.round(
                (Number(latestSubmittedAttempt.score_percent ?? 0) / 100) *
                  questionWithOptions.length
              ),
            });
          } else {
            setAttempt(null);
            setResponses({});
            setResult(null);
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load certification quiz.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [moduleId, traineeId]);

  const answeredCount = useMemo(() => {
    return Object.values(responses).filter((item) => item.selectedOptionIds.length > 0).length;
  }, [responses]);

  const currentAttemptAlreadyFinalized =
    Boolean(certificationRecord && attempt && certificationRecord.quiz_attempt_id === attempt.id);

  const canFinalizeCertification =
    Boolean(result?.passed) &&
    Boolean(attempt?.status === 'submitted') &&
    !currentAttemptAlreadyFinalized;

  async function handleStartOrResume() {
    if (!quiz || !moduleId || !traineeId) {
      setError('Certification quiz could not be started.');
      return;
    }

    if (attempt?.status === 'in_progress') return;

    try {
      setStarting(true);
      setError(null);

      const createdAttempt = await createTrainingQuizAttempt({
        quiz_id: quiz.id,
        module_id: moduleId,
        trainee_id: traineeId,
      });

      setAttempt(createdAttempt);
      setResult(null);
      setResponses({});
      setShowPinModal(false);
      setTrainerPin('');
      setTraineePin('');
      setPinError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start certification quiz.');
    } finally {
      setStarting(false);
    }
  }

  async function saveResponse(question: QuestionWithOptions, selectedIds: string[]) {
    if (!attempt) return;

    const correctIds = question.options
      .filter((option) => option.is_correct)
      .map((option) => option.id);

    const isCorrect = arraysEqualAsSets(selectedIds, correctIds);

    try {
      await upsertTrainingQuizAttemptAnswer({
        attempt_id: attempt.id,
        question_id: question.id,
        selected_option_id: selectedIds.length === 1 ? selectedIds[0] : null,
        answer_text: selectedIds.length > 1 ? JSON.stringify(selectedIds) : null,
        is_correct: isCorrect,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save answer.');
    }
  }

  async function handleSingleSelect(question: QuestionWithOptions, optionId: string) {
    const nextIds = [optionId];
    setResponses((prev) => ({
      ...prev,
      [question.id]: {
        questionId: question.id,
        selectedOptionIds: nextIds,
      },
    }));
    await saveResponse(question, nextIds);
  }

  async function handleMultiSelect(
    question: QuestionWithOptions,
    optionId: string,
    checked: boolean
  ) {
    const current = responses[question.id]?.selectedOptionIds ?? [];
    const nextIds = checked
      ? [...current, optionId]
      : current.filter((id) => id !== optionId);

    setResponses((prev) => ({
      ...prev,
      [question.id]: {
        questionId: question.id,
        selectedOptionIds: nextIds,
      },
    }));
    await saveResponse(question, nextIds);
  }

  async function handleSubmitQuiz() {
    if (!attempt || !quiz) return;

    const unanswered = questions.filter((question) => {
      const selected = responses[question.id]?.selectedOptionIds ?? [];
      return selected.length === 0;
    });

    if (unanswered.length > 0) {
      setError('All questions must be answered before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let correctAnswers = 0;

      for (const question of questions) {
        const selectedIds = responses[question.id]?.selectedOptionIds ?? [];
        const correctIds = question.options
          .filter((option) => option.is_correct)
          .map((option) => option.id);

        const isCorrect = arraysEqualAsSets(selectedIds, correctIds);
        if (isCorrect) correctAnswers += 1;

        await upsertTrainingQuizAttemptAnswer({
          attempt_id: attempt.id,
          question_id: question.id,
          selected_option_id: selectedIds.length === 1 ? selectedIds[0] : null,
          answer_text: selectedIds.length > 1 ? JSON.stringify(selectedIds) : null,
          is_correct: isCorrect,
        });
      }

      const scorePercent =
        questions.length > 0 ? Number(((correctAnswers / questions.length) * 100).toFixed(2)) : 0;

      const passed = scorePercent >= quiz.pass_score;

      const submittedAttempt = await submitTrainingQuizAttempt({
        attempt_id: attempt.id,
        score_percent: scorePercent,
        passed,
      });

      setAttempt(submittedAttempt);
      setResult({
        scorePercent,
        passed,
        totalQuestions: questions.length,
        correctAnswers,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit certification quiz.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFinalizeCertification() {
    if (!trainerId || !traineeId || !moduleId || !attempt || !module) {
      setPinError('Certification could not be finalized.');
      return;
    }

    if (!trainerPin || !traineePin) {
      setPinError('Both trainer and trainee PINs are required.');
      return;
    }

    try {
      setFinalizing(true);
      setPinError(null);

      const [trainerValid, traineeValid] = await Promise.all([
        verifyProfilePin(trainerId, trainerPin),
        verifyProfilePin(traineeId, traineePin),
      ]);

      if (!trainerValid) {
        setPinError('Trainer PIN is incorrect.');
        setFinalizing(false);
        return;
      }

      if (!traineeValid) {
        setPinError('Trainee PIN is incorrect.');
        setFinalizing(false);
        return;
      }

      const issuedAt = new Date().toISOString();
      const expiresAt = calculateExpiresAt(issuedAt, module.recertFrequencyDays);

      const certification = await upsertTrainingCertification({
        trainee_id: traineeId,
        module_id: moduleId,
        quiz_attempt_id: attempt.id,
        last_session_id: null,
        issued_at: issuedAt,
        expires_at: expiresAt,
      });

      setCertificationRecord(certification);
      setShowPinModal(false);
      setTrainerPin('');
      setTraineePin('');
      setPinError(null);
    } catch (err: unknown) {
      setPinError(
        err instanceof Error ? err.message : 'Failed to finalize certification.'
      );
    } finally {
      setFinalizing(false);
    }
  }

  if (loading) {
    return (
      <PageContainer title="Certification Quiz" subtitle="Loading certification quiz...">
        <ContentCard title="Loading">Please wait.</ContentCard>
      </PageContainer>
    );
  }

  if (!quiz || !module) {
    return (
      <PageContainer title="Certification Quiz" subtitle="Quiz not available.">
        <ContentCard title="Unavailable">No quiz is configured for this module.</ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Certification Quiz"
      subtitle={module.title}
      actions={
        <div style={topActionsStyle}>
          <button
            type="button"
            style={secondaryButtonStyle}
            onClick={() => navigate('/certifications')}
          >
            Back
          </button>
        </div>
      }
    >
      <div style={shellStyle}>
        <ContentCard title="Certification Session" subtitle="Trainer-led quiz session.">
          <div style={overviewGridStyle}>
            <SummaryItem label="Trainee" value={traineeName || 'Selected trainee'} />
            <SummaryItem label="Module" value={module.title} />
            <SummaryItem label="Pass Score" value={`${quiz.pass_score}%`} />
            <SummaryItem
              label="Attempt Status"
              value={
                attempt?.status === 'submitted'
                  ? 'Submitted'
                  : attempt?.status === 'in_progress'
                  ? 'In Progress'
                  : 'Not Started'
              }
            />
          </div>

          {error ? <div style={errorStyle}>{error}</div> : null}

          {!attempt ? (
            <div style={actionRowStyle}>
              <PrimaryButton onClick={handleStartOrResume} disabled={starting}>
                {starting ? 'Starting...' : 'Start Certification Quiz'}
              </PrimaryButton>
            </div>
          ) : null}
        </ContentCard>

        {result ? (
          <ContentCard title="Certification Result" subtitle="Quiz scoring complete.">
            <div style={resultCardStyle}>
              <div style={resultScoreStyle}>{result.scorePercent}%</div>
              <div style={resultMetaStyle}>
                {result.correctAnswers} of {result.totalQuestions} correct
              </div>
              <div
                style={{
                  ...resultBadgeStyle,
                  background: result.passed ? '#e8f7ee' : '#fff4e8',
                  color: result.passed ? '#18794e' : '#9a5b13',
                }}
              >
                {result.passed ? 'Passed' : 'Did Not Pass'}
              </div>
            </div>

            {result.passed ? (
              <div style={postResultBlockStyle}>
                {currentAttemptAlreadyFinalized ? (
                  <>
                    <div style={successMessageStyle}>
                      This certification attempt has already been finalized.
                    </div>
                    <div style={actionRowStyle}>
                      <PrimaryButton onClick={handleStartOrResume} disabled={starting}>
                        {starting ? 'Starting...' : 'Start New Certification Attempt'}
                      </PrimaryButton>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={resultHelperTextStyle}>
                      Quiz passed. Dual PIN signoff is required to finalize certification.
                    </div>
                    <div style={actionRowStyle}>
                      <PrimaryButton
                        onClick={() => {
                          setPinError(null);
                          setShowPinModal(true);
                        }}
                        disabled={!canFinalizeCertification}
                      >
                        Complete Certification
                      </PrimaryButton>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={postResultBlockStyle}>
                <div style={failMessageStyle}>
                  Certification not awarded. Additional training and a future reattempt are
                  required before certification can be issued.
                </div>
                <div style={actionRowStyle}>
                  <PrimaryButton onClick={handleStartOrResume} disabled={starting}>
                    {starting ? 'Starting...' : 'Start New Certification Attempt'}
                  </PrimaryButton>
                </div>
              </div>
            )}
          </ContentCard>
        ) : null}

        {attempt?.status === 'in_progress' ? (
          <ContentCard
            title="Questions"
            subtitle={`${answeredCount} of ${questions.length} answered`}
          >
            <div style={questionStackStyle}>
              {questions.map((question, index) => {
                const selectedIds = responses[question.id]?.selectedOptionIds ?? [];
                const correctOptionCount = question.options.filter((option) => option.is_correct)
                  .length;
                const isMultiSelect =
                  question.question_type === 'multiple_choice' && correctOptionCount > 1;

                return (
                  <div key={question.id} style={questionCardStyle}>
                    <div style={questionTopRowStyle}>
                      <div style={questionNumberStyle}>Question {index + 1}</div>
                      <div style={questionTypeBadgeStyle}>
                        {getQuestionTypeLabel(question.question_type)}
                      </div>
                    </div>

                    <div style={questionTextStyle}>{question.question_text}</div>

                    <div style={optionsStackStyle}>
                      {question.question_type === 'true_false' ||
                      question.question_type === 'scaled' ||
                      !isMultiSelect
                        ? question.options.map((option) => (
                            <label key={option.id} style={optionRowStyle}>
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                checked={selectedIds.includes(option.id)}
                                onChange={() => handleSingleSelect(question, option.id)}
                              />
                              <span>{option.option_text}</span>
                            </label>
                          ))
                        : question.options.map((option) => (
                            <label key={option.id} style={optionRowStyle}>
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(option.id)}
                                onChange={(e) =>
                                  handleMultiSelect(question, option.id, e.target.checked)
                                }
                              />
                              <span>{option.option_text}</span>
                            </label>
                          ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={submitRowStyle}>
              <PrimaryButton onClick={handleSubmitQuiz} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Certification Quiz'}
              </PrimaryButton>
            </div>
          </ContentCard>
        ) : null}
      </div>

      {showPinModal ? (
        <div style={modalBackdropStyle}>
          <div style={modalCardStyle}>
            <div style={modalTitleStyle}>Complete Certification</div>
            <div style={modalSubtitleStyle}>
              Enter both PINs to finalize certification after a passing result.
            </div>

            <div style={modalBodyStyle}>
              <div>
                <label style={labelStyle}>Trainer PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  style={inputStyle}
                  value={trainerPin}
                  onChange={(e) => setTrainerPin(e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>Trainee PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  style={inputStyle}
                  value={traineePin}
                  onChange={(e) => setTraineePin(e.target.value)}
                />
              </div>

              {pinError ? <div style={errorStyle}>{pinError}</div> : null}
            </div>

            <div style={modalFooterStyle}>
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => {
                  setShowPinModal(false);
                  setPinError(null);
                  setTrainerPin('');
                  setTraineePin('');
                }}
              >
                Cancel
              </button>
              <PrimaryButton onClick={handleFinalizeCertification} disabled={finalizing}>
                {finalizing ? 'Finalizing...' : 'Finalize Certification'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={summaryItemStyle}>
      <div style={summaryLabelStyle}>{label}</div>
      <div style={summaryValueStyle}>{value}</div>
    </div>
  );
}

const shellStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
};

const topActionsStyle: CSSProperties = {
  display: 'flex',
  gap: '10px',
};

const overviewGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px',
};

const summaryItemStyle: CSSProperties = {
  padding: '14px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  background: '#ffffff',
};

const summaryLabelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.colors.mutedText,
  marginBottom: '6px',
};

const summaryValueStyle: CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: theme.colors.text,
};

const actionRowStyle: CSSProperties = {
  marginTop: '16px',
  display: 'flex',
  gap: '10px',
};

const errorStyle: CSSProperties = {
  marginTop: '14px',
  background: '#fdecec',
  color: '#a12828',
  padding: '12px 14px',
  borderRadius: '12px',
};

const resultCardStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
  justifyItems: 'start',
};

const resultScoreStyle: CSSProperties = {
  fontSize: '36px',
  fontWeight: 800,
  color: theme.colors.text,
};

const resultMetaStyle: CSSProperties = {
  color: theme.colors.mutedText,
  fontSize: '14px',
};

const resultBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '999px',
  fontWeight: 800,
  fontSize: '13px',
};

const postResultBlockStyle: CSSProperties = {
  marginTop: '16px',
  display: 'grid',
  gap: '10px',
};

const resultHelperTextStyle: CSSProperties = {
  color: theme.colors.mutedText,
  lineHeight: 1.6,
};

const successMessageStyle: CSSProperties = {
  background: '#e8f7ee',
  color: '#18794e',
  padding: '12px 14px',
  borderRadius: '12px',
  fontWeight: 700,
};

const failMessageStyle: CSSProperties = {
  background: '#fff4e8',
  color: '#9a5b13',
  padding: '12px 14px',
  borderRadius: '12px',
  lineHeight: 1.6,
  fontWeight: 700,
};

const questionStackStyle: CSSProperties = {
  display: 'grid',
  gap: '14px',
};

const questionCardStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '18px',
  padding: '16px',
  background: '#ffffff',
  display: 'grid',
  gap: '12px',
};

const questionTopRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '10px',
  alignItems: 'center',
};

const questionNumberStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 800,
  color: theme.colors.mutedText,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const questionTypeBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#eef6ff',
  color: '#194f91',
  fontWeight: 800,
  fontSize: '12px',
};

const questionTextStyle: CSSProperties = {
  fontSize: '17px',
  fontWeight: 800,
  color: theme.colors.text,
};

const optionsStackStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
};

const optionRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 14px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  background: '#ffffff',
};

const submitRowStyle: CSSProperties = {
  marginTop: '18px',
  display: 'flex',
  justifyContent: 'flex-end',
};

const secondaryButtonStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: '#ffffff',
  borderRadius: '14px',
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const modalBackdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(8, 31, 45, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  zIndex: 1000,
};

const modalCardStyle: CSSProperties = {
  width: '100%',
  maxWidth: '520px',
  background: '#ffffff',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 18px 50px rgba(8, 31, 45, 0.18)',
};

const modalTitleStyle: CSSProperties = {
  fontSize: '22px',
  fontWeight: 800,
  color: theme.colors.text,
};

const modalSubtitleStyle: CSSProperties = {
  marginTop: '4px',
  color: theme.colors.mutedText,
  lineHeight: 1.6,
};

const modalBodyStyle: CSSProperties = {
  marginTop: '18px',
  display: 'grid',
  gap: '14px',
};

const modalFooterStyle: CSSProperties = {
  marginTop: '20px',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  marginBottom: '6px',
  color: theme.colors.mutedText,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const inputStyle: CSSProperties = {
  width: '100%',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '12px 14px',
  fontSize: '14px',
  background: '#ffffff',
};

export default CertificationQuizRunnerPage;