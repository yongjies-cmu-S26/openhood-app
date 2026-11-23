import type { ReactNode } from 'react';
import { Icon } from './Icon';

type NoticeTone = 'info' | 'warn' | 'error';
const ICON = { info: 'info', warn: 'clock', error: 'alert' } as const;

export function Notice({ tone = 'info', title, children }: { tone?: NoticeTone; title: string; children?: ReactNode }) {
  return (
    <div className={`oh-notice oh-notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={ICON[tone]} />
      <div>
        <b>{title}</b>
        {children && <div className="oh-small">{children}</div>}
      </div>
    </div>
  );
}
