import type { Decision, Decisions, FindingId, Message } from '../data/types';
import { confirmDecisions, createWorkflow, sendInspectionUpdate, type Camera, type CameraOutage, type LiveSession, type Workflow } from './workflow';

export interface State {
  decisions: Decisions;
  messages: Message[];
  seen: FindingId[];
  workflow: Workflow;
  live: LiveSession;
}

export type Action =
  | { type: 'decide'; id: FindingId; decision: Decision | null }
  | { type: 'addMessage'; message: Message }
  | { type: 'markSeen'; id: FindingId }
  | { type: 'send-inspection-update'; id: string; at: number }
  | { type: 'confirm-decisions'; at: number }
  | { type: 'read-advisor-notifications' }
  | { type: 'select-camera'; camera: Camera }
  | { type: 'record-camera-outage'; outage: CameraOutage }
  | { type: 'reset'; at?: number };

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

export const initialState: State = {
  decisions: {},
  messages: SEED_MESSAGES,
  seen: [],
  workflow: createWorkflow(Date.now()),
  live: { camera: 'overview', outages: [] },
};

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
    case 'send-inspection-update': {
      const workflow = sendInspectionUpdate(state.workflow, action.id, action.at);
      return workflow === state.workflow ? state : { ...state, workflow };
    }
    case 'confirm-decisions': {
      const workflow = confirmDecisions(state.workflow, state.decisions, action.at);
      return workflow === state.workflow ? state : { ...state, workflow };
    }
    case 'read-advisor-notifications':
      return {
        ...state,
        workflow: {
          ...state.workflow,
          notifications: state.workflow.notifications.map((notification) => ({ ...notification, unread: false })),
        },
      };
    case 'select-camera':
      return { ...state, live: { ...state.live, camera: action.camera } };
    case 'record-camera-outage':
      return { ...state, live: { ...state.live, outages: [...state.live.outages, action.outage] } };
    case 'reset':
      return action.at === undefined ? initialState : { ...initialState, workflow: createWorkflow(action.at) };
  }
}
