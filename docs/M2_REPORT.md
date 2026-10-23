# M2 — Cube Input and Orientation

Date: 2026-10-23. Status: COMPLETE for automated M2 acceptance. M1 was complete at session start. Only M2 implementation was performed; M3 has not started. Physical orientation confirmation remains pending and must not be inferred from virtual tests.

## Implemented

- Six-face entry in green/front, red/right, blue/back, orange/left, white/up, yellow/down order, using the canonical URFDLB positions from M0.
- A distinct partial input model with 48 initially empty editable stickers and six fixed centers. Row/column/color labels, active selection, named palette, keyboard arrows and Enter/Space, corrections and Clear face.
- Painting selects the next empty slot on the current face only. Neither selecting a palette color nor smart selection paints another sticker; completion never changes faces automatically.
- Named above/right landmarks and first-entry whole-cube orientation animation for each face. Camera-only movement, exact reference-mesh readback, reduced motion, automatic reference shrinking, hide/reopen, text fallback, and mobile-aware focus. No layer turns occur during guidance.
- Previous/Next and direct face navigation preserve incomplete work. Live completion, missing stickers and color counts include centers. Excess-color warnings preserve all entries and do not claim physical impossibility.
- Versioned minimal local persistence with defensive restoration, unavailable-storage messages and in-memory recovery. Navigation and refresh preserve corrections. A native modal confirms resetting existing work and supports cancellation/Escape.
- Preparation now leads to entry. Welcome, fixed demo, solver/worker and M0 diagnostics remain functional. Entered colors are never sent to the solver in M2, even when fully filled; the UI explicitly says they have not been physically checked.

## Engineering decisions

Use ordinary TypeScript modules for partial input, mapping and persistence; keep UI state at app scope. Persist only facelets/current face, not transient palette/selection/guide/solver state. Reject saved data with incorrect shape, version, colors or centers; accept unchecked distributions because M3 owns physical validity.

Use the existing Three.js camera and solved reference, not a second cube model or renderer library. Guidance moves the camera and validates the resulting actual sticker state; it never mutates input or applies a layer move. Keep all six proposed landmarks after checking the upstream cubejs net, labeled geometry and projected camera directions. No dependencies or solver algorithms were changed.

See DECISIONS.md for trade-offs and test-driver synchronization corrections.

## Verification

- `npm test`: 43 tests passed across two files (last run 26.78 s while browser checks ran). Includes existing 103 legal solving states, all 18 moves, all 54 entry positions, camera landmarks for six faces, corners, smart selection, immutable correction/clear, counts and persistence/error cases.
- `npm run build`: TypeScript and production Vite build passed. Last build 651 ms; main JavaScript 792.15 kB / 212.62 kB gzip; CSS 13.05 kB / 3.47 kB gzip; worker unchanged at 19.54 kB. The existing >500 kB warning remains.
- `npm run test:browser`: final combined suite 34 passed (1.7 min), installed Chrome 155.0.8059.85 and Edge 155.0.4283.62 at `/Face54/`, preserving M0/M1 coverage plus ten M2 scenarios per browser. It checks real worker loading for the demo and zero workers during entry; all 48 legal-fixture entries; exact draft refresh; every guide's actual 54-sticker endpoint; mouse, keyboard and emulated touch; excess counts; reset confirmation; malformed, unavailable and quota-failing storage; and editable text-guidance fallback without WebGL2.
- `node node_modules/@playwright/test/cli.js test tests/foundation.spec.ts --grep 'touch drag|keyboard navigation' --repeat-each=3`: twelve focused checks passed after correcting the inherited test-driver issues described below.
- Desktop 1440×1000 and mobile 390×844 entry screenshots are inspected and selected captures retained under docs/screenshots. No horizontal scrolling at those tested widths. Full browser captures regenerate under ignored test-results/.
- Sticker text contrast: white 18.32:1, red 5.01:1, green 5.05:1, yellow 12.89:1, orange 5.80:1, blue 8.47:1. Empty-cell boundary contrast 3.22:1. This is not a complete assistive-technology audit.
- Scoped `git diff --check -- .` passes; no commits, pushes or deployment.

## Files changed

- New modules/components: src/input.ts, src/orientation.ts, src/persistence.ts, src/useDraft.ts, src/InputEditor.tsx, src/OrientationGuide.tsx.
- Shared integration: src/cube.ts (shared Face type only), src/viewer.ts, src/main.tsx, src/styles.css.
- Tests: src/input.test.ts, tests/input.spec.ts, tests/foundation.spec.ts. M0 correctness tests and solver/worker modules remain unchanged.
- Handoff: README.md, context.md, docs/DECISIONS.md, docs/M2_REPORT.md, docs/screenshots/m2-input-*.png. PROJECT_SPEC.md and AGENTS.md unchanged.

## What to understand

Missing colors and an impossible cube are different problems. The editor can safely save an unfinished or incorrectly colored draft without pretending it is physically solvable; M3 will perform that check.

Looking at a new face changes the view, not the cube's layer arrangement. Keeping canonical coordinates fixed makes the input independent of camera orientation.

## Issues and physical checks

Real-cube orientation and solving trials have not occurred. Automated geometry and browser tests establish the virtual mapping only. Before physical acceptance, confirm each face's grid and its above/right landmarks on a real standard cube, enter a recorded legal scramble, compare with the renderer, and later follow verified moves on more than one physical scramble as required by the spec.

Existing release risks remain: legacy cubejs audit snapshot has 42 findings (3 critical), the worker build patch is version-sensitive, WebGL2 is needed for 3D, the bundle is large, and cold solver initialization takes seconds. Firefox/Safari, real mobile hardware and full assistive-technology verification remain pending. Cross-tab concurrent draft editing is not coordinated. No backend, public deployment, commit or push was introduced. Git operations remain scoped to Face54 because of the existing parent-repository warning.

The inherited touch regression exposed unreliable compatibility-click generation following raw CDP dragging. Native touch reset on a changed camera and raw touch drag with keyboard reset are now checked separately, with no application handler workaround. That automation coverage does not establish the real-hardware drag-then-tap flow.

## Next milestone — description only

M3 — Review and Physical Validation: compact cube net, complete-state and physical solvability checks, structured errors and correction navigation. Not started; await review/authorization.

Suggested commit: `feat: add guided cube input and local draft persistence`
