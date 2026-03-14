import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import UserListCard from '../features/users/UserListCard';
import { getUsers } from '../features/users/usersApi';
import {
  mapProfileToUserCard,
  type UserCardModel,
} from '../features/users/userMappers';

function UsersPage() {
  const [users, setUsers] = useState<UserCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        console.log('USERS RAW DATA', data);
        setUsers(data.map(mapProfileToUserCard));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load users.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

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
      <ContentCard title="User Directory" subtitle={`${users.length} users in system`}>
        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {users.map((user) => (
              <UserListCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </ContentCard>
    </PageContainer>
  );
}

export default UsersPage;