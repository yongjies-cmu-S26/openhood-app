import type { Message } from '../data/types';
import { VISIT } from '../data/visit';
import { VoiceNote } from './VoiceNote';

export function ChatBubble({ message }: { message: Message }) {
  const mine = message.from === 'customer';
  const who = mine ? 'You' : `${VISIT.technician.name} · ${VISIT.technician.role}`;
  return (
    <div className={`oh-bubble ${mine ? 'oh-bubble--me' : 'oh-bubble--them'}`}>
      <span className="oh-bubble__who">
        {who} · {message.at}
      </span>
      {message.kind === 'voice' ? (
        <>
          <VoiceNote durationSec={message.durationSec ?? 6} audioUrl={message.audioUrl} speakText={mine ? undefined : message.text} />
          <p className="bubble-transcript">{mine ? message.text : `“${message.text}”`}</p>
        </>
      ) : (
        <span className="bubble-text">{message.text}</span>
      )}
    </div>
  );
}
