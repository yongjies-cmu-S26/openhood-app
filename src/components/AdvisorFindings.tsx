import type { AdvisorVisit, VisitStatus } from '../data/advisorVisits';
import { formatMoney } from '../data/money';
import { FindingStatusChip, StatusChip } from './StatusChip';

export function AdvisorFindings({ findings, status, showNotes }: {
  findings: AdvisorVisit['findings'];
  status?: VisitStatus;
  showNotes?: boolean;
}) {
  return (
    <ul className="advisor-findings">
      {findings.map((finding) => (
        <li key={finding.title}>
          <div className="advisor-finding-line">
            <span>{finding.title}</span>
            <span className="oh-data">{formatMoney(finding.cost)}</span>
          </div>
          <div className="oh-cluster">
            <FindingStatusChip status={finding.status} />
            {status === 'pickup' && <StatusChip tone="ok" label="Completed" />}
          </div>
          {showNotes && finding.note && <p className="oh-small">{finding.note}</p>}
        </li>
      ))}
    </ul>
  );
}
