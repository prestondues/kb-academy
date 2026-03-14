import { Outlet } from 'react-router-dom';
import NavItem from '../components/NavItem';
import { theme } from '../styles/theme';

function AppLayout() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'DM Sans, sans-serif',
        background: theme.colors.background,
      }}
    >
      <aside
        style={{
          width: '260px',
          background: theme.colors.navy,
          color: theme.colors.white,
          padding: '24px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ margin: 0, fontSize: '24px' }}>KB Academy</h2>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', opacity: 0.82 }}>
              Live a Little. Learn a Lot.
            </p>
          </div>

          <nav>
            <NavItem to="/" label="Dashboard" />
            <NavItem to="/training" label="Training" />
            <NavItem to="/certifications" label="Certifications" />
            <NavItem to="/place-charts" label="Place Charts" />
            <NavItem to="/users" label="Users" />
            <NavItem to="/announcements" label="Announcements" />
            <NavItem to="/reports" label="Reports" />
            <NavItem to="/documents" label="Documents" />
            <NavItem to="/admin" label="Admin" />
          </nav>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: '16px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 700 }}>Preston Dues</div>
          <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '4px' }}>
            Admin
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            height: '76px',
            background: theme.colors.white,
            borderBottom: `1px solid ${theme.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', color: theme.colors.mutedText }}>
              KB Academy
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: theme.colors.text }}>
              Operations & Training Platform
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: theme.colors.infoBg,
                color: theme.colors.infoText,
                borderRadius: theme.radius.pill,
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              3 Notifications
            </div>

            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: theme.colors.lightBlue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.navy,
                fontWeight: 700,
              }}
            >
              P
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;