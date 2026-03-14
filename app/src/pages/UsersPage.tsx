import { Link } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import UserListCard from '../features/users/UserListCard';
import { mockUsers } from '../features/users/mockUsers';

function UsersPage() {
  return (
    <PageContainer
      title="Users"
      subtitle="Manage employees, profile details, access, and department assignments."
      actions={
        <Link to="/users/new" style={{ textDecoration: 'none' }}>
          <PrimaryButton>Create User</PrimaryButton>
        </Link>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '16px',
        }}
      >
        <ContentCard title="User Directory" subtitle={`${mockUsers.length} users in system`}>
          <div style={{ display: 'grid', gap: '12px' }}>
            {mockUsers.map((user) => (
              <UserListCard key={user.id} user={user} />
            ))}
          </div>
        </ContentCard>
      </div>
    </PageContainer>
  );
}

export default UsersPage;