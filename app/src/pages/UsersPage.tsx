import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import UserListCard from '../features/users/UserListCard';
import { getUsers } from '../features/users/usersApi';
import {
  mapProfileToUserCard,
  type UserCardModel,
} from '../features/users/userMappers';
import { theme } from '../styles/theme';

type SortOption = 'name-asc' | 'name-desc' | 'role-asc' | 'department-asc';

function UsersPage() {
  const [users, setUsers] = useState<UserCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
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

  const roleOptions = useMemo(
    () => ['All', ...Array.from(new Set(users.map((user) => user.role))).sort()],
    [users]
  );

  const departmentOptions = useMemo(
    () => [
      'All',
      ...Array.from(new Set(users.map((user) => user.homeDepartment))).sort(),
    ],
    [users]
  );

  const shiftOptions = useMemo(
    () => ['All', ...Array.from(new Set(users.map((user) => user.shift))).sort()],
    [users]
  );

  const filteredUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        term === '' ||
        user.fullName.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.employeeId.toLowerCase().includes(term);

      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      const matchesDepartment =
        departmentFilter === 'All' || user.homeDepartment === departmentFilter;
      const matchesShift = shiftFilter === 'All' || user.shift === shiftFilter;
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesDepartment &&
        matchesShift &&
        matchesStatus
      );
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-desc':
          return b.fullName.localeCompare(a.fullName);
        case 'role-asc':
          return a.role.localeCompare(b.role) || a.fullName.localeCompare(b.fullName);
        case 'department-asc':
          return (
            a.homeDepartment.localeCompare(b.homeDepartment) ||
            a.fullName.localeCompare(b.fullName)
          );
        case 'name-asc':
        default:
          return a.fullName.localeCompare(b.fullName);
      }
    });
  }, [
    users,
    search,
    roleFilter,
    departmentFilter,
    shiftFilter,
    statusFilter,
    sortBy,
  ]);

  function clearFilters() {
    setSearch('');
    setRoleFilter('All');
    setDepartmentFilter('All');
    setShiftFilter('All');
    setStatusFilter('All');
    setSortBy('name-asc');
  }

  const activeFilterCount = [
    search,
    roleFilter !== 'All' ? roleFilter : '',
    departmentFilter !== 'All' ? departmentFilter : '',
    shiftFilter !== 'All' ? shiftFilter : '',
    statusFilter !== 'All' ? statusFilter : '',
  ].filter(Boolean).length;

  return (
    <PageContainer
      title="Users"
      subtitle="Search, filter, and manage employee accounts."
      actions={
        <Link to="/users/new" style={{ textDecoration: 'none' }}>
          <PrimaryButton>Create User</PrimaryButton>
        </Link>
      }
    >
      <div style={shellStyle}>
        <div style={toolbarStyle}>
          <div style={searchWrapStyle}>
            <span style={searchIconStyle}>⌕</span>
            <input
              style={searchInputStyle}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username, or employee ID"
            />
          </div>

          <div style={toolbarMetaStyle}>
            <div style={countPillStyle}>
              {filteredUsers.length} result{filteredUsers.length === 1 ? '' : 's'}
            </div>
            {activeFilterCount > 0 ? (
              <button type="button" onClick={clearFilters} style={clearButtonStyle}>
                Clear Filters
              </button>
            ) : null}
          </div>
        </div>

        <div style={filtersRowStyle}>
          <FilterSelect
            value={roleFilter}
            onChange={setRoleFilter}
            options={roleOptions}
            label="Role"
          />
          <FilterSelect
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={departmentOptions}
            label="Department"
          />
          <FilterSelect
            value={shiftFilter}
            onChange={setShiftFilter}
            options={shiftOptions}
            label="Shift"
          />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={['All', 'Active', 'Inactive']}
            label="Status"
          />
          <FilterSelect
            value={sortBy}
            onChange={(value) => setSortBy(value as SortOption)}
            options={['name-asc', 'name-desc', 'role-asc', 'department-asc']}
            label="Sort"
            optionLabels={{
              'name-asc': 'Name A–Z',
              'name-desc': 'Name Z–A',
              'role-asc': 'Role',
              'department-asc': 'Department',
            }}
          />
        </div>

        <div style={listShellStyle}>
          <div style={listHeaderStyle}>
            <span>User</span>
            <span>Role</span>
            <span>Department</span>
            <span>Shift</span>
            <span>Status</span>
          </div>

          {loading ? (
            <div style={stateStyle}>Loading users...</div>
          ) : error ? (
            <div style={stateStyle}>{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
                No users found
              </div>
              <div style={{ color: theme.colors.mutedText, lineHeight: 1.6 }}>
                Try changing your filters or search term.
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '10px', padding: '12px' }}>
              {filteredUsers.map((user) => (
                <UserListCard key={user.id} user={user} compact />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  label,
  optionLabels,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
  optionLabels?: Record<string, string>;
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
            {optionLabels?.[option] ?? option}
          </option>
        ))}
      </select>
    </div>
  );
}

const shellStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
};

const toolbarStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap',
};

const searchWrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  minWidth: '420px',
  flex: 1,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  background: '#ffffff',
  overflow: 'hidden',
  boxShadow: '0 4px 16px rgba(8, 31, 45, 0.04)',
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

const toolbarMetaStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const countPillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '10px 14px',
  borderRadius: '999px',
  background: theme.colors.infoBg,
  color: theme.colors.infoText,
  fontSize: '13px',
  fontWeight: 800,
};

const clearButtonStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: '#ffffff',
  borderRadius: '14px',
  padding: '10px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const filtersRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
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

const listShellStyle: CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '22px',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(8, 31, 45, 0.05)',
};

const listHeaderStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.9fr 0.9fr 0.9fr 0.6fr',
  gap: '12px',
  padding: '16px 18px',
  background: '#f7f9fc',
  borderBottom: `1px solid ${theme.colors.border}`,
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: theme.colors.mutedText,
};

const stateStyle: CSSProperties = {
  padding: '24px',
};

const emptyStateStyle: CSSProperties = {
  padding: '28px',
  textAlign: 'center',
};

export default UsersPage;