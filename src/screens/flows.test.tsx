import { screen, within } from '@testing-library/react';
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
