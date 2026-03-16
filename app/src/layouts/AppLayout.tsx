import { Outlet } from 'react-router-dom';
import NavItem from '../components/NavItem';
import { signOut } from '../lib/auth';
import { useAuth } from '../features/auth/useAuth';
import { theme } from '../styles/theme';

const logoUrl =
  'https://killerbrownie.com/cdn/shop/files/Killer_Brownie_Logo.svg?v=1743195768&width=340';

function AppLayout() {
  const { user, profile } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    }
  }

  const displayName =
    profile ? `${profile.first_name} ${profile.last_name}` : user?.email ?? 'Signed In User';

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
          width: '272px',
          background: theme.colors.navy,
          color: theme.colors.white,
          padding: '24px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '12px 0 40px rgba(8, 31, 45, 0.12)',
        }}
      >
        <div>
          <div
            style={{
              marginBottom: '28px',
              padding: '12px 8px 20px 8px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <img
              src={logoUrl}
              alt="Killer Brownie"
              style={{
                width: '140px',
                display: 'block',
                marginBottom: '14px',
                filter: 'brightness(0) invert(1)',
              }}
            />
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
          <div style={{ fontSize: '13px', fontWeight: 700 }}>{displayName}</div>
          <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '4px' }}>
            {user?.email ?? 'No active email'}
          </div>

          <button
            onClick={handleSignOut}
            style={{
              marginTop: '12px',
              width: '100%',
              background: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              padding: '10px 12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            height: '84px',
            background: theme.colors.white,
            borderBottom: `1px solid ${theme.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={logoUrl}
              alt="Killer Brownie"
              style={{ width: '48px', display: 'block' }}
            />
            <div>
              <div style={{ fontSize: '12px', color: theme.colors.mutedText, fontWeight: 700 }}>
                KB ACADEMY
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: theme.colors.text }}>
                Operations & Training Platform
              </div>
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
                fontWeight: 700,
              }}
            >
              {profile ? `@${profile.username}` : user?.email ?? 'No Active User'}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '28px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;