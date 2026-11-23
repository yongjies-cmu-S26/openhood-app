import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Notice } from '../components/Notice';
import { FINDINGS } from '../data/findings';
import { formatMoney } from '../data/money';
import { VISIT } from '../data/visit';
import { approvedTotal, findingTotal, undecided } from '../state/selectors';
import { useVisit } from '../state/VisitContext';

export default function Done() {
  const { state } = useVisit();
  const approved = FINDINGS.filter((f) => state.decisions[f.id] === 'approved');
  const declined = FINDINGS.filter((f) => state.decisions[f.id] === 'declined');
  const open = undecided(state.decisions);

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
  return (
    <>
      <section className={`done-hero${anyApproved ? '' : ' done-hero--neutral'}`}>
        <span className="oh-label">
          {VISIT.ro} · Decision summary
        </span>
        <h1 className="oh-display done-display">{anyApproved ? 'Repair approved' : 'Decisions saved'}</h1>
        <p>
          {anyApproved
            ? `${VISIT.technician.name} starts in ${VISIT.bay}. You pay at pickup.`
            : 'No repairs approved. Your car will be ready for pickup.'}
        </p>
      </section>

      {open.length > 0 && (
        <Notice tone="warn" title={`${open.length} item still needs a decision`}>
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
            {formatMoney(approvedTotal(state.decisions))}
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

      <section className="oh-panel stack">
        <h2 className="oh-h3">What happens next</h2>
        <ol className="next-steps oh-small">
          {anyApproved && <li>{VISIT.technician.name} starts the approved work in {VISIT.bay}.</li>}
          <li>You get a text when your car is ready.</li>
          <li>Pay at pickup. Nothing is charged now.</li>
        </ol>
      </section>

      {anyApproved ? (
        <Button to="/live" block>
          Watch the bay live
        </Button>
      ) : (
        <Button variant="secondary" to="/" block>
          Back to My car
        </Button>
      )}
      <Button variant="text" to="/review">
        Change decisions
      </Button>
    </>
  );
}
