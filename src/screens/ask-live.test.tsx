import { act, screen } from '@testing-library/react';
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

test('live view switches camera and reflects decisions', async () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ decisions: { 'brake-pads': 'approved', 'tire-tread': 'declined' }, messages: [], seen: [] }));
  renderApp('/live');
  expect(screen.getByText('Repair in progress')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Switch to front-wheel camera' }));
  expect(screen.getByText('Camera 2 · Front-wheel camera')).toBeInTheDocument();
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
