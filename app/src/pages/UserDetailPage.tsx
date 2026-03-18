import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import StatusBadge from '../components/StatusBadge';
import { deactivateUser, getUserById, type UserRecord } from '../features/users/usersApi';

function UserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!userId) return;

      try {
        const data = await getUserById(userId);
        setUser(data);
      } catch (error) {
        console.error('LOAD USER DETAIL ERROR:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [userId]);

  async function handleDeactivate() {
    if (!userId) return;

    const confirmed = window.confirm(
      'Deactivate this user? They will stop appearing in active user pickers.'
    );
    if (!confirmed) return;

    try {
      await deactivateUser(userId);
      navigate('/users');
    } catch (error) {
      console.error('DEACTIVATE USER ERROR:', error);
      alert('Failed to deactivate user.');
    }
  }

  if (loading) {
    return (
      <PageContainer title="Loading user..." subtitle="Please wait.">
        <ContentCard title="Loading">Fetching user details.</ContentCard>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer title="User not found" subtitle="No user matched this route.">
        <ContentCard title="Missing User">This user could not be found.</ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`${user.first_name} ${user.last_name}`}
      subtitle={`@${user.username}`}
      actions={
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to={`/users/${user.id}/edit`} style={{ textDecoration: 'none' }}>
            <PrimaryButton>Edit User</PrimaryButton>
          </Link>
          <button type="button" onClick={handleDeactivate} style={dangerButtonStyle}>
            Deactivate
          </button>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.8fr', gap: '16px' }}>
        <ContentCard title="User Overview" subtitle="Employee and account information.">
          <div style={{ display: 'grid', gap: '12px' }}>
            <Row label="Full Name" value={`${user.first_name} ${user.last_name}`} />
            <Row label="Username" value={user.username || '—'} />
            <Row label="Employee ID" value={user.employee_id || '—'} />
            <Row label="Email" value={user.email || '—'} />
            <Row label="Role" value={user.role?.name || '—'} />
            <Row label="Department" value={user.department?.name || '—'} />
            <Row label="Shift" value={user.shift?.name || '—'} />
          </div>
        </ContentCard>

        <ContentCard title="User Status">
          <div style={{ display: 'grid', gap: '12px' }}>
            <StatusBadge
              label={user.is_active ? 'Active' : 'Inactive'}
              variant={user.is_active ? 'success' : 'danger'}
            />
            <StatusBadge
              label={user.probationary ? 'Probationary' : 'Standard'}
              variant={user.probationary ? 'warning' : 'info'}
            />
            <StatusBadge
              label={user.trainer_enabled ? 'Trainer Enabled' : 'Trainer Disabled'}
              variant={user.trainer_enabled ? 'success' : 'warning'}
            />
          </div>
        </ContentCard>
      </div>
    </PageContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '16px',
        paddingBottom: '10px',
        borderBottom: '1px solid #eef3f8',
      }}
    >
      <span style={{ color: '#5f6b76', fontWeight: 700 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const dangerButtonStyle: React.CSSProperties = {
  border: '1px solid #f3cccc',
  background: '#fff7f7',
  color: '#a12828',
  borderRadius: '14px',
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

export default UserDetailPage;