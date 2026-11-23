import type { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'dark' | 'text' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  small?: boolean;
  block?: boolean;
  /** when set, renders a router link instead of a button */
  to?: string;
}

export function Button({ variant = 'primary', small, block, to, className = '', children, type = 'button', ...rest }: ButtonProps) {
  const cls = ['oh-btn', `oh-btn--${variant}`, small && 'oh-btn--sm', block && 'oh-btn--block', className].filter(Boolean).join(' ');
  if (to !== undefined) {
    return (
      <Link to={to} className={cls} aria-label={rest['aria-label']}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}
