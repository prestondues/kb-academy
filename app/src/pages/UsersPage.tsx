import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import { getUsers, type UserRecord } from '../features/users/usersApi';
import { theme } from '../styles/theme';

function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err: unknown) {
        console.error('LOAD USERS ERROR:', err);
        const message =
          err instanceof Error ? err.message : JSON.stringify(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        term === '' ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        (user.email ?? '').toLowerCase().includes(term) ||
        (user.role?.name ?? '').toLowerCase().includes(term) ||
        (user.department?.name ?? '').toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && user.is_active) ||
        (statusFilter === 'Inactive' && !user.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  return (
    <PageContainer
      title="Users"
      subtitle="Manage employee profiles, access, and training participation."
      actions={
        <Link to="/users/new" style={{ textDecoration: 'none' }}>
          <PrimaryButton>Create User</PrimaryButton>
        </Link>
      }
    >
      <div style={toolbarStyle}>
        <div style={searchWrapStyle}>
          <span style={searchIconStyle}>⌕</span>
          <input
            style={searchInputStyle}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, username, email, role, or department"
          />
        </div>

        <select
          style={filterInputStyle}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Users</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div style={listStyle}>
        {loading ? (
          <div style={stateStyle}>Loading users...</div>
        ) : error ? (
          <div style={stateStyle}>Failed to load users: {error}</div>
        ) : filteredUsers.length === 0 ? (
          <div style={stateStyle}>No users found.</div>
        ) : (
          filteredUsers.map((user) => (
            <Link
              key={user.id}
              to={`/users/${user.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={cardStyle}>
                <div>
                  <div style={nameStyle}>
                    {user.first_name} {user.last_name}
                  </div>
                  <div style={metaStyle}>@{user.username}</div>
                  <div style={metaStyle}>
                    {user.role?.name ?? 'No role'} • {user.department?.name ?? 'No department'} •{' '}
                    {user.shift?.name ?? 'No shift'}
                  </div>
                  {user.email ? <div style={metaStyle}>{user.email}</div> : null}
                </div>

                <div style={{ display: 'grid', gap: '8px', justifyItems: 'end' }}>
                  <span
                    style={{
                      ...badgeStyle,
                      background: user.is_active ? '#e8f7ee' : '#fff7f7',
                      color: user.is_active ? '#18794e' : '#a12828',
                    }}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>

                  <span
                    style={{
                      ...badgeStyle,
                      background: user.trainer_enabled ? '#eef6ff' : '#f7f9fc',
                      color: user.trainer_enabled ? '#194f91' : '#5f6b76',
                    }}
                  >
                    {user.trainer_enabled ? 'Trainer Enabled' : 'Trainer Disabled'}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </PageContainer>
  );
}

const toolbarStyle: CSSProperties = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  marginBottom: '18px',
  flexWrap: 'wrap',
};

const searchWrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  minWidth: '360px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  background: '#ffffff',
  overflow: 'hidden',
};

const searchIconStyle: CSSProperties = {
  paddingLeft: '16px',
  paddingRight: '10px',
  color: theme.colors.mutedText,
};

const searchInputStyle: CSSProperties = {
  width: '100%',
  border: 'none',
  outline: 'none',
  padding: '14px 16px 14px 0',
  fontSize: '14px',
};

const filterInputStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '12px 14px',
  fontSize: '14px',
  background: '#ffffff',
};

const listStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
};

const cardStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  padding: '18px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '18px',
  background: '#ffffff',
};

const nameStyle: CSSProperties = {
  fontSize: '17px',
  fontWeight: 800,
  marginBottom: '4px',
};

const metaStyle: CSSProperties = {
  fontSize: '14px',
  color: theme.colors.mutedText,
  lineHeight: 1.55,
};

const badgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 800,
};

const stateStyle: CSSProperties = {
  padding: '24px',
  background: '#ffffff',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '18px',
};

export default UsersPage;