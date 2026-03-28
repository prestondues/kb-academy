import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import ContentCard from '../components/ContentCard';
import PrimaryButton from '../components/PrimaryButton';
import {
  getDepartments,
  getRoles,
  getShifts,
} from '../features/users/usersApi';
import type { LookupOption } from '../features/users/types';
import { supabase } from '../lib/supabase';
import { theme } from '../styles/theme';
import { getAppErrorMessage } from '../lib/appErrors';

function CreateUserPage() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState<LookupOption[]>([]);
  const [departments, setDepartments] = useState<LookupOption[]>([]);
  const [shifts, setShifts] = useState<LookupOption[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    employee_id: '',
    email: '',
    password: '',
    role_id: '',
    department_id: '',
    shift_id: '',
    probationary: false,
    trainer_enabled: false,
  });

  useEffect(() => {
    async function loadLookups() {
      try {
        const [roleData, departmentData, shiftData] = await Promise.all([
          getRoles(),
          getDepartments(),
          getShifts(),
        ]);

        setRoles(roleData);
        setDepartments(departmentData);
        setShifts(shiftData);
      } catch (err) {
        console.error('LOAD USER LOOKUPS ERROR:', err);
      }
    }

    loadLookups();
  }, []);

  function validateForm() {
    if (!form.first_name.trim()) return 'First name is required.';
    if (!form.last_name.trim()) return 'Last name is required.';
    if (!form.username.trim()) return 'Username is required.';
    if (!form.password.trim()) return 'Temporary password is required.';
    if (!form.role_id) return 'Role is required.';
    if (!form.department_id) return 'Department is required.';
    if (!form.shift_id) return 'Shift is required.';
    return null;
  }

  async function handleSubmit() {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase.functions.invoke('create-user', {
        body: form,
      });

      if (error) throw error;

      navigate('/users');
    } catch (err: unknown) {
      console.error('CREATE USER ERROR:', err);
      const message = await getAppErrorMessage(err, 'Failed to create user.');
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer
      title="Create User"
      subtitle="Create a new user account with role, department, and shift."
      actions={
        <PrimaryButton onClick={handleSubmit} disabled={saving}>
          {saving ? 'Creating...' : 'Create User'}
        </PrimaryButton>
      }
    >
      <ContentCard title="User Details" subtitle="Basic profile and access settings.">
        <div style={gridStyle}>
          <Field label="First Name" required>
            <input
              style={inputStyle}
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </Field>

          <Field label="Last Name" required>
            <input
              style={inputStyle}
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </Field>

          <Field label="Username" required>
            <input
              style={inputStyle}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </Field>

          <Field label="Employee ID">
            <input
              style={inputStyle}
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
            />
          </Field>

          <Field label="Contact Email (optional)">
            <input
              style={inputStyle}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>

          <Field label="Temporary Password" required>
            <input
              type="password"
              style={inputStyle}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>

          <Field label="Role" required>
            <select
              style={inputStyle}
              value={form.role_id}
              onChange={(e) => setForm({ ...form, role_id: e.target.value })}
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Department" required>
            <select
              style={inputStyle}
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
            >
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Shift" required>
            <select
              style={inputStyle}
              value={form.shift_id}
              onChange={(e) => setForm({ ...form, shift_id: e.target.value })}
            >
              <option value="">Select shift</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name}
                </option>
              ))}
            </select>
          </Field>

          <div style={checkboxWrapStyle}>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={form.probationary}
                onChange={(e) => setForm({ ...form, probationary: e.target.checked })}
              />
              Probationary
            </label>

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={form.trainer_enabled}
                onChange={(e) => setForm({ ...form, trainer_enabled: e.target.checked })}
              />
              Trainer Enabled
            </label>
          </div>
        </div>

        {error ? <div style={errorStyle}>{error}</div> : null}
      </ContentCard>
    </PageContainer>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {required ? <span style={requiredStyle}> *</span> : null}
      </label>
      {children}
    </div>
  );
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '16px',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 700,
  marginBottom: '6px',
};

const requiredStyle: CSSProperties = {
  color: '#a12828',
};

const inputStyle: CSSProperties = {
  width: '100%',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '13px 14px',
  fontSize: '14px',
  background: '#ffffff',
};

const checkboxWrapStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
  alignContent: 'start',
};

const checkboxLabelStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontWeight: 600,
};

const errorStyle: CSSProperties = {
  marginTop: '16px',
  background: '#fdecec',
  color: '#a12828',
  padding: '12px 14px',
  borderRadius: '12px',
};

export default CreateUserPage;