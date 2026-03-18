import { type CSSProperties, useMemo, useState } from 'react';
import { theme } from '../styles/theme';

type SignoffModalProps = {
  open: boolean;
  signerLabel: 'trainer' | 'trainee';
  signerName: string;
  mode: 'verify' | 'create';
  loading?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmitVerify: (pin: string) => Promise<void> | void;
  onSubmitCreate: (pin: string) => Promise<void> | void;
};

function SignoffModal({
  open,
  signerLabel,
  signerName,
  mode,
  loading = false,
  errorMessage,
  onClose,
  onSubmitVerify,
  onSubmitCreate,
}: SignoffModalProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const title = useMemo(() => {
    if (mode === 'create') {
      return `Create ${capitalize(signerLabel)} PIN`;
    }
    return `${capitalize(signerLabel)} Sign-Off`;
  }, [mode, signerLabel]);

  const subtitle = useMemo(() => {
    if (mode === 'create') {
      return `${signerName} does not have a PIN yet. Create one to continue sign-off.`;
    }
    return `Signing as ${signerName}. Enter the ${signerLabel} PIN to continue.`;
  }, [mode, signerLabel, signerName]);

  if (!open) return null;

  async function handleSubmit() {
    if (mode === 'create') {
      if (pin.length < 4) return;
      if (pin !== confirmPin) return;
      await onSubmitCreate(pin);
      return;
    }

    if (pin.length < 4) return;
    await onSubmitVerify(pin);
  }

  const createPinMismatch =
    mode === 'create' && confirmPin.length > 0 && pin !== confirmPin;

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div>
            <div style={eyebrowStyle}>KB Academy</div>
            <h2 style={titleStyle}>{title}</h2>
            <p style={subtitleStyle}>{subtitle}</p>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ✕
          </button>
        </div>

        <div style={namePillStyle}>
          <span style={namePillLabelStyle}>Signer</span>
          <span style={namePillValueStyle}>{signerName}</span>
        </div>

        <div style={{ display: 'grid', gap: '14px', marginTop: '14px' }}>
          <div>
            <label style={labelStyle}>
              {mode === 'create' ? 'Create PIN' : 'PIN'}
            </label>
            <input
              type="password"
              inputMode="numeric"
              style={inputStyle}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
            />
          </div>

          {mode === 'create' ? (
            <div>
              <label style={labelStyle}>Confirm PIN</label>
              <input
                type="password"
                inputMode="numeric"
                style={inputStyle}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Re-enter PIN"
              />
            </div>
          ) : null}

          {createPinMismatch ? (
            <div style={errorStyle}>PIN entries do not match.</div>
          ) : null}

          {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}
        </div>

        <div style={footerRowStyle}>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || createPinMismatch}
            style={{
              ...primaryButtonStyle,
              opacity: loading || createPinMismatch ? 0.6 : 1,
              cursor: loading || createPinMismatch ? 'not-allowed' : 'pointer',
            }}
          >
            {loading
              ? 'Saving...'
              : mode === 'create'
              ? 'Create PIN & Sign'
              : 'Verify & Sign'}
          </button>
        </div>
      </div>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const backdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(8, 31, 45, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  zIndex: 9999,
};

const modalStyle: CSSProperties = {
  width: '100%',
  maxWidth: '520px',
  background: '#ffffff',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 24px 60px rgba(8, 31, 45, 0.24)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  marginBottom: '18px',
};

const eyebrowStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#194f91',
  marginBottom: '8px',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '26px',
  fontWeight: 800,
  color: theme.colors.text,
};

const subtitleStyle: CSSProperties = {
  margin: '8px 0 0 0',
  color: theme.colors.mutedText,
  fontSize: '14px',
  lineHeight: 1.6,
};

const closeButtonStyle: CSSProperties = {
  border: 'none',
  background: '#f7f9fc',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  cursor: 'pointer',
  fontSize: '14px',
};

const namePillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 14px',
  borderRadius: '999px',
  background: '#eef6ff',
  color: '#194f91',
  fontWeight: 700,
};

const namePillLabelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const namePillValueStyle: CSSProperties = {
  fontSize: '14px',
  fontWeight: 800,
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '13px',
  marginBottom: '6px',
  fontWeight: 700,
};

const inputStyle: CSSProperties = {
  width: '100%',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '13px 14px',
  fontSize: '14px',
  background: '#ffffff',
};

const errorStyle: CSSProperties = {
  padding: '12px 14px',
  borderRadius: '14px',
  background: '#fff7f7',
  border: '1px solid #f3cccc',
  color: '#a12828',
  fontSize: '14px',
  fontWeight: 600,
};

const footerRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '20px',
};

const secondaryButtonStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: '#ffffff',
  borderRadius: '14px',
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const primaryButtonStyle: CSSProperties = {
  border: 'none',
  background: '#194f91',
  color: '#ffffff',
  borderRadius: '14px',
  padding: '12px 16px',
  fontWeight: 700,
};

export default SignoffModal;