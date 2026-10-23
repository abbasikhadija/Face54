# M4 — Production Solving Pipeline

Date: 2026-10-23. M3 was complete at session start. M4 COMPLETE for automated acceptance. M5 not started. No commit, push or deployment.

## Implemented

- Validated real input now starts local worker solving after Check cube. Typed requests carry unique IDs and exact canonical input; responses distinguish preparation/search progress, verified results and structured errors.
- Worker revalidates physical possibility before initializing cubejs. Already-solved input returns no moves without table initialization. Normal outputs must solve the original state using the independent geometric transition implementation.
- Main-thread client independently checks request ID, exact input snapshot, message shape/timings and returned moves before publishing. Replaced/disposed/cancelled requests cannot publish late callbacks. No input data is changed by solving.
- Cancel terminates synchronous work. Retry creates a fresh worker. Worker creation/load/runtime/post/decode failures, initialization/search/verification errors and a 60-second watchdog produce recoverable states. Workers are released after completion/failure and on navigation/editing.
- Review shows loading/Cancel, errors/Try again, verified move count or already-solved confirmation. Terminal status receives focus. Solutions are transient and disappear on editing/leaving/refresh; only the existing input draft persists.
- Existing demo and M0 proof use this same typed client. Existing demo seeking and renderer readback remain. No guided physical turns or full-solution autoplay added.

## Engineering decisions

Keep the established cubejs algorithm and canonical geometry; no solver replacement or new dependency. Use a small protocol handler plus one active-request client rather than a shared worker framework. Termination is required because synchronous cubejs cannot process cancel messages while working. Releasing every worker simplifies ownership and memory cleanup; retries/rechecks pay cold table-initialization cost again. Exact snapshot plus request identity binds every accepted solution to its input.

See DECISIONS.md for alternatives, boundaries and trust checks. Mathematical state stays independent of the renderer. The verified solution-ready screen is the deliberate M4 boundary; M5 must implement physical move guidance.

## Verification

- `node node_modules/vitest/vitest.mjs run --disableConsoleIntercept`: 77 tests passed across four files in 15.68 s. Includes 13 new pipeline tests, 103 deterministic actual typed solver cases, original 103 solver/renderer cases and all existing validation/input/persistence tests.
- Lifecycle tests use a controllable transport to deliver malformed results, bad moves, stale IDs/captured callbacks, cancellation/replacement/disposal, crashes, initialization/search failures, timeout and retry. These fault injections are not claimed as real solver runs.
- `npm run build`: TypeScript and production build passed. Final Vite build 848 ms; main JavaScript 805.07 kB / 216.54 kB gzip, CSS 15.97 kB / 4.02 kB gzip, worker 23.93 kB. Existing >500 kB warning remains. Final type-only transport tightening produced identical runtime asset hashes to the browser-tested build.
- Browser coverage includes all 48 stickers entered via UI through verified solving; real worker desktop/mobile input solving; solved fast path; malformed/impossible worker requests followed by recovery; responsive keyboard cancellation/retry; failed worker-load recovery; navigation/edit/refresh invalidation; wrong-output rejection with a deliberately substituted transport; and inherited demo/mesh/input/review regressions.
- `npm run test:browser`: final 74 tests passed in 2.9 min, Chrome 155.0.8059.85 and Edge 155.0.4283.62. No skips or retries added. Scoped `git diff --check -- .` passed.
- One initial focused browser run had 13 passes and one reload 404 because the build was replaced during serving. This was verification orchestration error, not a product fix: the final suite uses a fixed build, without skips or retries.
- Final unit timing for 103 typed requests: preparation total 2,997.25 ms, mean search 75.71 ms, maximum search 644.65 ms. Local observations only, concurrent with browser work; excludes UI and verification from search timing. Original solver/mesh suite runs separately.
- Final real-input browser fixture observations: Chrome desktop/mobile preparation 3,069 / 2,777.5 ms, search 106.6 / 112.3 ms; Edge preparation 6,230 / 4,936.9 ms, search 69.5 / 144.6 ms. These local emulated-viewport observations are not hardware-independent guarantees. Already-solved worker results report zero preparation/search by design.
- Desktop/mobile solution-ready screenshots visually inspected and saved as docs/screenshots/m4-solution-desktop.png and m4-solution-mobile.png. No horizontal overflow observed. Production test path remains /Face54/; this is not public deployment.

## Files changed

New: src/solverProtocol.ts, src/solverClient.ts, src/SolvePanel.tsx, src/solverPipeline.test.ts, tests/solving.spec.ts and this report/screenshots. Updated: solver adapter/worker, Review, demo/main, Proof, styles, input/review browser acceptance, README, DECISIONS and context. Canonical transitions, renderer, validator, input/persistence schema, dependencies, AGENTS and PROJECT_SPEC unchanged.

## What to understand

Computing a move sequence is not enough: its moves must independently solve the exact input that requested it. Request IDs also prevent late results from overwriting newer work. Stopping a worker actually halts synchronous CPU work; merely hiding a loader would not.

## Issues

Physical entry/renderer/solving trials remain pending. A mathematical solution proves nothing about whether the user copied or moved their physical cube correctly. Guided playback is not available until M5. Real mobile hardware, Firefox/Safari and full assistive-technology checks remain pending.

Existing release concerns remain: M0 dependency audit snapshot has 42 findings (3 critical), cubejs's guarded worker bundler patch is version-sensitive, WebGL2 is required for 3D, the main bundle is large and cold preparation takes seconds. No dependency changes or fresh audit claimed. No cross-tab draft arbitration. Git inspection remains scoped because its root is the workspace's parent.

## Next milestone — description only

M5 — Guided Physical Solving: exact initial 3D state, one current move with plain-English explanation and preview, explicit physical confirmation, undo guidance, progress, reset view and completion. Real cube trials must be performed or clearly marked pending. Not started; await user review.

Suggested commit: `feat: add verified worker solving with cancellation and recovery`
