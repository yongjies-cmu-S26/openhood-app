import { act, fireEvent, screen } from '@testing-library/react';
import type { ModelViewerElement } from '@google/model-viewer';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/renderApp';

async function getViewer(container: HTMLElement) {
  await screen.findByRole('button', { name: 'Front-left view' });
  return container.querySelector<ModelViewerElement>('model-viewer')!;
}

function showHotspot(viewer: ModelViewerElement, id: 'brake-pads' | 'tire-tread') {
  act(() => {
    for (const button of viewer.querySelectorAll('button[slot]')) {
      button.dispatchEvent(new CustomEvent('hotspot-visibility', {
        detail: { visible: button.getAttribute('slot') === `hotspot-${id}` },
      }));
    }
  });
}

test('opens at front-left, hides back-facing wheel markers, and lets both markers select their finding', async () => {
  const user = userEvent.setup();
  const { container } = renderApp('/inspect');
  const viewer = await getViewer(container);
  fireEvent.load(viewer);

  const marker1 = screen.getByRole('button', { name: 'Finding 1, Front brake pads, Needs attention' });
  expect(screen.getByText(/Illustrative vehicle model/)).toBeVisible();
  expect(marker1).toBeVisible();
  expect(marker1).toHaveAttribute('aria-pressed', 'true');
  expect(screen.queryByRole('button', { name: 'Finding 2, Rear tire tread, Plan soon' })).not.toBeInTheDocument();

  // Both finding cards remain available below the viewer at every angle.
  expect(screen.getByRole('link', { name: /Front brake pads/ })).toHaveAttribute('aria-current', 'true');
  expect(screen.getByRole('link', { name: /Rear tire tread/ })).toBeVisible();

  // Switching to rear-right hides marker 1, reveals marker 2, and preserves the selected finding until marker 2 is clicked.
  await user.click(screen.getByRole('button', { name: 'Rear-right view' }));
  showHotspot(viewer, 'tire-tread');
  expect(screen.queryByRole('button', { name: 'Finding 1, Front brake pads, Needs attention' })).not.toBeInTheDocument();
  const marker2 = screen.getByRole('button', { name: 'Finding 2, Rear tire tread, Plan soon' });
  expect(marker2).toBeVisible();
  expect(marker2).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByRole('link', { name: /Front brake pads/ })).toHaveAttribute('aria-current', 'true');

  await user.click(marker2);
  expect(marker2).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('link', { name: /Rear tire tread/ })).toHaveAttribute('aria-current', 'true');

  // Switching back to front-left reveals marker 1 and clicking it selects Front brake pads again.
  await user.click(screen.getByRole('button', { name: 'Front-left view' }));
  showHotspot(viewer, 'brake-pads');
  const marker1Again = screen.getByRole('button', { name: 'Finding 1, Front brake pads, Needs attention' });
  expect(marker1Again).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByRole('link', { name: /Rear tire tread/ })).toHaveAttribute('aria-current', 'true');
  await user.click(marker1Again);
  expect(marker1Again).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('link', { name: /Front brake pads/ })).toHaveAttribute('aria-current', 'true');
});

test('camera presets reset zoom and framing while preserving the selected finding', async () => {
  const user = userEvent.setup();
  const { container } = renderApp('/inspect');

  const viewer = await getViewer(container);
  fireEvent.load(viewer);
  expect(viewer).toHaveAttribute('camera-orbit', '38deg 74deg 105%');
  expect(viewer).toHaveAttribute('field-of-view', '30deg');
  expect(viewer).toHaveAttribute('touch-action', 'pan-y');

  // Select Rear tire tread via rear-right preset, zoom in, then reset framing via Front-left view.
  await user.click(screen.getByRole('button', { name: 'Rear-right view' }));
  showHotspot(viewer, 'tire-tread');
  await user.click(screen.getByRole('button', { name: 'Finding 2, Rear tire tread, Plan soon' }));
  viewer.cameraTarget = '0m 1m 0m';
  viewer.fieldOfView = '14deg';

  await user.click(screen.getByRole('button', { name: 'Front-left view' }));
  expect(viewer).toHaveAttribute('camera-orbit', '38deg 74deg 105%');
  expect(viewer).toHaveAttribute('camera-target', 'auto auto auto');
  expect(viewer).toHaveAttribute('field-of-view', '30deg');
  expect(viewer.fieldOfView).toBe('30deg');
  expect(viewer.cameraTarget).toBe('auto auto auto');
  expect(screen.getByRole('link', { name: /Rear tire tread/ })).toHaveAttribute('aria-current', 'true');
});

test('zoom buttons pass opposite relative steps to the model viewer', async () => {
  const user = userEvent.setup();
  const { container } = renderApp('/inspect');
  const viewer = await getViewer(container);
  const zoomIn = screen.getByRole('button', { name: 'Zoom in' });
  const zoomOut = screen.getByRole('button', { name: 'Zoom out' });
  expect(zoomIn).toBeDisabled();
  expect(zoomOut).toBeDisabled();

  fireEvent.load(viewer);
  const zoom = vi.spyOn(viewer, 'zoom');
  await user.click(zoomIn);
  await user.click(zoomOut);

  expect(zoom).toHaveBeenCalledTimes(2);
  const [[inward], [outward]] = zoom.mock.calls;
  expect(inward).toBeGreaterThan(0);
  expect(outward).toBe(-inward);
  expect(viewer).toHaveAttribute('field-of-view', '30deg');
});

test('hotspot-visibility events update marker visibility dynamically as the model rotates', async () => {
  const { container } = renderApp('/inspect');
  const viewer = await getViewer(container);
  fireEvent.load(viewer);
  showHotspot(viewer, 'tire-tread');

  expect(screen.queryByRole('button', { name: 'Finding 1, Front brake pads, Needs attention' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Finding 2, Rear tire tread, Plan soon' })).toBeVisible();
});

test('model=off, WebGL 1 only, and model load failure all show the fallback and keep findings usable', async () => {
  const user = userEvent.setup();
  const off = renderApp('/inspect?model=off');
  expect(screen.getByText('3D model unavailable')).toBeVisible();
  expect(off.container.querySelector('model-viewer')).toBeNull();
  expect(screen.getByRole('link', { name: /Front brake pads/ })).toBeVisible();
  expect(screen.queryByText(/Drag to rotate/)).not.toBeInTheDocument();
  off.unmount();

  const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation((kind: string) => kind === 'webgl' ? {} as WebGLRenderingContext : null);
  const noWebgl = renderApp('/inspect');
  expect(await screen.findByText('3D model unavailable')).toBeVisible();
  expect(noWebgl.container.querySelector('model-viewer')).toBeNull();
  expect(screen.getByRole('link', { name: /Rear tire tread/ })).toBeVisible();
  spy.mockRestore();
  noWebgl.unmount();

  const loadFail = renderApp('/inspect');
  const viewer = await getViewer(loadFail.container);
  expect(screen.queryByText(/Drag to rotate/)).not.toBeInTheDocument();
  fireEvent.load(viewer);
  expect(screen.getByText(/Drag to rotate/)).toBeVisible();
  fireEvent.error(viewer);
  expect(screen.getByText('3D model unavailable')).toBeVisible();
  expect(screen.queryByText(/Drag to rotate/)).not.toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: /Front brake pads/ }));
  expect(screen.getByRole('link', { name: /Enlarge evidence/ })).toBeVisible();
});

test('findings list shows both findings without loading the 3D viewer', () => {
  const { container } = renderApp('/findings');
  expect(screen.getByRole('heading', { name: 'Your findings' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /Front brake pads|Rear tire tread/ })).toHaveLength(2);
  expect(container.querySelector('model-viewer')).toBeNull();
});
