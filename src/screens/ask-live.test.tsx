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
