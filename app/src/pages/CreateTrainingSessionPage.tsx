import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import {
  createTrainingSession,
  getTrainingModuleById,
  getUserOptions,
} from '../features/training/trainingApi';
import { theme } from '../styles/theme';

type SelectOption = {
  id: string;
  name: string;
};

function CreateTrainingSessionPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [moduleTitle, setModuleTitle] = useState('Training Module');
  const [users, setUsers] = useState<SelectOption[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    trainee_id: '',
    trainer_id: '',
  });

  useEffect(() => {
    async function loadData() {
      if (!moduleId) return;

      try {
        const [moduleData, userData] = await Promise.all([
          getTrainingModuleById(moduleId),
          getUserOptions(),
        ]);

        if (moduleData) {
          setModuleTitle(moduleData.title);
        }

        setUsers(userData ?? []);
      } catch (error) {
        console.error('LOAD SESSION START DATA ERROR:', error);
      }
    }

    loadData();
  }, [moduleId]);

  async function handleSubmit() {
    if (!moduleId) return;

    try {
      setSaving(true);

      const session = await createTrainingSession({
        module_id: moduleId,
        trainee_id: form.trainee_id,
        trainer_id: form.trainer_id,
      });

      navigate(`/training/sessions/${session.id}`);
    } catch (error: unknown) {
      console.error('CREATE TRAINING SESSION ERROR:', error);
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      alert(`Failed to start training session: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer
      title="Start Training Session"
      subtitle={`Create a trainer-led session for ${moduleTitle}.`}
      actions={
        <PrimaryButton onClick={handleSubmit} disabled={saving}>
          {saving ? 'Starting Session...' : 'Start Session'}
        </PrimaryButton>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.8fr',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        <ContentCard
          title="Session Setup"
          subtitle="Choose the trainee and trainer for this module run."
        >
          <div style={gridTwoStyle}>
            <Field label="Trainee">
              <select
                style={inputStyle}
                value={form.trainee_id}
                onChange={(e) => setForm({ ...form, trainee_id: e.target.value })}
              >
                <option value="">Select trainee</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Trainer">
              <select
                style={inputStyle}
                value={form.trainer_id}
                onChange={(e) => setForm({ ...form, trainer_id: e.target.value })}
              >
                <option value="">Select trainer</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </ContentCard>

        <ContentCard
          title="What Happens Next"
          subtitle="Session behavior in this phase."
        >
          <p style={noteTextStyle}>
            The session will open the module sections, save progress section by
            section, and allow the trainer and trainee to resume later.
          </p>
        </ContentCard>
      </div>
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

const gridTwoStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '16px',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '13px',
  marginBottom: '6px',
  fontWeight: 700,
};

const inputStyle: CSSProperties = {
  width: '100%',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '13px 14px',
  fontSize: '14px',
  background: '#ffffff',
};

const noteTextStyle: CSSProperties = {
  margin: 0,
  color: theme.colors.mutedText,
  lineHeight: 1.65,
  fontSize: '14px',
};

export default CreateTrainingSessionPage;