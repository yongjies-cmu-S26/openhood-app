import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CostLines } from './CostLines';
import { FindingStatusChip, DecisionChip } from './StatusChip';
import { Button } from './Button';
import { FindingCard } from './FindingCard';
import { getFinding } from '../data/findings';

test('CostLines lists lines and computes the total', () => {
  render(<CostLines lines={getFinding('brake-pads')!.costLines} />);
  expect(screen.getByText('Labor · 1.0 hr')).toBeInTheDocument();
  expect(screen.getByTestId('cost-total')).toHaveTextContent('$260.00');
});

test('status chips always pair color with a word', () => {
  render(<><FindingStatusChip status="attention" /><FindingStatusChip status="soon" /><DecisionChip decision="declined" /></>);
  expect(screen.getByText('Needs attention')).toHaveClass('oh-status--red');
  expect(screen.getByText('Plan soon')).toHaveClass('oh-status--amber');
  expect(screen.getByText('Declined')).toHaveClass('oh-status--info');
});

test('Button renders a link when given "to"', () => {
  render(<MemoryRouter><Button to="/review">Review</Button><Button variant="secondary">Plain</Button></MemoryRouter>);
  expect(screen.getByRole('link', { name: 'Review' })).toHaveClass('oh-btn', 'oh-btn--primary');
  expect(screen.getByRole('button', { name: 'Plain' })).toHaveClass('oh-btn--secondary');
});

test('FindingCard shows number, title, status and selection', () => {
  render(<MemoryRouter><FindingCard finding={getFinding('tire-tread')!} to="/findings/tire-tread" selected /></MemoryRouter>);
  const link = screen.getByRole('link', { name: /Rear tire tread/ });
  expect(link).toHaveAttribute('aria-current', 'true');
  expect(link).toHaveTextContent('Plan soon');
});
