import { NavLink } from 'react-router-dom';
import { theme } from '../styles/theme';

type NavItemProps = {
  to: string;
  label: string;
};

function NavItem({ to, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'block',
        padding: '12px 14px',
        borderRadius: '12px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 600,
        marginBottom: '8px',
        background: isActive ? 'rgba(162, 199, 226, 0.18)' : 'transparent',
        color: theme.colors.white,
        border: isActive ? '1px solid rgba(162, 199, 226, 0.25)' : '1px solid transparent',
      })}
    >
      {label}
    </NavLink>
  );
}

export default NavItem;