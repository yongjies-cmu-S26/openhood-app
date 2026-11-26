import type { Decision, Decisions, FindingId, Message } from '../data/types';

export interface State {
  decisions: Decisions;
  messages: Message[];
  seen: FindingId[];
}

export type Action =
  | { type: 'decide'; id: FindingId; decision: Decision | null }
  | { type: 'addMessage'; message: Message }
  | { type: 'markSeen'; id: FindingId }
  | { type: 'reset' };

export const SEED_MESSAGES: Message[] = [
  { id: 'seed-1', from: 'customer', kind: 'text', text: 'Hi Miguel, I have a question about the front pads.', at: '11:28 AM' },
  {
    id: 'seed-2',
    from: 'technician',
    kind: 'voice',
    text: 'The front pads are worn thin. Replacing both front pads helps restore consistent braking.',
    at: '11:31 AM',
    durationSec: 7,
  },
];

export const initialState: State = { decisions: {}, messages: SEED_MESSAGES, seen: [] };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'decide': {
      const decisions: Decisions = { ...state.decisions };
      if (action.decision === null) delete decisions[action.id];
      else decisions[action.id] = action.decision;
      return { ...state, decisions };
    }
    case 'addMessage':
      return { ...state, messages: [...state.messages, action.message] };
    case 'markSeen':
      return state.seen.includes(action.id) ? state : { ...state, seen: [...state.seen, action.id] };
    case 'reset':
      return initialState;
  }
}
