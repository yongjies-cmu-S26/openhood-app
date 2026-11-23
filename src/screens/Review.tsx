import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { DecisionChip, FindingStatusChip } from '../components/StatusChip';
import { FINDINGS } from '../data/findings';
import { formatMoney } from '../data/money';
import { approvedTotal, findingTotal, undecided } from '../state/selectors';
import { useVisit } from '../state/VisitContext';

export default function Review() {
  const { state, dispatch } = useVisit();
  const remaining = undecided(state.decisions).length;

  return (
    <>
      <BackLink to="/" label="Main page" />
      <div className="page-head">
        <div className="oh-label">Customer</div>
        <h1 className="oh-h1">Review repairs</h1>
        <p className="oh-small">Choose for each item. Approving authorizes the work; you pay at pickup.</p>
      </div>
      {FINDINGS.map((f) => {
        const decision = state.decisions[f.id];
        return (
          <article key={f.id} className={`oh-finding review-item${f.status === 'soon' ? ' oh-finding--amber' : ''}`}>
            <div className="review-item__head">
              <h2 className="oh-h3">{f.title}</h2>
              <span className="oh-price" style={{ fontSize: 18 }}>
                {formatMoney(findingTotal(f))}
              </span>
            </div>
            <div className="oh-cluster">
              <FindingStatusChip status={f.status} />
              {decision && <DecisionChip decision={decision} />}
            </div>
            <div className="review-item__actions">
              {decision ? (
                <Button variant="text" aria-label={`Change decision for ${f.title}`} onClick={() => dispatch({ type: 'decide', id: f.id, decision: null })}>
                  Change decision
                </Button>
              ) : (
                <Button variant="secondary" small to={`/review/${f.id}`}>
                  Review &amp; decide
                </Button>
              )}
            </div>
          </article>
        );
      })}
      <section className="oh-panel stack">
        <div className="total-bar">
          <span className="oh-h3">Approved total</span>
          <span className="oh-price" data-testid="approved-total">
            {formatMoney(approvedTotal(state.decisions))}
          </span>
        </div>
        <p className="oh-small">{remaining === 0 ? 'Every item has a decision.' : `${remaining} of ${FINDINGS.length} items still need a decision.`}</p>
      </section>
      <Button to="/done" block>
        See decision summary
      </Button>
    </>
  );
}
