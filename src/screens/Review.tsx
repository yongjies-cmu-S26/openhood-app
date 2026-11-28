import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { DecisionChip, FindingStatusChip } from '../components/StatusChip';
import { FINDINGS } from '../data/findings';
import { formatMoney } from '../data/money';
import { approvedTotal, findingTotal, undecided } from '../state/selectors';
import { useVisit } from '../state/VisitContext';
import { currentConfirmation } from '../state/workflow';

export default function Review() {
  const { state, dispatch } = useVisit();
  const receipt = currentConfirmation(state.workflow);
  const decisions = receipt?.decisions ?? state.decisions;
  const remaining = undecided(decisions).length;

  return (
    <>
      <BackLink to="/" label="Main page" />
      <div className="page-head">
        <div className="oh-label">Customer</div>
        <h1 className="oh-h1">Review repairs</h1>
        <p className="oh-small">{receipt ? 'Your choices were sent to the service advisor.' : 'Choose for each item, then confirm all your choices to authorize the work. You pay at pickup.'}</p>
      </div>
      {FINDINGS.map((f) => {
        const decision = decisions[f.id];
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
            {!receipt && <div className="review-item__actions">
              {decision ? (
                <Button variant="text" aria-label={`Change decision for ${f.title}`} onClick={() => dispatch({ type: 'decide', id: f.id, decision: null })}>
                  Change decision
                </Button>
              ) : (
                <Button variant="secondary" small to={`/review/${f.id}`}>
                  Review &amp; decide
                </Button>
              )}
            </div>}
          </article>
        );
      })}
      <section className="oh-panel stack">
        <div className="total-bar">
          <span className="oh-h3">Approved total</span>
          <span className="oh-price" data-testid="approved-total">
            {formatMoney(receipt?.approvedAmount ?? approvedTotal(decisions))}
          </span>
        </div>
        <p className="oh-small">{receipt ? 'Decisions confirmed.' : remaining === 0 ? 'Every item has a decision.' : `${remaining} of ${FINDINGS.length} items still need a decision.`}</p>
      </section>
      <Button to="/done" block>
        {receipt ? 'View confirmation' : 'See decision summary'}
      </Button>
    </>
  );
}
