import { screen } from '@testing-library/react';
import { renderApp } from './test/renderApp';

test('shell shows the top bar, RO tag and tab bar', () => {
  renderApp('/nowhere');
  expect(screen.getByRole('link', { name: 'OpenHood home' })).toBeInTheDocument();
  expect(screen.getByText('RO-1048')).toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
});

test('unknown routes show the not-found notice', () => {
  renderApp('/nowhere');
  expect(screen.getByText('We couldn’t find that page')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back to My car' })).toHaveAttribute('href', '/');
});

test('tab follows the route', () => {
  renderApp('/help');
  expect(screen.getByRole('link', { name: 'Help' })).toHaveAttribute('aria-current', 'page');
});
