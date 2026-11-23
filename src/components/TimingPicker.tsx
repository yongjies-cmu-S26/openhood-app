import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import type { TimingKey, TimingOption } from '../data/types';

const TONE_COLOR = { ok: 'var(--oh-teal)', soon: 'var(--oh-amber)', attention: 'var(--oh-red)' } as const;

interface Props {
  options: TimingOption[];
  value: TimingKey;
  onChange: (key: TimingKey) => void;
  label: string;
}

export function TimingPicker({ options, value, onChange, label }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = options.findIndex((o) => o.key === value);
    const next = (i + step + options.length) % options.length;
    onChange(options[next].key);
    refs.current[next]?.focus();
  }

  return (
    <div className="oh-timing" role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      {options.map((o, i) => (
        <button
          key={o.key}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={o.key === value}
          tabIndex={o.key === value ? 0 : -1}
          style={{ '--c': TONE_COLOR[o.tone] } as CSSProperties}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
