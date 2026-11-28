/// <reference types="vite/client" />

import type { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface ModelViewerJSXProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  src?: string;
  alt?: string;
  'camera-controls'?: boolean | '';
  'touch-action'?: 'pan-y' | 'pan-x' | 'none';
  'camera-orbit'?: string;
  'camera-target'?: string;
  'field-of-view'?: string;
  'min-field-of-view'?: string;
  'max-field-of-view'?: string;
  'interaction-prompt'?: 'auto' | 'none';
  'shadow-intensity'?: string | number;
  'shadow-softness'?: string | number;
  exposure?: string | number;
  loading?: 'auto' | 'lazy' | 'eager';
  reveal?: 'auto' | 'manual';
  'disable-pan'?: boolean | '';
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerJSXProps;
    }
  }
}
