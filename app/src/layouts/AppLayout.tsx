import { Outlet } from 'react-router-dom';
import NavItem from '../components/NavItem';
import { signOut } from '../lib/auth';
import { useAuth } from '../features/auth/useAuth';
import { theme } from '../styles/theme';

function AppLayout() {
  const { user } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    }
  }

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
          <div style={{ fontSize: '13px', fontWeight: 700 }}>
            {user?.email ?? 'Signed In User'}
          </div>
          <button
            onClick={handleSignOut}
            style={{
              marginTop: '10px',
              width: '100%',
              background: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              padding: '10px 12px',
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
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
              {user?.email ?? 'No Active User'}
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