import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import {
  createTrainingQuiz,
  createTrainingQuizAnswerOption,
  createTrainingQuizQuestion,
  deleteTrainingQuizAnswerOption,
  deleteTrainingQuizQuestion,
  getTrainingModuleById,
  getTrainingQuizAnswerOptions,
  getTrainingQuizByModule,
  getTrainingQuizQuestions,
  reorderTrainingQuizQuestions,
  updateTrainingQuiz,
  updateTrainingQuizQuestion,
  type TrainingQuizAnswerOptionRecord,
  type TrainingQuizQuestionRecord,
  type TrainingQuizQuestionType,
  type TrainingQuizRecord,
} from '../features/training/trainingApi';
import { theme } from '../styles/theme';

type RawModule = {
  id?: string | null;
  title?: string | null;
};

type ModuleLite = {
  id: string;
  title: string;
};

type QuestionWithOptions = TrainingQuizQuestionRecord & {
  options: TrainingQuizAnswerOptionRecord[];
};

type DraftOption = {
  id: string;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
  isNew?: boolean;
};

type ModalState = {
  open: boolean;
  mode: 'create' | 'edit';
  questionId: string | null;
  questionText: string;
  questionType: TrainingQuizQuestionType;
  isActive: boolean;
  scaleMin: string;
  scaleMax: string;
  correctScaleValue: string;
  options: DraftOption[];
};

function makeId() {
  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function emptyModalState(): ModalState {
  return {
    open: false,
    mode: 'create',
    questionId: null,
    questionText: '',
    questionType: 'multiple_choice',
    isActive: true,
    scaleMin: '1',
    scaleMax: '5',
    correctScaleValue: '3',
    options: [
      { id: makeId(), option_text: '', is_correct: true, sort_order: 1, isNew: true },
      { id: makeId(), option_text: '', is_correct: false, sort_order: 2, isNew: true },
    ],
  };
}

function mapModule(moduleData: RawModule | null): ModuleLite | null {
  if (!moduleData?.id) return null;
  return {
    id: moduleData.id,
    title: moduleData.title ?? 'Untitled Module',
  };
}

function buildScaledOptions(scaleMin: number, scaleMax: number, correctValue: number) {
  const items: DraftOption[] = [];
  let order = 1;
  for (let value = scaleMin; value <= scaleMax; value += 1) {
    items.push({
      id: makeId(),
      option_text: String(value),
      is_correct: value === correctValue,
      sort_order: order,
      isNew: true,
    });
    order += 1;
  }
  return items;
}

function getTypeLabel(type: TrainingQuizQuestionType) {
  if (type === 'multiple_choice') return 'Multiple Choice';
  if (type === 'true_false') return 'True / False';
  return 'Scaled';
}

function TrainingQuizBuilderPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState<ModuleLite | null>(null);
  const [quiz, setQuiz] = useState<TrainingQuizRecord | null>(null);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggingQuestionId, setDraggingQuestionId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(emptyModalState());

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    pass_score: '80',
    is_active: true,
  });

  const nextQuestionOrder = useMemo(() => {
    if (questions.length === 0) return 1;
    return Math.max(...questions.map((q) => q.sort_order)) + 1;
  }, [questions]);

  async function refreshQuizData(quizId: string) {
    const questionRows = await getTrainingQuizQuestions(quizId);
    const questionWithOptions = await Promise.all(
      questionRows.map(async (question) => ({
        ...question,
        options: await getTrainingQuizAnswerOptions(question.id),
      }))
    );
    setQuestions(questionWithOptions);
  }

  useEffect(() => {
    async function loadData() {
      if (!moduleId) return;

      try {
        const moduleData = await getTrainingModuleById(moduleId);
        setModule(mapModule(moduleData as unknown as RawModule | null));

        const quizData = await getTrainingQuizByModule(moduleId);
        setQuiz(quizData);

        if (quizData) {
          setQuizForm({
            title: quizData.title,
            description: quizData.description ?? '',
            pass_score: String(quizData.pass_score),
            is_active: quizData.is_active,
          });
          await refreshQuizData(quizData.id);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz builder.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [moduleId]);

  async function handleSaveQuiz() {
    if (!moduleId) return;

    if (!quizForm.title.trim()) {
      setError('Quiz title is required.');
      return;
    }

    const passScore = Number(quizForm.pass_score);
    if (Number.isNaN(passScore) || passScore < 0 || passScore > 100) {
      setError('Pass score must be between 0 and 100.');
      return;
    }

    try {
      setSavingQuiz(true);
      setError(null);

      if (quiz) {
        const updated = await updateTrainingQuiz(quiz.id, {
          title: quizForm.title,
          description: quizForm.description || null,
          pass_score: passScore,
          is_active: quizForm.is_active,
        });
        setQuiz(updated);
      } else {
        const created = await createTrainingQuiz({
          module_id: moduleId,
          title: quizForm.title,
          description: quizForm.description || null,
          pass_score: passScore,
          is_active: quizForm.is_active,
        });
        setQuiz(created);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz.');
    } finally {
      setSavingQuiz(false);
    }
  }

  function openCreateQuestionModal() {
    setError(null);
    setModal(emptyModalState());
    setModal((prev) => ({
      ...prev,
      open: true,
      mode: 'create',
    }));
  }

  function openEditQuestionModal(question: QuestionWithOptions) {
    const isScaled = question.question_type === 'scaled';
    const scaleMin = question.scale_min ?? 1;
    const scaleMax = question.scale_max ?? 5;
    const correctScaleOption = question.options.find((option) => option.is_correct);

    setModal({
      open: true,
      mode: 'edit',
      questionId: question.id,
      questionText: question.question_text,
      questionType: question.question_type,
      isActive: question.is_active,
      scaleMin: String(scaleMin),
      scaleMax: String(scaleMax),
      correctScaleValue: correctScaleOption?.option_text ?? String(scaleMin),
      options:
        isScaled
          ? question.options.map((option) => ({
              id: option.id,
              option_text: option.option_text,
              is_correct: option.is_correct,
              sort_order: option.sort_order,
            }))
          : question.options.map((option) => ({
              id: option.id,
              option_text: option.option_text,
              is_correct: option.is_correct,
              sort_order: option.sort_order,
            })),
    });
  }

  function closeModal() {
    setModal(emptyModalState());
  }

  function setQuestionType(type: TrainingQuizQuestionType) {
    if (type === 'true_false') {
      setModal((prev) => ({
        ...prev,
        questionType: type,
        options: [
          { id: makeId(), option_text: 'True', is_correct: true, sort_order: 1, isNew: true },
          { id: makeId(), option_text: 'False', is_correct: false, sort_order: 2, isNew: true },
        ],
      }));
      return;
    }

    if (type === 'scaled') {
      const scaleMin = Number(modal.scaleMin || '1');
      const scaleMax = Number(modal.scaleMax || '5');
      const correctValue = Number(modal.correctScaleValue || modal.scaleMin || '1');

      setModal((prev) => ({
        ...prev,
        questionType: type,
        options: buildScaledOptions(scaleMin, scaleMax, correctValue),
      }));
      return;
    }

    setModal((prev) => ({
      ...prev,
      questionType: type,
      options: [
        { id: makeId(), option_text: '', is_correct: true, sort_order: 1, isNew: true },
        { id: makeId(), option_text: '', is_correct: false, sort_order: 2, isNew: true },
      ],
    }));
  }

  function refreshScaledDraftOptions(nextMin: string, nextMax: string, nextCorrect: string) {
    const min = Number(nextMin);
    const max = Number(nextMax);
    const correct = Number(nextCorrect);

    if (Number.isNaN(min) || Number.isNaN(max) || min >= max) return;

    setModal((prev) => ({
      ...prev,
      scaleMin: nextMin,
      scaleMax: nextMax,
      correctScaleValue: nextCorrect,
      options: buildScaledOptions(min, max, correct),
    }));
  }

  async function handleSaveQuestionFromModal() {
    if (!quiz) {
      setError('Save the quiz first before creating questions.');
      return;
    }

    if (!modal.questionText.trim()) {
      setError('Question text is required.');
      return;
    }

    try {
      setSavingQuestion(true);
      setError(null);

      if (modal.questionType === 'scaled') {
        const min = Number(modal.scaleMin);
        const max = Number(modal.scaleMax);
        const correct = Number(modal.correctScaleValue);

        if (Number.isNaN(min) || Number.isNaN(max) || min >= max) {
          setError('Scaled questions require a valid minimum and maximum range.');
          setSavingQuestion(false);
          return;
        }

        if (correct < min || correct > max) {
          setError('Correct scaled value must be inside the defined range.');
          setSavingQuestion(false);
          return;
        }
      } else {
        const validOptions = modal.options.filter((option) => option.option_text.trim());
        if (validOptions.length < 2) {
          setError('At least 2 answer options are required.');
          setSavingQuestion(false);
          return;
        }

        if (!validOptions.some((option) => option.is_correct)) {
          setError('At least one option must be marked correct.');
          setSavingQuestion(false);
          return;
        }
      }

      if (modal.mode === 'create') {
        const createdQuestion = await createTrainingQuizQuestion({
          quiz_id: quiz.id,
          question_text: modal.questionText,
          question_type: modal.questionType,
          sort_order: nextQuestionOrder,
          is_active: modal.isActive,
          scale_min: modal.questionType === 'scaled' ? Number(modal.scaleMin) : null,
          scale_max: modal.questionType === 'scaled' ? Number(modal.scaleMax) : null,
        });

        const optionsToCreate =
          modal.questionType === 'scaled'
            ? buildScaledOptions(
                Number(modal.scaleMin),
                Number(modal.scaleMax),
                Number(modal.correctScaleValue)
              )
            : modal.questionType === 'true_false'
            ? modal.options
            : modal.options.filter((option) => option.option_text.trim());

        for (let index = 0; index < optionsToCreate.length; index += 1) {
          const option = optionsToCreate[index];
          await createTrainingQuizAnswerOption({
            question_id: createdQuestion.id,
            option_text: option.option_text,
            sort_order: index + 1,
            is_correct: option.is_correct,
          });
        }
      } else if (modal.questionId) {
        const existing = questions.find((question) => question.id === modal.questionId);
        if (!existing) {
          setError('Question not found.');
          setSavingQuestion(false);
          return;
        }

        await updateTrainingQuizQuestion(modal.questionId, {
          question_text: modal.questionText,
          question_type: modal.questionType,
          sort_order: existing.sort_order,
          is_active: modal.isActive,
          scale_min: modal.questionType === 'scaled' ? Number(modal.scaleMin) : null,
          scale_max: modal.questionType === 'scaled' ? Number(modal.scaleMax) : null,
        });

        for (const existingOption of existing.options) {
          await deleteTrainingQuizAnswerOption(existingOption.id);
        }

        const optionsToCreate =
          modal.questionType === 'scaled'
            ? buildScaledOptions(
                Number(modal.scaleMin),
                Number(modal.scaleMax),
                Number(modal.correctScaleValue)
              )
            : modal.questionType === 'true_false'
            ? modal.options
            : modal.options.filter((option) => option.option_text.trim());

        for (let index = 0; index < optionsToCreate.length; index += 1) {
          const option = optionsToCreate[index];
          await createTrainingQuizAnswerOption({
            question_id: modal.questionId,
            option_text: option.option_text,
            sort_order: index + 1,
            is_correct: option.is_correct,
          });
        }
      }

      await refreshQuizData(quiz.id);
      closeModal();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save question.');
    } finally {
      setSavingQuestion(false);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    try {
      await deleteTrainingQuizQuestion(questionId);
      if (quiz) await refreshQuizData(quiz.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete question.');
    }
  }

  async function handleDropQuestion(targetQuestionId: string) {
    if (!draggingQuestionId || draggingQuestionId === targetQuestionId) return;

    const current = [...questions];
    const draggedIndex = current.findIndex((question) => question.id === draggingQuestionId);
    const targetIndex = current.findIndex((question) => question.id === targetQuestionId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedItem] = current.splice(draggedIndex, 1);
    current.splice(targetIndex, 0, draggedItem);

    const reordered = current.map((question, index) => ({
      ...question,
      sort_order: index + 1,
    }));

    setQuestions(reordered);

    try {
      await reorderTrainingQuizQuestions(
        reordered.map((question) => ({
          id: question.id,
          sort_order: question.sort_order,
        }))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reorder questions.');
      if (quiz) await refreshQuizData(quiz.id);
    } finally {
      setDraggingQuestionId(null);
    }
  }

  if (loading) {
    return (
      <PageContainer title="Quiz Builder" subtitle="Loading quiz builder...">
        <ContentCard title="Loading">Please wait.</ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Quiz Builder"
      subtitle={module ? module.title : 'Module quiz builder'}
      actions={<PrimaryButton onClick={() => navigate(-1)}>Back</PrimaryButton>}
    >
      <div style={shellStyle}>
        <ContentCard title="Quiz Settings" subtitle="Set the overall quiz requirements.">
          <div style={quizSettingsGridStyle}>
            <Field label="Quiz Title">
              <input
                style={inputStyle}
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
              />
            </Field>

            <Field label="Pass Score %">
              <input
                type="number"
                min={0}
                max={100}
                style={inputStyle}
                value={quizForm.pass_score}
                onChange={(e) => setQuizForm({ ...quizForm, pass_score: e.target.value })}
              />
            </Field>

            <Field label="Status">
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={quizForm.is_active}
                  onChange={(e) => setQuizForm({ ...quizForm, is_active: e.target.checked })}
                />
                Quiz is active
              </label>
            </Field>

            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Description">
                <textarea
                  style={quizTextareaStyle}
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                />
              </Field>
            </div>
          </div>

          {error ? <div style={errorStyle}>{error}</div> : null}

          <div style={headerActionRowStyle}>
            <PrimaryButton onClick={handleSaveQuiz} disabled={savingQuiz}>
              {savingQuiz ? 'Saving...' : quiz ? 'Update Quiz Settings' : 'Create Quiz'}
            </PrimaryButton>

            {quiz ? (
              <PrimaryButton onClick={openCreateQuestionModal}>Add Question</PrimaryButton>
            ) : null}
          </div>
        </ContentCard>

        {quiz ? (
          <ContentCard
            title="Questions"
            subtitle="Drag and drop to reorder. Click a card to edit the question."
          >
            {questions.length === 0 ? (
              <div style={emptyStyle}>
                No questions yet. Add your first question to begin building this quiz.
              </div>
            ) : (
              <div style={questionListStyle}>
                {questions.map((question, index) => {
                  const preview =
                    question.question_type === 'scaled'
                      ? `${question.scale_min ?? 1} to ${question.scale_max ?? 5}`
                      : question.options.map((option) => option.option_text).join(' • ');

                  return (
                    <div
                      key={question.id}
                      draggable
                      onDragStart={() => setDraggingQuestionId(question.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDropQuestion(question.id)}
                      style={questionCardStyle}
                    >
                      <div style={dragHandleStyle}>⋮⋮</div>

                      <div style={questionCardContentStyle}>
                        <div style={questionCardTopStyle}>
                          <div style={questionNumberStyle}>Question {index + 1}</div>
                          <div style={questionTypeBadgeStyle}>
                            {getTypeLabel(question.question_type)}
                          </div>
                        </div>

                        <div style={questionTextStyle}>{question.question_text}</div>
                        <div style={questionPreviewStyle}>{preview}</div>
                      </div>

                      <div style={questionCardActionsStyle}>
                        <button
                          type="button"
                          style={miniButtonStyle}
                          onClick={() => openEditQuestionModal(question)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          style={deleteButtonStyle}
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ContentCard>
        ) : null}
      </div>

      {modal.open ? (
        <div style={modalBackdropStyle}>
          <div style={modalCardStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <div style={modalTitleStyle}>
                  {modal.mode === 'create' ? 'Add Question' : 'Edit Question'}
                </div>
                <div style={modalSubtitleStyle}>
                  Build the full question in one focused flow.
                </div>
              </div>
            </div>

            <div style={modalBodyStyle}>
              <Field label="Question Type">
                <div style={typeButtonRowStyle}>
                  {(['multiple_choice', 'true_false', 'scaled'] as TrainingQuizQuestionType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        style={{
                          ...typeButtonStyle,
                          ...(modal.questionType === type ? activeTypeButtonStyle : {}),
                        }}
                        onClick={() => setQuestionType(type)}
                      >
                        {getTypeLabel(type)}
                      </button>
                    )
                  )}
                </div>
              </Field>

              <Field label="Question Text">
                <textarea
                  style={questionTextareaStyle}
                  value={modal.questionText}
                  onChange={(e) =>
                    setModal((prev) => ({
                      ...prev,
                      questionText: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="Status">
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={modal.isActive}
                    onChange={(e) =>
                      setModal((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  Question is active
                </label>
              </Field>

              {modal.questionType === 'multiple_choice' ? (
                <div style={builderSectionStyle}>
                  <div style={sectionHeaderStyle}>
                    <div style={sectionHeaderTitleStyle}>Answer Options</div>
                    <button
                      type="button"
                      style={miniButtonStyle}
                      onClick={() =>
                        setModal((prev) => ({
                          ...prev,
                          options: [
                            ...prev.options,
                            {
                              id: makeId(),
                              option_text: '',
                              is_correct: false,
                              sort_order: prev.options.length + 1,
                              isNew: true,
                            },
                          ],
                        }))
                      }
                    >
                      Add Option
                    </button>
                  </div>

                  <div style={builderStackStyle}>
                    {modal.options.map((option, index) => (
                      <div key={option.id} style={builderCardStyle}>
                        <div style={builderCardTopStyle}>
                          <div style={builderBadgeStyle}>Option {index + 1}</div>
                          <button
                            type="button"
                            style={deleteButtonStyle}
                            onClick={() =>
                              setModal((prev) => ({
                                ...prev,
                                options: prev.options
                                  .filter((item) => item.id !== option.id)
                                  .map((item, itemIndex) => ({
                                    ...item,
                                    sort_order: itemIndex + 1,
                                  })),
                              }))
                            }
                          >
                            Delete
                          </button>
                        </div>

                        <Field label="Answer Text">
                          <input
                            style={inputStyle}
                            value={option.option_text}
                            onChange={(e) =>
                              setModal((prev) => ({
                                ...prev,
                                options: prev.options.map((item) =>
                                  item.id === option.id
                                    ? { ...item, option_text: e.target.value }
                                    : item
                                ),
                              }))
                            }
                          />
                        </Field>

                        <Field label="Correct Answer">
                          <label style={checkboxLabelStyle}>
                            <input
                              type="checkbox"
                              checked={option.is_correct}
                              onChange={(e) =>
                                setModal((prev) => ({
                                  ...prev,
                                  options: prev.options.map((item) =>
                                    item.id === option.id
                                      ? { ...item, is_correct: e.target.checked }
                                      : item
                                  ),
                                }))
                              }
                            />
                            Mark as correct
                          </label>
                        </Field>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {modal.questionType === 'true_false' ? (
                <div style={builderSectionStyle}>
                  <div style={sectionHeaderTitleStyle}>Correct Answer</div>
                  <div style={builderStackStyle}>
                    {modal.options.map((option) => (
                      <label key={option.id} style={radioRowStyle}>
                        <input
                          type="radio"
                          name="true-false-correct"
                          checked={option.is_correct}
                          onChange={() =>
                            setModal((prev) => ({
                              ...prev,
                              options: prev.options.map((item) => ({
                                ...item,
                                is_correct: item.id === option.id,
                              })),
                            }))
                          }
                        />
                        {option.option_text}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {modal.questionType === 'scaled' ? (
                <div style={builderSectionStyle}>
                  <div style={scaledGridStyle}>
                    <Field label="Scale Minimum">
                      <input
                        type="number"
                        style={inputStyle}
                        value={modal.scaleMin}
                        onChange={(e) =>
                          refreshScaledDraftOptions(
                            e.target.value,
                            modal.scaleMax,
                            modal.correctScaleValue
                          )
                        }
                      />
                    </Field>

                    <Field label="Scale Maximum">
                      <input
                        type="number"
                        style={inputStyle}
                        value={modal.scaleMax}
                        onChange={(e) =>
                          refreshScaledDraftOptions(
                            modal.scaleMin,
                            e.target.value,
                            modal.correctScaleValue
                          )
                        }
                      />
                    </Field>

                    <Field label="Correct Scale Value">
                      <input
                        type="number"
                        style={inputStyle}
                        value={modal.correctScaleValue}
                        onChange={(e) =>
                          refreshScaledDraftOptions(
                            modal.scaleMin,
                            modal.scaleMax,
                            e.target.value
                          )
                        }
                      />
                    </Field>
                  </div>

                  <div style={scaledPreviewStyle}>
                    Scale preview: {modal.scaleMin} to {modal.scaleMax}
                  </div>
                </div>
              ) : null}
            </div>

            <div style={modalFooterStyle}>
              <button type="button" style={secondaryButtonStyle} onClick={closeModal}>
                Cancel
              </button>
              <PrimaryButton onClick={handleSaveQuestionFromModal} disabled={savingQuestion}>
                {savingQuestion
                  ? 'Saving...'
                  : modal.mode === 'create'
                  ? 'Create Question'
                  : 'Save Question'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const shellStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
};

const quizSettingsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '12px',
};

const headerActionRowStyle: CSSProperties = {
  marginTop: '16px',
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
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

const quizTextareaStyle: CSSProperties = {
  width: '100%',
  minHeight: '96px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '12px 14px',
  fontSize: '14px',
  background: '#ffffff',
  resize: 'vertical',
};

const questionTextareaStyle: CSSProperties = {
  width: '100%',
  minHeight: '120px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '12px 14px',
  fontSize: '15px',
  background: '#ffffff',
  resize: 'vertical',
};

const checkboxLabelStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  minHeight: '48px',
  fontWeight: 600,
};

const errorStyle: CSSProperties = {
  marginTop: '14px',
  background: '#fdecec',
  color: '#a12828',
  padding: '12px 14px',
  borderRadius: '12px',
};

const emptyStyle: CSSProperties = {
  color: theme.colors.mutedText,
  lineHeight: 1.6,
};

const questionListStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
};

const questionCardStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '40px minmax(0, 1fr) auto',
  gap: '14px',
  alignItems: 'center',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '18px',
  padding: '14px',
  background: '#ffffff',
};

const dragHandleStyle: CSSProperties = {
  fontSize: '18px',
  color: theme.colors.mutedText,
  cursor: 'grab',
  userSelect: 'none',
  textAlign: 'center',
};

const questionCardContentStyle: CSSProperties = {
  display: 'grid',
  gap: '6px',
};

const questionCardTopStyle: CSSProperties = {
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
  fontSize: '16px',
  fontWeight: 800,
  color: theme.colors.text,
};

const questionPreviewStyle: CSSProperties = {
  fontSize: '13px',
  color: theme.colors.mutedText,
};

const questionCardActionsStyle: CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

const miniButtonStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: '#ffffff',
  borderRadius: '10px',
  padding: '8px 10px',
  fontWeight: 700,
  cursor: 'pointer',
};

const deleteButtonStyle: CSSProperties = {
  border: '1px solid #f3cccc',
  background: '#fff7f7',
  color: '#a12828',
  borderRadius: '10px',
  padding: '8px 10px',
  fontWeight: 700,
  cursor: 'pointer',
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
  maxWidth: '840px',
  maxHeight: '90vh',
  overflow: 'auto',
  background: '#ffffff',
  borderRadius: '26px',
  padding: '24px',
  boxShadow: '0 18px 50px rgba(8, 31, 45, 0.18)',
};

const modalHeaderStyle: CSSProperties = {
  marginBottom: '16px',
};

const modalTitleStyle: CSSProperties = {
  fontSize: '22px',
  fontWeight: 800,
  color: theme.colors.text,
};

const modalSubtitleStyle: CSSProperties = {
  marginTop: '4px',
  color: theme.colors.mutedText,
};

const modalBodyStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
};

const modalFooterStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '20px',
};

const typeButtonRowStyle: CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
};

const typeButtonStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: '#ffffff',
  borderRadius: '14px',
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const activeTypeButtonStyle: CSSProperties = {
  background: '#194f91',
  color: '#ffffff',
  borderColor: '#194f91',
};

const builderSectionStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
};

const sectionHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'center',
};

const sectionHeaderTitleStyle: CSSProperties = {
  fontSize: '16px',
  fontWeight: 800,
  color: theme.colors.text,
};

const builderStackStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
};

const builderCardStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  padding: '14px',
  background: '#ffffff',
  display: 'grid',
  gap: '12px',
};

const builderCardTopStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const builderBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#eef6ff',
  color: '#194f91',
  fontWeight: 800,
  fontSize: '12px',
};

const radioRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 14px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  background: '#ffffff',
};

const scaledGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '12px',
};

const scaledPreviewStyle: CSSProperties = {
  color: theme.colors.mutedText,
  fontSize: '14px',
};

export default TrainingQuizBuilderPage;