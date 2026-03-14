import type { ReactNode } from 'react';
import { theme } from '../styles/theme';

type PageContainerProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

function PageContainer({
  title,
  subtitle,
  actions,
  children,
}: PageContainerProps) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '32px',
              lineHeight: 1.1,
              color: theme.colors.text,
            }}
          >
            {title}
          </h1>

          {subtitle ? (
            <p
              style={{
                margin: '8px 0 0 0',
                color: theme.colors.mutedText,
                fontSize: '15px',
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        {actions ? <div>{actions}</div> : null}
      </div>

      {children}
    </div>
  );
}

export default PageContainer;