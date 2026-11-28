import { lazy, Suspense, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { FindingCard } from '../components/FindingCard';
import { Notice } from '../components/Notice';
import { FINDINGS } from '../data/findings';
import type { FindingId } from '../data/types';
import { VISIT } from '../data/visit';
import { useVisit } from '../state/VisitContext';

const VehicleModelViewer = lazy(() => import('../components/VehicleModelViewer'));

export default function Inspect() {
  const { state } = useVisit();
  const [params] = useSearchParams();
  const [selectedId, setSelectedId] = useState<FindingId>('brake-pads');

  const fallback = (
    <Notice title="3D model unavailable">You can still review every finding and photo in the list view.</Notice>
  );

  return (
    <>
      <BackLink to="/" label="Main page" />
      <div className="page-head">
        <div className="oh-label">{VISIT.vehicle}</div>
        <h1 className="oh-h1">Explore your vehicle</h1>
      </div>
      {params.get('model') === 'off' ? (
        fallback
      ) : (
        <ErrorBoundary fallback={fallback}>
          <Suspense fallback={<div className="oh-panel oh-small">Loading 3D vehicle model…</div>}>
            <VehicleModelViewer selectedId={selectedId} onSelect={setSelectedId} fallback={fallback} />
          </Suspense>
        </ErrorBoundary>
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
