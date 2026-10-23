# Current context

## Current milestone

M2 — Cube Input and Orientation COMPLETE for automated acceptance (2026-10-23). M0/M1 remain complete. Physical orientation confirmation is pending and must not be inferred from virtual tests. STOPPED after M2; await review and authorization before M3. No commit, push or deployment performed.

## What was built

- M2 partial canonical input uses 54 URFDLB slots with 48 initially empty editable positions and six fixed centers. Entry order F/R/B/L/U/D. Input is separate from complete solver states.
- Six-face editor: labeled palette, smart next-empty selection, active/focus tracking, correction, keyboard arrows/Enter/Space, per-face clear, incomplete navigation, live counts and excess-color warnings. No auto-paint or auto-face advance.
- First-entry orientation guides animate only the camera, verify actual reference mesh readback, shrink after orienting, support reduced motion, hide/reopen, named landmarks and a text fallback without WebGL2. New-face focus brings guidance into view on mobile. No layer turns occur.
- Minimal versioned local persistence validates all saved slots/centers before restoring; preserves edits and current face across navigation/refresh; handles invalid, blocked and quota-failing storage; resets only after confirmation when work exists. Draft lives at app scope; transient UI state is not persisted.
- Preparation now links to #input. Existing graphite welcome, real fixed demo and `?proof=1` diagnostics remain. The unchanged demo worker is independent of entered colors. No entered input is solved or declared physically valid, even when all slots are filled.
- No dependencies added. New pure modules: input.ts, orientation.ts, persistence.ts; React integration: useDraft.ts, InputEditor.tsx, OrientationGuide.tsx. Existing solver/worker unchanged; cube.ts only exports the shared Face type.

## Verification

- `npm test`: 43 passed (last run 26.78 s), including 103 legal solve cases, all 18 moves, every entry slot, all six orientation poses, corner adjacency, smart selection, centers/clear/corrections and defensive persistence.
- `npm run build`: TypeScript + Vite passed. Last build 651 ms; JS 792.15 kB (212.62 kB gzip), CSS 13.05 kB (3.47 kB gzip), worker unchanged 19.54 kB. Existing size warning remains.
- `npm run test:browser`: final combined suite 34 passed (1.7 min), Chrome 155.0.8059.85 and Edge 155.0.4283.62 against production `/Face54/`. Includes M0/M1 regressions and 20 M2 browser checks: all 48 fixture entries reproduce exact facelets; all guides preserve all 54 stickers; corrections, refresh, counts, modal cancellation, keyboard, native emulated touch painting, malformed/blocked/quota storage, and no-WebGL editing/text fallback. No worker starts during entry.
- Two inherited timing-sensitive tests were stabilized: wait for React before Tab; verify native touch reset before raw CDP drag injection, then raw drag plus keyboard reset. Post-raw-drag compatibility clicks were unreliable in the driver; no app gesture workaround or retries were added. Twelve repeated focused checks passed before the final suite. Real-hardware drag-then-tap remains pending.
- Desktop/mobile entry and orientation screenshots inspected; selected captures saved as docs/screenshots/m2-input-desktop.png and m2-input-mobile.png. Full captures regenerate in ignored test-results/.
- Sticker text contrast is at least 5.01:1; empty-slot boundaries are 3.22:1. Semantic/keyboard checks performed; no full screen-reader audit claimed.
- Scoped `git diff --check -- .` passes.

## Engineering boundaries and known issues

No review net/full physical validator (M3), entered-state solving/complete typed worker request/cancellation/retry protocol (M4), or guided physical move confirmation (M5) implemented. Fully filled input is explicitly unchecked. Input changes cannot alter the fixed example demo; M4 must associate real solutions with the input revision. Cross-tab concurrent draft arbitration is not implemented.

Existing risks remain: cubejs's legacy npm tree has 42 findings in the M0 audit snapshot (3 critical); its guarded bundler patch requires upgrade verification; WebGL2 is required; bundle is large and cold solver initialization takes seconds. No fresh audit was needed because dependencies did not change. Firefox/Safari, real mobile hardware, assistive-technology audit, and physical cube acceptance remain pending. Virtual and emulated-touch evidence must never be called physical acceptance.

Git's earlier root warning is C:/Users/User, not a dedicated Face54 repository; keep inspections and any future staging scoped and establish the intended repository before deployment. No repository restructuring was performed. PROJECT_SPEC.md, AGENTS.md, solver and worker modules remain unchanged in M2. Facelet conventions were checked against upstream cubejs's documented net, independent geometry and camera projections; real physical confirmation is still required before product acceptance.

## Next action

Await the user's review. Next unfinished development milestone is M3 — Review and Physical Validation: compact net, full physical solvability checks, structured plain-English errors and correction navigation. Read PROJECT_SPEC.md, AGENTS.md, this file, docs/DECISIONS.md and docs/M2_REPORT.md, inspect scoped Git status, then implement only the newly authorized milestone. Keep real-cube orientation/solving acceptance explicitly pending until actual trials occur.
