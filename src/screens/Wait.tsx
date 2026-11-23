import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { FindingStatusChip } from '../components/StatusChip';
import { TimingPicker } from '../components/TimingPicker';
import { FINDINGS, getFinding } from '../data/findings';
import type { TimingKey } from '../data/types';
import { VISIT } from '../data/visit';
import NotFound from './NotFound';

export default function Wait() {
  const finding = getFinding(useParams().id);
  const [key, setKey] = useState<TimingKey>('now');
  if (!finding) return <NotFound />;
  const option = finding.timing.find((t) => t.key === key)!;
  const other = FINDINGS.find((f) => f.id !== finding.id)!;

  return (
    <>
      <BackLink to="/" label="Main page" />
      <div className="page-head">
        <h1 className="oh-h1">Can this repair wait?</h1>
        <p className="oh-small">
          {finding.title} · Recommended by {VISIT.technician.name}
        </p>
        <FindingStatusChip status={finding.status} />
      </div>
      <section className="oh-panel stack">
        <h2 className="oh-h3">What is wrong?</h2>
        <p className="oh-small">{finding.whatIsWrong}</p>
        <h2 className="oh-h3">Impact</h2>
        <p className="oh-small">{finding.impact}</p>
        <h2 className="oh-h3">What is recommended?</h2>
        <p className="oh-small">{finding.recommendation}</p>
      </section>
      <section className="oh-panel stack">
        <h2 className="oh-h3">Drag or tap to compare timing</h2>
        <TimingPicker options={finding.timing} value={key} onChange={setKey} label="Repair timing" />
      </section>
      <section className="oh-panel stack" aria-live="polite">
        <h2 className="oh-h3">{option.label === 'Now' ? 'Now · repair today' : `In ${option.label}`}</h2>
        <span className="oh-label">Risk</span>
        <p className="oh-small">{option.risk}</p>
        <span className="oh-label">Estimated repair cost</span>
        <p className="oh-price">{option.costText}</p>
        <p className="oh-caption">Illustrative risk · Timing varies with actual condition</p>
      </section>
      <Button to={`/review/${finding.id}`} block>
        Review repair and cost
      </Button>
      <Button variant="secondary" to="/ask" block>
        Ask your technician
      </Button>
      <Button variant="text" to={`/wait/${other.id}`}>
        Compare: {other.title}
      </Button>
    </>
  );
}
