import { type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { theme } from '../styles/theme';

const logoUrl =
  'https://killerbrownie.com/cdn/shop/files/Killer_Brownie_Logo.svg?v=1743195768&width=340';

function MaintenancePage({
  message,
}: {
  message?: string | null;
}) {
  const navigate = useNavigate();

  async function handleAdminSignIn() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('SIGN OUT DURING MAINTENANCE ERROR:', error);
    } finally {
      navigate('/admin-login');
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={logoWrapStyle}>
          <img src={logoUrl} alt="Killer Brownie" style={logoStyle} />
        </div>

        <div style={eyebrowStyle}>KB Academy</div>

        <h1 style={headingStyle}>We’re currently under maintenance</h1>

        <p style={messageStyle}>
          {message ||
            'KB Academy is temporarily unavailable while updates are being made.'}
        </p>

        <div style={subTextStyle}>
          Admins may still sign in to continue working.
        </div>

        <div style={buttonRowStyle}>
          <button type="button" onClick={handleAdminSignIn} style={buttonStyle}>
            Admin Sign In
          </button>
        </div>

        <div style={footerStyle}>Please check back shortly.</div>
      </div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #081f2d 0%, #194f91 55%, #a2c7e2 100%)',
  padding: '24px',
};

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: '620px',
  background: '#ffffff',
  borderRadius: '28px',
  padding: '40px',
  boxShadow: '0 20px 60px rgba(8, 31, 45, 0.18)',
  textAlign: 'center',
};

const logoWrapStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '18px',
};

const logoStyle: CSSProperties = {
  width: '180px',
  maxWidth: '100%',
  display: 'block',
};

const eyebrowStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#194f91',
  marginBottom: '14px',
};

const headingStyle: CSSProperties = {
  margin: 0,
  fontSize: '36px',
  lineHeight: 1.1,
  color: theme.colors.text,
};

const messageStyle: CSSProperties = {
  marginTop: '16px',
  fontSize: '16px',
  lineHeight: 1.7,
  color: theme.colors.mutedText,
};

const subTextStyle: CSSProperties = {
  marginTop: '12px',
  fontSize: '14px',
  lineHeight: 1.6,
  color: '#5f6b76',
};

const buttonRowStyle: CSSProperties = {
  marginTop: '24px',
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
};

const buttonStyle: CSSProperties = {
  border: 'none',
  background: '#194f91',
  color: '#ffffff',
  borderRadius: '14px',
  padding: '12px 16px',
  fontWeight: 700,
  cursor: 'pointer',
};

const footerStyle: CSSProperties = {
  marginTop: '24px',
  fontSize: '14px',
  color: '#5f6b76',
  fontWeight: 600,
};

export default MaintenancePage;