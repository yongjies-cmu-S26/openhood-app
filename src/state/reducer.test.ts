import { reducer, initialState, type State } from './reducer';
import { loadState, saveState, STORAGE_KEY } from './storage';

test('decide, change and clear a decision', () => {
  let s = reducer(initialState, { type: 'decide', id: 'brake-pads', decision: 'approved' });
  expect(s.decisions).toEqual({ 'brake-pads': 'approved' });
  s = reducer(s, { type: 'decide', id: 'brake-pads', decision: 'declined' });
  expect(s.decisions).toEqual({ 'brake-pads': 'declined' });
  s = reducer(s, { type: 'decide', id: 'brake-pads', decision: null });
  expect(s.decisions).toEqual({});
});

test('add message, mark seen once, reset', () => {
  let s = reducer(initialState, { type: 'addMessage', message: { id: 'x', from: 'customer', kind: 'text', text: 'Hi', at: '10:00' } });
  expect(s.messages.at(-1)?.text).toBe('Hi');
  s = reducer(s, { type: 'markSeen', id: 'tire-tread' });
  s = reducer(s, { type: 'markSeen', id: 'tire-tread' });
  expect(s.seen).toEqual(['tire-tread']);
  expect(reducer(s, { type: 'reset' })).toBe(initialState);
});

test('save and load round trip', () => {
  const s: State = { ...initialState, decisions: { 'tire-tread': 'approved' } };
  expect(saveState(s, localStorage)).toBe(true);
  expect(loadState(localStorage)).toEqual(s);
});

test('bad or missing saved data falls back to the initial state', () => {
  expect(loadState(localStorage)).toBe(initialState);
  localStorage.setItem(STORAGE_KEY, '{not json');
  expect(loadState(localStorage)).toBe(initialState);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ decisions: { 'brake-pads': 'maybe' }, messages: [], seen: [] }));
  expect(loadState(localStorage)).toBe(initialState);
  expect(loadState(null)).toBe(initialState);
  expect(saveState(initialState, null)).toBe(false);
});
