import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/renderApp';

test('tapping marker 2 selects the rear tire tread', async () => {
  renderApp('/inspect');
  const marker = screen.getByRole('button', { name: /Finding 2, Rear tire tread, Plan soon/ });
  await userEvent.click(marker);
  expect(marker).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('link', { name: /Rear tire tread/ })).toHaveAttribute('aria-current', 'true');
});

test('rotating the view swaps near and far markers', async () => {
  renderApp('/inspect');
  expect(screen.getByRole('button', { name: /Finding 2, Rear tire tread, Plan soon, far side/ })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Rear-right view' }));
  expect(screen.getByRole('button', { name: /Finding 1, Front brake pads, Needs attention, far side/ })).toBeInTheDocument();
});

test('model=off shows the model-unavailable fallback', () => {
  renderApp('/inspect?model=off');
  expect(screen.getByText('3D model unavailable')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Front brake pads/ })).toBeInTheDocument();
});

test('findings list shows both findings', () => {
  renderApp('/findings');
  expect(screen.getByRole('heading', { name: 'Your findings' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /Front brake pads|Rear tire tread/ })).toHaveLength(2);
});
