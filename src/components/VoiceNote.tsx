import { useEffect, useState } from 'react';
import { Icon } from './Icon';

const BARS = [6, 10, 16, 12, 20, 14, 8, 18, 22, 12, 9, 15, 19, 11, 7, 13, 17, 10, 6, 12, 16, 9, 14, 8];

function clock(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function VoiceNote({ durationSec }: { durationSec: number }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      setElapsed((e) => {
        if (e + 0.25 >= durationSec) {
          setPlaying(false);
          return 0;
        }
        return e + 0.25;
      });
    }, 250);
    return () => window.clearInterval(t);
  }, [playing, durationSec]);

  const progress = elapsed / durationSec;
  return (
    <div className="voice">
      <button type="button" className="voice__play" aria-label={playing ? 'Pause voice note' : 'Play voice note'} onClick={() => setPlaying((p) => !p)}>
        <Icon name={playing ? 'pause' : 'play'} size={14} />
      </button>
      <span className="voice__wave" aria-hidden="true">
        {BARS.map((h, i) => (
          <i key={i} className={i / BARS.length < progress ? 'is-on' : undefined} style={{ height: h }} />
        ))}
      </span>
      <span className="voice__time">{clock(playing ? durationSec - elapsed : durationSec)}</span>
    </div>
  );
}
