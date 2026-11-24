# OpenHood customer app (MVP)

OpenHood is a frontend-only, phone-first customer demo. Customers can inspect vehicle findings, ask the technician, watch a sample bay feed, compare repair timing, and approve or decline repairs.

[Open the live demo](https://yongjies-cmu-s26.github.io/openhood-app/)

## Technology stack

- React 18 and TypeScript for the app, with Vite for development and production builds.
- React Router with hash routing so routes work on GitHub Pages.
- Plain CSS with shared design tokens and browser `localStorage` for demo state.
- Vitest, Testing Library, and jsdom for tests. GitHub Actions builds and deploys the static site on pushes to `main`.

## Style guide

The [OpenHood Service Bay Style Guide](https://yongjies-cmu-s26.github.io/openhood-style-guide/) provides live examples and copyable CSS. The app uses its shared rules in [`src/styles/oh.css`](src/styles/oh.css).

## Launch locally

Use Node.js 20, 22, or 24+ with npm. Run these commands from the root of the cloned `openhood-app` repo.

```sh
npm ci
npm run dev
```

Open `http://localhost:5173`, or use the URL Vite prints if the port is occupied. Choose **Help → Reset demo** to clear the saved chat and repair decisions. To try the vehicle-view fallback, open `http://localhost:5173/#/inspect?model=off`.

Run `npm test` to run the tests. Use `npm run build` to generate the static site in `dist/`, then `npm run preview` to serve that build locally.

## Limitations

- **Sample data and local storage.** The visit, findings, prices, and repair timing estimates are illustrative. Chat messages and repair decisions are stored in the current browser, with no backend or sync across devices.
- **Simulated vehicle view and media.** Inspection uses two zoomable SVG views with annotated evidence diagrams. The bay camera is illustrative. Technician replies are scripted, and voice notes simulate recording and playback without using a microphone or playing audio.
- **Incomplete customer interactions.** The timing picker supports taps and keyboard selection. Dragging is unavailable. Glossary definitions open a separate screen. Chat always shows the front-brake topic, and navigating away cancels a pending scripted reply.
- **Customer workflow only.** The service-advisor dashboard and outbound status updates are outside this build. The app does not send SMS, email, or real chat messages, and it does not authenticate users, accept payment, or authorize actual repairs.

## Project documents

- [Design spec](docs/superpowers/specs/2026-11-23-openhood-customer-mvp-design.md)
- [Implementation plan](docs/superpowers/plans/2026-11-23-openhood-customer-mvp.md)
