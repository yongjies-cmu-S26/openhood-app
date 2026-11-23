import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { CarView } from '../components/CarView';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { FindingCard } from '../components/FindingCard';
import { Icon } from '../components/Icon';
import { Notice } from '../components/Notice';
import { FINDINGS } from '../data/findings';
import type { FindingId, View } from '../data/types';
import { useVisit } from '../state/VisitContext';

const VIEW_NAME: Record<View, string> = { 'front-left': 'Front left', 'rear-right': 'Rear right' };

export default function Inspect() {
  const { state } = useVisit();
  const [params] = useSearchParams();
  const [view, setView] = useState<View>('front-left');
  const [zoomed, setZoomed] = useState(false);
  const [selectedId, setSelectedId] = useState<FindingId>('brake-pads');
  const selected = FINDINGS.find((f) => f.id === selectedId)!;
  const otherView: View = view === 'front-left' ? 'rear-right' : 'front-left';

  const fallback = (
    <Notice title="3D model unavailable">You can still review every finding and photo in the list view.</Notice>
  );

  return (
    <>
      <BackLink to="/" label="Main page" />
      <div className="page-head">
        <h1 className="oh-h1">Explore your vehicle</h1>
        <p className="oh-small">Tap a finding. Dashed marker = far side.</p>
      </div>
      {params.get('model') === 'off' ? (
        fallback
      ) : (
        <>
          <ErrorBoundary fallback={fallback}>
            <CarView
              view={view}
              zoomed={zoomed}
              selectedId={selectedId}
              onSelect={setSelectedId}
              caption={`${VIEW_NAME[view]} view · Selected ${selected.number} · ${selected.location}`}
            />
          </ErrorBoundary>
          <div className="btn-row">
            <Button variant="secondary" small onClick={() => setView(otherView)}>
              <Icon name="rotate" size={16} />
              {VIEW_NAME[otherView].replace(' ', '-')} view
            </Button>
            <Button variant="secondary" small onClick={() => setZoomed((z) => !z)} aria-pressed={zoomed}>
              <Icon name={zoomed ? 'zoom-out' : 'zoom-in'} size={16} />
              {zoomed ? 'Zoom out' : 'Zoom in'}
            </Button>
          </div>
        </>
      )}
      <div className="stack">
        {FINDINGS.map((f) => (
          <FindingCard key={f.id} finding={f} to={`/findings/${f.id}`} selected={f.id === selectedId} decision={state.decisions[f.id]} />
        ))}
      </div>
      <Button variant="secondary" to="/findings" block>
        View findings as a list
      </Button>
    </>
  );
}
