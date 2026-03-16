import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import type { UserCardModel } from './userMappers';

type UserListCardProps = {
  user: UserCardModel;
  compact?: boolean;
};

function UserListCard({ user, compact = false }: UserListCardProps) {
  if (compact) {
    return (
      <Link
        to={`/users/${user.id}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div
          style={{
            padding: '14px 16px',
            border: '1px solid #eef3f8',
            borderRadius: '16px',
            background: '#ffffff',
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.9fr 0.9fr 0.9fr 0.6fr',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#a2c7e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#081f2d',
                flexShrink: 0,
              }}
            >
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 800,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={user.fullName}
              >
                {user.fullName}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#5f6b76',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={`@${user.username} • ${user.employeeId}`}
              >
                @{user.username} • {user.employeeId}
              </div>
            </div>
          </div>

          <CompactMetric value={user.role} />
          <CompactMetric value={user.homeDepartment} />
          <CompactMetric value={user.shift} />
          <div style={{ justifySelf: 'end' }}>
            <StatusBadge
              label={user.status}
              variant={user.status === 'Active' ? 'success' : 'danger'}
            />
          </div>
        </div>
      </Link>
    );
  }

  return null;
}

function CompactMetric({ value }: { value: string }) {
  return (
    <div
      style={{
        fontWeight: 700,
        color: '#081f2d',
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
      title={value}
    >
      {value}
    </div>
  );
}

export default UserListCard;