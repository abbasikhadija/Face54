# M1 — Minimal Design Foundation

Date: 2026-10-23. M0 was complete at session start. Status: COMPLETE. Only M1 is implemented in this session; M2 has not started.

## Implemented

- Graphite design tokens matching the spec, system sans-serif, restrained warm accent, responsive two-column/single-column layout, welcome screen and small header/footer.
- Prominent exact M0 fixture in an interactive Three.js cube. Drag/touch and keyboard camera orbit; Reset view; no autoplay or decorative animation. Container-responsive sizing and capped pixel ratio.
- Solve my cube opens preparation guidance with a solved home-orientation reference. It clearly states that color entry is not available until M2 and offers the working demo.
- Try demo runs the real verified worker pipeline, presents manual solution seeking, solved example and reset. Loading/error messages and return navigation are functional. This does not implement M5's guided physical move progression.
- Native hash links support Browser Back and deep links without server rewrites. Skip link, heading focus on navigation, visible focus states, named canvas controls, a labeled range input, touch targets and reduced-motion CSS.
- Preserved M0 diagnostics at `?proof=1` and adapted their existing production browser regression test to that address. Core state, solver, worker and compatibility patch unchanged.

## Engineering decisions

No dependencies added. OrbitControls comes from the existing Three.js package. Camera rotation never changes sticker geometry or notation. Render on changes rather than running an idle animation loop. The renderer cleans up materials, geometries, controls, listeners and its resize observer on unmount. Diagnostic mode preserves drawing-buffer access; product mode does not. A separate React cube component shares the adapter across screens.

The M1 preparation destination is useful orientation text with an honest scope boundary; a disabled/fake color editor would prematurely cross into M2. The demo deliberately retains M0's exploratory seeking rather than claiming to teach physical solving. Raw technical diagnostics stay off the product screens.

## Verification

- `npm test`: all 21 tests passed (15.55 s), including 103 legal-state solver/geometry/mesh cases and all 18 move conventions.
- `npm run build`: TypeScript and Vite production build passed. Last build: 682 ms, main JavaScript 778.99 kB / 208.67 kB gzip, CSS 6.56 kB / 2.14 kB gzip, worker 19.54 kB. Existing >500 kB warning remains.
- `npm run test:browser`: all 14 final production Chrome and Edge tests passed. Tests cover both 1440×900 desktop and 390×844 mobile journeys, direct subpath loading, worker solve, solution exploration/reset, browser Back, focused headings, skip link, keyboard range/camera, pointer drag/reset, emulated touch drag/reset, reduced-motion styles, responsive widths 320/768/1024, WebGL2 unavailability and worker failure guidance. M0 regression still checks every solution boundary and exact mesh readback.
- Contrast calculation: text/background 16.48:1, muted/background 8.33:1, accent/background 9.40:1. No full assistive-technology audit is claimed.
- Desktop/mobile welcome, preparation and solved-demo screenshots visually inspected. Selected welcome captures saved in docs/screenshots/ for review; browser runs regenerate the full set in ignored test-results/.
- Scoped `git diff --check -- .` checked. No commits, pushes or deployment.

The additional emulated-touch test exposed a harness synchronization issue: mixing input sessions and scrolling before synthesized click delivery could suppress the reset tap. Both gestures now use one CDP session, the target is positioned and the scroll compositor frame settles before tapping, and the test waits for the actual click before screenshot comparison. No application touch handler workaround was introduced.

## Files changed

- Application: src/main.tsx, src/CubeView.tsx, src/styles.css, src/viewer.ts, index.html.
- Retained proof: src/Proof.tsx, tests/proof.spec.ts.
- Browser verification: tests/foundation.spec.ts, playwright.config.ts (two workers to limit concurrent heavy solving/GPU use).
- Documentation: README.md, context.md, docs/DECISIONS.md, docs/M1_REPORT.md, docs/screenshots/.
- No package/dependency changes, no changes to PROJECT_SPEC.md or the domain/solver/worker modules.

## What to understand

Looking around a cube and turning a layer are different operations. M1 only moves the camera for inspection, so the verified cube state remains unchanged.

A visually complete welcome page does not make input/validation/physical playback complete. Those remain separate milestones with their own correctness tests.

## Issues

No new milestone scope is authorized beyond M1. Existing release risks remain: cubejs's legacy dependency snapshot has 42 audit findings (including 3 critical), its worker build fix is version-sensitive, WebGL2 is required, the bundle is large, and solver initialization takes seconds. Physical cube trials, real mobile hardware, Firefox/Safari and assistive-technology acceptance are pending. The earlier parent-repository warning remains; only scoped Git inspection was used. No public site is claimed.

## Next milestone — not started

M2 — Cube Input and Orientation: partial canonical input, verified per-face orientation, six-face entry, fixed centers, palette, smart active sticker, incomplete-face navigation, counts and local draft persistence.

Suggested commit: `feat: add responsive cube solver design foundation`
