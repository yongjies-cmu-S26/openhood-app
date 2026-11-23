import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/renderApp';
import { STORAGE_KEY } from '../state/storage';

test('home greets the customer and shows the current stage', () => {
  renderApp('/');
  expect(screen.getByRole('heading', { name: 'Hi, Priya.' })).toBeInTheDocument();
  expect(screen.getByText('Your review').closest('li')).toHaveAttribute('aria-current', 'step');
  expect(screen.getByRole('link', { name: /Ask your technician/ })).toHaveAttribute('href', '/ask');
});

test('finding detail links to help, timing and review', () => {
  renderApp('/findings/brake-pads');
  expect(screen.getByRole('heading', { name: 'Front brake pads' })).toBeInTheDocument();
  expect(screen.getByText('3 mm measured · minimum 4 mm')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'What is a brake pad?' })).toHaveAttribute('href', '/help/brake-pad');
  expect(screen.getByRole('link', { name: 'Review this repair' })).toHaveAttribute('href', '/review/brake-pads');
});

test('unknown finding id shows not found', () => {
  renderApp('/findings/nope');
  expect(screen.getByText('We couldn’t find that page')).toBeInTheDocument();
});

test('evidence and help pages render', () => {
  renderApp('/findings/tire-tread/evidence');
  expect(screen.getByRole('heading', { name: 'Evidence · Rear tire tread' })).toBeInTheDocument();
});

test('help term and reset demo', async () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ decisions: { 'brake-pads': 'approved' }, messages: [], seen: [] }));
  renderApp('/help');
  await userEvent.click(screen.getByRole('button', { name: 'Reset demo' }));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).decisions).toEqual({});
});

test('summary shows the total for all recommended repairs', () => {
  renderApp('/summary');
  expect(screen.getByTestId('summary-total')).toHaveTextContent('$495.00');
});
