import type { ReactElement } from 'react';

const PATHS = {
  'arrow-up-right': <path d="M7 17L17 7M8 7h9v9" />,
  'chevron-left': <path d="M15 6l-6 6 6 6" />,
  'chevron-right': <path d="M9 6l6 6-6 6" />,
  home: <path d="M3 10.5L12 3l9 7.5M5 9.5V20h14V9.5M10 20v-6h4v6" />,
  car: (
    <>
      <path d="M3 16v-3l2-5.2A2 2 0 0 1 6.9 6.5h10.2a2 2 0 0 1 1.9 1.3L21 13v3h-2M5 16H3M9 16h6" />
      <circle cx="7" cy="16.5" r="2" />
      <circle cx="17" cy="16.5" r="2" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17v.01" />
    </>
  ),
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  video: (
    <>
      <rect x="2" y="6" width="14" height="12" rx="1" />
      <path d="M16 10l6-3v10l-6-3" />
    </>
  ),
  clipboard: <path d="M9 4h6v3H9zM6 5.5H5v15h14v-15h-1M9 13l2 2 4-4" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  send: <path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  play: <path d="M7 4v16l13-8z" fill="currentColor" stroke="none" />,
  pause: <path d="M8 5v14M16 5v14" />,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  alert: (
    <>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v4.5M12 17.5v.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.01" />
    </>
  ),
  expand: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  rotate: <path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />,
  'zoom-in': (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4M11 8v6M8 11h6" />
    </>
  ),
  'zoom-out': (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4M8 11h6" />
    </>
  ),
} satisfies Record<string, ReactElement>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, className = '' }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={`oh-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
