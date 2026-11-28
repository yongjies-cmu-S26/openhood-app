import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ModelViewerElement } from '@google/model-viewer';
import sedanUrl from '../assets/sedan.glb?url';
import { FINDINGS } from '../data/findings';
import type { FindingId, View } from '../data/types';
import { VISIT } from '../data/visit';
import { Button } from './Button';
import { Icon } from './Icon';
import { STATUS_LABEL } from './StatusChip';

export const PRESET_ORBITS: Record<View, string> = {
  'front-left': '38deg 74deg 105%',
  'rear-right': '-142deg 74deg 105%',
};

export const DEFAULT_CAMERA_TARGET = 'auto auto auto';
export const DEFAULT_FOV = '30deg';
const ZOOM_STEPS = 2;

export function isWebGLSupported(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

function visibilityForPreset(preset: View): Record<FindingId, boolean> {
  return Object.fromEntries(FINDINGS.map((f) => [f.id, f.hotspot.preset === preset])) as Record<FindingId, boolean>;
}

interface Props {
  selectedId: FindingId;
  onSelect: (id: FindingId) => void;
  fallback: ReactNode;
}

export default function VehicleModelViewer({ selectedId, onSelect, fallback }: Props) {
  const [failed, setFailed] = useState(() => !isWebGLSupported());
  const [ready, setReady] = useState(false);
  const [visibleMarkers, setVisibleMarkers] = useState<Record<FindingId, boolean>>(() => visibilityForPreset('front-left'));
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const hotspotRefs = useRef<Partial<Record<FindingId, HTMLButtonElement | null>>>({});
  const selected = FINDINGS.find((f) => f.id === selectedId)!;

  useEffect(() => {
    if (failed) return;
    let cancelled = false;
    const ensureViewerRegistered = async () => {
      try {
        if (typeof customElements !== 'undefined' && !customElements.get('model-viewer')) {
          await import('@google/model-viewer');
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    void ensureViewerRegistered();
    return () => {
      cancelled = true;
    };
  }, [failed]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || failed) return;
    const onLoad = () => setReady(true);
    const onError = () => setFailed(true);
    viewer.addEventListener('load', onLoad);
    viewer.addEventListener('error', onError);
    if (viewer.loaded) onLoad();
    return () => {
      viewer.removeEventListener('load', onLoad);
      viewer.removeEventListener('error', onError);
    };
  }, [failed]);

  useEffect(() => {
    if (failed) return;
    const cleanups: (() => void)[] = [];
    for (const finding of FINDINGS) {
      const button = hotspotRefs.current[finding.id];
      if (!button) continue;
      const onVisibility = (event: Event) => {
        const visible = Boolean((event as CustomEvent<{ visible?: boolean }>).detail?.visible);
        setVisibleMarkers((prev) => (prev[finding.id] === visible ? prev : { ...prev, [finding.id]: visible }));
      };
      button.addEventListener('hotspot-visibility', onVisibility);
      cleanups.push(() => button.removeEventListener('hotspot-visibility', onVisibility));
    }
    return () => cleanups.forEach((fn) => fn());
  }, [failed]);

  if (failed) return <>{fallback}</>;

  function applyPreset(nextPreset: View) {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.cameraTarget = DEFAULT_CAMERA_TARGET;
    viewer.fieldOfView = DEFAULT_FOV;
    viewer.cameraOrbit = PRESET_ORBITS[nextPreset];
    viewer.setAttribute('camera-target', DEFAULT_CAMERA_TARGET);
    viewer.setAttribute('field-of-view', DEFAULT_FOV);
    viewer.setAttribute('camera-orbit', PRESET_ORBITS[nextPreset]);
    viewer.requestUpdate?.('cameraTarget');
    viewer.requestUpdate?.('fieldOfView');
    viewer.requestUpdate?.('cameraOrbit');

    if (prefersReducedMotion()) {
      viewer.jumpCameraToGoal?.();
    }
  }

  function changeZoom(steps: number) {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.zoom(steps);
    if (prefersReducedMotion()) {
      viewer.jumpCameraToGoal();
    }
  }

  return (
    <>
      {ready && <p className="oh-small">Drag to rotate or choose a view. Tap a wheel marker to inspect a finding.</p>}
      <div className="car-view vehicle-viewer">
        <model-viewer
          ref={(node) => {
            viewerRef.current = node as ModelViewerElement | null;
          }}
          src={sedanUrl}
          alt={`Illustrative 3D vehicle model for ${VISIT.vehicle} inspection`}
          camera-controls=""
          disable-pan=""
          touch-action="pan-y"
          interaction-prompt="none"
          camera-orbit={PRESET_ORBITS['front-left']}
          camera-target={DEFAULT_CAMERA_TARGET}
          field-of-view={DEFAULT_FOV}
          min-field-of-view="14deg"
          max-field-of-view="42deg"
          shadow-intensity="0.7"
          shadow-softness="0.85"
          exposure="1"
        >
          {FINDINGS.map((finding) => {
            const isSelected = finding.id === selectedId;
            const isVisible = visibleMarkers[finding.id];
            return (
              <button
                key={finding.id}
                ref={(el) => {
                  hotspotRefs.current[finding.id] = el;
                }}
                type="button"
                slot={`hotspot-${finding.id}`}
                data-position={finding.hotspot.position}
                data-normal={finding.hotspot.normal}
                data-visibility-attribute="visible"
                hidden={!ready || !isVisible}
                className={`vehicle-hotspot car-marker--${finding.status}${isSelected ? ' is-selected' : ''}`}
                aria-pressed={isSelected}
                aria-label={`Finding ${finding.number}, ${finding.title}, ${STATUS_LABEL[finding.status]}`}
                onClick={() => onSelect(finding.id)}
              >
                <span className="car-marker__badge" aria-hidden="true">
                  {finding.number}
                </span>
              </button>
            );
          })}
        </model-viewer>
        <p className="car-view__caption oh-label">
          Illustrative vehicle model · Selected {selected.number} · {selected.location}
        </p>
      </div>
      <div className="viewer-controls">
        <Button variant="secondary" small disabled={!ready} onClick={() => applyPreset('front-left')}>
          <Icon name="rotate" size={16} />
          Front-left view
        </Button>
        <Button variant="secondary" small disabled={!ready} onClick={() => applyPreset('rear-right')}>
          <Icon name="rotate" size={16} />
          Rear-right view
        </Button>
        <Button variant="secondary" small disabled={!ready} onClick={() => changeZoom(ZOOM_STEPS)}>
          <Icon name="zoom-in" size={16} />
          Zoom in
        </Button>
        <Button variant="secondary" small disabled={!ready} onClick={() => changeZoom(-ZOOM_STEPS)}>
          <Icon name="zoom-out" size={16} />
          Zoom out
        </Button>
      </div>
    </>
  );
}
