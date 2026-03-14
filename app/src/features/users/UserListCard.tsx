import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import type { UserCardModel } from './userMappers';

type UserListCardProps = {
  user: UserCardModel;
};

function UserListCard({ user }: UserListCardProps) {
  return (
    <Link
      to={`/users/${user.id}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div
        style={{
          padding: '16px',
          border: '1px solid #dbe4ee',
          borderRadius: '16px',
          background: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{user.fullName}</div>
            <div style={{ marginTop: '4px', color: '#5f6b76', fontSize: '14px' }}>
              @{user.username} • {user.employeeId}
            </div>
          </div>

          <StatusBadge
            label={user.status}
            variant={user.status === 'Active' ? 'success' : 'danger'}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#5f6b76' }}>Role</div>
            <div style={{ fontWeight: 600 }}>{user.role}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#5f6b76' }}>Department</div>
            <div style={{ fontWeight: 600 }}>{user.homeDepartment}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#5f6b76' }}>Shift</div>
            <div style={{ fontWeight: 600 }}>{user.shift}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#5f6b76' }}>Flags</div>
            <div style={{ fontWeight: 600 }}>
              {user.probationary ? 'Probationary' : user.trainerEnabled ? 'Trainer Enabled' : '—'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default UserListCard;