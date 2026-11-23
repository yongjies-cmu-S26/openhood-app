import { Link } from 'react-router-dom';
import type { Decision, Finding } from '../data/types';
import { DecisionChip, FindingStatusChip } from './StatusChip';
import { Icon } from './Icon';

interface Props {
  finding: Finding;
  to: string;
  selected?: boolean;
  decision?: Decision;
}

export function FindingCard({ finding, to, selected = false, decision }: Props) {
  return (
    <Link
      to={to}
      className={`finding-card finding-card--${finding.status}${selected ? ' is-selected' : ''}`}
      aria-current={selected ? 'true' : undefined}
    >
      <span className="finding-card__num" aria-hidden="true">
        {finding.number}
      </span>
      <span className="finding-card__body">
        <span className="finding-card__title">{finding.title}</span>
        <span className="finding-card__meta">
          <FindingStatusChip status={finding.status} />
          <span className="oh-small">{finding.location}</span>
          {decision && <DecisionChip decision={decision} />}
        </span>
      </span>
      <Icon name="chevron-right" size={16} className="finding-card__chev" />
    </Link>
  );
}
