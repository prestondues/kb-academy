import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { theme } from '../../styles/theme';
import type { UserCardModel } from './types';

function UserListCard({ user }: { user: UserCardModel }) {
  return (
    <div style={cardStyle}>
      <div style={topRowStyle}>
        <div>
          <div style={nameStyle}>{user.fullName}</div>
          <div style={usernameStyle}>@{user.username}</div>
        </div>

        <div
          style={{
            ...statusBadgeStyle,
            background: user.status === 'Active' ? '#e8f7ee' : '#fff4e8',
            color: user.status === 'Active' ? '#18794e' : '#9a5b13',
          }}
        >
          {user.status}
        </div>
      </div>

      <div style={detailsGridStyle}>
        <Detail label="Employee ID" value={user.employeeId} />
        <Detail label="Email" value={user.email} />
        <Detail label="Role" value={user.roleName} />
        <Detail label="Department" value={user.departmentName} />
        <Detail label="Shift" value={user.shiftName} />
        <Detail label="Trainer" value={user.trainerEnabled ? 'Yes' : 'No'} />
        <Detail label="Probationary" value={user.probationary ? 'Yes' : 'No'} />
      </div>

      <div style={footerStyle}>
        <Link to={`/users/${user.id}`} style={linkStyle}>
          View User
        </Link>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={detailLabelStyle}>{label}</div>
      <div style={detailValueStyle}>{value}</div>
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '20px',
  padding: '18px',
  boxShadow: '0 8px 24px rgba(8, 31, 45, 0.04)',
};

const topRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  alignItems: 'flex-start',
  marginBottom: '16px',
};

const nameStyle: CSSProperties = {
  fontSize: '18px',
  fontWeight: 800,
  color: theme.colors.text,
};

const usernameStyle: CSSProperties = {
  marginTop: '4px',
  fontSize: '13px',
  color: theme.colors.mutedText,
};

const statusBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '999px',
  fontWeight: 800,
  fontSize: '12px',
};

const detailsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '14px 18px',
};

const detailLabelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.colors.mutedText,
  marginBottom: '4px',
};

const detailValueStyle: CSSProperties = {
  fontSize: '14px',
  color: theme.colors.text,
};

const footerStyle: CSSProperties = {
  marginTop: '18px',
  display: 'flex',
  justifyContent: 'flex-end',
};

const linkStyle: CSSProperties = {
  textDecoration: 'none',
  color: '#194f91',
  fontWeight: 700,
};

export default UserListCard;