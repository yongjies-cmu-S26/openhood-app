# OpenHood customer app MVP: design spec

Date: 2026-11-23
Status: approved in brainstorming, waiting on written-spec review

## 1. Goal and scope

Build a frontend-only MVP of the **OpenHood customer phone app**: the experience a repair-shop customer has after dropping off a car. They inspect findings, ask the technician questions, watch the bay, decide whether a repair can wait, and approve or decline each repair.

- Source of truth for screens and copy: Figma file "OpenHood-Prototype" (`Pt6uJORboRO9bw4Vr49GHp`), customer frames 01–19 and the decision-summary frames.
- Source of truth for the visual design: OpenHood Service Bay style guide v2 (`~/openhood-style-guide/index.html`, the `#oh-css` block).
- There is no backend. All data is static demo data, and all "live" features (camera, technician replies, voice notes) are simulated and labeled as samples.

**In scope:** the 13 customer routes in section 3.

**Out of scope:** the SMS notification screen (00), every advisor-desk screen (16–17 and the dashboards, which are the next sub-project), real authentication, real payments, a real 3D model, a real camera, real audio recording, and sending real messages.

## 2. Tech stack

- React 18 + Vite + TypeScript
- `react-router-dom` with `HashRouter`, so it can be deployed as static files to GitHub Pages
- Plain CSS built on the style guide's `--oh-` tokens and `.oh-` classes. No CSS framework.
- Tests: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`
- No other runtime dependencies

Project folder: `~/openhood-app`

## 3. Screens and routes

| Route | Figma | Content and behavior |
|---|---|---|
| `/` | 01 | "Hi, Priya.", "2018 Honda Civic · Inspection ready", visit stages, navy hero card "Inspect damage in 3D" with status counts, action list (Ask your technician, Watch the bay live, Review & approve, Can this repair wait?) |
| `/inspect` | 02, 03, 02b–03d | SVG car in two views (front-left, rear-right), numbered markers for each finding, "Rear-right view ↻" / "Front-left view ↻" toggle, "Zoom in + / Zoom out −", the selected finding highlighted with its card below, "View findings as a list" |
| `/findings` | 08 | "Your findings": one card per finding with its number, title, status and location, plus "Open vehicle model" and "View inspection summary" |
| `/findings/:id` | 04, 05 | Title, status, location, plain-language explanation, evidence preview, links to "Enlarge evidence", "What is a {term}?", "Can this repair wait?", "Review this repair" and "Next finding" |
| `/findings/:id/evidence` | 06, 06b | Large annotated SVG diagram (brake cross-section with caliper, worn pad and brake disc; tire tread with wear bars) and a caption |
| `/help/:term` | 07, 07b, 09b | Glossary entry (brake pad, brake disc/rotor, tire tread) in plain language. `/help` with no term lists all terms, plus "Reset demo" |
| `/summary` | 09 | Both findings with status and price, the total, and "Review recommended repairs" |
| `/ask` | 10, 11, 11a, 11b | Context card (finding, Miguel · Technician, "Replies may arrive later…"), chat thread, three suggested-question chips, text box, mic button that adds a "Sample voice note" bubble, and scripted technician replies (text plus a voice-note player) after about a 1.2 s typing indicator |
| `/live` | 12, 13, 12b, 12c | "A window into the bay", the simulated feed (SVG car with markers) labeled "Sample live view · No live camera connected", a camera switcher (Bay overview / Front-wheel camera), and a status card that changes with the decisions (inspection complete → repair in progress) |
| `/wait/:id` | 18, 19, 18b | What is wrong, Impact, What is recommended, a timing picker (Now / 3 months / 6 months) with each option's risk text and estimated cost, "Review repair and cost" and "Ask your technician" |
| `/review` | 14a, 14b, 14 variants | Every finding with Approve / Decline / Change decision, the decided state shown per item, a running "Approved total", and "Continue" to `/done` |
| `/review/:id` | 14 | Evidence diagram, explanation, cost lines, total, "Approve {title} · ${total}" opens the confirm sheet, "Decline this repair" records the decline. "You pay at pickup." |
| `/done` | 15, 15b, 15c, decision summaries | The approved list and total, the declined list, "What happens next" (Miguel starts in Bay 02, the live view link). If nothing has been decided: "You haven't decided yet" plus "Review repairs" |
| `*` | | "We couldn't find that page" notice and a link Home |

Shared on every screen:

- **AppShell:** a navy top bar with the logo and "RO-1048" tag, and a blue 4 px bottom line.
- **Tab bar:** My car → `/`, Inspection → `/inspect`, Help → `/help`. The active tab is chosen by route prefix.
- **BackLink:** "‹ {label}", going to the logical parent, not browser history.
- The content column is 375 px phone-first, centered with a max width of 480 px.

## 4. Demo data (typed)

`data/visit.ts`

```ts
visit = { customerFirstName: "Priya", vehicle: "2018 Honda Civic", ro: "RO-1048", bay: "Bay 02",
          technician: { name: "Miguel", role: "Technician" }, advisor: "Alex", shopCloses: "6:00 PM" }
```

`data/findings.ts`, `Finding`:

```ts
type Status = "attention" | "soon"
type CostLine = { label: string; amount: number }   // cents
type TimingOption = { key: "now" | "3m" | "6m"; label: string; risk: string; costText: string; tone: "ok" | "soon" | "attention" }
type Finding = { id: "brake-pads" | "tire-tread"; number: 1 | 2; title: string; status: Status;
                 location: string; view: "front-left" | "rear-right"; marker: { x: number; y: number };
                 summary: string; whatIsWrong: string; impact: string; recommendation: string;
                 measurement: string; helpTerm: string; costLines: CostLine[]; timing: TimingOption[] }
```

| | Front brake pads (1) | Rear tire tread (2) |
|---|---|---|
| Status | attention, "Needs attention" | soon, "Plan soon" |
| Location | Front left wheel | Rear right wheel |
| Measurement | 3 mm (minimum 4 mm) | 3/32 in (minimum 2/32 in) |
| Cost lines | Parts $140.00, Labor · 1.0 hr $100.00, Tax $20.00 | Parts · 1 tire $160.00, Labor · 0.6 hr $60.00, Tax $15.00 |
| Total | $260.00 | $235.00 |
| Timing: now | Lowest risk · $260 | Lowest risk · $235 |
| Timing: 3 months | Pads keep wearing, braking response drops · est. $260–$330 | Grip in rain drops · est. $235 |
| Timing: 6 months | Metal on rotor, rotor may need replacing · est. $310–$520 | Tread at the legal limit, replace before winter · est. $235–$260 |

All money is stored as integer cents. Totals are always computed from the cost lines, never typed in. Every timing screen is labeled "Illustrative risk · Timing varies with actual condition".

`data/glossary.ts`: `brake-pad`, `brake-disc`, `tire-tread`, each with a title, a 2–3 sentence plain explanation, and a "Why it matters" line.

`data/techReplies.ts`: replies to the three suggested chips ("Why both pads?", "Can it wait?", "What does it cost?"), plus a generic reply for any typed question: "Thanks, I'll answer as soon as I'm off the lift. Usually within 15 minutes."

## 5. State

`state/VisitContext.tsx`, a React context with a reducer.

```ts
type Decision = "approved" | "declined"
type Message = { id: string; from: "customer" | "technician"; kind: "text" | "voice"; text: string; at: string; durationSec?: number }
type State = { decisions: Partial<Record<FindingId, Decision>>; messages: Message[]; seen: FindingId[] }
type Action =
  | { type: "decide"; id: FindingId; decision: Decision | null }   // null clears the decision
  | { type: "addMessage"; message: Message }
  | { type: "markSeen"; id: FindingId }
  | { type: "reset" }
```

- **Initial state:** no decisions, the seeded opening message from the customer, nothing seen.
- **Saving:** the store is saved to `localStorage["openhood.v1"]` on every change and read once on load. Every storage access is wrapped in try/catch. If storage is unavailable, the app runs in memory and shows an info notice on Help.
- **Derived selectors** (pure functions in `state/selectors.ts`):
  - `findingTotal(f)`
  - `approvedTotal(state)`
  - `allDecided(state)`
  - `visitStage(state)` → `review` while any finding is undecided, `repair` once every finding is decided and at least one is approved, and `pickup` once every finding is declined
  - `statusCounts()`

Visit stages on Home: Check-in ✓ · Inspect ✓ · Your review · Repair · Pickup. Done stages are teal, the current stage is blue, and later stages are gray.

## 6. Components

All components live in `src/components/` and are styled with the style guide classes.

| Component | Purpose |
|---|---|
| `AppShell` | Top bar, scrolling main area, tab bar |
| `BackLink` | Blue "‹ label" link |
| `Button` | variant: primary (teal) / secondary / dark / text. Renders `<button>` or a router `<Link>` |
| `StatusChip` | Colored square plus a word. Red and amber appear only here and on finding-card edges |
| `FindingCard` | Status-colored left edge, number, title, status, location, chevron |
| `CostLines` | Mono cost lines with a dashed rule above the total |
| `CarView` | Inline SVG car for `front-left` / `rear-right`, finding markers as `<button>`s with aria-labels, zoom state. Calls `onError` if it fails to render |
| `EvidenceDiagram` | SVG per finding (brake cross-section, tire tread) |
| `TimingPicker` | Three-option radio group styled as the timing control, with arrow-key support |
| `ChatBubble`, `VoiceNote` | Message bubbles; the voice note has a play/pause button, waveform and fake progress |
| `ConfirmSheet` | Native `<dialog>` bottom sheet that traps focus and closes on Esc and on backdrop click |
| `Notice` | info / warn / error |
| `Toast` | Confirms decisions ("Front brake pads approved · $260"). One at a time, gone after 4 s |

Rules from the style guide: one teal primary button per screen, sentence case everywhere, `.oh-display` (bold caps) only on `/done` ("REPAIR APPROVED" / "DECISIONS SAVED"), and prices in Overpass Mono.

## 7. Error and edge states

- **Unknown route or finding id:** a `Notice` plus a link Home.
- **Car view failure:** "3D model unavailable · You can still review every finding and photo in the list view" (09c), with the findings list rendered below.
- **No storage:** described in section 5.
- **Changing a decision:** allowed at any time from `/review`. `/done` always reflects the current state.
- **`/done` with nothing decided:** shows the empty state with "Review repairs".
- **Simulated features:** always labeled as samples.

## 8. Accessibility

- Semantic buttons and links everywhere, and a visible focus ring (`--oh-focus`).
- Every icon-only button has an `aria-label`.
- Car markers are named, for example "Finding 1, Front brake pads, Needs attention".
- The timing picker is a `radiogroup`.
- The confirm sheet uses `<dialog>` with focus trap and Esc.
- Status is never shown by color alone.
- Text contrast meets the style guide's AA pairs.
- `prefers-reduced-motion` disables the typing indicator animation and transitions.

## 9. Testing

Unit and component tests use Vitest + Testing Library, with jsdom:

1. **Reducer:** decide, clear a decision, change a decision, add a message, reset, and hydrate from saved JSON (including malformed JSON, which falls back to the initial state).
2. **Selectors:** `approvedTotal` for all 9 decision combinations (undecided / approved / declined × 2 findings), mirroring the Figma decision-summary frames. Expected: UU $0, UA $235, UD $0, AU $260, AA $495, AD $260, DU $0, DA $235, DD $0. Plus `visitStage` for each combination.
3. **Flows:**
   - Approving brakes from `/review/brake-pads` through the confirm sheet makes `/done` show $260.00.
   - Declining both shows the "nothing approved" summary.
   - An unknown finding id shows the not-found notice.
   - Tapping marker 2 on `/inspect` selects Rear tire tread.

Manual check: run the dev server, click through all 13 routes at 375 px and 1280 px wide in the browser, and check the console for errors.

## 10. Done criteria

- All routes in section 3 render with Figma content and the style guide's look.
- `npm test` passes and `npm run build` succeeds with no TypeScript errors.
- The end-to-end approve and decline flows work, and the decisions persist across a reload.
- There are no console errors during the manual click-through.
