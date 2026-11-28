import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/renderApp';
import { STORAGE_KEY } from '../state/storage';

afterEach(() => vi.useRealTimers());

test('a suggested question gets a scripted technician voice reply', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  renderApp('/ask');
  await user.click(screen.getByRole('button', { name: 'Why both pads?' }));
  expect(screen.getByText('Why both pads?', { selector: '.oh-bubble--me .bubble-text' })).toBeInTheDocument();
  expect(screen.getByText(/is typing/)).toBeInTheDocument();
  await act(async () => { vi.advanceTimersByTime(1300); });
  expect(screen.getByText(/Pads are replaced in pairs/)).toBeInTheDocument();
});

test('typed question is sent and the box clears', async () => {
  renderApp('/ask');
  const box = screen.getByRole('textbox', { name: 'Your question' });
  await userEvent.type(box, 'Is it safe to drive?{Enter}');
  expect(screen.getByText('Is it safe to drive?')).toBeInTheDocument();
  expect(box).toHaveValue('');
});

test('live view switches camera and reflects confirmed decisions', async () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ decisions: { 'brake-pads': 'approved', 'tire-tread': 'declined' }, messages: [], seen: [] }));
  renderApp('/done');
  await userEvent.click(screen.getByRole('button', { name: 'Confirm decisions' }));
  await userEvent.click(screen.getByRole('link', { name: 'Watch the bay live' }));
  expect(screen.getByText('Repair in progress')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Switch to front-wheel camera' }));
  expect(screen.getByText('Camera 2 · Front-wheel camera')).toBeInTheDocument();
});

test('a lost camera keeps repair status visible and retries the same angle', async () => {
  vi.useFakeTimers();
  const app = renderApp('/live');
  fireEvent.click(screen.getByRole('button', { name: 'Switch to front-wheel camera' }));
  fireEvent.click(screen.getByRole('button', { name: 'Simulate connection loss' }));
  expect(screen.getByRole('button', { name: 'Simulate connection loss' })).toBeDisabled();

  act(() => { vi.advanceTimersByTime(9_999); });
  expect(screen.queryByText('Camera unavailable')).not.toBeInTheDocument();
  act(() => { vi.advanceTimersByTime(1); });
  expect(screen.getByRole('alert')).toHaveTextContent('Camera unavailable');
  expect(screen.getByRole('heading', { name: 'Inspection complete' })).toBeVisible();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).live.outages).toEqual([
    { bay: 'Bay 02', camera: 'front-wheel', at: expect.any(Number) },
  ]);

  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  stored.live.camera = 'overview';
  act(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, storageArea: localStorage }));
  });
  expect(screen.getByText('Camera 2 · Front-wheel camera')).toBeVisible();

  fireEvent.click(screen.getByRole('button', { name: 'Reconnect camera' }));
  expect(screen.getByRole('button', { name: 'Reconnect camera' })).toBeDisabled();
  await act(async () => { vi.advanceTimersByTime(650); });
  expect(screen.getByText('Camera 2 · Front-wheel camera')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Switch to bay overview' })).toBeVisible();
  expect(screen.queryByText('Camera unavailable')).not.toBeInTheDocument();

  app.unmount();
  renderApp('/live');
  expect(screen.getByText('Camera 2 · Front-wheel camera')).toBeVisible();
});

test('a camera that cannot start immediately offers recovery and stores an outage', () => {
  renderApp('/live');
  fireEvent.click(screen.getByRole('button', { name: 'Simulate camera startup failure' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Camera unavailable');
  expect(screen.getByRole('button', { name: 'Reconnect camera' })).toBeVisible();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).live.outages).toEqual([
    { bay: 'Bay 02', camera: 'overview', at: expect.any(Number) },
  ]);
});

test('mic falls back to a sample voice note when recording is unavailable', async () => {
  renderApp('/ask');
  await userEvent.click(screen.getByRole('button', { name: 'Record a voice question' }));
  expect(screen.getByRole('alert')).toHaveTextContent(/sample voice note was sent/);
  expect(screen.getByText('Sample voice note', { selector: '.oh-bubble--me .bubble-transcript' })).toBeInTheDocument();
});

test('technician voice replies are read aloud', async () => {
  const speak = vi.fn();
  const cancel = vi.fn();
  vi.stubGlobal('speechSynthesis', { speak, cancel, getVoices: () => [] });
  vi.stubGlobal('SpeechSynthesisUtterance', class { text: string; lang = ''; constructor(t: string) { this.text = t; } });
  renderApp('/ask');
  await userEvent.click(screen.getByRole('button', { name: 'Play voice note' }));
  expect(speak).toHaveBeenCalledTimes(1);
  expect(speak.mock.calls[0][0].text).toMatch(/front pads are worn thin/);
  await userEvent.click(screen.getByRole('button', { name: 'Stop voice note' }));
  expect(cancel).toHaveBeenCalled();
  vi.unstubAllGlobals();
});
