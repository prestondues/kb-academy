import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithUsername } from '../lib/auth';
import { theme } from '../styles/theme';

const logoUrl =
  'https://killerbrownie.com/cdn/shop/files/Killer_Brownie_Logo.svg?v=1743195768&width=340';

function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await signInWithUsername(username, password);
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
    <div style={pageStyle}>
      <div style={brandPanelStyle}>
        <div>
          <div style={logoWrapStyle}>
            <img src={logoUrl} alt="Killer Brownie" style={logoStyle} />
          </div>

          <div style={eyebrowStyle}>KB Academy</div>
          <h1 style={heroTitleStyle}>Live a Little. Learn a Lot.</h1>
          <p style={heroTextStyle}>
            Internal training, compliance, and workforce operations for the
            brownie floor.
          </p>
        </div>

        <div style={valuesWrapStyle}>
          <ValuePill label="Love" />
          <ValuePill label="Creativity" />
          <ValuePill label="Joy" />
          <ValuePill label="Growth" />
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ marginBottom: '24px' }}>
          <div style={miniBrandRowStyle}>
            <img src={logoUrl} alt="Killer Brownie" style={miniLogoStyle} />
            <div>
              <h2 style={{ margin: 0, fontSize: '28px', color: theme.colors.navy }}>
                KB Academy
              </h2>
              <p style={{ margin: '6px 0 0 0', color: theme.colors.mutedText }}>
                Sign in with your KB Academy username and password.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Username</label>
            <input
              style={inputStyle}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
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

          {error ? <div style={errorStyle}>{error}</div> : null}

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={footerTextStyle}>
          Built for operations, training, and growth.
        </p>
      </div>
    </div>
  );
}

function ValuePill({ label }: { label: string }) {
  return <span style={valuePillStyle}>{label}</span>;
}

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background:
    'linear-gradient(135deg, #081f2d 0%, #194f91 45%, #a2c7e2 100%)',
  display: 'grid',
  gridTemplateColumns: '1.1fr 0.9fr',
  alignItems: 'stretch',
};

const brandPanelStyle: CSSProperties = {
  padding: '56px',
  color: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const logoWrapStyle: CSSProperties = {
  marginBottom: '28px',
};

const logoStyle: CSSProperties = {
  width: '220px',
  maxWidth: '100%',
  display: 'block',
  filter: 'brightness(0) invert(1)',
};

const miniBrandRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const miniLogoStyle: CSSProperties = {
  width: '72px',
  display: 'block',
};

const eyebrowStyle: CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  opacity: 0.85,
  marginBottom: '20px',
};

const heroTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '52px',
  lineHeight: 1.02,
  maxWidth: '520px',
};

const heroTextStyle: CSSProperties = {
  marginTop: '18px',
  maxWidth: '480px',
  fontSize: '18px',
  lineHeight: 1.6,
  opacity: 0.92,
};

const valuesWrapStyle: CSSProperties = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
};

const valuePillStyle: CSSProperties = {
  display: 'inline-flex',
  padding: '10px 14px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.16)',
  fontSize: '13px',
  fontWeight: 700,
};

const cardStyle: CSSProperties = {
  margin: '32px',
  background: '#ffffff',
  borderRadius: '28px',
  padding: '40px',
  boxShadow: '0 20px 60px rgba(8, 31, 45, 0.18)',
  alignSelf: 'center',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '13px',
  marginBottom: '6px',
  fontWeight: 600,
};

const inputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #dbe4ee',
  borderRadius: '14px',
  padding: '13px 14px',
  fontSize: '14px',
  background: '#ffffff',
};

const buttonStyle: CSSProperties = {
  background: '#194f91',
  color: '#ffffff',
  border: 'none',
  borderRadius: '14px',
  padding: '13px 16px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(25, 79, 145, 0.24)',
};

const errorStyle: CSSProperties = {
  background: '#fdecec',
  color: '#a12828',
  padding: '12px 14px',
  borderRadius: '12px',
  fontSize: '14px',
};

const footerTextStyle: CSSProperties = {
  marginTop: '20px',
  fontSize: '13px',
  color: '#5f6b76',
};

export default LoginPage;