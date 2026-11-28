import { useEffect, useRef, useState } from 'react';
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { CarView } from '../components/CarView';
import { Notice } from '../components/Notice';
import { FINDINGS } from '../data/findings';
import { VISIT } from '../data/visit';
import { visitStage } from '../state/selectors';
import { useVisit } from '../state/VisitContext';
import { CAMERA_LABELS, currentConfirmation } from '../state/workflow';

type FeedStatus = 'showing' | 'waiting' | 'unavailable' | 'reconnecting';

export default function Live() {
  const { state, dispatch } = useVisit();
  const [feedStatus, setFeedStatus] = useState<FeedStatus>('showing');
  const [camera, setCamera] = useState(state.live.camera);
  const timer = useRef<number | undefined>(undefined);
  const confirmed = currentConfirmation(state.workflow)?.decisions ?? {};
  const stage = visitStage(confirmed);
  const approved = FINDINGS.filter((f) => confirmed[f.id] === 'approved').map((f) => f.title.toLowerCase());
  const connectionPending = feedStatus === 'waiting' || feedStatus === 'reconnecting';

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function switchCamera() {
    const next = camera === 'overview' ? 'front-wheel' : 'overview';
    setCamera(next);
    dispatch({ type: 'select-camera', camera: next });
  }

  function recordOutage() {
    dispatch({ type: 'record-camera-outage', outage: { bay: VISIT.bay, camera, at: Date.now() } });
    setFeedStatus('unavailable');
  }

  function simulateLoss() {
    setFeedStatus('waiting');
    timer.current = window.setTimeout(recordOutage, 10_000);
  }

  function retry() {
    setFeedStatus('reconnecting');
    timer.current = window.setTimeout(() => {
      dispatch({ type: 'select-camera', camera });
      setFeedStatus('showing');
    }, 650);
  }

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
        {feedStatus === 'showing' && (
          <>
            <span className="feed__live">Sample live view</span>
            <CarView view="front-left" zoomed={camera === 'front-wheel'} selectedId="brake-pads" onSelect={() => {}} />
          </>
        )}
        <span className="oh-h3">{CAMERA_LABELS[camera]}</span>
        {feedStatus === 'showing' && <span className="oh-caption">Illustrative feed · No live camera connected</span>}
        {feedStatus === 'waiting' && <p className="oh-small" role="status">Waiting for the simulated camera signal…</p>}
        {feedStatus === 'unavailable' && (
          <Notice tone="error" title="Camera unavailable">
            The camera stopped sending a signal. Your current repair status is still available below.
          </Notice>
        )}
        {feedStatus === 'reconnecting' && <p className="oh-small" role="status">Reconnecting to the same camera…</p>}
      </section>
      <section className="oh-panel stack">
        <h2 className="oh-h3">{status.title}</h2>
        <p className="oh-small">{status.body}</p>
      </section>
      {feedStatus === 'showing' && (
        <Button variant="dark" block onClick={switchCamera}>
          {camera === 'overview' ? 'Switch to front-wheel camera' : 'Switch to bay overview'}
        </Button>
      )}
      <Button
        variant={feedStatus === 'unavailable' ? 'dark' : 'secondary'}
        block
        aria-disabled={connectionPending || undefined}
        onClick={connectionPending ? undefined : feedStatus === 'unavailable' ? retry : simulateLoss}
      >
        {feedStatus === 'unavailable' ? 'Try again' : connectionPending ? 'Camera connection pending' : 'Simulate connection loss'}
      </Button>
      {feedStatus === 'showing' && (
        <Button variant="secondary" block onClick={recordOutage}>Simulate camera startup failure</Button>
      )}
      {stage === 'review' && (
        <Button to="/review" block>
          Review recommended repairs
        </Button>
      )}
    </>
  );
}
