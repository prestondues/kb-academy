import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { theme } from '../styles/theme';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

function PrimaryButton({ children, ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      style={{
        background: theme.colors.royalBlue,
        color: theme.colors.white,
        border: 'none',
        borderRadius: theme.radius.button,
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: theme.shadow.soft,
      }}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;