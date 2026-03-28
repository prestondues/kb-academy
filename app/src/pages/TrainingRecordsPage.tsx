import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import {
  getAllTrainingSessions,
  getTrainingModules,
} from '../features/training/trainingApi';
import { mapTrainingModuleToCard } from '../features/training/trainingMappers';
import { mapTrainingSessionToCard } from '../features/training/sessionMappers';
import type { TrainingSessionCardModel } from '../features/training/sessionTypes';
import TrainingSubnav from '../features/training/TrainingSubnav';
import { useAuth } from '../features/auth/useAuth';
import { canViewAllDepartments, getVisibleDepartmentName } from '../features/auth/visibility';
import { theme } from '../styles/theme';

type SelectOption = {
  id: string;
  name: string;
};

function TrainingRecordsPage() {
  const { profile } = useAuth();

  const [sessions, setSessions] = useState<TrainingSessionCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [traineeOptions, setTraineeOptions] = useState<SelectOption[]>([]);
  const [trainerOptions, setTrainerOptions] = useState<SelectOption[]>([]);
  const [moduleOptions, setModuleOptions] = useState<SelectOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<SelectOption[]>([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [traineeFilter, setTraineeFilter] = useState('All');
  const [trainerFilter, setTrainerFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  useEffect(() => {
    async function loadData() {
      try {
        const [sessionData, moduleData] = await Promise.all([
          getAllTrainingSessions(),
          getTrainingModules(),
        ]);

        let mappedSessions = sessionData.map(mapTrainingSessionToCard);

        const visibleDepartmentName = getVisibleDepartmentName(profile);
        const allowAll = canViewAllDepartments(profile);

        if (!allowAll && visibleDepartmentName) {
          mappedSessions = mappedSessions.filter(
            (session) => session.departmentName === visibleDepartmentName
          );
        }

        setSessions(mappedSessions);

        const uniqueTrainees = Array.from(
          new Set(mappedSessions.map((s) => s.traineeName))
        ).sort();

        const uniqueTrainers = Array.from(
          new Set(mappedSessions.map((s) => s.trainerName))
        ).sort();

        const uniqueModules = Array.from(
          new Set(
            moduleData
              .map((module) => mapTrainingModuleToCard(module))
              .filter((module) => allowAll || module.department === visibleDepartmentName)
              .map((module) => module.title)
          )
        ).sort();

        const uniqueDepartments = Array.from(
          new Set(mappedSessions.map((s) => s.departmentName))
        ).sort();

        setTraineeOptions(['All', ...uniqueTrainees].map((name) => ({ id: name, name })));
        setTrainerOptions(['All', ...uniqueTrainers].map((name) => ({ id: name, name })));
        setModuleOptions(['All', ...uniqueModules].map((name) => ({ id: name, name })));
        setDepartmentOptions(['All', ...uniqueDepartments].map((name) => ({ id: name, name })));

        if (!allowAll && visibleDepartmentName) {
          setDepartmentFilter(visibleDepartmentName);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load training records.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [profile]);

  const filteredSessions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return sessions.filter((session) => {
      const matchesSearch =
        term === '' ||
        session.moduleTitle.toLowerCase().includes(term) ||
        session.traineeName.toLowerCase().includes(term) ||
        session.trainerName.toLowerCase().includes(term) ||
        session.departmentName.toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'All' || session.status === statusFilter;
      const matchesTrainee = traineeFilter === 'All' || session.traineeName === traineeFilter;
      const matchesTrainer = trainerFilter === 'All' || session.trainerName === trainerFilter;
      const matchesModule = moduleFilter === 'All' || session.moduleTitle === moduleFilter;
      const matchesDepartment =
        departmentFilter === 'All' || session.departmentName === departmentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTrainee &&
        matchesTrainer &&
        matchesModule &&
        matchesDepartment
      );
    });
  }, [sessions, search, statusFilter, traineeFilter, trainerFilter, moduleFilter, departmentFilter]);

  const allowAllDepartments = canViewAllDepartments(profile);

  return (
    <PageContainer
      title="Training"
      subtitle="Review completed and in-progress training activity with filters."
    >
      <TrainingSubnav />

      <div style={shellStyle}>
        <div style={toolbarStyle}>
          <div style={searchWrapStyle}>
            <span style={searchIconStyle}>⌕</span>
            <input
              style={searchInputStyle}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by trainee, trainer, module, or department"
            />
          </div>

          <div
            style={{
              ...filtersGridStyle,
              gridTemplateColumns: allowAllDepartments
                ? 'repeat(5, minmax(0, 1fr))'
                : 'repeat(4, minmax(0, 1fr))',
            }}
          >
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={['All', 'In Progress', 'Completed']}
            />
            <FilterSelect
              label="Trainee"
              value={traineeFilter}
              onChange={setTraineeFilter}
              options={traineeOptions.map((o) => o.name)}
            />
            <FilterSelect
              label="Trainer"
              value={trainerFilter}
              onChange={setTrainerFilter}
              options={trainerOptions.map((o) => o.name)}
            />
            <FilterSelect
              label="Module"
              value={moduleFilter}
              onChange={setModuleFilter}
              options={moduleOptions.map((o) => o.name)}
            />
            {allowAllDepartments ? (
              <FilterSelect
                label="Department"
                value={departmentFilter}
                onChange={setDepartmentFilter}
                options={departmentOptions.map((o) => o.name)}
              />
            ) : null}
          </div>
        </div>

        <ContentCard
          title="Session Records"
          subtitle={`${filteredSessions.length} session${filteredSessions.length === 1 ? '' : 's'} shown`}
        >
          {loading ? (
            <div style={stateStyle}>Loading training records...</div>
          ) : error ? (
            <div style={stateStyle}>{error}</div>
          ) : filteredSessions.length === 0 ? (
            <div style={stateStyle}>No training records found.</div>
          ) : (
            <div style={tableWrapStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Module</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Trainee</th>
                    <th style={thStyle}>Trainer</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Started</th>
                    <th style={thStyle}>Completed</th>
                    <th style={thStyle}>Duration</th>
                    <th style={thStyle}>Open</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => (
                    <tr key={session.id}>
                      <td style={tdStyle}>{session.moduleTitle}</td>
                      <td style={tdStyle}>{session.departmentName}</td>
                      <td style={tdStyle}>{session.traineeName}</td>
                      <td style={tdStyle}>{session.trainerName}</td>
                      <td style={tdStyle}>{session.status}</td>
                      <td style={tdStyle}>{session.startedAt}</td>
                      <td style={tdStyle}>{session.completedAt || '—'}</td>
                      <td style={tdStyle}>{session.durationMinutes || '—'}</td>
                      <td style={tdStyle}>
                        <Link to={`/training/sessions/${session.id}/view`} style={linkStyle}>
                          View
                        </Link>
                      </td>
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

const tableWrapStyle: CSSProperties = {
  overflowX: 'auto',
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '12px 10px',
  borderBottom: `1px solid ${theme.colors.border}`,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.colors.mutedText,
};

const tdStyle: CSSProperties = {
  padding: '12px 10px',
  borderBottom: `1px solid ${theme.colors.border}`,
  fontSize: '14px',
  color: theme.colors.text,
  verticalAlign: 'top',
};

const linkStyle: CSSProperties = {
  color: '#194f91',
  fontWeight: 700,
  textDecoration: 'none',
};

const stateStyle: CSSProperties = {
  padding: '24px 0',
  color: theme.colors.mutedText,
};

export default TrainingRecordsPage;