import { initialState, type State } from './reducer';

export const STORAGE_KEY = 'openhood.v1';
const IDS = ['brake-pads', 'tire-tread'];
const DECISIONS = ['approved', 'declined'];

export function safeStorage(): Storage | null {
  try {
    const s = window.localStorage;
    s.setItem('__oh_probe', '1');
    s.removeItem('__oh_probe');
    return s;
  } catch {
    return null;
  }
}

function isState(x: unknown): x is State {
  if (!x || typeof x !== 'object') return false;
  const s = x as Record<string, unknown>;
  const d = s.decisions;
  if (!d || typeof d !== 'object' || Array.isArray(d)) return false;
  for (const [k, v] of Object.entries(d)) {
    if (!IDS.includes(k) || !DECISIONS.includes(v as string)) return false;
  }
  if (!Array.isArray(s.messages) || !s.messages.every((m) => m && typeof m === 'object' && typeof (m as { text?: unknown }).text === 'string')) return false;
  if (!Array.isArray(s.seen) || !s.seen.every((id) => IDS.includes(id as string))) return false;
  return true;
}

export function loadState(storage: Storage | null = safeStorage()): State {
  if (!storage) return initialState;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed: unknown = JSON.parse(raw);
    return isState(parsed) ? parsed : initialState;
  } catch {
    return initialState;
  }
}

export function saveState(state: State, storage: Storage | null = safeStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
