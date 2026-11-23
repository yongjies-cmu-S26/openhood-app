import type { FindingId } from '../data/types';

export function EvidenceDiagram({ id }: { id: FindingId }) {
  if (id === 'brake-pads') {
    return (
      <div className="evidence">
        <svg viewBox="0 0 320 170" role="img" aria-label="Brake cross-section: the inner pad is worn to 3 millimeters">
          <rect className="ev-dark" x="96" y="20" width="104" height="14" />
          <rect className="ev-dark" x="96" y="20" width="14" height="112" />
          <rect className="ev-dark" x="186" y="20" width="14" height="112" />
          <rect className="ev-paper" x="114" y="40" width="20" height="88" />
          <rect className="ev-worn" x="134" y="40" width="7" height="88" />
          <rect className="ev-part" x="145" y="30" width="10" height="120" />
          <rect className="ev-paper" x="159" y="40" width="9" height="88" />
          <rect className="ev-paper" x="168" y="40" width="14" height="88" />
          <path className="ev-leader" d="M200 26 L236 26" />
          <text className="ev-label" x="240" y="30">Caliper</text>
          <path className="ev-leader" d="M137 84 L70 84" />
          <text className="ev-label ev-label--alert" x="12" y="80">Worn pad</text>
          <text className="ev-label ev-label--alert" x="12" y="94">3 mm</text>
          <path className="ev-leader" d="M150 150 L150 162 L176 162" />
          <text className="ev-label" x="180" y="166">Brake disc</text>
          <path className="ev-leader" d="M175 84 L236 84" />
          <text className="ev-label" x="240" y="80">Good pad</text>
          <text className="ev-label" x="240" y="94">9 mm</text>
        </svg>
      </div>
    );
  }
  return (
    <div className="evidence">
      <svg viewBox="0 0 320 170" role="img" aria-label="Tire tread close-up: grooves worn to 3/32 inch, near the wear bar">
        <rect className="ev-dark" x="70" y="14" width="180" height="142" rx="22" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} className="ev-part" x={88 + i * 32} y="24" width="16" height="122" rx="3" />
        ))}
        <rect className="ev-wear" x="88" y="78" width="144" height="8" />
        <path className="ev-leader" d="M232 82 L262 82" />
        <text className="ev-label" x="266" y="78">Wear bar</text>
        <text className="ev-label ev-label--alert" x="266" y="92">3/32 in</text>
        <path className="ev-leader" d="M96 30 L50 30" />
        <text className="ev-label" x="4" y="34">Groove</text>
      </svg>
    </div>
  );
}
