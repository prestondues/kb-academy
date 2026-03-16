import { useEffect, useState, type CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import StatusBadge from '../components/StatusBadge';
import { getUserById } from '../features/users/usersApi';
import {
  mapProfileToUserCard,
  type UserCardModel,
} from '../features/users/userMappers';

function UserDetailPage() {
  const { userId } = useParams();
  const [user, setUser] = useState<UserCardModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserById(userId);
        if (data) {
          setUser(mapProfileToUserCard(data));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(error);
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
        <ContentCard title="Loading">Fetching user profile.</ContentCard>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer title="User not found" subtitle="No user record matched this route.">
        <ContentCard title="Missing User">This user could not be found.</ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={user.fullName}
      subtitle={`${user.role} • ${user.homeDepartment}`}
      actions={<PrimaryButton>Edit User</PrimaryButton>}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '16px',
        }}
      >
        <ContentCard title="Profile Overview" subtitle="Core employee and access information.">
          <div style={heroWrapStyle}>
            <div style={avatarStyle}>
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>

            <div>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>{user.fullName}</div>
              <div style={{ marginTop: '6px', color: '#5f6b76' }}>
                @{user.username} • {user.employeeId}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
            <div style={rowStyle}>
              <span style={labelStyle}>Role</span>
              <span>{user.role}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Home Department</span>
              <span>{user.homeDepartment}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Shift</span>
              <span>{user.shift}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Hire Date</span>
              <span>{user.hireDate || '—'}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Birthday</span>
              <span>{user.birthday || '—'}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Email</span>
              <span>{user.email || '—'}</span>
            </div>
          </div>
        </ContentCard>

        <div style={{ display: 'grid', gap: '16px' }}>
          <ContentCard title="Account Status">
            <div style={{ display: 'grid', gap: '12px' }}>
              <StatusBadge
                label={user.status}
                variant={user.status === 'Active' ? 'success' : 'danger'}
              />
              <StatusBadge
                label={user.probationary ? 'Probationary' : 'Not Probationary'}
                variant={user.probationary ? 'warning' : 'success'}
              />
              <StatusBadge
                label={user.trainerEnabled ? 'Trainer Enabled' : 'Trainer Disabled'}
                variant={user.trainerEnabled ? 'info' : 'warning'}
              />
            </div>
          </ContentCard>

          <ContentCard title="Quick Actions">
            <div style={{ display: 'grid', gap: '10px' }}>
              <PrimaryButton>Reset Password</PrimaryButton>
              <PrimaryButton>Reset PIN</PrimaryButton>
              <PrimaryButton>Assign Training</PrimaryButton>
            </div>
          </ContentCard>
        </div>
      </div>
    </PageContainer>
  );
}

const heroWrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const avatarStyle: CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: '#a2c7e2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: '20px',
  color: '#081f2d',
};

const rowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  paddingBottom: '10px',
  borderBottom: '1px solid #eef3f8',
};

const labelStyle: CSSProperties = {
  color: '#5f6b76',
  fontWeight: 600,
};

export default UserDetailPage;