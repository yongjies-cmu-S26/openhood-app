# OpenHood app (MVP)

OpenHood includes a phone-first customer view and a responsive service-advisor workspace. Customers can inspect findings, ask the technician, compare repair timing, and confirm repair decisions. Advisors can track active visits, send simulated inspection updates, and see customer decisions.

[Open the live demo](https://yongjies-cmu-s26.github.io/openhood-app/)

## Technology stack

- **React 18 and TypeScript** for the app, with `@google/model-viewer` for the `/inspect` 3D vehicle view and Vite for development and production builds.
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

Open `http://localhost:5173`, or use the URL Vite prints if the port is occupied. Choose **Help → Reset demo** to clear saved decisions, chat, advisor activity, and camera history. To try the vehicle-view fallback, open `http://localhost:5173/#/inspect?model=off`.

Run `npm test` to run the tests. Use `npm run build` to generate the static site in `dist/`, then `npm run preview` to serve that build locally.

## Try the MVP workflows

- **Advisor update and approval.** From **My car**, open **Advisor workspace**, select Priya Shah under **Needs update**, and send her update. Open the customer estimate from the message preview, decide on each repair, and select **Confirm decisions**. Return to the advisor dashboard to see the updated visit lane and open the notification bell for the decision record.
- **Camera recovery.** Open **Watch the bay live**, switch to the front-wheel camera, and select **Simulate connection loss**. After 10 seconds, the outage is recorded and the repair status stays visible. **Simulate camera startup failure** shows the same recovery state immediately. Select **Reconnect camera** to reconnect to the same simulated camera.

## Limitations

- **Sample data and local storage.** Visits, findings, prices, and repair timing estimates are illustrative. Decisions, advisor notifications, chat messages, and camera outages are saved in the browser. Use the same browser profile and app origin to share the customer and advisor demo state between tabs. Only Priya’s visit has a full customer decision flow. Other sample visits show inspection and estimate previews.
- **Illustrative 3D vehicle model and simulated media.** Inspection on `/inspect` uses a bundled CC0 low-poly sedan `.glb` (`@google/model-viewer`) labeled **Illustrative vehicle model** with wheel-mounted 3D markers, camera presets, and a fallback when WebGL, the model, or `?model=off` disables 3D; each finding links to annotated SVG evidence diagrams. The bay camera on `/live` remains an illustrative SVG feed. Technician replies are scripted. The mic records a real voice question (up to 60 seconds, saved in this browser) and plays it back; if recording is unavailable, a sample note is sent instead. Technician voice replies are read aloud with the browser's built-in speech voice rather than a recorded human voice.
- **Incomplete customer interactions.** The timing picker supports taps and keyboard selection. Dragging is unavailable. Glossary definitions open a separate screen. Chat always shows the front-brake topic, and navigating away cancels a pending scripted reply.
- **Demo delivery and retry.** SMS and email delivery, technician messaging, and camera connections are simulated. The customer and advisor views require no authentication and record demo decisions without taking payment or authorizing actual repair work. Customers can edit their choices before confirming. If the advisor sends a new update, the customer can review and confirm the choices again.

## Project documents

- [Design spec](docs/superpowers/specs/2026-11-23-openhood-customer-mvp-design.md)
- [Implementation plan](docs/superpowers/plans/2026-11-23-openhood-customer-mvp.md)
