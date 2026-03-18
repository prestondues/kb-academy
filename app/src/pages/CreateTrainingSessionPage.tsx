import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import {
  createTrainingSession,
  getTrainingModules,
  getUserOptions,
} from '../features/training/trainingApi';
import { mapTrainingModuleToCard } from '../features/training/trainingMappers';
import { useAuth } from '../features/auth/useAuth';
import { theme } from '../styles/theme';

type SelectOption = {
  id: string;
  name: string;
};

function CreateTrainingSessionPage() {
  const { moduleId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const preselectedModuleId = moduleId ?? searchParams.get('moduleId') ?? '';

  const [modules, setModules] = useState<SelectOption[]>([]);
  const [allTrainees, setAllTrainees] = useState<SelectOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    module_id: preselectedModuleId,
    trainee_id: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [moduleData, traineeData] = await Promise.all([
          getTrainingModules(),
          getUserOptions(),
        ]);

        const mappedModules = moduleData.map((module) => {
          const card = mapTrainingModuleToCard(module);
          return {
            id: card.id,
            name: `${card.title} (${card.moduleType})`,
          };
        });

        setModules(mappedModules);
        setAllTrainees(traineeData ?? []);
      } catch (loadError) {
        console.error('LOAD CONDUCT TRAINING DATA ERROR:', loadError);
      }
    }

    loadData();
  }, []);

  const trainees = useMemo(() => {
    if (!user?.id) return allTrainees;
    return allTrainees.filter((option) => option.id !== user.id);
  }, [allTrainees, user?.id]);

  const selectedModuleName = useMemo(
    () => modules.find((item) => item.id === form.module_id)?.name ?? 'Not selected',
    [modules, form.module_id]
  );

  const selectedTraineeName = useMemo(
    () => trainees.find((item) => item.id === form.trainee_id)?.name ?? 'Not selected',
    [trainees, form.trainee_id]
  );

  const trainerDisplayName = useMemo(() => {
    const fullName =
      `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Current User';
    const username = profile?.username ? ` (@${profile.username})` : '';
    return `${fullName}${username}`;
  }, [profile]);

  async function handleSubmit() {
    if (!user?.id) {
      setError('You must be signed in to conduct training.');
      return;
    }

    if (!form.module_id || !form.trainee_id) {
      setError('Select both a module and a trainee.');
      return;
    }

    if (form.trainee_id === user.id) {
      setError('Trainer and trainee cannot be the same person.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const session = await createTrainingSession({
        module_id: form.module_id,
        trainee_id: form.trainee_id,
        trainer_id: user.id,
      });

      navigate(`/training/sessions/${session.id}`);
    } catch (submitError: unknown) {
      console.error('CREATE TRAINING SESSION ERROR:', submitError);
      const message =
        submitError instanceof Error ? submitError.message : JSON.stringify(submitError);
      setError(`Failed to start training session: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer
      title="Conduct Training"
      subtitle="Select a module and trainee to begin a live training session."
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
          subtitle="Choose the module and trainee. Trainer is assigned automatically."
        >
          <div style={gridTwoStyle}>
            <Field label="Training Module">
              <select
                style={inputStyle}
                value={form.module_id}
                onChange={(e) => setForm({ ...form, module_id: e.target.value })}
              >
                <option value="">Select module</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Trainee">
              <select
                style={inputStyle}
                value={form.trainee_id}
                onChange={(e) => setForm({ ...form, trainee_id: e.target.value })}
              >
                <option value="">Select trainee</option>
                {trainees.map((userOption) => (
                  <option key={userOption.id} value={userOption.id}>
                    {userOption.name}
                  </option>
                ))}
              </select>
            </Field>

            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Trainer">
                <div style={readOnlyBoxStyle}>{trainerDisplayName}</div>
              </Field>
            </div>
          </div>

          {error ? <div style={errorStyle}>{error}</div> : null}
        </ContentCard>

        <ContentCard
          title="Session Summary"
          subtitle="Confirm who and what will be attached to this training session."
        >
          <div style={{ display: 'grid', gap: '12px' }}>
            <SummaryRow label="Module" value={selectedModuleName} />
            <SummaryRow label="Trainee" value={selectedTraineeName} />
            <SummaryRow label="Trainer" value={trainerDisplayName} />
          </div>
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

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={summaryRowStyle}>
      <span style={summaryLabelStyle}>{label}</span>
      <span>{value}</span>
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

const readOnlyBoxStyle: CSSProperties = {
  width: '100%',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '13px 14px',
  fontSize: '14px',
  background: '#f7f9fc',
  color: theme.colors.text,
  fontWeight: 700,
};

const errorStyle: CSSProperties = {
  marginTop: '16px',
  padding: '12px 14px',
  borderRadius: '14px',
  background: '#fff7f7',
  border: '1px solid #f3cccc',
  color: '#a12828',
  fontSize: '14px',
  fontWeight: 600,
};

const summaryRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  paddingBottom: '10px',
  borderBottom: `1px solid ${theme.colors.border}`,
};

const summaryLabelStyle: CSSProperties = {
  color: theme.colors.mutedText,
  fontWeight: 700,
};

export default CreateTrainingSessionPage;