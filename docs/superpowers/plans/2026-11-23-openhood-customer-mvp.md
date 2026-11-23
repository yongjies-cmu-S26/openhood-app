# OpenHood Customer App MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the frontend-only OpenHood customer phone app (13 routes) from the Figma prototype, styled with the Service Bay v2 style guide.

**Architecture:** A React + Vite + TypeScript single-page app with `HashRouter`. Typed static demo data lives in `src/data`. A context + reducer store (`src/state`) holds approve/decline decisions and chat messages and saves them to localStorage. Screens in `src/screens` compose small components from `src/components`, styled by the style guide's `oh-` CSS (copied verbatim) plus a small `app.css`.

**Tech Stack:** React 18, react-router-dom 6, Vite 5, TypeScript 5, Vitest 2 + Testing Library + jsdom.

Spec: `docs/superpowers/specs/2026-11-23-openhood-customer-mvp-design.md`

---

## File structure

```
index.html                         HTML entry, Overpass font link
package.json, tsconfig.json, vite.config.ts
src/main.tsx                       mounts HashRouter + Providers + AppRoutes
src/App.tsx                        AppRoutes (all routes) and Providers
src/styles/oh.css                  style guide CSS, extracted verbatim (generated in Task 2)
src/styles/app.css                 app layout + app-only components
src/data/types.ts                  all shared types
src/data/money.ts                  sumLines, formatMoney, formatWhole
src/data/visit.ts                  demo visit
src/data/findings.ts               the two findings + getFinding
src/data/glossary.ts               help terms + getTerm
src/data/techReplies.ts            suggested questions + scripted replies
src/state/selectors.ts             findingTotal, approvedTotal, allDecided, visitStage, statusCounts, undecided
src/state/reducer.ts               State, Action, initialState, reducer
src/state/storage.ts               loadState, saveState, safeStorage
src/state/VisitContext.tsx         VisitProvider, useVisit
src/components/*.tsx               Icon, Button, StatusChip, Notice, BackLink, CostLines, FindingCard,
                                   Toast, ErrorBoundary, AppShell, CarView, EvidenceDiagram,
                                   TimingPicker, ChatBubble, VoiceNote, ConfirmSheet
src/screens/*.tsx                  Home, Inspect, Findings, Finding, Evidence, Help, Summary, Ask,
                                   Live, Wait, Review, ReviewItem, Done, NotFound
src/test/setup.ts                  jest-dom, cleanup, dialog polyfill
src/test/renderApp.tsx             render the app at a route with MemoryRouter
```

---

### Task 1: Scaffold the project

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/test/setup.ts`, `src/App.test.tsx`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "openhood-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install react@18.3.1 react-dom@18.3.1 react-router-dom@6.28.0
npm install -D typescript@5.6.3 vite@5.4.11 @vitejs/plugin-react@4.3.4 vitest@2.1.8 jsdom@25.0.1 @testing-library/react@16.1.0 @testing-library/dom@10.4.0 @testing-library/user-event@14.5.2 @testing-library/jest-dom@6.6.3 @types/react@18.3.12 @types/react-dom@18.3.1
```
Expected: both finish with `added N packages` and no `ERR!`.

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "types": ["vitest/globals"]
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 4: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
  },
});
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#032b43" />
    <title>OpenHood</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Overpass:wght@400;500;600;700;800&family=Overpass+Mono:wght@400;500;600&display=swap" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
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
```

- [ ] **Step 7: Write the failing smoke test `src/App.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './App';

test('renders the app', () => {
  render(<MemoryRouter><AppRoutes /></MemoryRouter>);
  expect(screen.getByText('OpenHood')).toBeInTheDocument();
});
```

- [ ] **Step 8: Run it and confirm it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL, `Failed to resolve import "./App"`.

- [ ] **Step 9: Create `src/App.tsx` (temporary minimal version, replaced in Task 7)**

```tsx
export function AppRoutes() {
  return <div>OpenHood</div>;
}
```

- [ ] **Step 10: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AppRoutes } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  </StrictMode>,
);
```

- [ ] **Step 11: Run the test and the build**

Run: `npx vitest run src/App.test.tsx && npm run build`
Expected: test PASS (1 passed); build prints `✓ built in`.

- [ ] **Step 12: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src
git commit -m "chore: scaffold React + Vite + TS app with Vitest"
```

---

### Task 2: Style guide CSS and app layout CSS

**Files:**
- Create: `src/styles/oh.css` (generated), `src/styles/app.css`
- Modify: `src/main.tsx`

- [ ] **Step 1: Extract the style guide CSS verbatim**

Run:
```bash
mkdir -p src/styles && node -e '
const fs=require("fs");
const html=fs.readFileSync(process.env.HOME+"/openhood-style-guide/index.html","utf8");
const m=html.match(/<style id="oh-css">([\s\S]*?)<\/style>/);
if(!m){console.error("oh-css block not found");process.exit(1)}
fs.writeFileSync("src/styles/oh.css","/* Generated from openhood-style-guide/index.html (#oh-css). Do not edit; update the style guide instead. */\n"+m[1].trim()+"\n");
console.log("lines:",m[1].trim().split("\n").length);'
```
Expected: `lines:` followed by a number over 300. `grep -c "\-\-oh-navy" src/styles/oh.css` prints a number of at least 1.

- [ ] **Step 2: Create `src/styles/app.css`**

```css
/* App layout and app-only components. Colors come only from --oh- tokens in oh.css. */
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: #dfe7ec; color: var(--oh-ink); font-family: var(--oh-font); }
#root { min-height: 100dvh; }
a { color: inherit; }

.app { max-width: 480px; margin: 0 auto; min-height: 100dvh; display: flex; flex-direction: column; background: var(--oh-canvas); box-shadow: 0 0 0 1px var(--oh-line); }
.app-top { position: sticky; top: 0; z-index: 20; padding-top: max(12px, env(safe-area-inset-top, 0px)); }
.app-top .oh-logo { color: var(--oh-paper); }
.app-main { flex: 1; display: flex; flex-direction: column; gap: 14px; padding: 16px max(16px, env(safe-area-inset-right, 0px)) 24px max(16px, env(safe-area-inset-left, 0px)); }
.app-tabs { position: sticky; bottom: 0; z-index: 20; }
.app-tabs a { min-height: 44px; }

.page-head { display: grid; gap: 6px; }
.page-head p { margin: 0; }
.stack { display: grid; gap: 10px; }
.btn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.section-title { margin: 6px 0 0; }
p.oh-small, p.oh-body { margin: 0; }
.oh-hero { color: var(--oh-paper); }
.hero-title { display: flex; align-items: center; gap: 8px; }

/* Finding card */
.finding-card { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; padding: 14px; background: var(--oh-paper); border: 1px solid var(--oh-line); border-left: 6px solid var(--edge); border-radius: var(--oh-radius); text-decoration: none; color: inherit; }
.finding-card--attention { --edge: var(--oh-red); }
.finding-card--soon { --edge: var(--oh-amber); }
.finding-card.is-selected { border-color: var(--oh-blue); border-left-color: var(--edge); box-shadow: 0 0 0 2px rgba(63, 136, 197, .35); }
.finding-card__num { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 50%; background: var(--oh-navy); color: var(--oh-paper); font: 600 14px/1 var(--oh-font-mono); }
.finding-card__body { display: grid; gap: 6px; }
.finding-card__title { font: 600 16px/1.25 var(--oh-font); }
.finding-card__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.finding-card__chev { color: var(--oh-line-strong); }

/* Car view */
.car-view { background: var(--oh-paper); border: 1px solid var(--oh-line); border-radius: var(--oh-radius); padding: 12px; overflow: hidden; }
.car-view__stage { position: relative; transition: transform .25s ease; }
.car-view.is-zoomed .car-view__stage { transform: scale(1.45); }
.car-svg { display: block; width: 100%; height: auto; }
.car-shadow { fill: var(--oh-canvas); }
.car-body { fill: var(--oh-canvas); stroke: var(--oh-navy); stroke-width: 2; stroke-linejoin: round; }
.car-glass { fill: var(--oh-blue-tint); stroke: var(--oh-navy); stroke-width: 1.5; }
.car-line { fill: none; stroke: var(--oh-navy); stroke-width: 1.5; stroke-linecap: round; }
.car-tire { fill: var(--oh-navy); }
.car-rim { fill: var(--oh-paper); stroke: var(--oh-navy); stroke-width: 1.5; }
.car-light { fill: var(--oh-blue-tint); stroke: var(--oh-navy); stroke-width: 1.2; }
.car-marker { position: absolute; transform: translate(-50%, -50%); width: 34px; height: 34px; border-radius: 50%; border: 2px solid var(--oh-paper); background: var(--oh-navy); color: var(--oh-paper); font: 600 14px/1 var(--oh-font-mono); cursor: pointer; display: grid; place-items: center; box-shadow: 0 0 0 3px var(--edge); }
.car-marker--attention { --edge: var(--oh-red); }
.car-marker--soon { --edge: var(--oh-amber); }
.car-marker.is-far { background: var(--oh-paper); color: var(--oh-navy); border: 2px dashed var(--oh-navy); }
.car-marker.is-selected { outline: 3px solid var(--oh-blue); outline-offset: 3px; }
.car-view__caption { margin: 10px 0 0; }

/* Evidence */
.evidence { background: #f6f9fb; border: 1px solid var(--oh-line); border-radius: var(--oh-radius); padding: 8px; }
.evidence svg { display: block; width: 100%; height: auto; }
.ev-part { fill: var(--oh-line); stroke: var(--oh-navy); stroke-width: 1.5; }
.ev-dark { fill: var(--oh-navy); }
.ev-worn { fill: var(--oh-red); }
.ev-wear { fill: var(--oh-amber); }
.ev-paper { fill: var(--oh-paper); stroke: var(--oh-navy); stroke-width: 1.5; }
.ev-leader { stroke: var(--oh-navy); stroke-width: 1; fill: none; }
.ev-label { font: 500 11px var(--oh-font); fill: var(--oh-ink); }
.ev-label--alert { fill: var(--oh-red); font-weight: 700; }
.evidence-preview { display: grid; gap: 8px; text-decoration: none; color: var(--oh-blue-text); font-weight: 500; }

/* Visit stages heading row */
.stage-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }

/* Timing picker (role=radio uses aria-checked) */
.oh-timing button[aria-checked="true"] { color: var(--oh-ink); font-weight: 600; }
.oh-timing button[aria-checked="true"]::before { background: var(--c); border-color: var(--c); box-shadow: inset 0 0 0 5px var(--oh-paper); }

/* Chat */
.chat-log { display: flex; flex-direction: column; gap: 10px; }
.bubble-transcript { margin: 8px 0 0; }
.typing { font: 400 12px/1 var(--oh-font-mono); color: var(--oh-muted); }
.typing::after { content: "…"; animation: blink 1s steps(2) infinite; }
@keyframes blink { 50% { opacity: 0; } }
.composer { display: flex; align-items: center; gap: 6px; padding: 6px 6px 6px 12px; background: var(--oh-paper); border: 1px solid var(--oh-line-strong); border-radius: var(--oh-radius); }
.composer:focus-within { border-color: var(--oh-blue); box-shadow: 0 0 0 3px rgba(63, 136, 197, .3); }
.composer input { flex: 1; min-width: 0; border: 0; outline: none; background: none; font: 400 15px/1.4 var(--oh-font); color: var(--oh-ink); }
.composer .oh-btn--icon { width: 40px; min-height: 40px; }

/* Voice note */
.voice { display: flex; align-items: center; gap: 10px; background: var(--oh-blue-tint); border-radius: var(--oh-radius); padding: 8px; min-width: 220px; }
.oh-bubble--me .voice { background: var(--oh-navy-2); }
.voice__play { flex: none; width: 34px; height: 34px; border: 0; border-radius: 50%; background: var(--oh-blue); color: var(--oh-paper); display: grid; place-items: center; cursor: pointer; }
.voice__wave { flex: 1; display: flex; align-items: center; gap: 2px; height: 24px; }
.voice__wave i { flex: 1; border-radius: 1px; background: #b7cfe3; }
.voice__wave i.is-on { background: var(--oh-blue-text); }
.oh-bubble--me .voice__wave i.is-on { background: var(--oh-blue-on-navy); }
.voice__time { font: 500 11px/1 var(--oh-font-mono); color: var(--oh-blue-text); }
.oh-bubble--me .voice__time { color: var(--oh-blue-on-navy); }

/* Live feed */
.feed { display: grid; gap: 8px; padding: 12px; border: 1px dashed var(--oh-line-strong); border-radius: var(--oh-radius); background: var(--oh-paper); }
.feed__live { display: inline-flex; align-items: center; gap: 6px; font: 500 11.5px/1 var(--oh-font-mono); color: var(--oh-blue-text); }
.feed__live::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--oh-blue); }

/* Review + done */
.review-item { display: grid; gap: 10px; }
.review-item__head { display: flex; justify-content: space-between; align-items: start; gap: 10px; }
.review-item__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.total-bar { display: flex; justify-content: space-between; align-items: baseline; }
.done-hero { background: var(--oh-teal); color: var(--oh-paper); border-radius: var(--oh-radius); padding: 20px 16px; display: grid; gap: 8px; }
.done-hero .oh-label { color: #cfe9e4; }
.done-hero--neutral { background: var(--oh-navy); }
.done-hero--neutral .oh-label { color: var(--oh-blue-on-navy); }
.done-display { font-size: 40px; margin: 0; }
.done-hero p { margin: 0; color: #e6f4f1; }
.done-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.done-list li { display: flex; justify-content: space-between; gap: 10px; }
.next-steps { margin: 0; padding-left: 20px; display: grid; gap: 6px; }

/* Bottom sheet dialog */
dialog.sheet { margin: auto auto 0; width: min(480px, 100vw); max-width: 100vw; border-radius: 14px 14px 0 0; padding-bottom: env(safe-area-inset-bottom, 0px); }

/* Toast */
.toast-region { position: fixed; left: 0; right: 0; bottom: calc(76px + env(safe-area-inset-bottom, 0px)); display: grid; justify-items: center; pointer-events: none; z-index: 40; padding: 0 16px; }
.toast-region .oh-toast { pointer-events: auto; }

@media (prefers-reduced-motion: reduce) {
  .car-view__stage { transition: none; }
  .typing::after { animation: none; }
}
```

- [ ] **Step 3: Import the CSS in `src/main.tsx`**

Replace `src/main.tsx` with:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AppRoutes } from './App';
import './styles/oh.css';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  </StrictMode>,
);
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `✓ built in`; `dist/assets/*.css` exists.

- [ ] **Step 5: Commit**

```bash
git add src/styles src/main.tsx
git commit -m "feat: add style guide CSS and app layout styles"
```

---

### Task 3: Types, money helpers and demo data

**Files:**
- Create: `src/data/types.ts`, `src/data/money.ts`, `src/data/visit.ts`, `src/data/findings.ts`, `src/data/glossary.ts`, `src/data/techReplies.ts`
- Test: `src/data/data.test.ts`

- [ ] **Step 1: Write the failing test `src/data/data.test.ts`**

```ts
import { sumLines, formatMoney, formatWhole } from './money';
import { FINDINGS, getFinding } from './findings';
import { getTerm, GLOSSARY } from './glossary';
import { replyFor, SUGGESTED, GENERIC_REPLY } from './techReplies';

test('money helpers', () => {
  expect(sumLines([{ label: 'a', amount: 14000 }, { label: 'b', amount: 12000 }])).toBe(26000);
  expect(formatMoney(26000)).toBe('$260.00');
  expect(formatMoney(123456)).toBe('$1,234.56');
  expect(formatWhole(26000)).toBe('$260');
  expect(formatWhole(26050)).toBe('$260.50');
});

test('findings match the spec totals', () => {
  expect(FINDINGS.map((f) => f.id)).toEqual(['brake-pads', 'tire-tread']);
  expect(sumLines(getFinding('brake-pads')!.costLines)).toBe(26000);
  expect(sumLines(getFinding('tire-tread')!.costLines)).toBe(23500);
  expect(getFinding('nope')).toBeUndefined();
  for (const f of FINDINGS) {
    expect(f.timing.map((t) => t.key)).toEqual(['now', '3m', '6m']);
    expect(getTerm(f.helpTerm)).toBeDefined();
  }
});

test('glossary and replies', () => {
  expect(GLOSSARY).toHaveLength(3);
  expect(getTerm('nope')).toBeUndefined();
  for (const q of SUGGESTED) expect(replyFor(q).durationSec).toBeGreaterThan(0);
  expect(replyFor('anything else')).toBe(GENERIC_REPLY);
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/data`
Expected: FAIL, `Failed to resolve import "./money"`.

- [ ] **Step 3: Create `src/data/types.ts`**

```ts
export type FindingId = 'brake-pads' | 'tire-tread';
export type FindingStatus = 'attention' | 'soon';
export type View = 'front-left' | 'rear-right';
export type Tone = 'attention' | 'soon' | 'ok' | 'info';
export type HelpTermId = 'brake-pad' | 'brake-disc' | 'tire-tread';
export type Decision = 'approved' | 'declined';
export type Decisions = Partial<Record<FindingId, Decision>>;
export type TimingKey = 'now' | '3m' | '6m';

export interface CostLine {
  label: string;
  /** cents */
  amount: number;
}

export interface TimingOption {
  key: TimingKey;
  label: string;
  risk: string;
  costText: string;
  tone: 'ok' | 'soon' | 'attention';
}

export interface Marker {
  /** position in the 320 x 200 car drawing */
  x: number;
  y: number;
  /** true when the part is on the far side of the car in this view */
  far: boolean;
}

export interface Finding {
  id: FindingId;
  number: 1 | 2;
  title: string;
  status: FindingStatus;
  location: string;
  markers: Record<View, Marker>;
  summary: string;
  whatIsWrong: string;
  impact: string;
  recommendation: string;
  measurement: string;
  helpTerm: HelpTermId;
  costLines: CostLine[];
  timing: TimingOption[];
}

export interface GlossaryEntry {
  id: HelpTermId;
  title: string;
  body: string;
  why: string;
}

export interface Message {
  id: string;
  from: 'customer' | 'technician';
  kind: 'text' | 'voice';
  text: string;
  at: string;
  durationSec?: number;
}
```

- [ ] **Step 4: Create `src/data/money.ts`**

```ts
import type { CostLine } from './types';

export function sumLines(lines: CostLine[]): number {
  return lines.reduce((sum, line) => sum + line.amount, 0);
}

export function formatMoney(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatWhole(cents: number): string {
  return cents % 100 === 0 ? '$' + (cents / 100).toLocaleString('en-US') : formatMoney(cents);
}
```

- [ ] **Step 5: Create `src/data/visit.ts`**

```ts
export const VISIT = {
  customerFirstName: 'Priya',
  customerName: 'Priya Shah',
  vehicle: '2018 Honda Civic',
  ro: 'RO-1048',
  bay: 'Bay 02',
  technician: { name: 'Miguel', role: 'Technician' },
  advisor: 'Alex',
} as const;
```

- [ ] **Step 6: Create `src/data/findings.ts`**

```ts
import type { Finding } from './types';

export const FINDINGS: Finding[] = [
  {
    id: 'brake-pads',
    number: 1,
    title: 'Front brake pads',
    status: 'attention',
    location: 'Front left wheel',
    markers: {
      'front-left': { x: 88, y: 150, far: false },
      'rear-right': { x: 252, y: 98, far: true },
    },
    summary: 'The pads are worn thin. Your shop recommends replacing the front pair to restore braking.',
    whatIsWrong: 'Front brake pads are worn thin from normal use.',
    impact: 'Replacing worn pads helps restore predictable braking and stopping response.',
    recommendation: 'Replace both front pads.',
    measurement: '3 mm measured · minimum 4 mm',
    helpTerm: 'brake-pad',
    costLines: [
      { label: 'Parts', amount: 14000 },
      { label: 'Labor · 1.0 hr', amount: 10000 },
      { label: 'Tax', amount: 2000 },
    ],
    timing: [
      { key: 'now', label: 'Now', risk: 'Replacing pads now protects the brake disc (rotor) from further wear.', costText: 'Now · $260', tone: 'ok' },
      { key: '3m', label: '3 months', risk: 'Pads keep wearing and braking response drops.', costText: 'Est. $260–$330', tone: 'soon' },
      { key: '6m', label: '6 months', risk: 'Metal can reach the rotor, and the rotor may need replacing.', costText: 'Est. $310–$520', tone: 'attention' },
    ],
  },
  {
    id: 'tire-tread',
    number: 2,
    title: 'Rear tire tread',
    status: 'soon',
    location: 'Rear right wheel',
    markers: {
      'front-left': { x: 252, y: 98, far: true },
      'rear-right': { x: 88, y: 150, far: false },
    },
    summary: 'The rear right tire tread is getting shallow. Plan a replacement before the rainy season.',
    whatIsWrong: 'Tread on the rear right tire is worn close to the limit.',
    impact: 'Shallow tread takes longer to stop and grips less on wet roads.',
    recommendation: 'Replace the rear right tire within 3 months.',
    measurement: '3/32 in measured · minimum 2/32 in',
    helpTerm: 'tire-tread',
    costLines: [
      { label: 'Parts · 1 tire', amount: 16000 },
      { label: 'Labor · 0.6 hr', amount: 6000 },
      { label: 'Tax', amount: 1500 },
    ],
    timing: [
      { key: 'now', label: 'Now', risk: 'Lowest risk. Full grip in wet weather.', costText: 'Now · $235', tone: 'ok' },
      { key: '3m', label: '3 months', risk: 'Grip in rain drops as the tread wears.', costText: 'Est. $235', tone: 'soon' },
      { key: '6m', label: '6 months', risk: 'Tread reaches the legal limit. Replace before winter.', costText: 'Est. $235–$260', tone: 'attention' },
    ],
  },
];

export function getFinding(id: string | undefined): Finding | undefined {
  return FINDINGS.find((f) => f.id === id);
}
```

- [ ] **Step 7: Create `src/data/glossary.ts`**

```ts
import type { GlossaryEntry } from './types';

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: 'brake-pad',
    title: 'Brake pad',
    body: 'Brake pads are the friction blocks that squeeze the brake disc when you press the pedal. They wear down a little every time you stop, so they are replaced regularly.',
    why: 'Thin pads take longer to stop the car and can damage the brake disc.',
  },
  {
    id: 'brake-disc',
    title: 'Brake disc (rotor)',
    body: 'The brake disc, also called the rotor, is the metal plate that spins with the wheel. The pads press on it to slow the car.',
    why: 'If pads wear through, metal grinds on the disc and it may need replacing too.',
  },
  {
    id: 'tire-tread',
    title: 'Tire tread',
    body: 'Tread is the patterned rubber that touches the road. The grooves push water away so the tire keeps its grip.',
    why: 'Shallow tread grips less on wet roads and takes longer to stop.',
  },
];

export function getTerm(id: string | undefined): GlossaryEntry | undefined {
  return GLOSSARY.find((t) => t.id === id);
}
```

- [ ] **Step 8: Create `src/data/techReplies.ts`**

```ts
export const SUGGESTED = ['Why both pads?', 'Can it wait?', 'What does it cost?'] as const;

export interface Reply {
  text: string;
  /** 0 means a text reply; above 0 means a voice note of that length */
  durationSec: number;
}

const REPLIES: Record<string, Reply> = {
  'Why both pads?': { text: 'Pads are replaced in pairs so both front wheels brake evenly. Replacing one side can make the car pull.', durationSec: 18 },
  'Can it wait?': { text: 'I wouldn’t wait long. At 3 mm the pads are below the 4 mm minimum, and waiting risks damaging the rotor.', durationSec: 21 },
  'What does it cost?': { text: 'Front pads are $260 total: $140 parts, $100 labor and $20 tax. You pay at pickup.', durationSec: 15 },
};

export const GENERIC_REPLY: Reply = {
  text: 'Thanks, I’ll answer as soon as I’m off the lift. Usually within 15 minutes.',
  durationSec: 0,
};

export function replyFor(question: string): Reply {
  return REPLIES[question] ?? GENERIC_REPLY;
}
```

- [ ] **Step 9: Run the tests**

Run: `npx vitest run src/data`
Expected: PASS (3 tests).

- [ ] **Step 10: Commit**

```bash
git add src/data
git commit -m "feat: add typed demo data and money helpers"
```

---

### Task 4: Selectors

**Files:**
- Create: `src/state/selectors.ts`
- Test: `src/state/selectors.test.ts`

- [ ] **Step 1: Write the failing test `src/state/selectors.test.ts`**

```ts
import { approvedTotal, allDecided, visitStage, statusCounts, undecided, findingTotal } from './selectors';
import { FINDINGS } from '../data/findings';
import type { Decision, Decisions } from '../data/types';

type D = Decision | undefined;
const make = (brake: D, tire: D): Decisions => {
  const d: Decisions = {};
  if (brake) d['brake-pads'] = brake;
  if (tire) d['tire-tread'] = tire;
  return d;
};

// Mirrors the Figma "Decision summary" frames: U = undecided, A = approved, D = declined.
const CASES: [string, D, D, number, 'review' | 'repair' | 'pickup'][] = [
  ['UU', undefined, undefined, 0, 'review'],
  ['UA', undefined, 'approved', 23500, 'review'],
  ['UD', undefined, 'declined', 0, 'review'],
  ['AU', 'approved', undefined, 26000, 'review'],
  ['AA', 'approved', 'approved', 49500, 'repair'],
  ['AD', 'approved', 'declined', 26000, 'repair'],
  ['DU', 'declined', undefined, 0, 'review'],
  ['DA', 'declined', 'approved', 23500, 'repair'],
  ['DD', 'declined', 'declined', 0, 'pickup'],
];

test.each(CASES)('%s → total %i, stage %s', (_name, brake, tire, total, stage) => {
  const d = make(brake, tire);
  expect(approvedTotal(d)).toBe(total);
  expect(visitStage(d)).toBe(stage);
  expect(allDecided(d)).toBe(brake !== undefined && tire !== undefined);
});

test('finding totals, counts and undecided', () => {
  expect(FINDINGS.map(findingTotal)).toEqual([26000, 23500]);
  expect(statusCounts()).toEqual({ attention: 1, soon: 1 });
  expect(undecided(make('approved', undefined)).map((f) => f.id)).toEqual(['tire-tread']);
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/state/selectors.test.ts`
Expected: FAIL, `Failed to resolve import "./selectors"`.

- [ ] **Step 3: Create `src/state/selectors.ts`**

```ts
import { FINDINGS } from '../data/findings';
import { sumLines } from '../data/money';
import type { Decisions, Finding } from '../data/types';

export type Stage = 'review' | 'repair' | 'pickup';

export function findingTotal(finding: Finding): number {
  return sumLines(finding.costLines);
}

export function approvedTotal(decisions: Decisions): number {
  return FINDINGS.filter((f) => decisions[f.id] === 'approved').reduce((sum, f) => sum + findingTotal(f), 0);
}

export function allDecided(decisions: Decisions): boolean {
  return FINDINGS.every((f) => decisions[f.id] !== undefined);
}

export function undecided(decisions: Decisions): Finding[] {
  return FINDINGS.filter((f) => decisions[f.id] === undefined);
}

export function visitStage(decisions: Decisions): Stage {
  if (!allDecided(decisions)) return 'review';
  return FINDINGS.some((f) => decisions[f.id] === 'approved') ? 'repair' : 'pickup';
}

export function statusCounts(): { attention: number; soon: number } {
  return {
    attention: FINDINGS.filter((f) => f.status === 'attention').length,
    soon: FINDINGS.filter((f) => f.status === 'soon').length,
  };
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/state/selectors.test.ts`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add src/state/selectors.ts src/state/selectors.test.ts
git commit -m "feat: add decision selectors with Figma decision-summary cases"
```

---

### Task 5: Reducer, storage and VisitContext

**Files:**
- Create: `src/state/reducer.ts`, `src/state/storage.ts`, `src/state/VisitContext.tsx`
- Test: `src/state/reducer.test.ts`

- [ ] **Step 1: Write the failing test `src/state/reducer.test.ts`**

```ts
import { reducer, initialState, type State } from './reducer';
import { loadState, saveState, STORAGE_KEY } from './storage';

test('decide, change and clear a decision', () => {
  let s = reducer(initialState, { type: 'decide', id: 'brake-pads', decision: 'approved' });
  expect(s.decisions).toEqual({ 'brake-pads': 'approved' });
  s = reducer(s, { type: 'decide', id: 'brake-pads', decision: 'declined' });
  expect(s.decisions).toEqual({ 'brake-pads': 'declined' });
  s = reducer(s, { type: 'decide', id: 'brake-pads', decision: null });
  expect(s.decisions).toEqual({});
});

test('add message, mark seen once, reset', () => {
  let s = reducer(initialState, { type: 'addMessage', message: { id: 'x', from: 'customer', kind: 'text', text: 'Hi', at: '10:00' } });
  expect(s.messages.at(-1)?.text).toBe('Hi');
  s = reducer(s, { type: 'markSeen', id: 'tire-tread' });
  s = reducer(s, { type: 'markSeen', id: 'tire-tread' });
  expect(s.seen).toEqual(['tire-tread']);
  expect(reducer(s, { type: 'reset' })).toBe(initialState);
});

test('save and load round trip', () => {
  const s: State = { ...initialState, decisions: { 'tire-tread': 'approved' } };
  expect(saveState(s, localStorage)).toBe(true);
  expect(loadState(localStorage)).toEqual(s);
});

test('bad or missing saved data falls back to the initial state', () => {
  expect(loadState(localStorage)).toBe(initialState);
  localStorage.setItem(STORAGE_KEY, '{not json');
  expect(loadState(localStorage)).toBe(initialState);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ decisions: { 'brake-pads': 'maybe' }, messages: [], seen: [] }));
  expect(loadState(localStorage)).toBe(initialState);
  expect(loadState(null)).toBe(initialState);
  expect(saveState(initialState, null)).toBe(false);
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/state/reducer.test.ts`
Expected: FAIL, `Failed to resolve import "./reducer"`.

- [ ] **Step 3: Create `src/state/reducer.ts`**

```ts
import type { Decision, Decisions, FindingId, Message } from '../data/types';

export interface State {
  decisions: Decisions;
  messages: Message[];
  seen: FindingId[];
}

export type Action =
  | { type: 'decide'; id: FindingId; decision: Decision | null }
  | { type: 'addMessage'; message: Message }
  | { type: 'markSeen'; id: FindingId }
  | { type: 'reset' };

export const SEED_MESSAGES: Message[] = [
  { id: 'seed-1', from: 'customer', kind: 'text', text: 'Hi Miguel, I have a question about the front pads.', at: '11:28 AM' },
  {
    id: 'seed-2',
    from: 'technician',
    kind: 'voice',
    text: 'The front pads are worn thin. Replacing both front pads helps restore consistent braking.',
    at: '11:31 AM',
    durationSec: 24,
  },
];

export const initialState: State = { decisions: {}, messages: SEED_MESSAGES, seen: [] };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'decide': {
      const decisions: Decisions = { ...state.decisions };
      if (action.decision === null) delete decisions[action.id];
      else decisions[action.id] = action.decision;
      return { ...state, decisions };
    }
    case 'addMessage':
      return { ...state, messages: [...state.messages, action.message] };
    case 'markSeen':
      return state.seen.includes(action.id) ? state : { ...state, seen: [...state.seen, action.id] };
    case 'reset':
      return initialState;
  }
}
```

- [ ] **Step 4: Create `src/state/storage.ts`**

```ts
import { initialState, type State } from './reducer';

export const STORAGE_KEY = 'openhood.v1';
const IDS = ['brake-pads', 'tire-tread'];
const DECISIONS = ['approved', 'declined'];

export function safeStorage(): Storage | null {
  try {
    const s = window.localStorage;
    s.setItem('__oh_probe', '1');
    s.removeItem('__oh_probe');
    return s;
  } catch {
    return null;
  }
}

function isState(x: unknown): x is State {
  if (!x || typeof x !== 'object') return false;
  const s = x as Record<string, unknown>;
  const d = s.decisions;
  if (!d || typeof d !== 'object' || Array.isArray(d)) return false;
  for (const [k, v] of Object.entries(d)) {
    if (!IDS.includes(k) || !DECISIONS.includes(v as string)) return false;
  }
  if (!Array.isArray(s.messages) || !s.messages.every((m) => m && typeof m === 'object' && typeof (m as { text?: unknown }).text === 'string')) return false;
  if (!Array.isArray(s.seen) || !s.seen.every((id) => IDS.includes(id as string))) return false;
  return true;
}

export function loadState(storage: Storage | null = safeStorage()): State {
  if (!storage) return initialState;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed: unknown = JSON.parse(raw);
    return isState(parsed) ? parsed : initialState;
  } catch {
    return initialState;
  }
}

export function saveState(state: State, storage: Storage | null = safeStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 5: Create `src/state/VisitContext.tsx`**

```tsx
import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import { reducer, type Action, type State } from './reducer';
import { loadState, saveState } from './storage';

interface VisitValue {
  state: State;
  dispatch: Dispatch<Action>;
  /** false when this browser blocks localStorage */
  storageOk: boolean;
}

const VisitContext = createContext<VisitValue | null>(null);

export function VisitProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState());
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    setStorageOk(saveState(state));
  }, [state]);

  return <VisitContext.Provider value={{ state, dispatch, storageOk }}>{children}</VisitContext.Provider>;
}

export function useVisit(): VisitValue {
  const value = useContext(VisitContext);
  if (!value) throw new Error('useVisit must be used inside VisitProvider');
  return value;
}
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/state`
Expected: PASS (all state tests, 14 total).

- [ ] **Step 7: Commit**

```bash
git add src/state
git commit -m "feat: add visit reducer, localStorage persistence and context"
```

---

### Task 6: Base components

**Files:**
- Create: `src/components/Icon.tsx`, `Button.tsx`, `StatusChip.tsx`, `Notice.tsx`, `BackLink.tsx`, `CostLines.tsx`, `FindingCard.tsx`, `Toast.tsx`, `ErrorBoundary.tsx`
- Test: `src/components/components.test.tsx`

- [ ] **Step 1: Write the failing test `src/components/components.test.tsx`**

```tsx
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
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/components`
Expected: FAIL, `Failed to resolve import "./CostLines"`.

- [ ] **Step 3: Create `src/components/Icon.tsx`**

```tsx
import type { ReactElement } from 'react';

const PATHS = {
  'arrow-up-right': <path d="M7 17L17 7M8 7h9v9" />,
  'chevron-left': <path d="M15 6l-6 6 6 6" />,
  'chevron-right': <path d="M9 6l6 6-6 6" />,
  home: <path d="M3 10.5L12 3l9 7.5M5 9.5V20h14V9.5M10 20v-6h4v6" />,
  car: (
    <>
      <path d="M3 16v-3l2-5.2A2 2 0 0 1 6.9 6.5h10.2a2 2 0 0 1 1.9 1.3L21 13v3h-2M5 16H3M9 16h6" />
      <circle cx="7" cy="16.5" r="2" />
      <circle cx="17" cy="16.5" r="2" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17v.01" />
    </>
  ),
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  video: (
    <>
      <rect x="2" y="6" width="14" height="12" rx="1" />
      <path d="M16 10l6-3v10l-6-3" />
    </>
  ),
  clipboard: <path d="M9 4h6v3H9zM6 5.5H5v15h14v-15h-1M9 13l2 2 4-4" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  send: <path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  play: <path d="M7 4v16l13-8z" fill="currentColor" stroke="none" />,
  pause: <path d="M8 5v14M16 5v14" />,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  alert: (
    <>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v4.5M12 17.5v.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.01" />
    </>
  ),
  expand: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  rotate: <path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />,
  'zoom-in': (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4M11 8v6M8 11h6" />
    </>
  ),
  'zoom-out': (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4M8 11h6" />
    </>
  ),
} satisfies Record<string, ReactElement>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, className = '' }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={`oh-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
```

- [ ] **Step 4: Create `src/components/Button.tsx`**

```tsx
import type { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'dark' | 'text' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  small?: boolean;
  block?: boolean;
  /** when set, renders a router link instead of a button */
  to?: string;
}

export function Button({ variant = 'primary', small, block, to, className = '', children, type = 'button', ...rest }: ButtonProps) {
  const cls = ['oh-btn', `oh-btn--${variant}`, small && 'oh-btn--sm', block && 'oh-btn--block', className].filter(Boolean).join(' ');
  if (to !== undefined) {
    return (
      <Link to={to} className={cls} aria-label={rest['aria-label']}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}
```

- [ ] **Step 5: Create `src/components/StatusChip.tsx`**

```tsx
import type { Decision, FindingStatus, Tone } from '../data/types';

const TONE_CLASS: Record<Tone, string> = {
  attention: 'oh-status--red',
  soon: 'oh-status--amber',
  ok: 'oh-status--ok',
  info: 'oh-status--info',
};

export const STATUS_LABEL: Record<FindingStatus, string> = {
  attention: 'Needs attention',
  soon: 'Plan soon',
};

export function StatusChip({ tone, label }: { tone: Tone; label: string }) {
  return <span className={`oh-status ${TONE_CLASS[tone]}`}>{label}</span>;
}

export function FindingStatusChip({ status }: { status: FindingStatus }) {
  return <StatusChip tone={status} label={STATUS_LABEL[status]} />;
}

export function DecisionChip({ decision }: { decision: Decision }) {
  return decision === 'approved' ? <StatusChip tone="ok" label="Approved" /> : <StatusChip tone="info" label="Declined" />;
}
```

- [ ] **Step 6: Create `src/components/Notice.tsx`**

```tsx
import type { ReactNode } from 'react';
import { Icon } from './Icon';

type NoticeTone = 'info' | 'warn' | 'error';
const ICON = { info: 'info', warn: 'clock', error: 'alert' } as const;

export function Notice({ tone = 'info', title, children }: { tone?: NoticeTone; title: string; children?: ReactNode }) {
  return (
    <div className={`oh-notice oh-notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={ICON[tone]} />
      <div>
        <b>{title}</b>
        {children && <div className="oh-small">{children}</div>}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create `src/components/BackLink.tsx`**

```tsx
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link className="oh-back" to={to}>
      <Icon name="chevron-left" size={16} />
      {label}
    </Link>
  );
}
```

- [ ] **Step 8: Create `src/components/CostLines.tsx`**

```tsx
import { formatMoney, sumLines } from '../data/money';
import type { CostLine } from '../data/types';

export function CostLines({ lines, totalLabel = 'Total' }: { lines: CostLine[]; totalLabel?: string }) {
  return (
    <div className="stack">
      <div className="oh-lines">
        {lines.map((line) => (
          <div key={line.label}>
            <span>{line.label}</span>
            <span>{formatMoney(line.amount)}</span>
          </div>
        ))}
      </div>
      <div className="oh-total">
        <span className="oh-h3">{totalLabel}</span>
        <span className="oh-price" data-testid="cost-total">
          {formatMoney(sumLines(lines))}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Create `src/components/FindingCard.tsx`**

```tsx
import { Link } from 'react-router-dom';
import type { Decision, Finding } from '../data/types';
import { DecisionChip, FindingStatusChip } from './StatusChip';
import { Icon } from './Icon';

interface Props {
  finding: Finding;
  to: string;
  selected?: boolean;
  decision?: Decision;
}

export function FindingCard({ finding, to, selected = false, decision }: Props) {
  return (
    <Link
      to={to}
      className={`finding-card finding-card--${finding.status}${selected ? ' is-selected' : ''}`}
      aria-current={selected ? 'true' : undefined}
    >
      <span className="finding-card__num" aria-hidden="true">
        {finding.number}
      </span>
      <span className="finding-card__body">
        <span className="finding-card__title">{finding.title}</span>
        <span className="finding-card__meta">
          <FindingStatusChip status={finding.status} />
          <span className="oh-small">{finding.location}</span>
          {decision && <DecisionChip decision={decision} />}
        </span>
      </span>
      <Icon name="chevron-right" size={16} className="finding-card__chev" />
    </Link>
  );
}
```

- [ ] **Step 10: Create `src/components/Toast.tsx`**

```tsx
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

const ToastContext = createContext<(text: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((next: string) => {
    setText(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setText(null), 4000);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" aria-live="polite">
        {text && (
          <div className="oh-toast">
            <span className="oh-toast__icon">
              <Icon name="check" />
            </span>
            <div>
              <b>{text}</b>
              <div className="oh-toast__meta">Saved on this device</div>
            </div>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): (text: string) => void {
  return useContext(ToastContext);
}
```

- [ ] **Step 11: Create `src/components/ErrorBoundary.tsx`**

```tsx
import { Component, type ReactNode } from 'react';

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
```

- [ ] **Step 12: Run the tests**

Run: `npx vitest run src/components`
Expected: PASS (4 tests).

- [ ] **Step 13: Commit**

```bash
git add src/components
git commit -m "feat: add base UI components"
```

---

### Task 7: App shell, routes, providers and not-found

**Files:**
- Create: `src/components/AppShell.tsx`, `src/screens/NotFound.tsx`, `src/test/renderApp.tsx`
- Modify: `src/App.tsx` (replace), `src/main.tsx`, `src/App.test.tsx` (replace)

- [ ] **Step 1: Replace `src/App.test.tsx` with failing tests**

```tsx
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
```

- [ ] **Step 2: Create `src/test/renderApp.tsx`**

```tsx
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes, Providers } from '../App';

export function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Providers>
        <AppRoutes />
      </Providers>
    </MemoryRouter>,
  );
}
```

- [ ] **Step 3: Run the tests and confirm they fail**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL, `"Providers" is not exported by "src/App.tsx"` or `Unable to find role="link" name "OpenHood home"`.

- [ ] **Step 4: Create `src/components/AppShell.tsx`**

```tsx
import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { VISIT } from '../data/visit';
import { Icon, type IconName } from './Icon';

type TabId = 'car' | 'inspection' | 'help';
const TABS: { id: TabId; to: string; label: string; icon: IconName }[] = [
  { id: 'car', to: '/', label: 'My car', icon: 'home' },
  { id: 'inspection', to: '/inspect', label: 'Inspection', icon: 'car' },
  { id: 'help', to: '/help', label: 'Help', icon: 'help' },
];

export function activeTab(pathname: string): TabId {
  if (pathname.startsWith('/inspect') || pathname.startsWith('/findings')) return 'inspection';
  if (pathname.startsWith('/help')) return 'help';
  return 'car';
}

export function AppShell() {
  const { pathname } = useLocation();
  const tab = activeTab(pathname);

  useEffect(() => {
    if (!navigator.userAgent.includes('jsdom')) window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app oh-app">
      <header className="app-top oh-topbar">
        <Link className="oh-logo" to="/" aria-label="OpenHood home">
          <span className="oh-logo__mark">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
          </span>
          <span className="oh-logo__word" aria-hidden="true">OpenHood</span>
        </Link>
        <span className="oh-topbar__end">
          <span className="oh-tag oh-tag--navy">{VISIT.ro}</span>
        </span>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <nav className="app-tabs oh-tabbar" aria-label="Main">
        {TABS.map((t) => (
          <Link key={t.id} to={t.to} aria-current={tab === t.id ? 'page' : undefined}>
            <Icon name={t.icon} />
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/screens/NotFound.tsx`**

```tsx
import { Notice } from '../components/Notice';
import { Button } from '../components/Button';

export default function NotFound() {
  return (
    <>
      <Notice tone="error" title="We couldn’t find that page">
        The link may be out of date. Your visit details are safe.
      </Notice>
      <Button variant="secondary" to="/" block>
        Back to My car
      </Button>
    </>
  );
}
```

- [ ] **Step 6: Replace `src/App.tsx`**

```tsx
import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ToastProvider } from './components/Toast';
import { VisitProvider } from './state/VisitContext';
import NotFound from './screens/NotFound';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <VisitProvider>
      <ToastProvider>{children}</ToastProvider>
    </VisitProvider>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* ROUTES: each later task adds its <Route> lines directly above the catch-all */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
```

- [ ] **Step 7: Replace `src/main.tsx` to use Providers**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AppRoutes, Providers } from './App';
import './styles/oh.css';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Providers>
        <AppRoutes />
      </Providers>
    </HashRouter>
  </StrictMode>,
);
```

- [ ] **Step 8: Run the tests**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS (3 tests). (`/help` falls through to NotFound for now; the Help tab is still active because the tab follows the path.)

- [ ] **Step 9: Commit**

```bash
git add src
git commit -m "feat: add app shell, providers, routes and not-found screen"
```

---

### Task 8: Car view, Inspect and Findings screens

**Files:**
- Create: `src/components/CarView.tsx`, `src/screens/Inspect.tsx`, `src/screens/Findings.tsx`
- Modify: `src/App.tsx` (add imports and routes)
- Test: `src/screens/inspect.test.tsx`

- [ ] **Step 1: Write the failing test `src/screens/inspect.test.tsx`**

```tsx
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
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/screens/inspect.test.tsx`
Expected: FAIL, `Unable to find an accessible element with the role "button" and name /Finding 2.../`.

- [ ] **Step 3: Create `src/components/CarView.tsx`**

```tsx
import { FINDINGS } from '../data/findings';
import type { FindingId, View } from '../data/types';
import { STATUS_LABEL } from './StatusChip';

interface Props {
  view: View;
  zoomed: boolean;
  selectedId: FindingId;
  onSelect: (id: FindingId) => void;
  caption?: string;
}

const VIEW_LABEL: Record<View, string> = {
  'front-left': 'Car seen from the front left',
  'rear-right': 'Car seen from the rear right',
};

export function CarView({ view, zoomed, selectedId, onSelect, caption }: Props) {
  const selected = FINDINGS.find((f) => f.id === selectedId)!.markers[view];
  return (
    <div className={`car-view${zoomed ? ' is-zoomed' : ''}`}>
      <div className="car-view__stage" style={{ transformOrigin: `${(selected.x / 320) * 100}% ${(selected.y / 200) * 100}%` }}>
        <svg className="car-svg" viewBox="0 0 320 200" role="img" aria-label={VIEW_LABEL[view]}>
          <ellipse className="car-shadow" cx="160" cy="172" rx="140" ry="12" />
          <g transform={view === 'rear-right' ? 'translate(320 0) scale(-1 1)' : undefined}>
            <path
              className="car-body"
              d="M30 140 L40 110 Q46 98 64 96 L110 92 L140 64 Q148 56 162 56 L222 56 Q236 56 246 66 L274 96 Q292 100 294 116 L296 140 Q296 152 284 152 L42 152 Q30 152 30 140 Z"
            />
            <path className="car-glass" d="M118 92 L146 66 Q150 62 158 62 L194 62 L194 92 Z" />
            <path className="car-glass" d="M202 62 L222 62 Q232 62 240 70 L262 92 L202 92 Z" />
            <path className="car-line" d="M198 94 L198 146 M120 96 L120 146 M44 120 L292 120" />
            {view === 'front-left' ? (
              <rect className="car-light" x="34" y="112" width="18" height="8" rx="3" />
            ) : (
              <rect className="car-light" x="34" y="104" width="12" height="14" rx="2" />
            )}
            <circle className="car-tire" cx="88" cy="150" r="24" />
            <circle className="car-rim" cx="88" cy="150" r="11" />
            <circle className="car-tire" cx="242" cy="150" r="24" />
            <circle className="car-rim" cx="242" cy="150" r="11" />
          </g>
        </svg>
        {FINDINGS.map((f) => {
          const m = f.markers[view];
          const isSelected = f.id === selectedId;
          return (
            <button
              key={f.id}
              type="button"
              className={`car-marker car-marker--${f.status}${m.far ? ' is-far' : ''}${isSelected ? ' is-selected' : ''}`}
              style={{ left: `${(m.x / 320) * 100}%`, top: `${(m.y / 200) * 100}%` }}
              aria-pressed={isSelected}
              aria-label={`Finding ${f.number}, ${f.title}, ${STATUS_LABEL[f.status]}${m.far ? ', far side' : ''}`}
              onClick={() => onSelect(f.id)}
            >
              {f.number}
            </button>
          );
        })}
      </div>
      {caption && <p className="car-view__caption oh-label">{caption}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/screens/Inspect.tsx`**

```tsx
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { CarView } from '../components/CarView';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { FindingCard } from '../components/FindingCard';
import { Icon } from '../components/Icon';
import { Notice } from '../components/Notice';
import { FINDINGS } from '../data/findings';
import type { FindingId, View } from '../data/types';
import { useVisit } from '../state/VisitContext';

const VIEW_NAME: Record<View, string> = { 'front-left': 'Front left', 'rear-right': 'Rear right' };

export default function Inspect() {
  const { state } = useVisit();
  const [params] = useSearchParams();
  const [view, setView] = useState<View>('front-left');
  const [zoomed, setZoomed] = useState(false);
  const [selectedId, setSelectedId] = useState<FindingId>('brake-pads');
  const selected = FINDINGS.find((f) => f.id === selectedId)!;
  const otherView: View = view === 'front-left' ? 'rear-right' : 'front-left';

  const fallback = (
    <Notice title="3D model unavailable">You can still review every finding and photo in the list view.</Notice>
  );

  return (
    <>
      <BackLink to="/" label="Main page" />
      <div className="page-head">
        <h1 className="oh-h1">Explore your vehicle</h1>
        <p className="oh-small">Tap a finding. Dashed marker = far side.</p>
      </div>
      {params.get('model') === 'off' ? (
        fallback
      ) : (
        <>
          <ErrorBoundary fallback={fallback}>
            <CarView
              view={view}
              zoomed={zoomed}
              selectedId={selectedId}
              onSelect={setSelectedId}
              caption={`${VIEW_NAME[view]} view · Selected ${selected.number} · ${selected.location}`}
            />
          </ErrorBoundary>
          <div className="btn-row">
            <Button variant="secondary" small onClick={() => setView(otherView)}>
              <Icon name="rotate" size={16} />
              {VIEW_NAME[otherView].replace(' ', '-')} view
            </Button>
            <Button variant="secondary" small onClick={() => setZoomed((z) => !z)} aria-pressed={zoomed}>
              <Icon name={zoomed ? 'zoom-out' : 'zoom-in'} size={16} />
              {zoomed ? 'Zoom out' : 'Zoom in'}
            </Button>
          </div>
        </>
      )}
      <div className="stack">
        {FINDINGS.map((f) => (
          <FindingCard key={f.id} finding={f} to={`/findings/${f.id}`} selected={f.id === selectedId} decision={state.decisions[f.id]} />
        ))}
      </div>
      <Button variant="secondary" to="/findings" block>
        View findings as a list
      </Button>
    </>
  );
}
```

Note: `VIEW_NAME[otherView].replace(' ', '-')` produces `Rear-right` / `Front-left`, so the button names are exactly "Rear-right view" and "Front-left view" (the icon is `aria-hidden`).

- [ ] **Step 5: Create `src/screens/Findings.tsx`**

```tsx
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { FindingCard } from '../components/FindingCard';
import { FINDINGS } from '../data/findings';
import { useVisit } from '../state/VisitContext';

export default function Findings() {
  const { state } = useVisit();
  return (
    <>
      <BackLink to="/inspect" label="Vehicle model" />
      <div className="page-head">
        <h1 className="oh-h1">Your findings</h1>
        <p className="oh-small">The same findings and evidence, without the model.</p>
      </div>
      <div className="stack">
        {FINDINGS.map((f) => (
          <FindingCard key={f.id} finding={f} to={`/findings/${f.id}`} decision={state.decisions[f.id]} />
        ))}
      </div>
      <Button variant="secondary" to="/inspect" block>
        Open vehicle model
      </Button>
      <Button variant="dark" to="/summary" block>
        View inspection summary
      </Button>
    </>
  );
}
```

- [ ] **Step 6: Add routes to `src/App.tsx`**

Add imports below `import NotFound from './screens/NotFound';`:
```tsx
import Inspect from './screens/Inspect';
import Findings from './screens/Findings';
```
Add directly above `<Route path="*" element={<NotFound />} />`:
```tsx
        <Route path="inspect" element={<Inspect />} />
        <Route path="findings" element={<Findings />} />
```

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/screens/inspect.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "feat: add illustrated car view, inspect and findings screens"
```

---

### Task 9: Home, Finding, Evidence, Help and Summary screens

**Files:**
- Create: `src/components/EvidenceDiagram.tsx`, `src/screens/Home.tsx`, `src/screens/Finding.tsx`, `src/screens/Evidence.tsx`, `src/screens/Help.tsx`, `src/screens/Summary.tsx`
- Modify: `src/App.tsx`
- Test: `src/screens/content.test.tsx`

- [ ] **Step 1: Write the failing test `src/screens/content.test.tsx`**

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/renderApp';
import { STORAGE_KEY } from '../state/storage';

test('home greets the customer and shows the current stage', () => {
  renderApp('/');
  expect(screen.getByRole('heading', { name: 'Hi, Priya.' })).toBeInTheDocument();
  expect(screen.getByText('Your review').closest('li')).toHaveAttribute('aria-current', 'step');
  expect(screen.getByRole('link', { name: /Ask your technician/ })).toHaveAttribute('href', '/ask');
});

test('finding detail links to help, timing and review', () => {
  renderApp('/findings/brake-pads');
  expect(screen.getByRole('heading', { name: 'Front brake pads' })).toBeInTheDocument();
  expect(screen.getByText('3 mm measured · minimum 4 mm')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'What is a brake pad?' })).toHaveAttribute('href', '/help/brake-pad');
  expect(screen.getByRole('link', { name: 'Review this repair' })).toHaveAttribute('href', '/review/brake-pads');
});

test('unknown finding id shows not found', () => {
  renderApp('/findings/nope');
  expect(screen.getByText('We couldn’t find that page')).toBeInTheDocument();
});

test('evidence and help pages render', () => {
  renderApp('/findings/tire-tread/evidence');
  expect(screen.getByRole('heading', { name: 'Evidence · Rear tire tread' })).toBeInTheDocument();
});

test('help term and reset demo', async () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ decisions: { 'brake-pads': 'approved' }, messages: [], seen: [] }));
  renderApp('/help');
  await userEvent.click(screen.getByRole('button', { name: 'Reset demo' }));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).decisions).toEqual({});
});

test('summary shows the total for all recommended repairs', () => {
  renderApp('/summary');
  expect(screen.getByTestId('summary-total')).toHaveTextContent('$495.00');
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/screens/content.test.tsx`
Expected: FAIL, `Unable to find an accessible element with the role "heading" and name "Hi, Priya."`.

- [ ] **Step 3: Create `src/components/EvidenceDiagram.tsx`**

```tsx
import type { FindingId } from '../data/types';

export function EvidenceDiagram({ id }: { id: FindingId }) {
  if (id === 'brake-pads') {
    return (
      <div className="evidence">
        <svg viewBox="0 0 320 170" role="img" aria-label="Brake cross-section: the inner pad is worn to 3 millimeters">
          <rect className="ev-dark" x="96" y="20" width="104" height="14" />
          <rect className="ev-dark" x="96" y="20" width="14" height="112" />
          <rect className="ev-dark" x="186" y="20" width="14" height="112" />
          <rect className="ev-paper" x="114" y="40" width="20" height="88" />
          <rect className="ev-worn" x="134" y="40" width="7" height="88" />
          <rect className="ev-part" x="145" y="30" width="10" height="120" />
          <rect className="ev-paper" x="159" y="40" width="9" height="88" />
          <rect className="ev-paper" x="168" y="40" width="14" height="88" />
          <path className="ev-leader" d="M200 26 L236 26" />
          <text className="ev-label" x="240" y="30">Caliper</text>
          <path className="ev-leader" d="M137 84 L70 84" />
          <text className="ev-label ev-label--alert" x="12" y="80">Worn pad</text>
          <text className="ev-label ev-label--alert" x="12" y="94">3 mm</text>
          <path className="ev-leader" d="M150 150 L150 162 L176 162" />
          <text className="ev-label" x="180" y="166">Brake disc</text>
          <path className="ev-leader" d="M175 84 L236 84" />
          <text className="ev-label" x="240" y="80">Good pad</text>
          <text className="ev-label" x="240" y="94">9 mm</text>
        </svg>
      </div>
    );
  }
  return (
    <div className="evidence">
      <svg viewBox="0 0 320 170" role="img" aria-label="Tire tread close-up: grooves worn to 3/32 inch, near the wear bar">
        <rect className="ev-dark" x="70" y="14" width="180" height="142" rx="22" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} className="ev-part" x={88 + i * 32} y="24" width="16" height="122" rx="3" />
        ))}
        <rect className="ev-wear" x="88" y="78" width="144" height="8" />
        <path className="ev-leader" d="M232 82 L262 82" />
        <text className="ev-label" x="266" y="78">Wear bar</text>
        <text className="ev-label ev-label--alert" x="266" y="92">3/32 in</text>
        <path className="ev-leader" d="M96 30 L50 30" />
        <text className="ev-label" x="4" y="34">Groove</text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/screens/Home.tsx`**

```tsx
import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../components/Icon';
import { StatusChip } from '../components/StatusChip';
import { VISIT } from '../data/visit';
import { statusCounts, visitStage } from '../state/selectors';
import { useVisit } from '../state/VisitContext';

const STAGES = ['Check-in', 'Inspect', 'Your review', 'Repair', 'Pickup'];
const STAGE_INDEX = { review: 2, repair: 3, pickup: 4 } as const;
const STAGE_TITLE = { review: 'Waiting for your review', repair: 'Repair in progress', pickup: 'Ready for pickup' } as const;

const ROWS: { to: string; icon: IconName; title: string; sub: string }[] = [
  { to: '/ask', icon: 'chat', title: 'Ask your technician', sub: 'Plain-language answers by text or voice.' },
  { to: '/live', icon: 'video', title: 'Watch the bay live', sub: 'Switch camera angles during repair.' },
  { to: '/review', icon: 'clipboard', title: 'Review & approve repairs', sub: 'Evidence, urgency and cost for each item.' },
  { to: '/wait/brake-pads', icon: 'clock', title: 'Can this repair wait?', sub: 'Compare timing, risk and estimated cost.' },
];

export default function Home() {
  const { state } = useVisit();
  const stage = visitStage(state.decisions);
  const current = STAGE_INDEX[stage];
  const counts = statusCounts();

  return (
    <>
      <div className="page-head">
        <div className="oh-label">Your visit</div>
        <h1 className="oh-h1">Hi, {VISIT.customerFirstName}.</h1>
        <p className="oh-small">{VISIT.vehicle} · Inspection ready</p>
      </div>

      <section className="oh-panel stack" aria-label="Visit progress">
        <div className="stage-head">
          <span className="oh-h3">{STAGE_TITLE[stage]}</span>
          <span className="oh-caption">
            {current + 1} of {STAGES.length}
          </span>
        </div>
        <ol className="oh-stages">
          {STAGES.map((s, i) => (
            <li key={s} className={i < current ? 'is-done' : undefined} aria-current={i === current ? 'step' : undefined}>
              {s}
            </li>
          ))}
        </ol>
      </section>

      <Link className="oh-hero" to="/inspect">
        <span className="oh-label">Multi-point inspection</span>
        <span className="oh-h2 hero-title">
          Inspect damage in 3D <Icon name="arrow-up-right" />
        </span>
        <span className="oh-cluster">
          <StatusChip tone="attention" label={`${counts.attention} needs attention`} />
          <StatusChip tone="soon" label={`${counts.soon} plan soon`} />
        </span>
      </Link>

      <nav className="oh-list" aria-label="Visit actions">
        {ROWS.map((r) => (
          <Link key={r.to} className="oh-list__row" to={r.to}>
            <Icon name={r.icon} />
            <span>
              <span className="oh-list__title">{r.title}</span>
              <span className="oh-list__sub">{r.sub}</span>
            </span>
            <Icon name="chevron-right" size={16} />
          </Link>
        ))}
      </nav>
      <p className="oh-caption">Sample visit · demo data</p>
    </>
  );
}
```

- [ ] **Step 5: Create `src/screens/Finding.tsx`**

```tsx
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { EvidenceDiagram } from '../components/EvidenceDiagram';
import { Icon } from '../components/Icon';
import { DecisionChip, FindingStatusChip } from '../components/StatusChip';
import { FINDINGS, getFinding } from '../data/findings';
import { getTerm } from '../data/glossary';
import { useVisit } from '../state/VisitContext';
import NotFound from './NotFound';

export default function Finding() {
  const { id } = useParams();
  const finding = getFinding(id);
  const { state, dispatch } = useVisit();

  useEffect(() => {
    if (finding) dispatch({ type: 'markSeen', id: finding.id });
  }, [finding, dispatch]);

  if (!finding) return <NotFound />;
  const term = getTerm(finding.helpTerm)!;
  const next = FINDINGS[(FINDINGS.indexOf(finding) + 1) % FINDINGS.length];
  const decision = state.decisions[finding.id];

  return (
    <>
      <BackLink to="/inspect" label="Vehicle model" />
      <div className="page-head">
        <div className="oh-label">
          Finding {finding.number} of {FINDINGS.length}
        </div>
        <h1 className="oh-h1">{finding.title}</h1>
        <div className="oh-cluster">
          <FindingStatusChip status={finding.status} />
          <span className="oh-small">{finding.location}</span>
          {decision && <DecisionChip decision={decision} />}
        </div>
      </div>
      <section className={`oh-finding${finding.status === 'soon' ? ' oh-finding--amber' : ''}`}>
        <p className="oh-body">{finding.summary}</p>
        <p className="oh-data">{finding.measurement}</p>
        <Link className="evidence-preview" to={`/findings/${finding.id}/evidence`}>
          <EvidenceDiagram id={finding.id} />
          <span>
            <Icon name="expand" size={16} /> Enlarge evidence
          </span>
        </Link>
      </section>
      <Button variant="text" to={`/help/${term.id}`}>
        What is a {term.title.split(' (')[0].toLowerCase()}?
      </Button>
      <Button variant="secondary" to={`/wait/${finding.id}`} block>
        Can this repair wait?
      </Button>
      <Button to={`/review/${finding.id}`} block>
        Review this repair
      </Button>
      <Button variant="text" to={`/findings/${next.id}`}>
        Next finding: {next.title}
      </Button>
    </>
  );
}
```

- [ ] **Step 6: Create `src/screens/Evidence.tsx`**

```tsx
import { useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { EvidenceDiagram } from '../components/EvidenceDiagram';
import { FindingStatusChip } from '../components/StatusChip';
import { getFinding } from '../data/findings';
import NotFound from './NotFound';

export default function Evidence() {
  const finding = getFinding(useParams().id);
  if (!finding) return <NotFound />;
  return (
    <>
      <BackLink to={`/findings/${finding.id}`} label={finding.title} />
      <div className="page-head">
        <h1 className="oh-h1">Evidence · {finding.title}</h1>
        <FindingStatusChip status={finding.status} />
      </div>
      <EvidenceDiagram id={finding.id} />
      <p className="oh-data">{finding.measurement}</p>
      <p className="oh-small">{finding.whatIsWrong}</p>
      <p className="oh-caption">Annotated sample photo · illustrative</p>
    </>
  );
}
```

- [ ] **Step 7: Create `src/screens/Help.tsx`**

```tsx
import { Link, useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Notice } from '../components/Notice';
import { useToast } from '../components/Toast';
import { GLOSSARY, getTerm } from '../data/glossary';
import { useVisit } from '../state/VisitContext';
import NotFound from './NotFound';

export default function Help() {
  const { term } = useParams();
  const { dispatch, storageOk } = useVisit();
  const toast = useToast();

  if (term !== undefined) {
    const entry = getTerm(term);
    if (!entry) return <NotFound />;
    return (
      <>
        <BackLink to="/help" label="All help topics" />
        <div className="page-head">
          <div className="oh-label">Help</div>
          <h1 className="oh-h1">{entry.title}</h1>
        </div>
        <section className="oh-panel stack">
          <p className="oh-body">{entry.body}</p>
          <h2 className="oh-h3">Why it matters</h2>
          <p className="oh-body">{entry.why}</p>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1 className="oh-h1">Help</h1>
        <p className="oh-small">Plain-language answers about your car and this visit.</p>
      </div>
      <nav className="oh-list" aria-label="Help topics">
        {GLOSSARY.map((t) => (
          <Link key={t.id} className="oh-list__row" to={`/help/${t.id}`}>
            <Icon name="help" />
            <span>
              <span className="oh-list__title">{t.title}</span>
              <span className="oh-list__sub">{t.why}</span>
            </span>
            <Icon name="chevron-right" size={16} />
          </Link>
        ))}
      </nav>
      <h2 className="oh-h3 section-title">About this demo</h2>
      {!storageOk && (
        <Notice tone="warn" title="Decisions aren’t saved on this device">
          Your browser blocks storage, so choices reset when you close the page.
        </Notice>
      )}
      <p className="oh-small">This is a sample visit. No work is authorized and no messages are sent.</p>
      <Button
        variant="secondary"
        block
        onClick={() => {
          dispatch({ type: 'reset' });
          toast('Demo reset');
        }}
      >
        Reset demo
      </Button>
    </>
  );
}
```

- [ ] **Step 8: Create `src/screens/Summary.tsx`**

```tsx
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { FindingStatusChip } from '../components/StatusChip';
import { FINDINGS } from '../data/findings';
import { formatMoney } from '../data/money';
import { VISIT } from '../data/visit';
import { findingTotal } from '../state/selectors';

export default function Summary() {
  const total = FINDINGS.reduce((sum, f) => sum + findingTotal(f), 0);
  return (
    <>
      <BackLink to="/findings" label="Your findings" />
      <div className="page-head">
        <h1 className="oh-h1">Inspection summary</h1>
        <p className="oh-small">
          {VISIT.vehicle} · {VISIT.ro}
        </p>
      </div>
      <div className="oh-table-wrap">
        <table className="oh-table">
          <thead>
            <tr>
              <th>Item</th>
              <th className="oh-num">Total</th>
            </tr>
          </thead>
          <tbody>
            {FINDINGS.map((f) => (
              <tr key={f.id}>
                <td>
                  <div className="stack" style={{ gap: 6 }}>
                    <span>{f.title}</span>
                    <FindingStatusChip status={f.status} />
                  </div>
                </td>
                <td className="oh-num">{formatMoney(findingTotal(f))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>All recommended</td>
              <td className="oh-num" data-testid="summary-total">
                {formatMoney(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <Button to="/review" block>
        Review recommended repairs
      </Button>
      <p className="oh-caption">Sample estimate · tax included</p>
    </>
  );
}
```

- [ ] **Step 9: Add routes to `src/App.tsx`**

Add imports:
```tsx
import Home from './screens/Home';
import Finding from './screens/Finding';
import Evidence from './screens/Evidence';
import Help from './screens/Help';
import Summary from './screens/Summary';
```
Add directly above `<Route path="*" element={<NotFound />} />`:
```tsx
        <Route index element={<Home />} />
        <Route path="findings/:id" element={<Finding />} />
        <Route path="findings/:id/evidence" element={<Evidence />} />
        <Route path="help" element={<Help />} />
        <Route path="help/:term" element={<Help />} />
        <Route path="summary" element={<Summary />} />
```

- [ ] **Step 10: Run all tests**

Run: `npx vitest run`
Expected: PASS (all tests, including `src/App.test.tsx`).

- [ ] **Step 11: Commit**

```bash
git add src
git commit -m "feat: add home, finding, evidence, help and summary screens"
```

---

### Task 10: Ask the technician and Live bay screens

**Files:**
- Create: `src/components/VoiceNote.tsx`, `src/components/ChatBubble.tsx`, `src/screens/Ask.tsx`, `src/screens/Live.tsx`
- Modify: `src/App.tsx`
- Test: `src/screens/ask-live.test.tsx`

- [ ] **Step 1: Write the failing test `src/screens/ask-live.test.tsx`**

```tsx
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/renderApp';
import { STORAGE_KEY } from '../state/storage';

afterEach(() => vi.useRealTimers());

test('a suggested question gets a scripted technician voice reply', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  renderApp('/ask');
  await user.click(screen.getByRole('button', { name: 'Why both pads?' }));
  expect(screen.getByText('Why both pads?', { selector: '.oh-bubble--me .bubble-text' })).toBeInTheDocument();
  expect(screen.getByText(/is typing/)).toBeInTheDocument();
  await act(async () => { vi.advanceTimersByTime(1300); });
  expect(screen.getByText(/Pads are replaced in pairs/)).toBeInTheDocument();
});

test('typed question is sent and the box clears', async () => {
  renderApp('/ask');
  const box = screen.getByRole('textbox', { name: 'Your question' });
  await userEvent.type(box, 'Is it safe to drive?{Enter}');
  expect(screen.getByText('Is it safe to drive?')).toBeInTheDocument();
  expect(box).toHaveValue('');
});

test('live view switches camera and reflects decisions', async () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ decisions: { 'brake-pads': 'approved', 'tire-tread': 'declined' }, messages: [], seen: [] }));
  renderApp('/live');
  expect(screen.getByText('Repair in progress')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Switch to front-wheel camera' }));
  expect(screen.getByText('Camera 2 · Front-wheel camera')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/screens/ask-live.test.tsx`
Expected: FAIL, `Unable to find an accessible element with the role "button" and name "Why both pads?"`.

- [ ] **Step 3: Create `src/components/VoiceNote.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Icon } from './Icon';

const BARS = [6, 10, 16, 12, 20, 14, 8, 18, 22, 12, 9, 15, 19, 11, 7, 13, 17, 10, 6, 12, 16, 9, 14, 8];

function clock(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function VoiceNote({ durationSec }: { durationSec: number }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      setElapsed((e) => {
        if (e + 0.25 >= durationSec) {
          setPlaying(false);
          return 0;
        }
        return e + 0.25;
      });
    }, 250);
    return () => window.clearInterval(t);
  }, [playing, durationSec]);

  const progress = elapsed / durationSec;
  return (
    <div className="voice">
      <button type="button" className="voice__play" aria-label={playing ? 'Pause voice note' : 'Play voice note'} onClick={() => setPlaying((p) => !p)}>
        <Icon name={playing ? 'pause' : 'play'} size={14} />
      </button>
      <span className="voice__wave" aria-hidden="true">
        {BARS.map((h, i) => (
          <i key={i} className={i / BARS.length < progress ? 'is-on' : undefined} style={{ height: h }} />
        ))}
      </span>
      <span className="voice__time">{clock(playing ? durationSec - elapsed : durationSec)}</span>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/ChatBubble.tsx`**

```tsx
import type { Message } from '../data/types';
import { VISIT } from '../data/visit';
import { VoiceNote } from './VoiceNote';

export function ChatBubble({ message }: { message: Message }) {
  const mine = message.from === 'customer';
  const who = mine ? 'You' : `${VISIT.technician.name} · ${VISIT.technician.role}`;
  return (
    <div className={`oh-bubble ${mine ? 'oh-bubble--me' : 'oh-bubble--them'}`}>
      <span className="oh-bubble__who">
        {who} · {message.at}
      </span>
      {message.kind === 'voice' ? (
        <>
          <VoiceNote durationSec={message.durationSec ?? 6} />
          <p className="bubble-transcript">{mine ? 'Sample voice note' : `“${message.text}”`}</p>
        </>
      ) : (
        <span className="bubble-text">{message.text}</span>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create `src/screens/Ask.tsx`**

```tsx
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { BackLink } from '../components/BackLink';
import { ChatBubble } from '../components/ChatBubble';
import { Icon } from '../components/Icon';
import { replyFor, SUGGESTED, GENERIC_REPLY } from '../data/techReplies';
import type { Message } from '../data/types';
import { VISIT } from '../data/visit';
import { useVisit } from '../state/VisitContext';

const nowLabel = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

export default function Ask() {
  const { state, dispatch } = useVisit();
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  function scheduleReply(question: string | null) {
    const reply = question === null ? GENERIC_REPLY : replyFor(question);
    setTyping(true);
    timers.current.push(
      window.setTimeout(() => {
        const message: Message = {
          id: newId(),
          from: 'technician',
          kind: reply.durationSec > 0 ? 'voice' : 'text',
          text: reply.text,
          at: nowLabel(),
          durationSec: reply.durationSec > 0 ? reply.durationSec : undefined,
        };
        dispatch({ type: 'addMessage', message });
        setTyping(false);
      }, 1200),
    );
  }

  function ask(text: string) {
    const clean = text.trim();
    if (!clean) return;
    dispatch({ type: 'addMessage', message: { id: newId(), from: 'customer', kind: 'text', text: clean, at: nowLabel() } });
    scheduleReply(clean);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    ask(draft);
    setDraft('');
  }

  function sendVoice() {
    dispatch({ type: 'addMessage', message: { id: newId(), from: 'customer', kind: 'voice', text: 'Sample voice note', at: nowLabel(), durationSec: 6 } });
    scheduleReply(null);
  }

  return (
    <>
      <BackLink to="/" label="Main page" />
      <div className="page-head">
        <h1 className="oh-h1">Ask your technician</h1>
        <p className="oh-small">Front brake pads · Simulated conversation</p>
      </div>
      <section className="oh-panel stack" style={{ background: 'var(--oh-blue-tint)', borderColor: 'transparent' }}>
        <h2 className="oh-h3">Front brake pads</h2>
        <span className="oh-label">
          {VISIT.technician.name} · {VISIT.technician.role}
        </span>
        <p className="oh-small">Replies may arrive later while the technician works on your car.</p>
      </section>
      <div className="chat-log" role="log" aria-live="polite" aria-label="Conversation">
        {state.messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {typing && <span className="typing">{VISIT.technician.name} is typing</span>}
      </div>
      <div className="oh-cluster">
        {SUGGESTED.map((q) => (
          <button key={q} type="button" className="oh-chip" onClick={() => ask(q)}>
            {q}
          </button>
        ))}
      </div>
      <form className="composer" onSubmit={onSubmit}>
        <input aria-label="Your question" placeholder="Type your question…" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <button type="button" className="oh-btn oh-btn--secondary oh-btn--icon" aria-label="Send a sample voice note" onClick={sendVoice}>
          <Icon name="mic" size={18} />
        </button>
        <button type="submit" className="oh-btn oh-btn--primary oh-btn--icon" aria-label="Send question">
          <Icon name="send" size={18} />
        </button>
      </form>
    </>
  );
}
```

- [ ] **Step 6: Create `src/screens/Live.tsx`**

```tsx
import { useState } from 'react';
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { CarView } from '../components/CarView';
import { FINDINGS } from '../data/findings';
import { VISIT } from '../data/visit';
import { visitStage } from '../state/selectors';
import { useVisit } from '../state/VisitContext';

type Camera = 'overview' | 'front-wheel';

export default function Live() {
  const { state } = useVisit();
  const [camera, setCamera] = useState<Camera>('overview');
  const stage = visitStage(state.decisions);
  const approved = FINDINGS.filter((f) => state.decisions[f.id] === 'approved').map((f) => f.title.toLowerCase());

  const status =
    stage === 'review'
      ? { title: 'Inspection complete', body: 'Your shop is waiting for your repair decisions.' }
      : stage === 'repair'
        ? { title: 'Repair in progress', body: `${VISIT.technician.name} is working on: ${approved.join(' and ')}.` }
        : { title: 'No repairs approved', body: 'Your car will be ready for pickup shortly.' };

  return (
    <>
      <BackLink to="/" label="Main page" />
      <div className="page-head">
        <div className="oh-label">Customer</div>
        <h1 className="oh-h1">A window into the bay</h1>
        <p className="oh-small">
          {VISIT.vehicle} · {VISIT.bay}
        </p>
      </div>
      <section className="feed" aria-label="Sample live view">
        <span className="feed__live">Sample live view</span>
        <CarView view="front-left" zoomed={camera === 'front-wheel'} selectedId="brake-pads" onSelect={() => {}} />
        <span className="oh-h3">{camera === 'overview' ? 'Camera 1 · Bay overview' : 'Camera 2 · Front-wheel camera'}</span>
        <span className="oh-caption">Illustrative feed · No live camera connected</span>
      </section>
      <section className="oh-panel stack">
        <h2 className="oh-h3">{status.title}</h2>
        <p className="oh-small">{status.body}</p>
      </section>
      <Button variant="dark" block onClick={() => setCamera((c) => (c === 'overview' ? 'front-wheel' : 'overview'))}>
        {camera === 'overview' ? 'Switch to front-wheel camera' : 'Switch to bay overview'}
      </Button>
      {stage === 'review' && (
        <Button to="/review" block>
          Review recommended repairs
        </Button>
      )}
    </>
  );
}
```

- [ ] **Step 7: Add routes to `src/App.tsx`**

Add imports:
```tsx
import Ask from './screens/Ask';
import Live from './screens/Live';
```
Add directly above `<Route path="*" element={<NotFound />} />`:
```tsx
        <Route path="ask" element={<Ask />} />
        <Route path="live" element={<Live />} />
```

- [ ] **Step 8: Run all tests**

Run: `npx vitest run`
Expected: PASS (all tests).

- [ ] **Step 9: Commit**

```bash
git add src
git commit -m "feat: add ask-the-technician chat and live bay screens"
```

---

### Task 11: Can this repair wait? (timing picker)

**Files:**
- Create: `src/components/TimingPicker.tsx`, `src/screens/Wait.tsx`
- Modify: `src/App.tsx`
- Test: `src/screens/wait.test.tsx`

- [ ] **Step 1: Write the failing test `src/screens/wait.test.tsx`**

```tsx
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
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/screens/wait.test.tsx`
Expected: FAIL, `Unable to find an accessible element with the role "radio"`.

- [ ] **Step 3: Create `src/components/TimingPicker.tsx`**

```tsx
import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import type { TimingKey, TimingOption } from '../data/types';

const TONE_COLOR = { ok: 'var(--oh-teal)', soon: 'var(--oh-amber)', attention: 'var(--oh-red)' } as const;

interface Props {
  options: TimingOption[];
  value: TimingKey;
  onChange: (key: TimingKey) => void;
  label: string;
}

export function TimingPicker({ options, value, onChange, label }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = options.findIndex((o) => o.key === value);
    const next = (i + step + options.length) % options.length;
    onChange(options[next].key);
    refs.current[next]?.focus();
  }

  return (
    <div className="oh-timing" role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      {options.map((o, i) => (
        <button
          key={o.key}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={o.key === value}
          tabIndex={o.key === value ? 0 : -1}
          style={{ '--c': TONE_COLOR[o.tone] } as CSSProperties}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/screens/Wait.tsx`**

```tsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { FindingStatusChip } from '../components/StatusChip';
import { TimingPicker } from '../components/TimingPicker';
import { FINDINGS, getFinding } from '../data/findings';
import type { TimingKey } from '../data/types';
import { VISIT } from '../data/visit';
import NotFound from './NotFound';

export default function Wait() {
  const finding = getFinding(useParams().id);
  const [key, setKey] = useState<TimingKey>('now');
  if (!finding) return <NotFound />;
  const option = finding.timing.find((t) => t.key === key)!;
  const other = FINDINGS.find((f) => f.id !== finding.id)!;

  return (
    <>
      <BackLink to="/" label="Main page" />
      <div className="page-head">
        <h1 className="oh-h1">Can this repair wait?</h1>
        <p className="oh-small">
          {finding.title} · Recommended by {VISIT.technician.name}
        </p>
        <FindingStatusChip status={finding.status} />
      </div>
      <section className="oh-panel stack">
        <h2 className="oh-h3">What is wrong?</h2>
        <p className="oh-small">{finding.whatIsWrong}</p>
        <h2 className="oh-h3">Impact</h2>
        <p className="oh-small">{finding.impact}</p>
        <h2 className="oh-h3">What is recommended?</h2>
        <p className="oh-small">{finding.recommendation}</p>
      </section>
      <section className="oh-panel stack">
        <h2 className="oh-h3">Drag or tap to compare timing</h2>
        <TimingPicker options={finding.timing} value={key} onChange={setKey} label="Repair timing" />
      </section>
      <section className="oh-panel stack" aria-live="polite">
        <h2 className="oh-h3">{option.label === 'Now' ? 'Now · repair today' : `In ${option.label}`}</h2>
        <span className="oh-label">Risk</span>
        <p className="oh-small">{option.risk}</p>
        <span className="oh-label">Estimated repair cost</span>
        <p className="oh-price">{option.costText}</p>
        <p className="oh-caption">Illustrative risk · Timing varies with actual condition</p>
      </section>
      <Button to={`/review/${finding.id}`} block>
        Review repair and cost
      </Button>
      <Button variant="secondary" to="/ask" block>
        Ask your technician
      </Button>
      <Button variant="text" to={`/wait/${other.id}`}>
        Compare: {other.title}
      </Button>
    </>
  );
}
```

- [ ] **Step 5: Add the route to `src/App.tsx`**

Add import:
```tsx
import Wait from './screens/Wait';
```
Add directly above `<Route path="*" element={<NotFound />} />`:
```tsx
        <Route path="wait/:id" element={<Wait />} />
```

- [ ] **Step 6: Run all tests**

Run: `npx vitest run`
Expected: PASS (all tests).

- [ ] **Step 7: Commit**

```bash
git add src
git commit -m "feat: add can-this-repair-wait screen with timing picker"
```

---

### Task 12: Review, confirm sheet and decision summary

**Files:**
- Create: `src/components/ConfirmSheet.tsx`, `src/screens/Review.tsx`, `src/screens/ReviewItem.tsx`, `src/screens/Done.tsx`
- Modify: `src/App.tsx`
- Test: `src/screens/flows.test.tsx`

- [ ] **Step 1: Write the failing test `src/screens/flows.test.tsx`**

```tsx
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/renderApp';
import { STORAGE_KEY } from '../state/storage';

test('approve brakes, decline tire → summary shows $260.00 approved', async () => {
  renderApp('/review/brake-pads');
  await userEvent.click(screen.getByRole('button', { name: 'Approve repair · $260' }));
  const sheet = screen.getByRole('dialog', { name: 'Approve front brake pads?' });
  await userEvent.click(within(sheet).getByRole('button', { name: 'Approve · $260' }));
  // next undecided item opens
  expect(screen.getByRole('heading', { name: 'Rear tire tread' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Decline this repair' }));
  expect(screen.getByText('Repair approved')).toBeInTheDocument();
  expect(screen.getByTestId('approved-total')).toHaveTextContent('$260.00');
  expect(screen.getByText('Rear tire tread', { selector: '.declined-item' })).toBeInTheDocument();
});

test('declining both shows the nothing-approved summary', async () => {
  renderApp('/review/brake-pads');
  await userEvent.click(screen.getByRole('button', { name: 'Decline this repair' }));
  await userEvent.click(screen.getByRole('button', { name: 'Decline this repair' }));
  expect(screen.getByText('Decisions saved')).toBeInTheDocument();
  expect(screen.getByText('No repairs approved. Your car will be ready for pickup.')).toBeInTheDocument();
});

test('done with no decisions shows the empty state', () => {
  renderApp('/done');
  expect(screen.getByRole('heading', { name: 'You haven’t decided yet' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Review repairs' })).toHaveAttribute('href', '/review');
});

test('decisions persist across a reload and can be changed', async () => {
  const first = renderApp('/review/brake-pads');
  await userEvent.click(screen.getByRole('button', { name: 'Approve repair · $260' }));
  await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Approve · $260' }));
  first.unmount();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).decisions).toEqual({ 'brake-pads': 'approved' });

  renderApp('/review');
  expect(screen.getByTestId('approved-total')).toHaveTextContent('$260.00');
  await userEvent.click(screen.getByRole('button', { name: 'Change decision for Front brake pads' }));
  expect(screen.getByTestId('approved-total')).toHaveTextContent('$0.00');
});

test('closing the sheet with Go back records nothing', async () => {
  renderApp('/review/brake-pads');
  await userEvent.click(screen.getByRole('button', { name: 'Approve repair · $260' }));
  await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Go back' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(localStorage.getItem(STORAGE_KEY)).toContain('"decisions":{}');
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run src/screens/flows.test.tsx`
Expected: FAIL, `Unable to find an accessible element with the role "button" and name "Approve repair · $260"`.

- [ ] **Step 3: Create `src/components/ConfirmSheet.tsx`**

```tsx
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

interface Props {
  open: boolean;
  title: string;
  eyebrow?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  children: ReactNode;
}

export function ConfirmSheet({ open, title, eyebrow, confirmLabel, onConfirm, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      className="oh-dialog sheet"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="oh-dialog__head">
        <div>
          {eyebrow && <div className="oh-label">{eyebrow}</div>}
          <h2 className="oh-h2" id={titleId}>
            {title}
          </h2>
        </div>
        <button type="button" className="oh-dialog__close" aria-label="Close" onClick={onClose}>
          <Icon name="x" />
        </button>
      </div>
      <div className="oh-dialog__body">{children}</div>
      <div className="oh-dialog__foot">
        <Button block onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button variant="secondary" block onClick={onClose}>
          Go back
        </Button>
      </div>
    </dialog>
  );
}
```

- [ ] **Step 4: Create `src/screens/ReviewItem.tsx`**

```tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { CostLines } from '../components/CostLines';
import { EvidenceDiagram } from '../components/EvidenceDiagram';
import { Notice } from '../components/Notice';
import { FindingStatusChip } from '../components/StatusChip';
import { useToast } from '../components/Toast';
import { FINDINGS, getFinding } from '../data/findings';
import { formatWhole } from '../data/money';
import type { Decision, Decisions } from '../data/types';
import { VISIT } from '../data/visit';
import { findingTotal } from '../state/selectors';
import { useVisit } from '../state/VisitContext';
import NotFound from './NotFound';

export default function ReviewItem() {
  const finding = getFinding(useParams().id);
  const { state, dispatch } = useVisit();
  const navigate = useNavigate();
  const toast = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  if (!finding) return <NotFound />;

  const total = findingTotal(finding);
  const decision = state.decisions[finding.id];

  function decide(next: Decision) {
    dispatch({ type: 'decide', id: finding!.id, decision: next });
    toast(next === 'approved' ? `${finding!.title} approved · ${formatWhole(total)}` : `${finding!.title} declined`);
    setSheetOpen(false);
    const after: Decisions = { ...state.decisions, [finding!.id]: next };
    const nextItem = FINDINGS.find((f) => after[f.id] === undefined);
    navigate(nextItem ? `/review/${nextItem.id}` : '/done');
  }

  return (
    <>
      <BackLink to="/review" label="All repairs" />
      <div className="page-head">
        <div className="oh-label">
          {VISIT.ro} · Item {finding.number} of {FINDINGS.length}
        </div>
        <h1 className="oh-h1">Review this repair</h1>
        <p className="oh-small">Approving authorizes the work. You pay at pickup.</p>
      </div>
      <article className={`oh-finding${finding.status === 'soon' ? ' oh-finding--amber' : ''}`}>
        <h2 className="oh-h2">{finding.title}</h2>
        <FindingStatusChip status={finding.status} />
        <EvidenceDiagram id={finding.id} />
        <p className="oh-small">{finding.summary}</p>
        <Button variant="secondary" small to={`/findings/${finding.id}/evidence`}>
          Enlarge evidence
        </Button>
        <CostLines lines={finding.costLines} />
      </article>
      {decision ? (
        <>
          <Notice title={`You ${decision} this repair.`}>You can change your decision until work starts.</Notice>
          <Button variant="secondary" block onClick={() => dispatch({ type: 'decide', id: finding.id, decision: null })}>
            Change decision
          </Button>
        </>
      ) : (
        <>
          <Button block onClick={() => setSheetOpen(true)}>
            Approve repair · {formatWhole(total)}
          </Button>
          <Button variant="secondary" block onClick={() => decide('declined')}>
            Decline this repair
          </Button>
        </>
      )}
      <p className="oh-caption">Sample estimate · No work is authorized in this demo</p>
      <ConfirmSheet
        open={sheetOpen}
        title={`Approve ${finding.title.toLowerCase()}?`}
        eyebrow={`${VISIT.ro} · Item ${finding.number} of ${FINDINGS.length}`}
        confirmLabel={`Approve · ${formatWhole(total)}`}
        onConfirm={() => decide('approved')}
        onClose={() => setSheetOpen(false)}
      >
        <p className="oh-small" style={{ color: 'var(--oh-ink)' }}>
          {VISIT.technician.name} starts in {VISIT.bay} right away. You pay at pickup.
        </p>
        <CostLines lines={finding.costLines} />
      </ConfirmSheet>
    </>
  );
}
```

- [ ] **Step 5: Create `src/screens/Review.tsx`**

```tsx
import { BackLink } from '../components/BackLink';
import { Button } from '../components/Button';
import { DecisionChip, FindingStatusChip } from '../components/StatusChip';
import { FINDINGS } from '../data/findings';
import { formatMoney } from '../data/money';
import { approvedTotal, findingTotal, undecided } from '../state/selectors';
import { useVisit } from '../state/VisitContext';

export default function Review() {
  const { state, dispatch } = useVisit();
  const remaining = undecided(state.decisions).length;

  return (
    <>
      <BackLink to="/" label="Main page" />
      <div className="page-head">
        <div className="oh-label">Customer</div>
        <h1 className="oh-h1">Review repairs</h1>
        <p className="oh-small">Choose for each item. Approving authorizes the work; you pay at pickup.</p>
      </div>
      {FINDINGS.map((f) => {
        const decision = state.decisions[f.id];
        return (
          <article key={f.id} className={`oh-finding review-item${f.status === 'soon' ? ' oh-finding--amber' : ''}`}>
            <div className="review-item__head">
              <h2 className="oh-h3">{f.title}</h2>
              <span className="oh-price" style={{ fontSize: 18 }}>
                {formatMoney(findingTotal(f))}
              </span>
            </div>
            <div className="oh-cluster">
              <FindingStatusChip status={f.status} />
              {decision && <DecisionChip decision={decision} />}
            </div>
            <div className="review-item__actions">
              {decision ? (
                <Button variant="text" aria-label={`Change decision for ${f.title}`} onClick={() => dispatch({ type: 'decide', id: f.id, decision: null })}>
                  Change decision
                </Button>
              ) : (
                <Button variant="secondary" small to={`/review/${f.id}`}>
                  Review &amp; decide
                </Button>
              )}
            </div>
          </article>
        );
      })}
      <section className="oh-panel stack">
        <div className="total-bar">
          <span className="oh-h3">Approved total</span>
          <span className="oh-price" data-testid="approved-total">
            {formatMoney(approvedTotal(state.decisions))}
          </span>
        </div>
        <p className="oh-small">{remaining === 0 ? 'Every item has a decision.' : `${remaining} of ${FINDINGS.length} items still need a decision.`}</p>
      </section>
      <Button to="/done" block>
        See decision summary
      </Button>
    </>
  );
}
```

- [ ] **Step 6: Create `src/screens/Done.tsx`**

```tsx
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Notice } from '../components/Notice';
import { FINDINGS } from '../data/findings';
import { formatMoney } from '../data/money';
import { VISIT } from '../data/visit';
import { approvedTotal, findingTotal, undecided } from '../state/selectors';
import { useVisit } from '../state/VisitContext';

export default function Done() {
  const { state } = useVisit();
  const approved = FINDINGS.filter((f) => state.decisions[f.id] === 'approved');
  const declined = FINDINGS.filter((f) => state.decisions[f.id] === 'declined');
  const open = undecided(state.decisions);

  if (approved.length === 0 && declined.length === 0) {
    return (
      <>
        <div className="page-head">
          <h1 className="oh-h1">You haven’t decided yet</h1>
          <p className="oh-small">Review each recommended repair, then come back here for your summary.</p>
        </div>
        <Button to="/review" block>
          Review repairs
        </Button>
      </>
    );
  }

  const anyApproved = approved.length > 0;
  return (
    <>
      <section className={`done-hero${anyApproved ? '' : ' done-hero--neutral'}`}>
        <span className="oh-label">
          {VISIT.ro} · Decision summary
        </span>
        <h1 className="oh-display done-display">{anyApproved ? 'Repair approved' : 'Decisions saved'}</h1>
        <p>
          {anyApproved
            ? `${VISIT.technician.name} starts in ${VISIT.bay}. You pay at pickup.`
            : 'No repairs approved. Your car will be ready for pickup.'}
        </p>
      </section>

      {open.length > 0 && (
        <Notice tone="warn" title={`${open.length} item still needs a decision`}>
          <Link to={`/review/${open[0].id}`}>Decide on {open[0].title.toLowerCase()}</Link>
        </Notice>
      )}

      <section className="oh-panel stack">
        <h2 className="oh-h3">Approved</h2>
        {anyApproved ? (
          <ul className="done-list">
            {approved.map((f) => (
              <li key={f.id}>
                <span>{f.title}</span>
                <span className="oh-data">{formatMoney(findingTotal(f))}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="oh-small">Nothing approved.</p>
        )}
        <div className="oh-total">
          <span className="oh-h3">Approved total</span>
          <span className="oh-price" data-testid="approved-total">
            {formatMoney(approvedTotal(state.decisions))}
          </span>
        </div>
      </section>

      {declined.length > 0 && (
        <section className="oh-panel stack">
          <h2 className="oh-h3">Declined</h2>
          <ul className="done-list">
            {declined.map((f) => (
              <li key={f.id}>
                <span className="declined-item">{f.title}</span>
                <span className="oh-small">Ask about it at your next visit</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="oh-panel stack">
        <h2 className="oh-h3">What happens next</h2>
        <ol className="next-steps oh-small">
          {anyApproved && <li>{VISIT.technician.name} starts the approved work in {VISIT.bay}.</li>}
          <li>You get a text when your car is ready.</li>
          <li>Pay at pickup. Nothing is charged now.</li>
        </ol>
      </section>

      {anyApproved ? (
        <Button to="/live" block>
          Watch the bay live
        </Button>
      ) : (
        <Button variant="secondary" to="/" block>
          Back to My car
        </Button>
      )}
      <Button variant="text" to="/review">
        Change decisions
      </Button>
    </>
  );
}
```

- [ ] **Step 7: Add routes to `src/App.tsx`**

Add imports:
```tsx
import Review from './screens/Review';
import ReviewItem from './screens/ReviewItem';
import Done from './screens/Done';
```
Add directly above `<Route path="*" element={<NotFound />} />`:
```tsx
        <Route path="review" element={<Review />} />
        <Route path="review/:id" element={<ReviewItem />} />
        <Route path="done" element={<Done />} />
```

- [ ] **Step 8: Run all tests**

Run: `npx vitest run`
Expected: PASS (all tests).

- [ ] **Step 9: Commit**

```bash
git add src
git commit -m "feat: add review, confirm sheet and decision summary"
```

---

### Task 13: Build and manual browser check

**Files:**
- Create: `.claude/launch.json`, `README.md`

- [ ] **Step 1: Full test run and production build**

Run: `npm test && npm run build`
Expected: all tests PASS; `tsc` reports no errors; Vite prints `✓ built in`.

- [ ] **Step 2: Create `.claude/launch.json`**

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "openhood-app", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev", "--", "--port", "5173", "--strictPort"], "port": 5173 }
  ]
}
```

- [ ] **Step 3: Click through every route in the browser**

Start the dev server (`preview_start` with name `openhood-app`). At 375 × 812 and again at desktop width, visit:
`#/`, `#/inspect` (tap both markers, rotate, zoom), `#/inspect?model=off`, `#/findings`, `#/findings/brake-pads`, `#/findings/brake-pads/evidence`, `#/help`, `#/help/brake-disc`, `#/summary`, `#/ask` (tap a chip, wait for the reply, play a voice note), `#/live` (switch camera), `#/wait/brake-pads` (pick each timing), `#/review`, `#/review/brake-pads` (approve via the sheet, then decline the tire), `#/done`, then reload and confirm the decisions are still there, `#/nowhere`.
Expected: content matches the Figma, the style guide colors and fonts show, there is no horizontal scroll at 375 px, and the console has no errors.

- [ ] **Step 4: Create `README.md`**

```markdown
# OpenHood customer app (MVP)

Frontend-only MVP of the OpenHood customer phone app: inspect findings, ask the technician, watch the bay, decide whether a repair can wait, and approve or decline repairs. All data is sample data; nothing is sent anywhere.

- Design spec: `docs/superpowers/specs/2026-11-23-openhood-customer-mvp-design.md`
- Styles: `src/styles/oh.css` is generated from the OpenHood Service Bay style guide.

## Run

    npm install
    npm run dev      # http://localhost:5173
    npm test
    npm run build    # static files in dist/ (works on GitHub Pages)

Add `?model=off` to `#/inspect` to see the "3D model unavailable" state. "Reset demo" is in the Help tab.
```

- [ ] **Step 5: Commit**

```bash
git add .claude/launch.json README.md
git commit -m "docs: add README and dev server launch config"
```
