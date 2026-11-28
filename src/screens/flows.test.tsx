import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/renderApp';
import { STORAGE_KEY } from '../state/storage';

test('approve brakes, decline tire → summary shows $260.00 approved', async () => {
  renderApp('/review/brake-pads');
  await userEvent.click(screen.getByRole('button', { name: 'Approve repair · $260' }));
  const sheet = screen.getByRole('dialog', { name: 'Approve front brake pads?' });
  await userEvent.click(within(sheet).getByRole('button', { name: 'Approve · $260' }));
  // next undecided item opens
  expect(screen.getByRole('heading', { name: 'Rear tire tread' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Decline this repair' }));
  expect(screen.getByRole('heading', { name: 'Review your decisions' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Confirm decisions' }));
  expect(screen.getByText('Repair approved')).toBeInTheDocument();
  expect(screen.getByTestId('approved-total')).toHaveTextContent('$260.00');
  expect(screen.getByText('Rear tire tread', { selector: '.declined-item' })).toBeInTheDocument();
});

test('declining both shows the nothing-approved summary', async () => {
  renderApp('/review/brake-pads');
  await userEvent.click(screen.getByRole('button', { name: 'Decline this repair' }));
  await userEvent.click(screen.getByRole('button', { name: 'Decline this repair' }));
  await userEvent.click(screen.getByRole('button', { name: 'Confirm decisions' }));
  expect(screen.getByText('Decisions saved')).toBeInTheDocument();
  expect(screen.getByText('No repairs approved. Your car will be ready for pickup.')).toBeInTheDocument();
});

test('done with no decisions shows the empty state', () => {
  renderApp('/done');
  expect(screen.getByRole('heading', { name: 'You haven’t decided yet' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Review repairs' })).toHaveAttribute('href', '/review');
});

test('the partial summary directs the customer to the remaining choice', () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ decisions: { 'brake-pads': 'approved' }, messages: [], seen: [] }));
  renderApp('/done');

  expect(screen.getByRole('heading', { name: 'Review your decisions' })).toHaveClass('oh-h1');
  expect(screen.getByText('Decide on every repair before sending your choices to the service advisor.')).toBeVisible();
  expect(screen.getByRole('link', { name: 'Decide on rear tire tread' })).toHaveAttribute('href', '/review/tire-tread');
  expect(screen.queryByRole('button', { name: 'Confirm decisions' })).not.toBeInTheDocument();
});

test('the final choice waits for the storage lock before opening the summary', async () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ decisions: { 'brake-pads': 'approved' }, messages: [], seen: [] }));
  let hold: Promise<void> | undefined;
  let release: (() => void) | undefined;
  const original = Object.getOwnPropertyDescriptor(window.navigator, 'locks');
  Object.defineProperty(window.navigator, 'locks', {
    configurable: true,
    value: { request: async (_key: string, callback: () => unknown) => {
      await hold;
      return callback();
    } },
  });
  try {
    await act(async () => { renderApp('/review/tire-tread'); });
    hold = new Promise<void>((resolve) => { release = resolve; });
    await userEvent.click(screen.getByRole('button', { name: 'Decline this repair' }));
    expect(screen.getByRole('button', { name: 'Decline this repair' })).toBeDisabled();
    expect(screen.queryByRole('heading', { name: 'Review your decisions' })).not.toBeInTheDocument();

    await act(async () => { release?.(); });
    expect(screen.getByRole('button', { name: 'Confirm decisions' })).toBeVisible();
    expect(screen.queryByText('1 item still needs a decision')).not.toBeInTheDocument();
  } finally {
    release?.();
    if (original) Object.defineProperty(window.navigator, 'locks', original);
    else Reflect.deleteProperty(window.navigator, 'locks');
  }
});

test('confirmed choices are read-only on the summary and review routes', async () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ decisions: { 'brake-pads': 'approved', 'tire-tread': 'declined' }, messages: [], seen: [] }));
  const app = renderApp('/done');
  await userEvent.click(screen.getByRole('button', { name: 'Confirm decisions' }));
  expect(screen.queryByRole('link', { name: 'Change decisions' })).not.toBeInTheDocument();
  app.unmount();

  const review = renderApp('/review');
  expect(screen.queryByRole('button', { name: /Change decision/ })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View confirmation' })).toBeVisible();
  review.unmount();

  renderApp('/review/brake-pads');
  expect(screen.getByText('This choice is part of your confirmed decisions.')).toBeVisible();
  expect(screen.queryByRole('button', { name: /Change decision/ })).not.toBeInTheDocument();
});

test('decisions persist across a reload and can be changed', async () => {
  const first = renderApp('/review/brake-pads');
  await userEvent.click(screen.getByRole('button', { name: 'Approve repair · $260' }));
  await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Approve · $260' }));
  first.unmount();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).decisions).toEqual({ 'brake-pads': 'approved' });

  renderApp('/review');
  expect(screen.getByTestId('approved-total')).toHaveTextContent('$260.00');
  await userEvent.click(screen.getByRole('button', { name: 'Change decision for Front brake pads' }));
  expect(screen.getByTestId('approved-total')).toHaveTextContent('$0.00');
});

test('closing the sheet with Go back records nothing', async () => {
  renderApp('/review/brake-pads');
  await userEvent.click(screen.getByRole('button', { name: 'Approve repair · $260' }));
  await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Go back' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(localStorage.getItem(STORAGE_KEY)).toContain('"decisions":{}');
});
