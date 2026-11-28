import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../components/Icon';
import { StatusChip } from '../components/StatusChip';
import { VISIT } from '../data/visit';
import { statusCounts, visitStage } from '../state/selectors';
import { useVisit } from '../state/VisitContext';
import { currentConfirmation } from '../state/workflow';

const STAGES = ['Check-in', 'Inspect', 'Your review', 'Repair', 'Pickup'];
const STAGE_INDEX = { review: 2, repair: 3, pickup: 4 } as const;
const STAGE_TITLE = { review: 'Waiting for your review', repair: 'Repair in progress', pickup: 'Ready for pickup' } as const;

const ROWS: { to: string; icon: IconName; title: string; sub: string }[] = [
  { to: '/ask', icon: 'chat', title: 'Ask your technician', sub: 'Plain-language answers by text or voice.' },
  { to: '/live', icon: 'video', title: 'Watch the bay live', sub: 'Switch camera angles during repair.' },
  { to: '/review', icon: 'clipboard', title: 'Review & approve repairs', sub: 'Evidence, urgency and cost for each item.' },
  { to: '/wait/brake-pads', icon: 'clock', title: 'Can this repair wait?', sub: 'Compare timing, risk and estimated cost.' },
];

export default function Home() {
  const { state } = useVisit();
  const stage = visitStage(currentConfirmation(state.workflow)?.decisions ?? {});
  const current = STAGE_INDEX[stage];
  const counts = statusCounts();

  return (
    <>
      <div className="page-head">
        <div className="oh-label">Your visit</div>
        <h1 className="oh-h1">Hi, {VISIT.customerFirstName}.</h1>
        <p className="oh-small">{VISIT.vehicle} · Inspection ready</p>
      </div>

      <section className="oh-panel stack" aria-label="Visit progress">
        <div className="stage-head">
          <span className="oh-h3">{STAGE_TITLE[stage]}</span>
          <span className="oh-caption">
            {current + 1} of {STAGES.length}
          </span>
        </div>
        <ol className="oh-stages">
          {STAGES.map((s, i) => (
            <li key={s} className={i < current ? 'is-done' : undefined} aria-current={i === current ? 'step' : undefined}>
              {s}
            </li>
          ))}
        </ol>
      </section>

      <Link className="oh-hero" to="/inspect">
        <span className="oh-label">Multi-point inspection</span>
        <span className="oh-h2 hero-title">
          Inspect damage in 3D <Icon name="arrow-up-right" />
        </span>
        <span className="oh-cluster">
          <StatusChip tone="attention" label={`${counts.attention} needs attention`} />
          <StatusChip tone="soon" label={`${counts.soon} plan soon`} />
        </span>
      </Link>

      <nav className="oh-list" aria-label="Visit actions">
        {ROWS.map((r) => (
          <Link key={r.to} className="oh-list__row" to={r.to}>
            <Icon name={r.icon} />
            <span>
              <span className="oh-list__title">{r.title}</span>
              <span className="oh-list__sub">{r.sub}</span>
            </span>
            <Icon name="chevron-right" size={16} />
          </Link>
        ))}
      </nav>
      <div className="oh-cluster">
        <p className="oh-caption">Sample visit · demo data</p>
        <Link to="/advisor" className="oh-plain-link">Advisor workspace</Link>
      </div>
    </>
  );
}
