import { Outlet } from 'react-router-dom';

function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <aside
        style={{
          width: '240px',
          background: '#081f2d',
          color: 'white',
          padding: '24px',
        }}
      >
        <h2 style={{ marginTop: 0 }}>KB Academy</h2>
        <p style={{ fontSize: '14px', opacity: 0.8 }}>Live a Little. Learn a Lot.</p>
      </aside>

      <main style={{ flex: 1, background: '#f7f9fc', padding: '24px' }}>
        <header style={{ marginBottom: '24px' }}>
          <strong>KB Academy</strong>
        </header>

        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;