# Current context

## Current milestone

M1 — Minimal Design Foundation COMPLETE (2026-10-23). M0 remains complete. STOPPED after M1; await review and authorization before M2. No commit, push or deployment performed.

## What was built

- Responsive graphite shell and welcome with Solve my cube / Try demo.
- Basic preparation screen explains centers and white-up/green-front home orientation. Explicitly marks color entry as pending M2; no fake editor.
- Real demo solves the existing M0 legal fixture in the unchanged browser worker. Manual example seeking, solved view and reset. No autoplay and no M5 physical move-confirmation flow.
- Interactive 3D cube supports mouse/touch camera orbit, arrow keys when focused, Reset view and container resizing. The camera moves; sticker coordinates and notation do not. Uses existing Three.js OrbitControls; no added dependencies.
- Hash navigation supports deep links and Browser Back. Native accessible controls, skip link, heading focus after navigation, focus outlines, reduced-motion styles, readable WebGL2/worker failure guidance.
- Preserved M0 diagnostic harness at `?proof=1`. Renderer still serializes actual 54 mesh transforms/material colors and verifies exact state. Its diagnostic mode retains drawing-buffer preservation; product mode does not.

## Verification

- `npm test`: 21 passed (15.55 s), including 103 legal-state solve cases and all 18 moves; independent geometry, cubejs and mesh states agree at each solution boundary.
- `npm run build`: TypeScript + Vite passed. Final build 682 ms; JS 778.99 kB (208.67 kB gzip), CSS 6.56 kB (2.14 kB gzip), worker 19.54 kB. Existing size warning remains.
- `npm run test:browser`: final combined suite 14 passed across installed Chrome 155.0.8059.85 and Edge 155.0.4283.62, against production `/Face54/` assets and workers. Covers desktop/mobile journeys, keyboard, pointer, emulated touch, reset, resize, reduced motion, navigation, unavailable WebGL2, worker failure, and retained M0 exact-state proof.
- The touch test required compositor/input synchronization fixes; six repeated touch checks passed before the final full run. Both gestures now use one CDP session, wait for scroll frames to settle, and wait for click delivery before screenshot comparison. No app event-handler workaround was needed.
- Desktop/mobile welcome, preparation and demo screenshots inspected. Welcome captures saved in docs/screenshots/. Additional captures regenerate under ignored test-results/.
- Text/muted/accent contrast against background: 16.48:1 / 8.33:1 / 9.40:1. Semantic/keyboard checks performed; no complete screen-reader audit claimed.
- Scoped `git diff --check -- .` passes.

## Engineering boundaries and known issues

No input/editor/persistence (M2), full physical-state validator (M3), complete typed worker request/cancellation/retry protocol (M4), or guided physical move confirmation (M5) implemented. Leaving demo terminates its one-request worker; this is basic view cleanup, not the full M4 pipeline.

Existing risks remain: cubejs's legacy npm tree has 42 findings in the M0 audit snapshot (3 critical); its guarded bundler patch requires upgrade verification; WebGL2 is required; bundle is large and cold solver initialization takes seconds. No fresh audit was needed because dependencies did not change. Firefox/Safari, real mobile hardware, assistive-technology audit, and physical cube acceptance remain pending. Virtual and emulated-touch evidence must never be called physical acceptance.

Git's earlier root warning is C:/Users/User, not a dedicated Face54 repository; keep inspections and any future staging scoped and establish the intended repository before deployment. No repository restructuring was performed. PROJECT_SPEC.md, AGENTS.md, canonical cube, solver and worker modules remain unchanged in M1.

## Next action

Await the user's review. Next unfinished milestone is M2 — Cube Input and Orientation: partial canonical input; tested per-face orientation; six-face editor; fixed centers; palette/smart selection; partial navigation; live counts; versioned local draft persistence. Read PROJECT_SPEC.md, AGENTS.md, this file, docs/DECISIONS.md and docs/M1_REPORT.md, then inspect scoped Git status before implementing M2 in its own authorized session.
