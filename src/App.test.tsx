import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './App';

test('renders the app', () => {
  render(<MemoryRouter><AppRoutes /></MemoryRouter>);
  expect(screen.getByText('OpenHood')).toBeInTheDocument();
});
