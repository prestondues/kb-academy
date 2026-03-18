import { useEffect, useState, type CSSProperties } from 'react';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import {
  getSystemSettings,
  updateSystemSettings,
} from '../features/system/systemApi';
import { theme } from '../styles/theme';

function AdminPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'KB Academy is temporarily unavailable while updates are being made.'
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getSystemSettings();

        if (settings) {
          setMaintenanceMode(Boolean(settings.maintenance_mode));
          setMaintenanceMessage(
            settings.maintenance_message ||
              'KB Academy is temporarily unavailable while updates are being made.'
          );
        }
      } catch (error) {
        console.error('LOAD ADMIN SETTINGS ERROR:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  async function handleSave() {
    try {
      setSaving(true);

      await updateSystemSettings({
        maintenance_mode: maintenanceMode,
        maintenance_message: maintenanceMessage || null,
      });

      alert('System settings updated.');
    } catch (error: unknown) {
      console.error('SAVE SYSTEM SETTINGS ERROR:', error);
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      alert(`Failed to update system settings: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer
      title="Admin"
      subtitle="Control system-wide settings and maintenance behavior."
      actions={
        <PrimaryButton onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save Settings'}
        </PrimaryButton>
      }
    >
      <ContentCard
        title="Maintenance Mode"
        subtitle="Take KB Academy offline for non-admin users while changes are being made."
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <label style={toggleWrapStyle}>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
            />
            <span>Enable maintenance mode</span>
          </label>

          <div>
            <label style={labelStyle}>Maintenance Message</label>
            <textarea
              style={textareaStyle}
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="Enter maintenance message"
            />
          </div>

          <div style={helperStyle}>
            When maintenance mode is enabled, non-admin users will see the
            maintenance page. Admins and leadership-level users can still access
            the app.
          </div>
        </div>
      </ContentCard>
    </PageContainer>
  );
}

const toggleWrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontWeight: 700,
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '13px',
  marginBottom: '6px',
  fontWeight: 700,
};

const textareaStyle: CSSProperties = {
  width: '100%',
  minHeight: '120px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '13px 14px',
  fontSize: '14px',
  background: '#ffffff',
  resize: 'vertical',
};

const helperStyle: CSSProperties = {
  padding: '14px',
  borderRadius: '16px',
  background: '#f7f9fc',
  border: `1px solid ${theme.colors.border}`,
  color: theme.colors.mutedText,
  fontSize: '14px',
  lineHeight: 1.6,
};

export default AdminPage;