import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// jsdom does not implement <dialog> methods.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

// jsdom does not implement WebGL on <canvas>; return a minimal context stub unless a test overrides getContext.
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function getContext(contextId: string) {
    if (contextId === 'webgl2' || contextId === 'webgl') {
      return {} as WebGLRenderingContext;
    }
    return null;
  } as typeof HTMLCanvasElement.prototype.getContext;
}

// Lightweight <model-viewer> stub for jsdom so tests exercise attributes, properties, slots, and events cleanly.
if (typeof customElements !== 'undefined' && !customElements.get('model-viewer')) {
  class StubModelViewerElement extends HTMLElement {
    loaded = false;
    cameraOrbit = '38deg 74deg 105%';
    cameraTarget = 'auto auto auto';
    fieldOfView = '30deg';

    getCameraOrbit() {
      return {
        theta: 0,
        phi: 1.29,
        radius: 3.5,
        toString: () => this.cameraOrbit,
      };
    }

    getCameraTarget() {
      return {
        x: 0,
        y: 0.45,
        z: 0,
        toString: () => this.cameraTarget,
      };
    }

    getFieldOfView() {
      return Number.parseFloat(this.fieldOfView) || 30;
    }

    zoom(_steps: number) {}

    jumpCameraToGoal() {}

    async updateFraming() {}
  }

  customElements.define('model-viewer', StubModelViewerElement);
}
