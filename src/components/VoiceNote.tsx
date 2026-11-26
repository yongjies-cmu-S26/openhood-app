import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

const BARS = [6, 10, 16, 12, 20, 14, 8, 18, 22, 12, 9, 15, 19, 11, 7, 13, 17, 10, 6, 12, 16, 9, 14, 8];
const TICK_MS = 250;

function clock(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang === 'en-US' && v.localService) ?? voices.find((v) => v.lang.startsWith('en'));
}

/**
 * Plays a voice note.
 * - `audioUrl`: a real recording (the customer's own voice question).
 * - `speakText`: read aloud with the browser's speech synthesis (scripted technician replies).
 * - neither: falls back to a silent progress animation.
 */
export function VoiceNote({ durationSec, audioUrl, speakText }: { durationSec: number; audioUrl?: string; speakText?: string }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const speaking = useRef(false);

  const stop = () => {
    if (audio.current) {
      audio.current.pause();
      audio.current.currentTime = 0;
    }
    if (speaking.current && speechSupported()) window.speechSynthesis.cancel();
    speaking.current = false;
    setPlaying(false);
    setElapsed(0);
  };

  // Progress clock. Real audio and speech end the note themselves; the silent fallback ends at durationSec.
  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      if (audio.current && audioUrl) {
        setElapsed(audio.current.currentTime);
        return;
      }
      setElapsed((e) => {
        const next = e + TICK_MS / 1000;
        if (!speaking.current && next >= durationSec) {
          window.setTimeout(stop, 0);
          return 0;
        }
        return Math.min(next, durationSec);
      });
    }, TICK_MS);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, durationSec, audioUrl]);

  // Stop any sound when the note leaves the screen.
  useEffect(() => () => {
    audio.current?.pause();
    if (speaking.current && speechSupported()) window.speechSynthesis.cancel();
  }, []);

  function start() {
    if (audioUrl) {
      if (!audio.current) {
        audio.current = new Audio(audioUrl);
        audio.current.onended = stop;
      }
      audio.current.play().catch(stop);
    } else if (speakText && speechSupported()) {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(speakText);
      u.lang = 'en-US';
      const voice = pickVoice();
      if (voice) u.voice = voice;
      u.onend = () => {
        if (speaking.current) stop();
      };
      u.onerror = () => {
        if (speaking.current) stop();
      };
      speaking.current = true;
      synth.speak(u);
    }
    setElapsed(0);
    setPlaying(true);
  }

  const progress = durationSec > 0 ? elapsed / durationSec : 0;
  return (
    <div className="voice">
      <button type="button" className="voice__play" aria-label={playing ? 'Stop voice note' : 'Play voice note'} onClick={() => (playing ? stop() : start())}>
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
