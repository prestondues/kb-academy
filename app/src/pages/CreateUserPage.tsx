import { useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import {
  createUser,
  getDepartments,
  getRoles,
  getShifts,
} from '../features/users/usersApi';

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

      const created = await createUser(form);
      navigate(`/users/${created.id}`);
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
      subtitle="Add a new employee profile, assign access, and configure account details."
      actions={
        <PrimaryButton onClick={handleSubmit} disabled={saving}>
          {saving ? 'Creating...' : 'Create User'}
        </PrimaryButton>
      }
    >
      <ContentCard title="Basic Information" subtitle="Initial account setup fields.">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '16px',
          }}
        >
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

          <Field label="Email">
            <input
              style={inputStyle}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Optional email"
            />
          </Field>

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
              onChange={(e) => setForm({ ...form, home_department_id: e.target.value })}
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
              onChange={(e) => setForm({ ...form, home_shift_id: e.target.value })}
            >
              <option value="">Select a shift</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name}
                </option>
              ))}
            </select>
          </Field>

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

        <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
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
      </ContentCard>
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
      <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #dbe4ee',
  borderRadius: '12px',
  padding: '12px 14px',
  fontSize: '14px',
  background: '#ffffff',
};

const checkboxLabelStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
};

export default CreateUserPage;