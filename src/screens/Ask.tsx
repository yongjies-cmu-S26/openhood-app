import { useEffect, useRef, useState, type FormEvent } from 'react';
import { BackLink } from '../components/BackLink';
import { ChatBubble } from '../components/ChatBubble';
import { Icon } from '../components/Icon';
import { replyFor, SUGGESTED, GENERIC_REPLY } from '../data/techReplies';
import type { Message } from '../data/types';
import { VISIT } from '../data/visit';
import { useVisit } from '../state/VisitContext';

const nowLabel = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

export default function Ask() {
  const { state, dispatch } = useVisit();
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

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

  function sendVoice() {
    dispatch({ type: 'addMessage', message: { id: newId(), from: 'customer', kind: 'voice', text: 'Sample voice note', at: nowLabel(), durationSec: 6 } });
    scheduleReply(null);
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
      <form className="composer" onSubmit={onSubmit}>
        <input aria-label="Your question" placeholder="Type your question…" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button type="button" className="oh-btn oh-btn--secondary oh-btn--icon" aria-label="Send a sample voice note" onClick={sendVoice}>
          <Icon name="mic" size={18} />
        </button>
        <button type="submit" className="oh-btn oh-btn--primary oh-btn--icon" aria-label="Send question">
          <Icon name="send" size={18} />
        </button>
      </form>
    </>
  );
}
