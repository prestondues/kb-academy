import { theme } from '../styles/theme';

type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info';

type StatusBadgeProps = {
  label: string;
  variant?: StatusBadgeVariant;
};

function StatusBadge({ label, variant = 'info' }: StatusBadgeProps) {
  const styles = {
    success: {
      background: theme.colors.successBg,
      color: theme.colors.successText,
    },
    warning: {
      background: theme.colors.warningBg,
      color: theme.colors.warningText,
    },
    danger: {
      background: theme.colors.dangerBg,
      color: theme.colors.dangerText,
    },
    info: {
      background: theme.colors.infoBg,
      color: theme.colors.infoText,
    },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: theme.radius.pill,
        fontSize: '12px',
        fontWeight: 600,
        background: styles[variant].background,
        color: styles[variant].color,
      }}
    >
      {label}
    </span>
  );
}

export default StatusBadge;