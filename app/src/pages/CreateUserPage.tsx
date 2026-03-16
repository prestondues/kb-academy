import { useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import {
  createManagedUser,
  getDepartments,
  getRoles,
  getShifts,
} from '../features/users/usersApi';
import { theme } from '../styles/theme';

type SelectOption = {
  id: string;
  name: string;
};

function CreateUserPage() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState<SelectOption[]>([]);
  const [departments, setDepartments] = useState<SelectOption[]>([]);
  const [shifts, setShifts] = useState<SelectOption[]>([]);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    employee_id: '',
    email: '',
    password: '',
    role_id: '',
    home_department_id: '',
    home_shift_id: '',
    hire_date: '',
    birthday: '',
    probationary: false,
    trainer_enabled: false,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      const [rolesData, departmentData, shiftData] = await Promise.all([
        getRoles(),
        getDepartments(),
        getShifts(),
      ]);

      setRoles(rolesData ?? []);
      setDepartments(departmentData ?? []);
      setShifts(shiftData ?? []);
    }

    loadOptions();
  }, []);

  async function handleSubmit() {
    try {
      setSaving(true);

      const result = await createManagedUser({
        ...form,
        email: form.email,
        password: form.password,
      });

      navigate(`/users/${result.user.id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create user.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer
      title="Create User"
      subtitle="Create a login-ready employee account and linked KB Academy profile."
      actions={
        <PrimaryButton onClick={handleSubmit} disabled={saving}>
          {saving ? 'Creating User...' : 'Create User'}
        </PrimaryButton>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.35fr 0.78fr',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <ContentCard
            title="Account Identity"
            subtitle="Core sign-in and employee identity details."
          >
            <div style={gridTwoStyle}>
              <Field label="First Name">
                <input
                  style={inputStyle}
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  placeholder="Enter first name"
                />
              </Field>

              <Field label="Last Name">
                <input
                  style={inputStyle}
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  placeholder="Enter last name"
                />
              </Field>

              <Field label="Username">
                <input
                  style={inputStyle}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="e.g. pdues"
                />
              </Field>

              <Field label="Employee ID">
                <input
                  style={inputStyle}
                  value={form.employee_id}
                  onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                  placeholder="Enter employee ID"
                />
              </Field>

              <Field label="Login Email">
                <input
                  style={inputStyle}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter login email"
                />
              </Field>

              <Field label="Temporary Password">
                <input
                  style={inputStyle}
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Set temporary password"
                />
              </Field>
            </div>

            <div style={helperPanelStyle}>
              This temporary password is only for first login. The user will be
              required to change it before entering the app.
            </div>
          </ContentCard>

          <ContentCard
            title="Access & Organization"
            subtitle="Assign system access, department, and shift."
          >
            <div style={gridThreeStyle}>
              <Field label="Role">
                <select
                  style={inputStyle}
                  value={form.role_id}
                  onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Home Department">
                <select
                  style={inputStyle}
                  value={form.home_department_id}
                  onChange={(e) =>
                    setForm({ ...form, home_department_id: e.target.value })
                  }
                >
                  <option value="">Select a department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Shift">
                <select
                  style={inputStyle}
                  value={form.home_shift_id}
                  onChange={(e) =>
                    setForm({ ...form, home_shift_id: e.target.value })
                  }
                >
                  <option value="">Select a shift</option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </ContentCard>

          <ContentCard
            title="Employment Details"
            subtitle="Optional employee timing and personal reference details."
          >
            <div style={gridTwoStyle}>
              <Field label="Hire Date">
                <input
                  type="date"
                  style={inputStyle}
                  value={form.hire_date}
                  onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
                />
              </Field>

              <Field label="Birthday">
                <input
                  type="date"
                  style={inputStyle}
                  value={form.birthday}
                  onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                />
              </Field>
            </div>
          </ContentCard>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <ContentCard
            title="Account Flags"
            subtitle="Control special onboarding and training status."
          >
            <div style={{ display: 'grid', gap: '14px' }}>
              <ToggleCard
                title="Probationary"
                description="Use this when the employee is still in a probationary period."
                checked={form.probationary}
                onChange={(checked) =>
                  setForm({ ...form, probationary: checked })
                }
              />

              <ToggleCard
                title="Trainer Enabled"
                description="Allows this employee to participate in trainer-led workflows."
                checked={form.trainer_enabled}
                onChange={(checked) =>
                  setForm({ ...form, trainer_enabled: checked })
                }
              />
            </div>
          </ContentCard>

          <ContentCard
            title="First Login Flow"
            subtitle="What will happen after the account is created."
          >
            <div style={{ display: 'grid', gap: '12px' }}>
              <StepItem
                number="1"
                title="User signs in with username + temporary password"
              />
              <StepItem
                number="2"
                title="User is required to change password"
              />
              <StepItem
                number="3"
                title="User creates a 6-digit PIN"
              />
              <StepItem
                number="4"
                title="User enters KB Academy dashboard"
              />
            </div>
          </ContentCard>

          <ContentCard
            title="Admin Note"
            subtitle="Keep onboarding clear and consistent."
          >
            <p style={noteTextStyle}>
              Use a real login email for the auth account, even though the
              employee signs in with their username in KB Academy.
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

function ToggleCard({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label style={toggleCardStyle}>
      <div>
        <div style={{ fontWeight: 800, marginBottom: '6px' }}>{title}</div>
        <div style={toggleDescriptionStyle}>{description}</div>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function StepItem({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div style={stepItemStyle}>
      <div style={stepNumberStyle}>{number}</div>
      <div style={{ fontWeight: 700, lineHeight: 1.45 }}>{title}</div>
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

const helperPanelStyle: CSSProperties = {
  marginTop: '18px',
  padding: '14px',
  borderRadius: '16px',
  background: '#f7f9fc',
  border: `1px solid ${theme.colors.border}`,
  color: theme.colors.mutedText,
  fontSize: '14px',
  lineHeight: 1.6,
};

const toggleCardStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '16px',
  padding: '14px',
  borderRadius: '16px',
  border: `1px solid ${theme.colors.border}`,
  background: '#f7f9fc',
  cursor: 'pointer',
};

const toggleDescriptionStyle: CSSProperties = {
  color: theme.colors.mutedText,
  fontSize: '14px',
  lineHeight: 1.55,
};

const stepItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 0',
};

const stepNumberStyle: CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  background: theme.colors.infoBg,
  color: theme.colors.infoText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: '13px',
  flexShrink: 0,
};

const noteTextStyle: CSSProperties = {
  margin: 0,
  color: theme.colors.mutedText,
  lineHeight: 1.65,
  fontSize: '14px',
};

export default CreateUserPage;