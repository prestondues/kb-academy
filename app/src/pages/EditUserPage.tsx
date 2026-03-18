import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import {
  getRoleOptions,
  getUserById,
  updateUser,
} from '../features/users/usersApi';
import { theme } from '../styles/theme';

type SelectOption = {
  id: string;
  name: string;
};

function EditUserPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [roles, setRoles] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    employee_id: '',
    email: '',
    role_id: '',
    probationary: false,
    trainer_enabled: false,
    is_active: true,
  });

  useEffect(() => {
    async function loadData() {
      if (!userId) return;

      try {
        const [user, roleData] = await Promise.all([
          getUserById(userId),
          getRoleOptions(),
        ]);

        setRoles(roleData as SelectOption[]);

        if (user) {
          setForm({
            first_name: user.first_name ?? '',
            last_name: user.last_name ?? '',
            username: user.username ?? '',
            employee_id: user.employee_id ?? '',
            email: user.email ?? '',
            role_id: user.role_id ?? '',
            probationary: Boolean(user.probationary),
            trainer_enabled: Boolean(user.trainer_enabled),
            is_active: Boolean(user.is_active),
          });
        }
      } catch (error) {
        console.error('LOAD EDIT USER ERROR:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  async function handleSave() {
    if (!userId) return;

    try {
      setSaving(true);

      await updateUser(userId, {
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        employee_id: form.employee_id || null,
        email: form.email || null,
        role_id: form.role_id || null,
        department_id: null,
        shift_id: null,
        probationary: form.probationary,
        trainer_enabled: form.trainer_enabled,
        is_active: form.is_active,
      });

      navigate(`/users/${userId}`);
    } catch (error: unknown) {
      console.error('UPDATE USER ERROR:', error);
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      alert(`Failed to update user: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageContainer title="Loading user..." subtitle="Please wait.">
        <ContentCard title="Loading">Fetching user data.</ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Edit User"
      subtitle="Update profile details and account status."
      actions={
        <PrimaryButton onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </PrimaryButton>
      }
    >
      <div style={{ display: 'grid', gap: '16px' }}>
        <ContentCard title="Profile Details" subtitle="Basic employee information.">
          <div style={gridTwoStyle}>
            <Field label="First Name">
              <input
                style={inputStyle}
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </Field>

            <Field label="Last Name">
              <input
                style={inputStyle}
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </Field>

            <Field label="Username">
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

            <Field label="Email">
              <input
                style={inputStyle}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
          </div>
        </ContentCard>

        <ContentCard title="Role & Flags" subtitle="Account role and training settings.">
          <div style={gridTwoStyle}>
            <Field label="Role">
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

            <div />
          </div>

          <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
            <ToggleRow
              label="Active User"
              checked={form.is_active}
              onChange={(checked) => setForm({ ...form, is_active: checked })}
            />
            <ToggleRow
              label="Probationary"
              checked={form.probationary}
              onChange={(checked) => setForm({ ...form, probationary: checked })}
            />
            <ToggleRow
              label="Trainer Enabled"
              checked={form.trainer_enabled}
              onChange={(checked) => setForm({ ...form, trainer_enabled: checked })}
            />
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

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label style={toggleStyle}>
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
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

const toggleStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px',
  borderRadius: '16px',
  border: `1px solid ${theme.colors.border}`,
  background: '#f7f9fc',
  fontWeight: 700,
};

export default EditUserPage;