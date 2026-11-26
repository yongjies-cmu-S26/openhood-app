import { useEffect, useRef, useState, type FormEvent } from 'react';
import { BackLink } from '../components/BackLink';
import { ChatBubble } from '../components/ChatBubble';
import { Icon } from '../components/Icon';
import { replyFor, SUGGESTED, GENERIC_REPLY } from '../data/techReplies';
import type { Message } from '../data/types';
import { VISIT } from '../data/visit';
import { useVisit } from '../state/VisitContext';

const nowLabel = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const MAX_RECORDING_SEC = 60;

function micSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof window.MediaRecorder === 'function';
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

function clock(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

export default function Ask() {
  const { state, dispatch } = useVisit();
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [recordingSec, setRecordingSec] = useState<number | null>(null);
  const [micNote, setMicNote] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const keep = useRef(false);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      keep.current = false;
      if (recorder.current?.state === 'recording') recorder.current.stop();
    },
    [],
  );

  // Recording clock, with an automatic stop at the length limit.
  useEffect(() => {
    if (recordingSec === null) return;
    const t = window.setInterval(() => {
      const sec = Math.floor((Date.now() - startedAt.current) / 1000);
      setRecordingSec(sec);
      if (sec >= MAX_RECORDING_SEC) stopRecording(true);
    }, 250);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingSec === null]);

  function scheduleReply(question: string | null) {
    const reply = question === null ? GENERIC_REPLY : replyFor(question);
    setTyping(true);
    timers.current.push(
      window.setTimeout(() => {
        const message: Message = {
          id: newId(),
          from: 'technician',
          kind: reply.durationSec > 0 ? 'voice' : 'text',
          text: reply.text,
          at: nowLabel(),
          durationSec: reply.durationSec > 0 ? reply.durationSec : undefined,
        };
        dispatch({ type: 'addMessage', message });
        setTyping(false);
      }, 1200),
    );
  }

  function ask(text: string) {
    const clean = text.trim();
    if (!clean) return;
    dispatch({ type: 'addMessage', message: { id: newId(), from: 'customer', kind: 'text', text: clean, at: nowLabel() } });
    scheduleReply(clean);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    ask(draft);
    setDraft('');
  }

  function sendSampleVoice() {
    dispatch({ type: 'addMessage', message: { id: newId(), from: 'customer', kind: 'voice', text: 'Sample voice note', at: nowLabel(), durationSec: 6 } });
    scheduleReply(null);
  }

  async function startRecording() {
    setMicNote(null);
    if (!micSupported()) {
      setMicNote('Recording isn’t available in this browser, so a sample voice note was sent.');
      sendSampleVoice();
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicNote('Microphone access was blocked. Allow the microphone for this site to record, or type your question.');
      return;
    }
    const rec = new MediaRecorder(stream);
    chunks.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      recorder.current = null;
      const durationSec = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
      if (!keep.current || chunks.current.length === 0) return;
      const blob = new Blob(chunks.current, { type: rec.mimeType || 'audio/webm' });
      try {
        const audioUrl = await blobToDataUrl(blob);
        dispatch({ type: 'addMessage', message: { id: newId(), from: 'customer', kind: 'voice', text: 'Voice question', at: nowLabel(), durationSec, audioUrl } });
        scheduleReply(null);
      } catch {
        setMicNote('That recording couldn’t be saved. Please try again.');
      }
    };
    recorder.current = rec;
    startedAt.current = Date.now();
    rec.start();
    setRecordingSec(0);
  }

  function stopRecording(send: boolean) {
    keep.current = send;
    if (recorder.current?.state === 'recording') recorder.current.stop();
    setRecordingSec(null);
  }

  return (
    <>
      <BackLink to="/" label="Main page" />
      <div className="page-head">
        <h1 className="oh-h1">Ask your technician</h1>
        <p className="oh-small">Front brake pads · Simulated conversation</p>
      </div>
      <section className="oh-panel stack" style={{ background: 'var(--oh-blue-tint)', borderColor: 'transparent' }}>
        <h2 className="oh-h3">Front brake pads</h2>
        <span className="oh-label">
          {VISIT.technician.name} · {VISIT.technician.role}
        </span>
        <p className="oh-small">Replies may arrive later while the technician works on your car.</p>
      </section>
      <div className="chat-log" role="log" aria-live="polite" aria-label="Conversation">
        {state.messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {typing && <span className="typing">{VISIT.technician.name} is typing</span>}
      </div>
      <div className="oh-cluster">
        {SUGGESTED.map((q) => (
          <button key={q} type="button" className="oh-chip" onClick={() => ask(q)}>
            {q}
          </button>
        ))}
      </div>
      {recordingSec !== null ? (
        <div className="composer composer--recording" role="status">
          <span className="recording-dot" aria-hidden="true" />
          <span className="recording-label">
            Recording {clock(recordingSec)} / {clock(MAX_RECORDING_SEC)}
          </span>
          <button type="button" className="oh-btn oh-btn--secondary oh-btn--icon" aria-label="Cancel recording" onClick={() => stopRecording(false)}>
            <Icon name="x" size={18} />
          </button>
          <button type="button" className="oh-btn oh-btn--primary oh-btn--icon" aria-label="Send voice question" onClick={() => stopRecording(true)}>
            <Icon name="send" size={18} />
          </button>
        </div>
      ) : (
        <form className="composer" onSubmit={onSubmit}>
          <input aria-label="Your question" placeholder="Type your question…" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button type="button" className="oh-btn oh-btn--secondary oh-btn--icon" aria-label="Record a voice question" onClick={startRecording}>
            <Icon name="mic" size={18} />
          </button>
          <button type="submit" className="oh-btn oh-btn--primary oh-btn--icon" aria-label="Send question">
            <Icon name="send" size={18} />
          </button>
        </form>
      )}
      {micNote && <p className="oh-small" role="alert">{micNote}</p>}
    </>
  );
}
