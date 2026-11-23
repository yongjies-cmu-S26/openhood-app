import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { FindingStatusChip } from '../components/StatusChip';
import { FINDINGS } from '../data/findings';
import { formatMoney } from '../data/money';
import { VISIT } from '../data/visit';
import { findingTotal } from '../state/selectors';

export default function Summary() {
  const total = FINDINGS.reduce((sum, f) => sum + findingTotal(f), 0);
  return (
    <>
      <BackLink to="/findings" label="Your findings" />
      <div className="page-head">
        <h1 className="oh-h1">Inspection summary</h1>
        <p className="oh-small">
          {VISIT.vehicle} · {VISIT.ro}
        </p>
      </div>
      <div className="oh-table-wrap">
        <table className="oh-table">
          <thead>
            <tr>
              <th>Item</th>
              <th className="oh-num">Total</th>
            </tr>
          </thead>
          <tbody>
            {FINDINGS.map((f) => (
              <tr key={f.id}>
                <td>
                  <div className="stack" style={{ gap: 6 }}>
                    <span>{f.title}</span>
                    <FindingStatusChip status={f.status} />
                  </div>
                </td>
                <td className="oh-num">{formatMoney(findingTotal(f))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>All recommended</td>
              <td className="oh-num" data-testid="summary-total">
                {formatMoney(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <Button to="/review" block>
        Review recommended repairs
      </Button>
      <p className="oh-caption">Sample estimate · tax included</p>
    </>
  );
}
