import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../features/auth/useAuth';
import { theme } from '../styles/theme';

function CreatePinPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(pin)) {
      setError('PIN must be exactly 6 digits.');
      return;
    }

    if (pin !== confirmPin) {
      setError('PIN values do not match.');
      return;
    }

    if (!user?.id) {
      setError('No authenticated user found.');
      return;
    }

    try {
      setSaving(true);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          must_change_password: false,
          must_create_pin: false,
          pin_reset_required: false,
          notes: null,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      await refreshProfile();
      navigate('/');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save PIN state.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '24px' }}>
          <div style={eyebrowStyle}>First Login Setup</div>
          <h1 style={{ margin: 0 }}>Create PIN</h1>
          <p style={subtitleStyle}>
            Set your 6-digit verification PIN for training sign-offs and secure actions.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={labelStyle}>PIN</label>
            <input
              type="password"
              style={inputStyle}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
            />
          </div>

          <div>
            <label style={labelStyle}>Confirm PIN</label>
            <input
              type="password"
              style={inputStyle}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              maxLength={6}
            />
          </div>

          {error ? <div style={errorStyle}>{error}</div> : null}

          <button type="submit" style={buttonStyle} disabled={saving}>
            {saving ? 'Saving...' : 'Save PIN'}
          </button>
        </form>
      </div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f7f9fc',
  padding: '24px',
};

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: '520px',
  background: '#ffffff',
  border: '1px solid #dbe4ee',
  borderRadius: '28px',
  padding: '36px',
  boxShadow: '0 18px 50px rgba(8, 31, 45, 0.12)',
};

const eyebrowStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#194f91',
  marginBottom: '12px',
};

const subtitleStyle: CSSProperties = {
  margin: '8px 0 0 0',
  color: theme.colors.mutedText,
  lineHeight: 1.6,
};

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '13px',
  fontWeight: 600,
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: '14px',
  border: '1px solid #dbe4ee',
};

const buttonStyle: CSSProperties = {
  background: '#194f91',
  color: '#ffffff',
  border: 'none',
  borderRadius: '14px',
  padding: '13px 16px',
  fontWeight: 700,
  cursor: 'pointer',
};

const errorStyle: CSSProperties = {
  background: '#fdecec',
  color: '#a12828',
  padding: '12px 14px',
  borderRadius: '12px',
};

export default CreatePinPage;