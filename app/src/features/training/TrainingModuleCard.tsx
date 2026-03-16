import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import type { TrainingModuleCardModel } from './types';

function TrainingModuleCard({
  module,
}: {
  module: TrainingModuleCardModel;
}) {
  return (
    <Link
      to={`/training/${module.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        style={{
          padding: '18px',
          border: '1px solid #dbe4ee',
          borderRadius: '18px',
          background: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>{module.title}</div>
            <div style={{ marginTop: '6px', color: '#5f6b76', lineHeight: 1.55 }}>
              {module.description}
            </div>
          </div>

          <StatusBadge
            label={module.status}
            variant={module.status === 'Active' ? 'success' : 'danger'}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '12px',
            marginTop: '18px',
          }}
        >
          <Metric label="Type" value={module.moduleType} />
          <Metric label="Department" value={module.department} />
          <Metric label="Required Hours" value={module.requiredHours} />
          <Metric label="Recertification" value={module.recertFrequency} />
        </div>
      </div>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '12px', color: '#5f6b76' }}>{label}</div>
      <div style={{ fontWeight: 700, marginTop: '4px' }}>{value}</div>
    </div>
  );
}

export default TrainingModuleCard;