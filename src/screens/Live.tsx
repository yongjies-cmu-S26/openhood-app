import { useState } from 'react';
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { CarView } from '../components/CarView';
import { FINDINGS } from '../data/findings';
import { VISIT } from '../data/visit';
import { visitStage } from '../state/selectors';
import { useVisit } from '../state/VisitContext';

type Camera = 'overview' | 'front-wheel';

export default function Live() {
  const { state } = useVisit();
  const [camera, setCamera] = useState<Camera>('overview');
  const stage = visitStage(state.decisions);
  const approved = FINDINGS.filter((f) => state.decisions[f.id] === 'approved').map((f) => f.title.toLowerCase());

  const status =
    stage === 'review'
      ? { title: 'Inspection complete', body: 'Your shop is waiting for your repair decisions.' }
      : stage === 'repair'
        ? { title: 'Repair in progress', body: `${VISIT.technician.name} is working on: ${approved.join(' and ')}.` }
        : { title: 'No repairs approved', body: 'Your car will be ready for pickup shortly.' };

  return (
    <>
      <BackLink to="/" label="Main page" />
      <div className="page-head">
        <div className="oh-label">Customer</div>
        <h1 className="oh-h1">A window into the bay</h1>
        <p className="oh-small">
          {VISIT.vehicle} · {VISIT.bay}
        </p>
      </div>
      <section className="feed" aria-label="Sample live view">
        <span className="feed__live">Sample live view</span>
        <CarView view="front-left" zoomed={camera === 'front-wheel'} selectedId="brake-pads" onSelect={() => {}} />
        <span className="oh-h3">{camera === 'overview' ? 'Camera 1 · Bay overview' : 'Camera 2 · Front-wheel camera'}</span>
        <span className="oh-caption">Illustrative feed · No live camera connected</span>
      </section>
      <section className="oh-panel stack">
        <h2 className="oh-h3">{status.title}</h2>
        <p className="oh-small">{status.body}</p>
      </section>
      <Button variant="dark" block onClick={() => setCamera((c) => (c === 'overview' ? 'front-wheel' : 'overview'))}>
        {camera === 'overview' ? 'Switch to front-wheel camera' : 'Switch to bay overview'}
      </Button>
      {stage === 'review' && (
        <Button to="/review" block>
          Review recommended repairs
        </Button>
      )}
    </>
  );
}
