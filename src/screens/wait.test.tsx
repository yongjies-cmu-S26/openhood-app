import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/renderApp';

test('picking 6 months shows the matching risk and cost', async () => {
  renderApp('/wait/brake-pads');
  expect(screen.getByRole('radio', { name: 'Now' })).toHaveAttribute('aria-checked', 'true');
  await userEvent.click(screen.getByRole('radio', { name: '6 months' }));
  expect(screen.getByText('Metal can reach the rotor, and the rotor may need replacing.')).toBeInTheDocument();
  expect(screen.getByText('Est. $310–$520')).toBeInTheDocument();
});

test('arrow keys move the selection', async () => {
  renderApp('/wait/tire-tread');
  screen.getByRole('radio', { name: 'Now' }).focus();
  await userEvent.keyboard('{ArrowRight}');
  expect(screen.getByRole('radio', { name: '3 months' })).toHaveAttribute('aria-checked', 'true');
  expect(screen.getByRole('radio', { name: '3 months' })).toHaveFocus();
});

test('unknown id shows not found', () => {
  renderApp('/wait/nope');
  expect(screen.getByText('We couldn’t find that page')).toBeInTheDocument();
});
