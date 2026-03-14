import type { ReactNode } from 'react';
import { theme } from '../styles/theme';

type ContentCardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

function ContentCard({ title, subtitle, children }: ContentCardProps) {
  return (
    <div
      style={{
        background: theme.colors.white,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.card,
        boxShadow: theme.shadow.card,
        padding: theme.spacing.card,
      }}
    >
      {title ? (
        <div style={{ marginBottom: '16px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              color: theme.colors.text,
            }}
          >
            {title}
          </h2>

          {subtitle ? (
            <p
              style={{
                margin: '6px 0 0 0',
                fontSize: '14px',
                color: theme.colors.mutedText,
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      {children}
    </div>
  );
}

export default ContentCard;