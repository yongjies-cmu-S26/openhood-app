import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/renderApp';

test('the advisor dashboard groups visits by status and sorts each lane by longest wait', () => {
  renderApp('/advisor');
  const lane = screen.getByRole('region', { name: 'Waiting for approval' });
  expect(within(lane).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent))
    .toEqual(['Elena Rodriguez', 'David Kim', 'Sarah Miller']);
  const visit = within(lane).getByRole('heading', { name: 'Elena Rodriguez' }).closest('article')!;
  expect(within(visit).getByText('2019 Subaru Outback')).toBeVisible();
  expect(within(visit).getByText('Bay 01')).toBeVisible();
  expect(within(visit).getByText(/Long wait ·/)).toHaveClass('oh-wait--late');
  expect(within(visit).getByText('Front control arm')).toBeVisible();
  expect(within(visit).getByText('$480.00')).toBeVisible();
  expect(within(visit).getByText('Needs attention')).toBeVisible();
  const pickupLane = within(screen.getByRole('region', { name: 'Ready for pickup' }));
  expect(pickupLane.getByText('Completed')).toBeVisible();
  expect(pickupLane.getByText('Original urgency · Needs attention')).toBeVisible();
  expect(pickupLane.queryByText('Needs attention')).not.toBeInTheDocument();
});

test('sending an inspection update records delivery and moves the visit after reload', async () => {
  const user = userEvent.setup();
  const app = renderApp('/advisor');
  await user.click(screen.getByRole('link', { name: 'Review update for Marcus Chen' }));
  expect(within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByText('RO-1051')).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('Alex · Service advisor')).toBeVisible();
  expect(screen.getByText('Preferred channel · Email')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Send update to Marcus' }));
  expect(screen.getByText('Email update delivered · Demo')).toBeVisible();
  expect(screen.getByText(/Sent at/)).toBeVisible();
  expect(screen.getByText('Approval status · Waiting for approval')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Send update to Marcus' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Open customer estimate' }));
  expect(screen.getByRole('heading', { name: 'Repair estimate' })).toBeVisible();
  expect(screen.getByText(/Marcus Chen · 2020 Toyota RAV4/)).toBeVisible();
  expect(screen.getByText('$240.00')).toBeVisible();

  app.unmount();
  renderApp('/advisor');
  expect(within(screen.getByRole('region', { name: 'Waiting for approval' })).getByText('Marcus Chen')).toBeVisible();
  expect(within(screen.getByRole('region', { name: 'Needs update' })).queryByText('Marcus Chen')).not.toBeInTheDocument();
});

test('confirmed customer decisions move the visit and create a persistent advisor notification', async () => {
  const user = userEvent.setup();
  const app = renderApp('/advisor/RO-1048');
  await user.click(screen.getByRole('button', { name: 'Send update to Priya' }));
  expect(screen.getByText('SMS update delivered · Demo')).toBeVisible();
  await user.click(screen.getByRole('link', { name: 'Open customer estimate' }));
  const brakes = screen.getByRole('heading', { name: 'Front brake pads' }).closest('article')!;
  await user.click(within(brakes).getByRole('link', { name: 'Review & decide' }));
  await user.click(screen.getByRole('button', { name: 'Approve repair · $260' }));
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Approve · $260' }));
  await user.click(screen.getByRole('button', { name: 'Decline this repair' }));
  await user.click(screen.getByRole('button', { name: 'Confirm decisions' }));
  expect(screen.getByText(/Confirmed ·/)).toBeVisible();

  await user.click(screen.getByRole('link', { name: 'My car' }));
  await user.click(screen.getByRole('link', { name: 'Advisor workspace' }));
  expect(within(screen.getByRole('region', { name: 'Approved – in repair' })).getByText('Priya Shah')).toBeVisible();
  const toastText = 'Priya Shah approved front brake pads · $260.00';
  expect(screen.getByText(toastText)).toBeVisible();
  app.unmount();

  const reopened = renderApp('/advisor');
  expect(screen.queryByText(toastText)).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Notifications (1 unread)' }));
  const notifications = within(screen.getByRole('region', { name: 'Advisor notifications' }));
  expect(notifications.getByText(/Approved \$260\.00/)).toBeVisible();
  expect(notifications.getByText('Approved repairs · Front brake pads')).toBeVisible();
  expect(notifications.getByText('Declined repairs · Rear tire tread')).toBeVisible();
  await user.click(notifications.getByRole('button', { name: 'Mark all as read' }));

  reopened.unmount();
  renderApp('/advisor');
  await user.click(screen.getByRole('button', { name: 'Notifications (0 unread)' }));
  expect(screen.getByText(/Approved \$260\.00/)).toBeVisible();
});

test('a waiting visit with no approved repairs returns to needs update', async () => {
  const user = userEvent.setup();
  renderApp('/advisor/RO-1048');
  await user.click(screen.getByRole('button', { name: 'Send update to Priya' }));
  await user.click(screen.getByRole('link', { name: 'Open customer estimate' }));
  await user.click(screen.getAllByRole('link', { name: 'Review & decide' })[0]);
  await user.click(screen.getByRole('button', { name: 'Decline this repair' }));
  await user.click(screen.getByRole('button', { name: 'Decline this repair' }));
  await user.click(screen.getByRole('button', { name: 'Confirm decisions' }));
  await user.click(screen.getByRole('link', { name: 'My car' }));
  await user.click(screen.getByRole('link', { name: 'Advisor workspace' }));

  expect(within(screen.getByRole('region', { name: 'Needs update' })).getByText('Priya Shah')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Notifications (1 unread)' }));
  expect(screen.getByText('Approved repairs · None')).toBeVisible();
  expect(screen.getByText(/Approved \$0\.00/)).toBeVisible();

  await user.click(screen.getByRole('link', { name: 'Review update for Priya Shah' }));
  await user.click(screen.getByRole('button', { name: 'Send update to Priya' }));
  await user.click(screen.getByRole('link', { name: 'Open customer estimate' }));
  await user.click(screen.getByRole('link', { name: 'See decision summary' }));
  await user.click(screen.getByRole('button', { name: 'Confirm decisions' }));
  expect(screen.getByText('Decisions saved')).toBeVisible();
  await user.click(screen.getByRole('link', { name: 'My car' }));
  await user.click(screen.getByRole('link', { name: 'Advisor workspace' }));
  expect(screen.getByRole('button', { name: 'Notifications (2 unread)' })).toBeVisible();
});
