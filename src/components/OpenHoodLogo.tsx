import { Link } from 'react-router-dom';

export function OpenHoodLogo({ to = '/', label = 'OpenHood home' }: { to?: string; label?: string }) {
  return (
    <Link className="oh-logo" to={to} aria-label={label}>
      <span className="oh-logo__mark">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 17L17 7M8 7h9v9" />
        </svg>
      </span>
      <span className="oh-logo__word" aria-hidden="true">OpenHood</span>
    </Link>
  );
}
