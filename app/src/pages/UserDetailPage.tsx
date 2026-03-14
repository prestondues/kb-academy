import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import StatusBadge from '../components/StatusBadge';
import { mockUsers } from '../features/users/mockUsers';

function UserDetailPage() {
  const { userId } = useParams();

  const user = useMemo(
    () => mockUsers.find((item) => item.id === userId),
    [userId]
  );

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
          gridTemplateColumns: '1.2fr 1fr',
          gap: '16px',
        }}
      >
        <ContentCard title="Profile Overview" subtitle="Core employee and access information.">
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={rowStyle}>
              <span style={labelStyle}>Username</span>
              <span>{user.username}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Employee ID</span>
              <span>{user.employeeId}</span>
            </div>
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
              <span>{user.hireDate}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Birthday</span>
              <span>{user.birthday}</span>
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

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  paddingBottom: '10px',
  borderBottom: '1px solid #eef3f8',
};

const labelStyle: React.CSSProperties = {
  color: '#5f6b76',
  fontWeight: 600,
};

export default UserDetailPage;