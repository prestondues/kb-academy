import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../features/auth/useAuth';
import {
  getTrainingModules,
  getTrainingQuizByModule,
  getUserOptions,
} from '../features/training/trainingApi';
import type { TrainingModuleRecord } from '../features/training/types';

type UserOption = {
  id: string;
  name: string;
};

function StartCertificationPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [users, setUsers] = useState<UserOption[]>([]);
  const [modules, setModules] = useState<TrainingModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [traineeId, setTraineeId] = useState('');
  const [moduleId, setModuleId] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [userOptions, moduleOptions] = await Promise.all([
          getUserOptions(),
          getTrainingModules(),
        ]);

        const currentUserId = (profile as { id?: string } | null)?.id ?? null;

        setUsers(
          userOptions.filter((user) => user.id !== currentUserId)
        );

        setModules(moduleOptions.filter((module) => module.is_active));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load certification setup.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [profile]);

  async function handleStart() {
    if (!traineeId || !moduleId) {
      setError('Trainee and module are required.');
      return;
    }

    try {
      setStarting(true);
      setError(null);

      const quiz = await getTrainingQuizByModule(moduleId);

      if (!quiz) {
        setError('This module does not have a certification quiz configured.');
        setStarting(false);
        return;
      }

      navigate(`/certifications/start/${moduleId}/${traineeId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start certification.');
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <PageContainer title="Start Certification" subtitle="Loading certification setup...">
        <ContentCard title="Loading">Please wait.</ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Start Certification"
      subtitle="Select the trainee and module to launch a certification quiz."
    >
      <ContentCard title="Certification Setup" subtitle="Trainer-led certification launch.">
        <div style={formGridStyle}>
          <div>
            <label style={labelStyle}>Trainee</label>
            <select
              style={inputStyle}
              value={traineeId}
              onChange={(e) => setTraineeId(e.target.value)}
            >
              <option value="">Select trainee</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Module</label>
            <select
              style={inputStyle}
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
            >
              <option value="">Select module</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? <div style={errorStyle}>{error}</div> : null}

        <div style={actionsStyle}>
          <PrimaryButton onClick={handleStart} disabled={starting}>
            {starting ? 'Starting...' : 'Launch Certification Quiz'}
          </PrimaryButton>
        </div>
      </ContentCard>
    </PageContainer>
  );
}

const formGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '12px',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#5b6875',
};

const inputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #d7dee7',
  borderRadius: '14px',
  padding: '12px 14px',
  fontSize: '14px',
  background: '#ffffff',
};

const actionsStyle: CSSProperties = {
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

export default StartCertificationPage;