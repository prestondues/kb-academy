import { NavLink } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { theme } from '../../styles/theme';

function TrainingSubnav() {
  return (
    <div style={shellStyle}>
      <NavLink
        to="/training"
        end
        style={({ isActive }) => ({
          ...linkStyle,
          ...(isActive ? activeLinkStyle : inactiveLinkStyle),
        })}
      >
        Modules
      </NavLink>

      <NavLink
        to="/training/records"
        style={({ isActive }) => ({
          ...linkStyle,
          ...(isActive ? activeLinkStyle : inactiveLinkStyle),
        })}
      >
        Records
      </NavLink>

      <NavLink
        to="/training/matrix"
        style={({ isActive }) => ({
          ...linkStyle,
          ...(isActive ? activeLinkStyle : inactiveLinkStyle),
        })}
      >
        Skills Matrix
      </NavLink>
    </div>
  );
}

const shellStyle: CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  padding: '10px',
  background: '#ffffff',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '18px',
  boxShadow: '0 10px 24px rgba(8, 31, 45, 0.04)',
  marginBottom: '16px',
};

const linkStyle: CSSProperties = {
  textDecoration: 'none',
  padding: '10px 14px',
  borderRadius: '12px',
  fontWeight: 700,
  fontSize: '14px',
  transition: 'all 0.15s ease',
};

const activeLinkStyle: CSSProperties = {
  background: '#194f91',
  color: '#ffffff',
};

const inactiveLinkStyle: CSSProperties = {
  background: '#f7f9fc',
  color: theme.colors.text,
};

export default TrainingSubnav;