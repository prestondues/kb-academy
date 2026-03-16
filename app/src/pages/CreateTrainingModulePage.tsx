import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import {
  createTrainingModule,
  getTrainingDepartments,
} from '../features/training/trainingApi';
import { theme } from '../styles/theme';

type SelectOption = {
  id: string;
  name: string;
};

function CreateTrainingModulePage() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<SelectOption[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    module_type: 'time_based' as 'time_based' | 'sign_off',
    department_id: '',
    required_hours: '',
    recert_frequency_days: '',
    requires_quiz: false,
    allergen_flag: false,
    sqf_element: '',
  });

  useEffect(() => {
    async function loadDepartments() {
      try {
        const data = await getTrainingDepartments();
        setDepartments(data ?? []);
      } catch (error) {
        console.error('LOAD DEPARTMENTS ERROR:', error);
      }
    }

    loadDepartments();
  }, []);

  async function handleSubmit() {
    try {
      setSaving(true);

      const created = await createTrainingModule({
        title: form.title,
        description: form.description,
        module_type: form.module_type,
        department_id: form.department_id || null,
        required_hours:
          form.module_type === 'time_based' && form.required_hours !== ''
            ? Number(form.required_hours)
            : null,
        recert_frequency_days:
          form.recert_frequency_days !== ''
            ? Number(form.recert_frequency_days)
            : null,
        requires_quiz:
          form.module_type === 'time_based' ? form.requires_quiz : false,
        allergen_flag: form.allergen_flag,
        sqf_element: form.sqf_element || null,
      });

      navigate(`/training/${created.id}`);
    } catch (error: unknown) {
      console.error('CREATE TRAINING MODULE ERROR:', error);

      const message =
        error instanceof Error ? error.message : JSON.stringify(error);

      alert(`Failed to create training module: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer
      title="Create Training Module"
      subtitle="Define a new KB Academy module and its operational settings."
      actions={
        <PrimaryButton onClick={handleSubmit} disabled={saving}>
          {saving ? 'Creating Module...' : 'Create Module'}
        </PrimaryButton>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 0.8fr',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <ContentCard
            title="Module Basics"
            subtitle="The core identity and scope of this training."
          >
            <div style={gridTwoStyle}>
              <Field label="Title">
                <input
                  style={inputStyle}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter module title"
                />
              </Field>

              <Field label="Module Type">
                <select
                  style={inputStyle}
                  value={form.module_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      module_type: e.target.value as 'time_based' | 'sign_off',
                    })
                  }
                >
                  <option value="time_based">Time Based</option>
                  <option value="sign_off">Sign Off</option>
                </select>
              </Field>

              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Description">
                  <textarea
                    style={textareaStyle}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Describe what this training covers"
                  />
                </Field>
              </div>

              <Field label="Department">
                <select
                  style={inputStyle}
                  value={form.department_id}
                  onChange={(e) =>
                    setForm({ ...form, department_id: e.target.value })
                  }
                >
                  <option value="">General / Company-Wide</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="SQF Element">
                <input
                  style={inputStyle}
                  value={form.sqf_element}
                  onChange={(e) =>
                    setForm({ ...form, sqf_element: e.target.value })
                  }
                  placeholder="e.g. 2.9.2"
                />
              </Field>
            </div>
          </ContentCard>

          <ContentCard
            title="Time & Recertification Settings"
            subtitle="Configure hours, quiz requirements, and recertification timing."
          >
            <div style={gridThreeStyle}>
              <Field label="Required Hours">
                <input
                  type="number"
                  step="0.25"
                  style={inputStyle}
                  value={form.required_hours}
                  onChange={(e) =>
                    setForm({ ...form, required_hours: e.target.value })
                  }
                  disabled={form.module_type !== 'time_based'}
                  placeholder="0.00"
                />
              </Field>

              <Field label="Recertification Days">
                <input
                  type="number"
                  style={inputStyle}
                  value={form.recert_frequency_days}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      recert_frequency_days: e.target.value,
                    })
                  }
                  placeholder="e.g. 365"
                />
              </Field>

              <div />
            </div>

            <div style={{ display: 'grid', gap: '14px', marginTop: '18px' }}>
              <ToggleRow
                title="Requires Quiz"
                description="Only applies to time-based training modules."
                checked={form.requires_quiz}
                disabled={form.module_type !== 'time_based'}
                onChange={(checked) =>
                  setForm({ ...form, requires_quiz: checked })
                }
              />

              <ToggleRow
                title="Allergen Flag"
                description="Marks this module as relevant to allergen handling."
                checked={form.allergen_flag}
                onChange={(checked) =>
                  setForm({ ...form, allergen_flag: checked })
                }
              />
            </div>
          </ContentCard>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <ContentCard
            title="Configuration Summary"
            subtitle="How this module will behave."
          >
            <div style={{ display: 'grid', gap: '12px' }}>
              <SummaryRow
                label="Type"
                value={
                  form.module_type === 'time_based' ? 'Time Based' : 'Sign Off'
                }
              />
              <SummaryRow
                label="Department"
                value={
                  departments.find((d) => d.id === form.department_id)?.name ??
                  'General'
                }
              />
              <SummaryRow
                label="Required Hours"
                value={
                  form.module_type === 'time_based'
                    ? form.required_hours || '—'
                    : 'Not applicable'
                }
              />
              <SummaryRow
                label="Quiz"
                value={
                  form.module_type === 'time_based' && form.requires_quiz
                    ? 'Required'
                    : 'Not required'
                }
              />
              <SummaryRow
                label="Allergen Flag"
                value={form.allergen_flag ? 'Enabled' : 'Off'}
              />
              <SummaryRow
                label="SQF Element"
                value={form.sqf_element || '—'}
              />
            </div>
          </ContentCard>

          <ContentCard
            title="Next Phase"
            subtitle="What comes after module creation."
          >
            <p style={noteTextStyle}>
              In the next training phase, this module will gain content blocks,
              module sections, prerequisites, assignments, time tracking rules,
              and sign-off behavior.
            </p>
          </ContentCard>
        </div>
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

function ToggleRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label style={{ ...toggleRowStyle, opacity: disabled ? 0.6 : 1 }}>
      <div>
        <div style={{ fontWeight: 800, marginBottom: '6px' }}>{title}</div>
        <div
          style={{
            color: theme.colors.mutedText,
            fontSize: '14px',
            lineHeight: 1.55,
          }}
        >
          {description}
        </div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
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

const gridThreeStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
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

const textareaStyle: CSSProperties = {
  width: '100%',
  minHeight: '120px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '13px 14px',
  fontSize: '14px',
  background: '#ffffff',
  resize: 'vertical',
};

const toggleRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '16px',
  padding: '14px',
  borderRadius: '16px',
  border: `1px solid ${theme.colors.border}`,
  background: '#f7f9fc',
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

const noteTextStyle: CSSProperties = {
  margin: 0,
  color: theme.colors.mutedText,
  lineHeight: 1.65,
  fontSize: '14px',
};

export default CreateTrainingModulePage;