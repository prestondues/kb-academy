import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import UserListCard from '../features/users/UserListCard';
import { mapUserToCard } from '../features/users/userMappers';
import { getUsers } from '../features/users/usersApi';
import type { UserCardModel } from '../features/users/types';
import { theme } from '../styles/theme';

function UsersPage() {
  const [users, setUsers] = useState<UserCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState('All');

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        setUsers(data.map(mapUserToCard));
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

  const departmentOptions = useMemo(
    () => ['All', ...Array.from(new Set(users.map((u) => u.departmentName))).sort()],
    [users]
  );

  const shiftOptions = useMemo(
    () => ['All', ...Array.from(new Set(users.map((u) => u.shiftName))).sort()],
    [users]
  );

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        term === '' ||
        user.fullName.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.roleName.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === 'All' || user.status === statusFilter;

      const matchesDepartment =
        departmentFilter === 'All' || user.departmentName === departmentFilter;

      const matchesShift =
        shiftFilter === 'All' || user.shiftName === shiftFilter;

      return matchesSearch && matchesStatus && matchesDepartment && matchesShift;
    });
  }, [users, search, statusFilter, departmentFilter, shiftFilter]);

  return (
    <PageContainer
      title="Users"
      subtitle="Manage employee accounts, roles, departments, and shifts."
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
            placeholder="Search by name, username, email, or role"
          />
        </div>

        <div style={filtersGridStyle}>
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={['All', 'Active', 'Inactive']}
          />
          <FilterSelect
            label="Department"
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={departmentOptions}
          />
          <FilterSelect
            label="Shift"
            value={shiftFilter}
            onChange={setShiftFilter}
            options={shiftOptions}
          />
        </div>
      </div>

      <div style={countStyle}>
        {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'}
      </div>

      <div style={gridStyle}>
        {loading ? (
          <div style={stateStyle}>Loading users...</div>
        ) : error ? (
          <div style={stateStyle}>{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div style={stateStyle}>No users found.</div>
        ) : (
          filteredUsers.map((user) => <UserListCard key={user.id} user={user} />)
        )}
      </div>
    </PageContainer>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label style={filterLabelStyle}>{label}</label>
      <select
        style={filterInputStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

const toolbarStyle: CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '22px',
  padding: '18px',
  boxShadow: '0 10px 30px rgba(8, 31, 45, 0.04)',
  marginBottom: '16px',
};

const searchWrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  background: '#ffffff',
  overflow: 'hidden',
  marginBottom: '14px',
};

const searchIconStyle: CSSProperties = {
  paddingLeft: '16px',
  paddingRight: '10px',
  color: theme.colors.mutedText,
  fontSize: '16px',
};

const searchInputStyle: CSSProperties = {
  width: '100%',
  border: 'none',
  outline: 'none',
  padding: '14px 16px 14px 0',
  fontSize: '14px',
  background: 'transparent',
};

const filtersGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '12px',
};

const filterLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  marginBottom: '6px',
  color: theme.colors.mutedText,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const filterInputStyle: CSSProperties = {
  width: '100%',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '12px 14px',
  fontSize: '14px',
  background: '#ffffff',
};

const countStyle: CSSProperties = {
  marginBottom: '12px',
  color: theme.colors.mutedText,
  fontSize: '14px',
  fontWeight: 700,
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
};

const stateStyle: CSSProperties = {
  padding: '24px',
  background: '#ffffff',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '18px',
};

export default UsersPage;