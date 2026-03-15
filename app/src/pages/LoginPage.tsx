import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail } from '../lib/auth';
import { theme } from '../styles/theme';

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await signInWithEmail(email, password);
      navigate('/');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to sign in.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: theme.colors.white,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '24px',
          padding: '32px',
          boxShadow: theme.shadow.card,
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', color: theme.colors.navy }}>
            KB Academy
          </h1>
          <p style={{ margin: '8px 0 0 0', color: theme.colors.mutedText }}>
            Live a Little. Learn a Lot.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          {error ? (
            <div
              style={{
                background: '#fdecec',
                color: '#a12828',
                padding: '12px 14px',
                borderRadius: '12px',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          ) : null}

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #dbe4ee',
  borderRadius: '12px',
  padding: '12px 14px',
  fontSize: '14px',
  background: '#ffffff',
};

const buttonStyle: React.CSSProperties = {
  background: '#194f91',
  color: '#ffffff',
  border: 'none',
  borderRadius: '14px',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
};

export default LoginPage;