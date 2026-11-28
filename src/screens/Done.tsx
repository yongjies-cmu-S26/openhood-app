import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Notice } from '../components/Notice';
import { FINDINGS } from '../data/findings';
import { formatMoney } from '../data/money';
import { VISIT } from '../data/visit';
import { approvedTotal, findingTotal, undecided } from '../state/selectors';
import { useVisit } from '../state/VisitContext';
import { currentConfirmation } from '../state/workflow';

export default function Done() {
  const { state, dispatch } = useVisit();
  const receipt = currentConfirmation(state.workflow);
  const decisions = receipt?.decisions ?? state.decisions;
  const approved = FINDINGS.filter((f) => decisions[f.id] === 'approved');
  const declined = FINDINGS.filter((f) => decisions[f.id] === 'declined');
  const open = undecided(decisions);

  if (approved.length === 0 && declined.length === 0) {
    return (
      <>
        <div className="page-head">
          <h1 className="oh-h1">You haven’t decided yet</h1>
          <p className="oh-small">Review each recommended repair, then come back here for your summary.</p>
        </div>
        <Button to="/review" block>
          Review repairs
        </Button>
      </>
    );
  }

  const anyApproved = approved.length > 0;
  const confirmedAt = receipt ? new Date(receipt.confirmedAt) : null;
  return (
    <>
      <section className={receipt && anyApproved ? 'done-hero' : 'done-hero done-hero--neutral'}>
        <span className="oh-label">
          {VISIT.ro} · Decision summary
        </span>
        <h1 className={receipt ? 'oh-display done-display' : 'oh-h1'}>{receipt ? (anyApproved ? 'Repair approved' : 'Decisions saved') : 'Review your decisions'}</h1>
        <p>
          {receipt
            ? (anyApproved ? `${VISIT.technician.name} starts in ${VISIT.bay}. You pay at pickup.` : 'No repairs approved. Your car will be ready for pickup.')
            : open.length > 0
              ? 'Decide on every repair before sending your choices to the service advisor.'
              : 'Confirm your choices to send them to the service advisor.'}
        </p>
        {confirmedAt && <time className="oh-caption" dateTime={confirmedAt.toISOString()}>Confirmed · {confirmedAt.toLocaleString()}</time>}
      </section>

      {open.length > 0 && (
        <Notice tone="warn" title={open.length === 1 ? '1 item still needs a decision' : open.length + ' items still need decisions'}>
          <Link to={`/review/${open[0].id}`}>Decide on {open[0].title.toLowerCase()}</Link>
        </Notice>
      )}

      <section className="oh-panel stack">
        <h2 className="oh-h3">Approved</h2>
        {anyApproved ? (
          <ul className="done-list">
            {approved.map((f) => (
              <li key={f.id}>
                <span>{f.title}</span>
                <span className="oh-data">{formatMoney(findingTotal(f))}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="oh-small">Nothing approved.</p>
        )}
        <div className="oh-total">
          <span className="oh-h3">Approved total</span>
          <span className="oh-price" data-testid="approved-total">
            {formatMoney(receipt?.approvedAmount ?? approvedTotal(state.decisions))}
          </span>
        </div>
      </section>

      {declined.length > 0 && (
        <section className="oh-panel stack">
          <h2 className="oh-h3">Declined</h2>
          <ul className="done-list">
            {declined.map((f) => (
              <li key={f.id}>
                <span className="declined-item">{f.title}</span>
                <span className="oh-small">Ask about it at your next visit</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {receipt ? (
        <>
          <section className="oh-panel stack">
            <h2 className="oh-h3">What happens next</h2>
            <ol className="next-steps oh-small">
              {anyApproved && <li>{VISIT.technician.name} starts the approved work in {VISIT.bay}.</li>}
              <li>You get a text when your car is ready.</li>
              <li>Pay at pickup. Nothing is charged now.</li>
            </ol>
          </section>
          {anyApproved ? (
            <Button to="/live" block>Watch the bay live</Button>
          ) : (
            <Button variant="secondary" to="/" block>Back to My car</Button>
          )}
        </>
      ) : open.length === 0 && (
        <Button block onClick={() => dispatch({ type: 'confirm-decisions', at: Date.now() })}>Confirm decisions</Button>
      )}
      {!receipt && <Button variant="text" to="/review">Change decisions</Button>}
    </>
  );
}
