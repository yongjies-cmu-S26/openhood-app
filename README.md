# OpenHood customer app (MVP)

Frontend-only MVP of the OpenHood customer phone app: inspect findings, ask the technician, watch the bay, decide whether a repair can wait, and approve or decline repairs. All data is sample data; nothing is sent anywhere.

- Design spec: `docs/superpowers/specs/2026-11-23-openhood-customer-mvp-design.md`
- Implementation plan: `docs/superpowers/plans/2026-11-23-openhood-customer-mvp.md`
- Styles: `src/styles/oh.css` is generated from the OpenHood Service Bay style guide.

## Run

    npm install
    npm run dev      # http://localhost:5173
    npm test
    npm run build    # static files in dist/ (works on GitHub Pages)

Add `?model=off` to `#/inspect` to see the "3D model unavailable" state. "Reset demo" is in the Help tab.

Requires Node 20+. On Node 22+ the test config turns off Node's built-in `localStorage` so jsdom's is used.

**Live:** https://yongjies-cmu-s26.github.io/openhood-app/ (deployed by `.github/workflows/deploy.yml` on every push to `main`).
