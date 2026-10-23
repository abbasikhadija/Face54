# Current context

## Current milestone

M5 — Guided Physical Solving COMPLETE for automated acceptance (2026-10-23). M0–M4 remain complete. Physical cube trials PENDING. STOPPED after M5; await user review before M6. No commit, push or deployment. Virtual tests are not physical acceptance.

## What was built

- Existing verified URFDLB model, input/orientation, minimal version-1 face54.draft, physical validator and typed worker pipeline remain. Entry order F/R/B/L/U/D; fixed standard centers. No dependencies changed.
- M5 adds pure playback.ts: verified canonical solution boundaries, descriptions/inverses of all 18 outer turns and explicit forward/undo transitions. It has no renderer/UI dependency. GuidedPlayback owns confirmed index/undo mode separately from transient preview state.
- Start guided solving opens the exact entered initial 3D state at #play. Display one move, plain-English layer/color/direction with an outside-face viewpoint, progress, fixed white-up/green-front hold, camera inspection and Reset view. Camera rotation never changes notation or mathematical state.
- Preview this turn rotates the actual layer sticker meshes plus nine body pieces. Endpoint mesh readback must equal independent apply(); then restore original transforms and verify the confirmed state. Preview never confirms progress. Busy previews lock Done/undo; reduced motion skips interpolation. Mobile preview scrolls the actual cube into view.
- Done — next move advances once. Previous enters explicit inverse physical instructions without changing progress; I undid this turn moves backward once; Keep current step cancels undo. Completion can also be undone. Renderer/WebGL verification failure blocks confirmation while exit remains available.
- Completion shows solved cube, move count and Solve another cube. Already-solved input needs no moves. Starting another real cube clears its completed draft; demo completion preserves unrelated input.
- The one demo now uses the same real worker and full guided controller. Product slider/Show solved shortcut removed; M0 diagnostic seek/readback remains at ?proof=1. No automatic full-solution playback.
- App holds playback session in memory only. Exit confirmation and persistent help explain that physical colors must be re-entered after leaving/refreshing if turns were made. Direct/refresh #play has no saved solution and shows recovery. Browser Back/wordmark discard session. Original entered colors stay saved until edited or explicitly reset; progress/solutions are never persisted.
- New: playback.ts, GuidedPlayback.tsx, playback.test.ts, tests/playback.spec.ts. Updated viewer/CubeView, Review/SolvePanel handoff, main/demo, styles, browser acceptance and docs. Renderer now has individual black body meshes to avoid detached-looking sticker planes during turns. Canonical transformations, validator, solver/worker/client, orientation mappings and persistence implementation/schema unchanged.

## Verification

- `node node_modules/vitest/vitest.mjs run --disableConsoleIntercept`: 118 passed, five files, 15.74 s. Includes 41 new playback tests: all 18 instructions/inverses, all 18 actual mesh turns/restoration, correct nine-body rotation, repeated-preview drift, verified/invalid/zero plans, progression/undo boundaries and 100 deterministic legal plans checked against cubejs at every forward/reverse boundary. Existing 103 solver/renderer cases, 103 typed solver requests, 1,000 legal validation states and input/orientation/persistence tests pass.
- `npm run build`: TypeScript + Vite passed, 856 ms. JS 812.39 kB / 218.55 kB gzip, CSS 17.02 kB / 4.22 kB gzip, worker unchanged 23.93 kB. Existing >500 kB warning remains.
- `npm run test:browser`: final 90 passed, 3.7 min. Chrome 155.0.8059.85 and Edge 155.0.4283.62, production /Face54/. Complete real demo on desktop/mobile, every confirmation/mesh boundary, completion/undo; all 48 manually entered slots through real worker solving and all 22 turns to solved; all 18 animated endpoints/restoration; repeated/reduced-motion previews; explicit undo/cancel; fixed notation under camera inspection/reset; keyboard/native emulated touch; preview viewport visibility; exit/refresh; zero moves; unavailable WebGL and all M0–M4 regressions. No skips/retries added.
- Earlier focused browser run: 26 passed, 2.4 min. Visual inspection then identified detached-looking turn bodies and offscreen mobile previews; both fixed before final build/full verification. All-18 browser fixture uses a substituted deterministic worker result to ensure every turn is covered; real solver journeys are separate. No simulated confirmation is called a physical turn.
- Desktop/mobile guidance/completion and in-progress turn screenshots inspected, no horizontal overflow observed. Saved docs/screenshots/m5-guided-desktop.png, m5-guided-mobile.png, m5-complete-mobile.png and m5-turn-preview.png. Full artifacts regenerate under ignored test-results/.
- Preview timing is configured 700 ms interpolation + 400 ms endpoint dwell; reduced motion uses static endpoint/600 ms dwell. No FPS or hardware performance guarantee measured. No idle animation loop; body meshes add draw calls for correct moving geometry.
- Scoped `git diff --check -- .` passed. Full evidence/alternatives/references in docs/M5_REPORT.md and docs/DECISIONS.md; historical milestone reports preserve previous measurements.

## Engineering boundaries and known issues

No unresolved automated M5 blockers. Physical cube trials PENDING: more than one recorded legal scramble, entered through the UI, all-face real/virtual comparison, physical generated turns and solved confirmation are still required. The app cannot detect whether a user copied colors or performed a turn correctly. A solved virtual cube is not proof of a solved physical cube. Leaving after physical turns requires re-entering current colors because progress is transient.

Firefox/Safari, real mobile hardware and full assistive-technology checks remain pending. Existing M2 raw-CDP touch-driver limitations remain historical; native emulated touch is not real hardware acceptance. Cross-tab draft arbitration unsupported.

Existing release risks remain: cubejs's legacy dependency tree had 42 findings (3 critical) in the M0 audit snapshot; its guarded bundler compatibility patch is version-sensitive; WebGL2 required for 3D; main bundle large; cold solver preparation takes seconds. No dependencies changed; no fresh audit claimed. M6 quality/dependency/release work NOT STARTED.

Git root is C:/Users/User, the workspace parent. Keep inspections/staging scoped; establish intended repository before deployment. No restructuring, commit, push or deployment. AGENTS.md/PROJECT_SPEC.md unchanged. Local /Face54/ evidence is not a verified public URL.

## Next action

Await user review. Next unfinished milestone is M6 — Final Quality and GitHub Pages Release: responsive/accessibility/reduced-motion/recovery review, production performance, dependency/license review, CI/Pages configuration for the actual repository and base path, real-cube acceptance and verified public worker/3D/demo/manual journey. Read instructions/spec/context/decisions/M5 report and scoped Git status first. Perform or explicitly retain pending physical trials; do not claim final product acceptance without them. Deployment/commit/push require explicit authorization. Do not start M6 automatically.
