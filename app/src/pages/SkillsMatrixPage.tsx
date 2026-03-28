import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import TrainingSubnav from '../features/training/TrainingSubnav';
import {
  getMatrixUsers,
  getTrainingCertifications,
  getTrainingModules,
} from '../features/training/trainingApi';
import { mapTrainingModuleToCard } from '../features/training/trainingMappers';
import { useAuth } from '../features/auth/useAuth';
import { canViewAllDepartments, getVisibleDepartmentName } from '../features/auth/visibility';
import { theme } from '../styles/theme';

type MatrixUser = {
  id: string;
  name: string;
  username: string;
  departmentName: string;
  shiftName: string;
};

type MatrixModule = {
  id: string;
  title: string;
  departmentName: string;
};

type MatrixCertification = {
  trainee_id: string;
  module_id: string;
  expires_at?: string | null;
};

function SkillsMatrixPage() {
  const { profile } = useAuth();

  const [users, setUsers] = useState<MatrixUser[]>([]);
  const [modules, setModules] = useState<MatrixModule[]>([]);
  const [certifications, setCertifications] = useState<MatrixCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userSearch, setUserSearch] = useState('');
  const [moduleSearch, setModuleSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, moduleData, certificationData] = await Promise.all([
          getMatrixUsers(),
          getTrainingModules(),
          getTrainingCertifications(),
        ]);

        const allowAll = canViewAllDepartments(profile);
        const visibleDepartmentName = getVisibleDepartmentName(profile);

        let mappedUsers = userData.map((user) => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`.trim(),
          username: user.username,
          departmentName: user.department?.name ?? '—',
          shiftName: user.shift?.name ?? '—',
        }));

        let mappedModules = moduleData.map((module) => {
          const mapped = mapTrainingModuleToCard(module);
          return {
            id: mapped.id,
            title: mapped.title,
            departmentName: mapped.department,
          };
        });

        if (!allowAll && visibleDepartmentName) {
          mappedUsers = mappedUsers.filter((user) => user.departmentName === visibleDepartmentName);
          mappedModules = mappedModules.filter(
            (module) => module.departmentName === visibleDepartmentName
          );
          setDepartmentFilter(visibleDepartmentName);
        }

        setUsers(mappedUsers);
        setModules(mappedModules);

        setCertifications(
          certificationData.map((cert) => ({
            trainee_id: cert.trainee_id,
            module_id: cert.module_id,
            expires_at: cert.expires_at ?? null,
          }))
        );
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load skills matrix.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [profile]);

  const allowAllDepartments = canViewAllDepartments(profile);

  const departmentOptions = useMemo(() => {
    const names = Array.from(new Set(modules.map((module) => module.departmentName))).sort();
    return ['All', ...names];
  }, [modules]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        term === '' ||
        user.name.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.departmentName.toLowerCase().includes(term) ||
        user.shiftName.toLowerCase().includes(term);

      const matchesDepartment =
        departmentFilter === 'All' || user.departmentName === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [users, userSearch, departmentFilter]);

  const filteredModules = useMemo(() => {
    const term = moduleSearch.trim().toLowerCase();

    return modules.filter((module) => {
      const matchesSearch =
        term === '' ||
        module.title.toLowerCase().includes(term) ||
        module.departmentName.toLowerCase().includes(term);

      const matchesDepartment =
        departmentFilter === 'All' || module.departmentName === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [modules, moduleSearch, departmentFilter]);

  function getCellStatus(userId: string, moduleId: string) {
    const cert = certifications.find(
      (item) => item.trainee_id === userId && item.module_id === moduleId
    );

    if (!cert) {
      return {
        label: 'Missing',
        style: missingCellStyle,
      };
    }

    if (cert.expires_at) {
      const expires = new Date(cert.expires_at);
      const now = new Date();

      if (!Number.isNaN(expires.getTime()) && expires < now) {
        return {
          label: 'Expired',
          style: expiredCellStyle,
        };
      }
    }

    return {
      label: 'Current',
      style: currentCellStyle,
    };
  }

  return (
    <PageContainer
      title="Training"
      subtitle="Visual skills matrix for current training and certification status."
    >
      <TrainingSubnav />

      <div style={shellStyle}>
        <div style={toolbarStyle}>
          <div
            style={{
              ...searchGridStyle,
              gridTemplateColumns: allowAllDepartments
                ? 'repeat(3, minmax(0, 1fr))'
                : 'repeat(2, minmax(0, 1fr))',
            }}
          >
            <div style={searchWrapStyle}>
              <span style={searchIconStyle}>⌕</span>
              <input
                style={searchInputStyle}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search team members"
              />
            </div>

            <div style={searchWrapStyle}>
              <span style={searchIconStyle}>⌕</span>
              <input
                style={searchInputStyle}
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
                placeholder="Search modules"
              />
            </div>

            {allowAllDepartments ? (
              <div>
                <label style={filterLabelStyle}>Department</label>
                <select
                  style={filterInputStyle}
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  {departmentOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        </div>

        <ContentCard
          title="Skills Matrix"
          subtitle={`${filteredUsers.length} user${filteredUsers.length === 1 ? '' : 's'} × ${filteredModules.length} module${filteredModules.length === 1 ? '' : 's'}`}
        >
          {loading ? (
            <div style={stateStyle}>Loading skills matrix...</div>
          ) : error ? (
            <div style={stateStyle}>{error}</div>
          ) : filteredUsers.length === 0 || filteredModules.length === 0 ? (
            <div style={stateStyle}>No matrix results found.</div>
          ) : (
            <div style={matrixWrapStyle}>
              <table style={matrixTableStyle}>
                <thead>
                  <tr>
                    <th style={stickyHeaderStyle}>Team Member</th>
                    {filteredModules.map((module) => (
                      <th key={module.id} style={headerCellStyle}>
                        <div>{module.title}</div>
                        <div style={headerSubStyle}>{module.departmentName}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td style={stickyUserCellStyle}>
                        <div style={{ fontWeight: 800 }}>{user.name}</div>
                        <div style={usernameStyle}>@{user.username}</div>
                        <div style={metaRowStyle}>
                          {user.departmentName} • {user.shiftName}
                        </div>
                      </td>

                      {filteredModules.map((module) => {
                        const cell = getCellStatus(user.id, module.id);

                        return (
                          <td key={`${user.id}-${module.id}`} style={matrixCellStyle}>
                            <div style={cell.style}>{cell.label}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ContentCard>
      </div>
    </PageContainer>
  );
}

const shellStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
};

const toolbarStyle: CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '22px',
  padding: '18px',
  boxShadow: '0 10px 30px rgba(8, 31, 45, 0.04)',
};

const searchGridStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
};

const searchWrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  background: '#ffffff',
  overflow: 'hidden',
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

const matrixWrapStyle: CSSProperties = {
  overflowX: 'auto',
};

const matrixTableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: '900px',
};

const stickyHeaderStyle: CSSProperties = {
  position: 'sticky',
  left: 0,
  zIndex: 2,
  background: '#ffffff',
  textAlign: 'left',
  padding: '12px 10px',
  borderBottom: `1px solid ${theme.colors.border}`,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.colors.mutedText,
  minWidth: '220px',
};

const headerCellStyle: CSSProperties = {
  textAlign: 'left',
  padding: '12px 10px',
  borderBottom: `1px solid ${theme.colors.border}`,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.colors.mutedText,
  minWidth: '140px',
};

const headerSubStyle: CSSProperties = {
  marginTop: '4px',
  fontSize: '11px',
  color: theme.colors.mutedText,
  textTransform: 'none',
  letterSpacing: 'normal',
};

const stickyUserCellStyle: CSSProperties = {
  position: 'sticky',
  left: 0,
  zIndex: 1,
  background: '#ffffff',
  padding: '12px 10px',
  borderBottom: `1px solid ${theme.colors.border}`,
  verticalAlign: 'top',
};

const usernameStyle: CSSProperties = {
  fontSize: '12px',
  color: theme.colors.mutedText,
  marginTop: '2px',
};

const metaRowStyle: CSSProperties = {
  fontSize: '12px',
  color: theme.colors.mutedText,
  marginTop: '4px',
};

const matrixCellStyle: CSSProperties = {
  padding: '12px 10px',
  borderBottom: `1px solid ${theme.colors.border}`,
  verticalAlign: 'top',
};

const currentCellStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 12px',
  borderRadius: '999px',
  background: '#e8f7ee',
  color: '#18794e',
  fontWeight: 800,
  fontSize: '12px',
  minWidth: '84px',
};

const expiredCellStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 12px',
  borderRadius: '999px',
  background: '#fff4e8',
  color: '#9a5b13',
  fontWeight: 800,
  fontSize: '12px',
  minWidth: '84px',
};

const missingCellStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 12px',
  borderRadius: '999px',
  background: '#f3f5f7',
  color: '#5f6b76',
  fontWeight: 800,
  fontSize: '12px',
  minWidth: '84px',
};

const stateStyle: CSSProperties = {
  padding: '24px 0',
  color: theme.colors.mutedText,
};

export default SkillsMatrixPage;