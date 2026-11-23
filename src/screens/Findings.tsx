import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { FindingCard } from '../components/FindingCard';
import { FINDINGS } from '../data/findings';
import { useVisit } from '../state/VisitContext';

export default function Findings() {
  const { state } = useVisit();
  return (
    <>
      <BackLink to="/inspect" label="Vehicle model" />
      <div className="page-head">
        <h1 className="oh-h1">Your findings</h1>
        <p className="oh-small">The same findings and evidence, without the model.</p>
      </div>
      <div className="stack">
        {FINDINGS.map((f) => (
          <FindingCard key={f.id} finding={f} to={`/findings/${f.id}`} decision={state.decisions[f.id]} />
        ))}
      </div>
      <Button variant="secondary" to="/inspect" block>
        Open vehicle model
      </Button>
      <Button variant="dark" to="/summary" block>
        View inspection summary
      </Button>
    </>
  );
}
