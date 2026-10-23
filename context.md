# Current context

## Current milestone

M4 — Production Solving Pipeline COMPLETE for automated acceptance (2026-10-23). M0–M3 remain complete. STOPPED after M4; await user review before M5. No commit, push or deployment. Physical cube acceptance remains pending; virtual tests are not physical trials.

## What was built

- Existing verified URFDLB canonical model, renderer, graphite welcome/demo, six-face input/orientation, local drafts and physical validator remain intact. Entry order F/R/B/L/U/D; centers fixed; version-1 face54.draft schema unchanged.
- Valid Check cube now starts local solving for the exact entered state. Review mounts SolvePanel only after physical validation. Already-solved input returns zero moves without initializing search tables.
- solverProtocol.ts defines typed solve requests (positive unique ID and state), progress, results and bounded errors. handleSolve runtime-validates requests and physical input; runs preparation/search in the worker; independently verifies moves against the original input using cube.ts geometry.
- solverClient.ts owns one active worker/request, binds IDs and exact snapshots, runtime-checks messages/timings and independently verifies moves again before publication. Captured late callbacks/stale IDs cannot overwrite newer or cancelled requests. The injectable transport is only a test seam, not a dependency framework.
- Cancel terminates synchronous computation. Retry starts a fresh worker. Creation/load/runtime/post/decode failures, initialization/search/verification errors and a 60-second watchdog are recoverable. Success, failure, cancellation, disposal and edit/navigation release the worker. Trade-off: retries/rechecks pay cold preparation again.
- SolvePanel shows preparation/search, Cancel, errors/Try again, verified move count or already-solved confirmation, with terminal heading focus. It preserves all colors. Leaving review/editing/refresh discards solution and validation state; only unfinished input persists.
- Demo and M0 proof now use the same typed client; no untyped legacy worker path remains. Their existing exploration and exact mesh readback still work. No guided physical move UI, previews, confirmations or automatic full-solution playback added.
- New modules/tests: solverProtocol.ts, solverClient.ts, SolvePanel.tsx, solverPipeline.test.ts, tests/solving.spec.ts. Updated adapter/worker, Review, demo/main, Proof, styles, input/review browser tests and documentation. No dependencies added; cubejs algorithm, canonical transitions, renderer, validator and persistence implementation unchanged.

## Verification

- `node node_modules/vitest/vitest.mjs run --disableConsoleIntercept`: 77 passed across four files, 15.68 s. Includes 13 new pipeline tests; 103 actual deterministic typed solver requests; existing 103 solver/renderer cases; 1,000 legal validation states; impossible fixtures; input/orientation/persistence regressions.
- Handler/client tests cover solved fast path, malformed/impossible requests, initialization/search/verification failures, incorrect/unsupported moves, malformed timings, wrong snapshots, stale IDs/captured callbacks, replacement/cancellation/disposal, crashes, creation/post/decode failures, watchdog cleanup and recovery.
- `npm run test:browser`: final 74 passed, 2.9 min. Chrome 155.0.8059.85 and Edge 155.0.4283.62, production /Face54/ path. Covers all 48 manually entered slots through verified solving, real worker desktop/mobile results, independent move application, solved fast path, malformed/impossible worker requests/recovery, responsive keyboard cancel/retry, worker-load failure/recovery, wrong-output rejection (substituted transport), edit/navigation/refresh invalidation and all inherited regressions.
- One initial focused browser run had a reload 404 because the build was replaced while served. Final run used a fixed build; no product workaround, skips or retries. A final type-only transport tightening compiled to identical runtime asset hashes as the tested build.
- `npm run build`: TypeScript + Vite passed. Last build 848 ms; JS 805.07 kB / 216.54 kB gzip, CSS 15.97 kB / 4.02 kB gzip, worker 23.93 kB. Existing >500 kB warning remains.
- Typed pipeline Node observation: 103 requests, total preparation 2,997.25 ms, mean search 75.71 ms, maximum 644.65 ms. Browser fixture preparation: Chrome desktop/mobile 3,069 / 2,777.5 ms; Edge 6,230 / 4,936.9 ms. Search respectively 106.6 / 112.3 / 69.5 / 144.6 ms. Local concurrent-run observations, not performance promises; search excludes verification/rendering.
- Desktop/mobile solution-ready screenshots visually inspected, no horizontal overflow; saved as docs/screenshots/m4-solution-desktop.png and m4-solution-mobile.png. Test artifacts regenerate under ignored test-results/.
- Scoped `git diff --check -- .` passed. Details/alternatives in docs/M4_REPORT.md and docs/DECISIONS.md. Historical milestone reports preserve earlier evidence.

## Engineering boundaries and known issues

No unresolved automated M4 blockers. A solution proves only the exact entered colors are solvable, not that they match the real cube or that any physical move occurred. M5 physical guidance and completion are not started. Real-cube entry/orientation/renderer/solving trials remain pending, as do real mobile hardware, Firefox/Safari and full assistive-technology checks. Existing raw-CDP touch limitations are recorded in M2 report; emulated touch is not physical acceptance.

Existing release concerns remain: cubejs legacy dependency tree had 42 findings (3 critical) in the M0 audit snapshot; its guarded bundler compatibility patch is version-sensitive; WebGL2 is required for 3D; the bundle is large and cold preparation takes seconds. No dependencies changed or fresh audit claimed. Cross-tab draft arbitration remains unsupported.

Git root is C:/Users/User rather than a dedicated Face54 repository. Keep inspection/staging scoped; establish intended repository before deployment. No restructuring performed. AGENTS.md and PROJECT_SPEC.md unchanged. No public deployment claimed.

## Next action

Await user review. Next unfinished milestone is M5 — Guided Physical Solving: exact entered initial 3D state, one current move/plain-English explanation, turn preview that does not confirm progress, Done — next move, explicit undo guidance, progress, Reset View, completion and full demo journey. Keep camera inspection independent of notation and confirmed mathematical state. Real cube trials must be performed or explicitly marked pending. Read project instructions/spec/context/decisions/M4 report and scoped Git status before implementing only the next authorized milestone. Do not start M6.
