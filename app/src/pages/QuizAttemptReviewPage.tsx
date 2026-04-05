import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import {
  getTrainingQuizAttemptReviewData,
  type TrainingQuizAnswerOptionRecord,
  type TrainingQuizAttemptRecord,
  type TrainingQuizAttemptReviewQuestion,
} from '../features/training/trainingApi';
import { theme } from '../styles/theme';

function formatDate(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString([], {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

function parseSelectedIds(answer: {
  selected_option_id?: string | null;
  answer_text?: string | null;
} | null | undefined): string[] {
  if (!answer) return [];

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

function getCorrectOptions(options: TrainingQuizAnswerOptionRecord[]) {
  return options.filter((option) => option.is_correct);
}

function getSelectedOptions(
  options: TrainingQuizAnswerOptionRecord[],
  selectedIds: string[]
) {
  return options.filter((option) => selectedIds.includes(option.id));
}

function QuizAttemptReviewPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<TrainingQuizAttemptRecord | null>(null);
  const [questions, setQuestions] = useState<TrainingQuizAttemptReviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!attemptId) {
        setError('Quiz attempt not found.');
        setLoading(false);
        return;
      }

      try {
        const data = await getTrainingQuizAttemptReviewData(attemptId);
        setAttempt(data.attempt);
        setQuestions(data.questions);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz attempt.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [attemptId]);

  if (loading) {
    return (
      <PageContainer title="Quiz Attempt Review" subtitle="Loading attempt review...">
        <ContentCard title="Loading">Please wait.</ContentCard>
      </PageContainer>
    );
  }

  if (error || !attempt) {
    return (
      <PageContainer title="Quiz Attempt Review" subtitle="Unable to load attempt.">
        <ContentCard title="Unavailable">{error ?? 'Quiz attempt not found.'}</ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Quiz Attempt Review"
      subtitle={attempt.module?.title ?? 'Training Quiz'}
      actions={
        <div style={actionsStyle}>
          <PrimaryButton onClick={() => navigate(-1)}>Back</PrimaryButton>
        </div>
      }
    >
      <div style={layoutStyle}>
        <ContentCard title="Attempt Summary" subtitle="Quiz result overview.">
          <div style={summaryGridStyle}>
            <SummaryItem label="Quiz" value={attempt.quiz?.title ?? '—'} />
            <SummaryItem label="Module" value={attempt.module?.title ?? '—'} />
            <SummaryItem
              label="Score"
              value={
                typeof attempt.score_percent === 'number'
                  ? `${attempt.score_percent}%`
                  : '—'
              }
            />
            <SummaryItem
              label="Result"
              value={
                attempt.status === 'submitted'
                  ? attempt.passed
                    ? 'Pass'
                    : 'Fail'
                  : 'In Progress'
              }
            />
            <SummaryItem label="Submitted" value={formatDate(attempt.submitted_at)} />
          </div>
        </ContentCard>

        <ContentCard
          title="Question Review"
          subtitle={`${questions.length} question${questions.length === 1 ? '' : 's'}`}
        >
          {questions.length === 0 ? (
            <div style={emptyStyle}>No questions found for this attempt.</div>
          ) : (
            <div style={questionListStyle}>
              {questions.map((question, index) => {
                const selectedIds = parseSelectedIds(question.attemptAnswer);
                const selectedOptions = getSelectedOptions(question.options, selectedIds);
                const correctOptions = getCorrectOptions(question.options);
                const wasCorrect = Boolean(question.attemptAnswer?.is_correct);

                return (
                  <div key={question.id} style={questionCardStyle}>
                    <div style={questionTopStyle}>
                      <div style={questionNumberStyle}>Question {index + 1}</div>
                      <span
                        style={wasCorrect ? correctBadgeStyle : incorrectBadgeStyle}
                      >
                        {wasCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <div style={questionTextStyle}>{question.question_text}</div>

                    <div style={answerSectionStyle}>
                      <div style={answerLabelStyle}>Selected Answer</div>
                      {selectedOptions.length > 0 ? (
                        <div style={answerListStyle}>
                          {selectedOptions.map((option) => (
                            <div key={option.id} style={selectedAnswerStyle}>
                              {option.option_text}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={mutedTextStyle}>No answer selected.</div>
                      )}
                    </div>

                    <div style={answerSectionStyle}>
                      <div style={answerLabelStyle}>Correct Answer</div>
                      <div style={answerListStyle}>
                        {correctOptions.map((option) => (
                          <div key={option.id} style={correctAnswerStyle}>
                            {option.option_text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ContentCard>
      </div>
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
    <div style={summaryCardStyle}>
      <div style={summaryLabelStyle}>{label}</div>
      <div style={summaryValueStyle}>{value}</div>
    </div>
  );
}

const actionsStyle: CSSProperties = {
  display: 'flex',
  gap: '10px',
};

const layoutStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
};

const summaryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: '12px',
};

const summaryCardStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  padding: '14px',
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
  fontSize: '16px',
  fontWeight: 800,
  color: theme.colors.text,
};

const emptyStyle: CSSProperties = {
  color: theme.colors.mutedText,
  lineHeight: 1.6,
};

const questionListStyle: CSSProperties = {
  display: 'grid',
  gap: '14px',
};

const questionCardStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  padding: '16px',
  background: '#ffffff',
  display: 'grid',
  gap: '12px',
};

const questionTopStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'center',
};

const questionNumberStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.colors.mutedText,
};

const questionTextStyle: CSSProperties = {
  fontSize: '17px',
  fontWeight: 800,
  color: theme.colors.text,
};

const answerSectionStyle: CSSProperties = {
  display: 'grid',
  gap: '8px',
};

const answerLabelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.colors.mutedText,
};

const answerListStyle: CSSProperties = {
  display: 'grid',
  gap: '8px',
};

const selectedAnswerStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: '12px',
  background: '#eef3f8',
  color: theme.colors.text,
  fontWeight: 600,
};

const correctAnswerStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: '12px',
  background: '#e8f7ee',
  color: '#18794e',
  fontWeight: 700,
};

const correctBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#e8f7ee',
  color: '#18794e',
  fontWeight: 800,
  fontSize: '12px',
};

const incorrectBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#fff4e8',
  color: '#9a5b13',
  fontWeight: 800,
  fontSize: '12px',
};

const mutedTextStyle: CSSProperties = {
  color: theme.colors.mutedText,
};

export default QuizAttemptReviewPage;