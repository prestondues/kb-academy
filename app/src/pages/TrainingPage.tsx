import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import StatusBadge from '../components/StatusBadge';
import {
  getCompletedTrainingSessions,
  getInProgressTrainingSessions,
  getTrainingModules,
} from '../features/training/trainingApi';
import { mapTrainingModuleToCard } from '../features/training/trainingMappers';
import { mapTrainingSessionToCard } from '../features/training/sessionMappers';
import type { TrainingModuleCardModel } from '../features/training/types';
import type { TrainingSessionCardModel } from '../features/training/sessionTypes';
import TrainingModuleCard from '../features/training/TrainingModuleCard';
import TrainingSubnav from '../features/training/TrainingSubnav';
import { theme } from '../styles/theme';

function TrainingPage() {
  const [modules, setModules] = useState<TrainingModuleCardModel[]>([]);
  const [inProgressSessions, setInProgressSessions] = useState<TrainingSessionCardModel[]>([]);
  const [completedSessions, setCompletedSessions] = useState<TrainingSessionCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    async function loadTrainingData() {
      try {
        const [moduleData, inProgressData, completedData] = await Promise.all([
          getTrainingModules(),
          getInProgressTrainingSessions(),
          getCompletedTrainingSessions(),
        ]);

        setModules(moduleData.map(mapTrainingModuleToCard));
        setInProgressSessions(inProgressData.map(mapTrainingSessionToCard));
        setCompletedSessions(completedData.map(mapTrainingSessionToCard));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load training data.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadTrainingData();
  }, []);

  const typeOptions = useMemo(
    () => ['All', ...Array.from(new Set(modules.map((m) => m.moduleType))).sort()],
    [modules]
  );

  const departmentOptions = useMemo(
    () => ['All', ...Array.from(new Set(modules.map((m) => m.department))).sort()],
    [modules]
  );

  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        term === '' ||
        module.title.toLowerCase().includes(term) ||
        module.description.toLowerCase().includes(term) ||
        module.department.toLowerCase().includes(term) ||
        module.sqfElement.toLowerCase().includes(term);

      const matchesType = typeFilter === 'All' || module.moduleType === typeFilter;
      const matchesDepartment =
        departmentFilter === 'All' || module.department === departmentFilter;
      const matchesStatus =
        statusFilter === 'All' || module.status === statusFilter;

      return matchesSearch && matchesType && matchesDepartment && matchesStatus;
    });
  }, [modules, search, typeFilter, departmentFilter, statusFilter]);

  return (
    <PageContainer
      title="Training"
      subtitle="Manage modules and conduct live training sessions."
      actions={
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/training/conduct" style={{ textDecoration: 'none' }}>
            <PrimaryButton>Conduct Training</PrimaryButton>
          </Link>
          <Link to="/training/new" style={{ textDecoration: 'none' }}>
            <PrimaryButton>Create Module</PrimaryButton>
          </Link>
        </div>
      }
    >
      <TrainingSubnav />

      <div style={pageGridStyle}>
        <div style={leftColumnStyle}>
          <div style={toolbarShellStyle}>
            <div style={searchWrapStyle}>
              <span style={searchIconStyle}>⌕</span>
              <input
                style={searchInputStyle}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search modules by title, department, or SQF"
              />
            </div>

            <div style={filterRowStyle}>
              <FilterSelect
                value={typeFilter}
                onChange={setTypeFilter}
                options={typeOptions}
                label="Type"
              />
              <FilterSelect
                value={departmentFilter}
                onChange={setDepartmentFilter}
                options={departmentOptions}
                label="Department"
              />
              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={['All', 'Active', 'Inactive']}
                label="Status"
              />
              <div style={moduleCountWrapStyle}>
                <span style={moduleCountLabelStyle}>Showing</span>
                <div style={moduleCountValueStyle}>
                  {filteredModules.length} module{filteredModules.length === 1 ? '' : 's'}
                </div>
              </div>
            </div>
          </div>

          <div style={libraryHeaderStyle}>
            <div>
              <div style={libraryEyebrowStyle}>Module Library</div>
              <h2 style={libraryHeadingStyle}>Training Modules</h2>
            </div>
          </div>

          <div style={moduleGridStyle}>
            {loading ? (
              <div style={stateStyle}>Loading training data...</div>
            ) : error ? (
              <div style={stateStyle}>{error}</div>
            ) : filteredModules.length === 0 ? (
              <div style={emptyStateStyle}>
                <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
                  No training modules found
                </div>
                <div style={{ color: theme.colors.mutedText, lineHeight: 1.6 }}>
                  Try adjusting your search or filters.
                </div>
              </div>
            ) : (
              filteredModules.map((module) => (
                <TrainingModuleCard key={module.id} module={module} />
              ))
            )}
          </div>
        </div>

        <div style={rightColumnStyle}>
          <div style={sidebarCardStyle}>
            <div style={sidebarEyebrowStyle}>Session Activity</div>
            <h2 style={sidebarHeadingStyle}>Training Status</h2>

            <div style={badgeRowStyle}>
              <StatPill label="In Progress" value={String(inProgressSessions.length)} />
              <StatPill label="Completed" value={String(completedSessions.length)} />
            </div>
          </div>

          <div style={sidebarCardStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <div style={panelEyebrowStyle}>Resume</div>
                <div style={panelTitleStyle}>In Progress Sessions</div>
              </div>
            </div>

            {inProgressSessions.length === 0 ? (
              <div style={activityEmptyStyle}>No sessions waiting to be resumed.</div>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {inProgressSessions.slice(0, 5).map((session) => (
                  <SlimSessionRow
                    key={session.id}
                    session={session}
                    actionLabel="Resume"
                    actionTo={`/training/sessions/${session.id}`}
                    showCompletedDate={false}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={sidebarCardStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <div style={panelEyebrowStyle}>Recent</div>
                <div style={panelTitleStyle}>Completed Sessions</div>
              </div>
            </div>

            {completedSessions.length === 0 ? (
              <div style={activityEmptyStyle}>No recent completed sessions.</div>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {completedSessions.slice(0, 5).map((session) => (
                  <SlimSessionRow
                    key={session.id}
                    session={session}
                    actionLabel="View"
                    actionTo={`/training/sessions/${session.id}/view`}
                    showCompletedDate
                  />
                ))}
              </div>
            )}
          </div>
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
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
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

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={statPillStyle}>
      <span style={statPillLabelStyle}>{label}</span>
      <span style={statPillValueStyle}>{value}</span>
    </div>
  );
}

function SlimSessionRow({
  session,
  actionLabel,
  actionTo,
  showCompletedDate,
}: {
  session: TrainingSessionCardModel;
  actionLabel: string;
  actionTo: string;
  showCompletedDate?: boolean;
}) {
  return (
    <div style={sessionRowStyle}>
      <div style={{ minWidth: 0 }}>
        <div style={sessionTitleStyle}>{session.moduleTitle}</div>
        <div style={sessionMetaStyle}>{session.traineeName}</div>
        <div style={sessionSubMetaStyle}>
          {showCompletedDate ? `Completed ${session.completedAt}` : `Started ${session.startedAt}`}
        </div>
      </div>

      <div style={sessionRightStyle}>
        <StatusBadge
          label={session.status}
          variant={session.status === 'Completed' ? 'success' : 'info'}
        />
        <Link to={actionTo} style={{ textDecoration: 'none' }}>
          <button type="button" style={miniActionStyle}>
            {actionLabel}
          </button>
        </Link>
      </div>
    </div>
  );
}

const pageGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.7fr) minmax(320px, 0.9fr)',
  gap: '18px',
  alignItems: 'start',
};

const leftColumnStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
  minWidth: 0,
};

const rightColumnStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
  alignContent: 'start',
};

const toolbarShellStyle: CSSProperties = {
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

const filterRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px',
  alignItems: 'end',
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

const moduleCountWrapStyle: CSSProperties = {
  padding: '10px 14px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  background: '#f7f9fc',
};

const moduleCountLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: '12px',
  color: theme.colors.mutedText,
  marginBottom: '4px',
};

const moduleCountValueStyle: CSSProperties = {
  fontSize: '14px',
  fontWeight: 800,
  color: theme.colors.text,
};

const libraryHeaderStyle: CSSProperties = {
  marginBottom: '2px',
};

const libraryEyebrowStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: theme.colors.mutedText,
  marginBottom: '4px',
};

const libraryHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: '24px',
  fontWeight: 800,
  color: theme.colors.text,
};

const moduleGridStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
};

const sidebarCardStyle: CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '22px',
  padding: '18px',
  boxShadow: '0 10px 30px rgba(8, 31, 45, 0.04)',
};

const sidebarEyebrowStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: theme.colors.mutedText,
  marginBottom: '4px',
};

const sidebarHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: '22px',
  fontWeight: 800,
  color: theme.colors.text,
};

const badgeRowStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
  marginTop: '16px',
};

const statPillStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 14px',
  borderRadius: '16px',
  background: theme.colors.infoBg,
  color: theme.colors.infoText,
  fontWeight: 700,
};

const statPillLabelStyle: CSSProperties = {
  fontSize: '13px',
  opacity: 0.95,
};

const statPillValueStyle: CSSProperties = {
  fontSize: '16px',
  fontWeight: 800,
};

const panelHeaderStyle: CSSProperties = {
  marginBottom: '10px',
};

const panelEyebrowStyle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: theme.colors.mutedText,
  marginBottom: '4px',
};

const panelTitleStyle: CSSProperties = {
  fontSize: '18px',
  fontWeight: 800,
  color: theme.colors.text,
};

const activityEmptyStyle: CSSProperties = {
  color: theme.colors.mutedText,
  fontSize: '14px',
  lineHeight: 1.6,
  padding: '4px 0',
};

const sessionRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: `1px solid ${theme.colors.border}`,
};

const sessionTitleStyle: CSSProperties = {
  fontWeight: 800,
  fontSize: '15px',
  marginBottom: '4px',
};

const sessionMetaStyle: CSSProperties = {
  color: theme.colors.text,
  fontSize: '13px',
  lineHeight: 1.45,
};

const sessionSubMetaStyle: CSSProperties = {
  color: theme.colors.mutedText,
  fontSize: '13px',
  lineHeight: 1.45,
  marginTop: '2px',
};

const sessionRightStyle: CSSProperties = {
  display: 'grid',
  gap: '8px',
  justifyItems: 'end',
  flexShrink: 0,
};

const miniActionStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: '#ffffff',
  borderRadius: '12px',
  padding: '8px 12px',
  fontWeight: 700,
  cursor: 'pointer',
};

const stateStyle: CSSProperties = {
  padding: '24px',
  background: '#ffffff',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '18px',
};

const emptyStateStyle: CSSProperties = {
  padding: '28px',
  textAlign: 'center',
  background: '#ffffff',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '18px',
};

export default TrainingPage;