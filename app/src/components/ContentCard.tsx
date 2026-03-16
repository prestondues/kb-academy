import type { CSSProperties, ReactNode } from 'react';
import { theme } from '../styles/theme';

type ContentCardProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

function ContentCard({
  title,
  subtitle,
  actions,
  children,
}: ContentCardProps) {
  return (
    <section style={cardStyle}>
      <div style={headerStyle}>
        <div>
          <h3 style={titleStyle}>{title}</h3>
          {subtitle ? <p style={subtitleStyle}>{subtitle}</p> : null}
        </div>

        {actions ? <div style={actionsWrapStyle}>{actions}</div> : null}
      </div>

      <div>{children}</div>
    </section>
  );
}

const cardStyle: CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '20px',
  padding: '20px',
  boxShadow: '0 8px 24px rgba(8, 31, 45, 0.04)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '16px',
  marginBottom: '18px',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 800,
  color: theme.colors.text,
};

const subtitleStyle: CSSProperties = {
  margin: '6px 0 0 0',
  fontSize: '14px',
  color: theme.colors.mutedText,
  lineHeight: 1.55,
};

const actionsWrapStyle: CSSProperties = {
  flexShrink: 0,
};

export default ContentCard;