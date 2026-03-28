import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import PageContainer from '../components/PageContainer';
import ContentCard from '../components/ContentCard';
import PrimaryButton from '../components/PrimaryButton';
import TrainingSubnav from '../features/training/TrainingSubnav';
import {
  createTrainingTimeLog,
  createTrainingTimeLogSignoff,
  finalizeTrainingTimeLog,
  getProfilePinStatus,
  getTrainingModules,
  getTrainingTimeLogs,
  getUserOptions,
  verifyProfilePin,
  voidTrainingTimeLog,
  type TrainingTimeLogRecord,
} from '../features/training/trainingApi';
import { mapTrainingModuleToCard } from '../features/training/trainingMappers';
import { useAuth } from '../features/auth/useAuth';
import { theme } from '../styles/theme';

type SelectOption = {
  id: string;
  name: string;
};

type SignoffStep = 'trainer' | 'trainee';

function ManualTimeLogPage() {
  const { user, profile } = useAuth();

  const [modules, setModules] = useState<SelectOption[]>([]);
  const [trainees, setTrainees] = useState<SelectOption[]>([]);
  const [logs, setLogs] = useState<TrainingTimeLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    module_id: '',
    trainee_id: '',
    entry_date: new Date().toISOString().slice(0, 10),
    hours_logged: '',
    notes: '',
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<SignoffStep>('trainer');
  const [trainerPin, setTrainerPin] = useState('');
  const [traineePin, setTraineePin] = useState('');
  const [dialogError, setDialogError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [moduleData, traineeData, logData] = await Promise.all([
          getTrainingModules(),
          getUserOptions(),
          getTrainingTimeLogs(),
        ]);

        const mappedModules = moduleData
          .filter((module) => module.module_type === 'time_based')
          .map((module) => {
            const card = mapTrainingModuleToCard(module);
            return { id: card.id, name: card.title };
          });

        setModules(mappedModules);
        setTrainees(traineeData.filter((item) => item.id !== user?.id));
        setLogs(logData);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load manual time logging.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  const trainerName = useMemo(() => {
    const fullName =
      `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Current User';
    const username = profile?.username ? ` (@${profile.username})` : '';
    return `${fullName}${username}`;
  }, [profile]);

  const selectedTraineeName = useMemo(() => {
    return trainees.find((item) => item.id === form.trainee_id)?.name ?? 'Selected Trainee';
  }, [trainees, form.trainee_id]);

  const selectedModuleName = useMemo(() => {
    return modules.find((item) => item.id === form.module_id)?.name ?? 'Selected Module';
  }, [modules, form.module_id]);

  async function refreshLogs() {
    const logData = await getTrainingTimeLogs();
    setLogs(logData);
  }

  function resetDialog() {
    setDialogOpen(false);
    setDialogStep('trainer');
    setTrainerPin('');
    setTraineePin('');
    setDialogError(null);
  }

  async function handleStartSubmitFlow() {
    if (!user?.id) {
      setError('You must be signed in.');
      return;
    }

    if (!form.module_id || !form.trainee_id || !form.hours_logged) {
      setError('Module, trainee, and hours are required.');
      return;
    }

    if (form.trainee_id === user.id) {
      setError('Trainer and trainee cannot be the same person.');
      return;
    }

    const parsedHours = Number(form.hours_logged);

    if (Number.isNaN(parsedHours) || parsedHours <= 0) {
      setError('Hours logged must be greater than 0.');
      return;
    }

    try {
      setError(null);

      const [trainerPinStatus, traineePinStatus] = await Promise.all([
        getProfilePinStatus(user.id),
        getProfilePinStatus(form.trainee_id),
      ]);

      if (
        !trainerPinStatus.hasPin ||
        trainerPinStatus.mustCreatePin ||
        trainerPinStatus.pinResetRequired
      ) {
        setError('Trainer must create or reset their PIN before signing.');
        return;
      }

      if (
        !traineePinStatus.hasPin ||
        traineePinStatus.mustCreatePin ||
        traineePinStatus.pinResetRequired
      ) {
        setError('Trainee must create or reset their PIN before signing.');
        return;
      }

      setDialogStep('trainer');
      setTrainerPin('');
      setTraineePin('');
      setDialogError(null);
      setDialogOpen(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to prepare PIN verification.';
      setError(message);
    }
  }

  async function handleDialogContinue() {
    if (!user?.id) return;

    try {
      setDialogError(null);

      if (dialogStep === 'trainer') {
        if (!trainerPin.trim()) {
          setDialogError('Trainer PIN is required.');
          return;
        }

        const valid = await verifyProfilePin(user.id, trainerPin);
        if (!valid) {
          setDialogError('Incorrect trainer PIN.');
          return;
        }

        setDialogStep('trainee');
        return;
      }

      if (!traineePin.trim()) {
        setDialogError('Trainee PIN is required.');
        return;
      }

      const validTrainee = await verifyProfilePin(form.trainee_id, traineePin);
      if (!validTrainee) {
        setDialogError('Incorrect trainee PIN.');
        return;
      }

      const parsedHours = Number(form.hours_logged);
      const minutesLogged = Math.round(parsedHours * 60);

      setSaving(true);

      const log = await createTrainingTimeLog({
        module_id: form.module_id,
        trainee_id: form.trainee_id,
        trainer_id: user.id,
        entry_date: form.entry_date,
        minutes_logged: minutesLogged,
        notes: form.notes || null,
      });

      await createTrainingTimeLogSignoff({
        time_log_id: log.id,
        signer_id: user.id,
        signer_role: 'trainer',
      });

      await createTrainingTimeLogSignoff({
        time_log_id: log.id,
        signer_id: form.trainee_id,
        signer_role: 'trainee',
      });

      await finalizeTrainingTimeLog(log.id);
      await refreshLogs();

      setForm({
        module_id: '',
        trainee_id: '',
        entry_date: new Date().toISOString().slice(0, 10),
        hours_logged: '',
        notes: '',
      });

      resetDialog();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit manual time log.';
      setDialogError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleVoidLog(logId: string) {
    try {
      await voidTrainingTimeLog(logId);
      await refreshLogs();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to void time log.';
      setError(message);
    }
  }

  if (loading) {
    return (
      <PageContainer title="Training" subtitle="Loading manual time logging...">
        <ContentCard title="Loading">Please wait.</ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Training"
      subtitle="Manual time logging with dual PIN verification."
    >
      <TrainingSubnav />

      <div style={shellStyle}>
        <ContentCard
          title="Create Manual Time Log"
          subtitle="Trainer enters the log, then both trainer and trainee verify in one submit flow."
        >
          <div style={formGridStyle}>
            <Field label="Module">
              <select
                style={inputStyle}
                value={form.module_id}
                onChange={(e) => setForm({ ...form, module_id: e.target.value })}
              >
                <option value="">Select module</option>
                {modules.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
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
                {trainees.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Trainer">
              <div style={readOnlyStyle}>{trainerName}</div>
            </Field>

            <Field label="Entry Date">
              <input
                type="date"
                style={inputStyle}
                value={form.entry_date}
                onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
              />
            </Field>

            <Field label="Hours Logged">
              <input
                type="number"
                min={0.01}
                step={0.25}
                style={inputStyle}
                value={form.hours_logged}
                onChange={(e) => setForm({ ...form, hours_logged: e.target.value })}
              />
            </Field>

            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Notes">
                <textarea
                  style={textareaStyle}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </Field>
            </div>
          </div>

          {error ? <div style={errorStyle}>{error}</div> : null}

          <div style={{ marginTop: '16px' }}>
            <PrimaryButton onClick={handleStartSubmitFlow} disabled={saving}>
              {saving ? 'Submitting...' : 'Submit Time Log'}
            </PrimaryButton>
          </div>
        </ContentCard>

        <ContentCard
          title="Manual Time Log History"
          subtitle="Completed logs are official. Pending or voided logs remain visible for audit clarity."
        >
          {logs.length === 0 ? (
            <div style={emptyStyle}>No manual time logs found.</div>
          ) : (
            <div style={tableWrapStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Module</th>
                    <th style={thStyle}>Trainee</th>
                    <th style={thStyle}>Trainer</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Hours</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={tdStyle}>{log.module?.title ?? '—'}</td>
                      <td style={tdStyle}>
                        {`${log.trainee?.first_name ?? ''} ${log.trainee?.last_name ?? ''}`.trim() ||
                          '—'}
                      </td>
                      <td style={tdStyle}>
                        {`${log.trainer?.first_name ?? ''} ${log.trainer?.last_name ?? ''}`.trim() ||
                          '—'}
                      </td>
                      <td style={tdStyle}>{log.entry_date}</td>
                      <td style={tdStyle}>{Number((log.minutes_logged / 60).toFixed(2))}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            ...statusPillStyle,
                            ...(log.log_status === 'completed'
                              ? completedStatusStyle
                              : log.log_status === 'voided'
                              ? voidedStatusStyle
                              : pendingStatusStyle),
                          }}
                        >
                          {log.log_status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {log.log_status === 'pending' ? (
                          <button
                            type="button"
                            style={deleteButtonStyle}
                            onClick={() => handleVoidLog(log.id)}
                          >
                            Void
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ContentCard>
      </div>

      {dialogOpen ? (
        <div style={modalBackdropStyle}>
          <div style={modalCardStyle}>
            <div style={modalTitleStyle}>Time Log Signoff</div>
            <div style={modalTextStyle}>
              <div><strong>Module:</strong> {selectedModuleName}</div>
              <div><strong>Trainee:</strong> {selectedTraineeName}</div>
              <div><strong>Hours:</strong> {form.hours_logged || '—'}</div>
              <div><strong>Date:</strong> {form.entry_date}</div>
            </div>

            {dialogStep === 'trainer' ? (
              <>
                <div style={signerHeadingStyle}>Trainer Signoff</div>
                <div style={signerSubtextStyle}>
                  Enter the PIN for <strong>{trainerName}</strong>.
                </div>
                <input
                  type="password"
                  maxLength={6}
                  style={inputStyle}
                  value={trainerPin}
                  onChange={(e) => setTrainerPin(e.target.value)}
                  placeholder="Enter trainer PIN"
                />
              </>
            ) : (
              <>
                <div style={signerHeadingStyle}>Trainee Signoff</div>
                <div style={signerSubtextStyle}>
                  Enter the PIN for <strong>{selectedTraineeName}</strong>.
                </div>
                <input
                  type="password"
                  maxLength={6}
                  style={inputStyle}
                  value={traineePin}
                  onChange={(e) => setTraineePin(e.target.value)}
                  placeholder="Enter trainee PIN"
                />
              </>
            )}

            {dialogError ? <div style={errorStyle}>{dialogError}</div> : null}

            <div style={modalActionsStyle}>
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={resetDialog}
                disabled={saving}
              >
                Cancel
              </button>
              <PrimaryButton onClick={handleDialogContinue} disabled={saving}>
                {saving
                  ? 'Submitting...'
                  : dialogStep === 'trainer'
                  ? 'Continue to Trainee Signoff'
                  : 'Complete Time Log'}
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

const formGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '12px',
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

const textareaStyle: CSSProperties = {
  width: '100%',
  minHeight: '110px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '12px 14px',
  fontSize: '14px',
  background: '#ffffff',
  resize: 'vertical',
};

const readOnlyStyle: CSSProperties = {
  ...inputStyle,
  background: '#f7f9fc',
  fontWeight: 700,
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

const tableWrapStyle: CSSProperties = {
  overflowX: 'auto',
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '12px 10px',
  borderBottom: `1px solid ${theme.colors.border}`,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.colors.mutedText,
};

const tdStyle: CSSProperties = {
  padding: '12px 10px',
  borderBottom: `1px solid ${theme.colors.border}`,
  fontSize: '14px',
  color: theme.colors.text,
};

const statusPillStyle: CSSProperties = {
  display: 'inline-flex',
  padding: '6px 10px',
  borderRadius: '999px',
  fontWeight: 800,
  fontSize: '12px',
  textTransform: 'capitalize',
};

const completedStatusStyle: CSSProperties = {
  background: '#e8f7ee',
  color: '#18794e',
};

const pendingStatusStyle: CSSProperties = {
  background: '#eef6ff',
  color: '#194f91',
};

const voidedStatusStyle: CSSProperties = {
  background: '#fff7f7',
  color: '#a12828',
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
  fontSize: '20px',
  fontWeight: 800,
  marginBottom: '10px',
};

const modalTextStyle: CSSProperties = {
  marginBottom: '16px',
  color: theme.colors.text,
  lineHeight: 1.6,
};

const signerHeadingStyle: CSSProperties = {
  fontSize: '16px',
  fontWeight: 800,
  marginBottom: '6px',
};

const signerSubtextStyle: CSSProperties = {
  marginBottom: '12px',
  color: theme.colors.mutedText,
  lineHeight: 1.5,
};

const modalActionsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '16px',
};

const secondaryButtonStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: '#ffffff',
  borderRadius: '14px',
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

export default ManualTimeLogPage;