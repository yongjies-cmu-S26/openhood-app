import { Link } from 'react-router-dom';
import { Icon } from './Icon';

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link className="oh-back" to={to}>
      <Icon name="chevron-left" size={16} />
      {label}
    </Link>
  );
}
