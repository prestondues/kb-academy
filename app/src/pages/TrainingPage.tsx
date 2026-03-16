import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import { getTrainingModules } from '../features/training/trainingApi';
import { mapTrainingModuleToCard } from '../features/training/trainingMappers';
import type { TrainingModuleCardModel } from '../features/training/types';
import TrainingModuleCard from '../features/training/TrainingModuleCard';
import { theme } from '../styles/theme';

function TrainingPage() {
  const [modules, setModules] = useState<TrainingModuleCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    async function loadModules() {
      try {
        const data = await getTrainingModules();
        setModules(data.map(mapTrainingModuleToCard));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load training modules.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadModules();
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
      subtitle="Manage KB Academy training modules, settings, and readiness."
      actions={
        <Link to="/training/new" style={{ textDecoration: 'none' }}>
          <PrimaryButton>Create Module</PrimaryButton>
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
            placeholder="Search modules by title, description, department, or SQF"
          />
        </div>

        <div style={countPillStyle}>
          {filteredModules.length} module{filteredModules.length === 1 ? '' : 's'}
        </div>
      </div>

      <div style={filtersRowStyle}>
        <FilterSelect
          label="Type"
          value={typeFilter}
          onChange={setTypeFilter}
          options={typeOptions}
        />
        <FilterSelect
          label="Department"
          value={departmentFilter}
          onChange={setDepartmentFilter}
          options={departmentOptions}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={['All', 'Active', 'Inactive']}
        />
      </div>

      <div style={gridStyle}>
        {loading ? (
          <div style={stateStyle}>Loading training modules...</div>
        ) : error ? (
          <div style={stateStyle}>{error}</div>
        ) : filteredModules.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              No training modules found
            </div>
            <div style={{ color: theme.colors.mutedText, lineHeight: 1.6 }}>
              Try changing the filters or create your first module.
            </div>
          </div>
        ) : (
          filteredModules.map((module) => (
            <TrainingModuleCard key={module.id} module={module} />
          ))
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
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '16px',
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

const filtersRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '12px',
  marginBottom: '18px',
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

const emptyStateStyle: CSSProperties = {
  padding: '28px',
  textAlign: 'center',
  background: '#ffffff',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '18px',
};

export default TrainingPage;