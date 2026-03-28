import { Link, useParams } from 'react-router-dom';
import { useEffect, useState, type CSSProperties } from 'react';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import { getUserById } from '../features/users/usersApi';
import type { UserRecord } from '../features/users/types';

function UserDetailPage() {
  const { userId } = useParams();
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

  if (loading) {
    return (
      <PageContainer title="Loading user..." subtitle="Please wait.">
        <ContentCard title="Loading">Fetching user record.</ContentCard>
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
      title={`${user.first_name} ${user.last_name}`.trim()}
      subtitle={`@${user.username}`}
      actions={
        <Link to={`/users/${user.id}/edit`} style={{ textDecoration: 'none' }}>
          <PrimaryButton>Edit User</PrimaryButton>
        </Link>
      }
    >
      <ContentCard title="User Profile" subtitle="Account and organizational details.">
        <div style={gridStyle}>
          <Detail label="Employee ID" value={user.employee_id ?? '—'} />
          <Detail label="Email" value={user.email ?? '—'} />
          <Detail label="Role" value={user.role?.name ?? '—'} />
          <Detail label="Department" value={user.department?.name ?? '—'} />
          <Detail label="Shift" value={user.shift?.name ?? '—'} />
          <Detail label="Probationary" value={user.probationary ? 'Yes' : 'No'} />
          <Detail label="Trainer Enabled" value={user.trainer_enabled ? 'Yes' : 'No'} />
          <Detail label="Active" value={user.is_active ? 'Yes' : 'No'} />
          <Detail
            label="Must Change Password"
            value={user.must_change_password ? 'Yes' : 'No'}
          />
          <Detail label="Must Create PIN" value={user.must_create_pin ? 'Yes' : 'No'} />
          <Detail
            label="PIN Reset Required"
            value={user.pin_reset_required ? 'Yes' : 'No'}
          />
        </div>
      </ContentCard>
    </PageContainer>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={detailCardStyle}>
      <div style={detailLabelStyle}>{label}</div>
      <div style={detailValueStyle}>{value}</div>
    </div>
  );
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '14px',
};

const detailCardStyle: CSSProperties = {
  padding: '14px',
  border: '1px solid #dbe4ee',
  borderRadius: '16px',
  background: '#ffffff',
};

const detailLabelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#5f6b76',
  marginBottom: '6px',
};

const detailValueStyle: CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#081f2d',
};

export default UserDetailPage;