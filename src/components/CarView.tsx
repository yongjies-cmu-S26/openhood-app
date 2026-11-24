import { FINDINGS } from '../data/findings';
import type { FindingId, View } from '../data/types';
import { STATUS_LABEL } from './StatusChip';

interface Props {
  view: View;
  zoomed: boolean;
  selectedId: FindingId;
  onSelect: (id: FindingId) => void;
  caption?: string;
}

const VIEW_LABEL: Record<View, string> = {
  'front-left': 'Car seen from the front left',
  'rear-right': 'Car seen from the rear right',
};

export function CarView({ view, zoomed, selectedId, onSelect, caption }: Props) {
  const selected = FINDINGS.find((f) => f.id === selectedId)!.markers[view];
  // Keep the far-side target reachable when zooming in on the left marker.
  const zoomOrigin = `max(40%, ${(selected.x / 320) * 100}%) ${(selected.y / 200) * 100}%`;
  return (
    <div className={`car-view${zoomed ? ' is-zoomed' : ''}`}>
      <div className="car-view__stage" style={{ transformOrigin: zoomOrigin }}>
        <svg className="car-svg" viewBox="0 0 320 200" role="img" aria-label={VIEW_LABEL[view]}>
          <ellipse className="car-shadow" cx="160" cy="172" rx="140" ry="12" />
          <g transform={view === 'rear-right' ? 'translate(320 0) scale(-1 1)' : undefined}>
            <path
              className="car-body"
              d="M30 140 L40 110 Q46 98 64 96 L110 92 L140 64 Q148 56 162 56 L222 56 Q236 56 246 66 L274 96 Q292 100 294 116 L296 140 Q296 152 284 152 L42 152 Q30 152 30 140 Z"
            />
            <path className="car-glass" d="M118 92 L146 66 Q150 62 158 62 L194 62 L194 92 Z" />
            <path className="car-glass" d="M202 62 L222 62 Q232 62 240 70 L262 92 L202 92 Z" />
            <path className="car-line" d="M198 94 L198 146 M120 96 L120 146 M44 120 L292 120" />
            {view === 'front-left' ? (
              <rect className="car-light" x="34" y="112" width="18" height="8" rx="3" />
            ) : (
              <rect className="car-light" x="34" y="104" width="12" height="14" rx="2" />
            )}
            <circle className="car-tire" cx="88" cy="150" r="24" />
            <circle className="car-rim" cx="88" cy="150" r="11" />
            <circle className="car-tire" cx="242" cy="150" r="24" />
            <circle className="car-rim" cx="242" cy="150" r="11" />
          </g>
        </svg>
        {FINDINGS.map((f) => {
          const m = f.markers[view];
          const isSelected = f.id === selectedId;
          return (
            <button
              key={f.id}
              type="button"
              className={`car-marker car-marker--${f.status}${m.far ? ' is-far' : ''}${isSelected ? ' is-selected' : ''}`}
              style={{ left: `${(m.x / 320) * 100}%`, top: `${(m.y / 200) * 100}%` }}
              aria-pressed={isSelected}
              aria-label={`Finding ${f.number}, ${f.title}, ${STATUS_LABEL[f.status]}${m.far ? ', far side' : ''}`}
              onClick={() => onSelect(f.id)}
            >
              <span className="car-marker__badge" aria-hidden="true">{f.number}</span>
            </button>
          );
        })}
      </div>
      {caption && <p className="car-view__caption oh-label">{caption}</p>}
    </div>
  );
}
