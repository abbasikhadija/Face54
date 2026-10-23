# M5 — Guided Physical Solving

Date: 2026-10-23. M4 was complete and scoped Git status was clean at session start. M5 COMPLETE for automated acceptance; physical trials PENDING. M6 not started. No commit, push or deployment.

## Implemented

- Start guided solving opens the exact validated/verified entered state in 3D. A pure playback plan verifies the full solution and derives every canonical boundary without renderer dependencies.
- One current notation and plain-English layer/color/direction, step count, fixed white-up/green-front hold, interactive camera and Reset view. Camera inspection never changes notation or progress.
- Requested current-turn previews rotate actual sticker meshes and their nine body pieces. Verify the endpoint against the mathematical move, restore the original transforms and verify the confirmed state again. Preview never advances the confirmed index; confirmation and undo are disabled during it.
- Done — next move advances exactly one confirmed boundary. Previous explains the inverse physical turn without changing progress; I undid this turn moves back once; Keep current step cancels. Undo also works from completion.
- Completion shows a solved cube, move count and Solve another cube; already-solved input requires zero turns. Starting another real cube clears the completed draft. Demo completion preserves unrelated input.
- The one demo now follows the full real worker/verification/controller journey. Product seek/Show solved shortcuts were removed; M0 diagnostic seeking/readback remains. No automatic full-solution playback.
- Memory-only playback session at #play; exit confirmation, refresh/direct-link recovery and explicit instruction to re-enter current physical colors if leaving after turns. Saved input is preserved until edited or explicitly reset. WebGL/verification failures block move confirmation while leaving remains available.

## Engineering decisions

Keep confirmed mathematical state separate from temporary render transforms. Use absolute per-layer quaternion transforms, read actual meshes at endpoints, and retain fixed world coordinates while orbiting only the camera. Individual body pieces replace the stationary internal box because inspection showed detached-looking sticker planes during turns. No dependency or animation framework added.

Use explicit forward/reverse confirmation rather than a general timeline or persisted physical progress. The app cannot detect real turns; progress is deliberately transient. Demo and entered input share the same guided controller. See DECISIONS.md for alternatives, upstream notation/API references and verification rationale.

## Verification

- `node node_modules/vitest/vitest.mjs run --disableConsoleIntercept`: 118 passed across five files, 15.74 s. Includes 41 new playback tests: all 18 descriptions/inverses, all 18 actual mesh endpoints/restorations, body transforms, repeated-preview drift, invalid/zero plans, explicit progression/undo bounds, and 100 deterministic legal plans checked against cubejs at every forward/reverse boundary. Existing solver, validation, input, orientation and persistence tests pass.
- Earlier focused browser run: 26 passed in 2.4 min. After visual inspection, body rotation and mobile preview scrolling were added, then the production build and full suite were rerun.
- `npm run test:browser`: final 90 passed in 3.7 min, Chrome 155.0.8059.85 and Edge 155.0.4283.62, production /Face54/ path. No skips or retries added. Scoped `git diff --check -- .` passed.
- `npm run build`: TypeScript and Vite passed. Build 856 ms; JS 812.39 kB / 218.55 kB gzip, CSS 17.02 kB / 4.22 kB gzip, worker unchanged 23.93 kB. Existing >500 kB bundle warning remains.
- Browser coverage: real desktop/mobile demo through all 22 confirmations and undo from completion; all 48 manually entered slots through real worker solving and every mesh boundary to completion; all 18 animated endpoints/restoration; repeated reduced-motion previews; explicit undo/cancel; camera reset/notation; keyboard/native emulated touch; preview visibility; exit/refresh; solved input; unavailable WebGL; inherited M0–M4 regressions. Tests simulate confirmations, not physical turns. Deterministic preview fixture transport is substituted to exercise all 18 moves; real worker tests remain separate.
- Preview interpolation/dwell are configured at 700/400 ms; reduced motion skips interpolation and shows an endpoint for 600 ms. No frame-rate or real-hardware performance claim. The viewer has no idle animation loop. Body meshes add draw calls for accurate moving geometry; no measured FPS claim.
- Desktop/mobile guidance, completion and an in-progress turn screenshot visually inspected. Selected captures are saved under docs/screenshots/m5-*.png; generated captures remain under ignored test-results/.

## Files changed

New: src/playback.ts, src/GuidedPlayback.tsx, src/playback.test.ts, tests/playback.spec.ts, this report and screenshots. Updated: CubeView/viewer preview lifecycle, Review/SolvePanel handoff, main/demo routing, styles, foundation/input browser journeys, README, context and DECISIONS. Canonical move implementation, physical validator, solver/worker/client, orientation mapping, persistence schema and dependencies unchanged. AGENTS.md and PROJECT_SPEC.md unchanged.

## What to understand

A preview is temporary visual evidence of one move. Only user confirmation changes the canonical confirmed state. Undo needs the matching physical reverse turn and its own confirmation; moving the camera changes neither.

## Issues

Real physical-cube trials are **PENDING**. No physical trial was performed in this session; automated virtual evidence is not substituted. Product physical acceptance requires more than one recorded legal scramble entered through the UI, all-face real/virtual comparison and physically following the generated solution to solved.

The app cannot detect incorrect physical turns. Progress is not persisted; leaving/refresh requires re-entering current physical colors. Firefox/Safari, real mobile hardware and full assistive-technology checks remain pending. Existing release risks remain: M0 audit snapshot has 42 findings (3 critical), version-sensitive cubejs bundler patch, WebGL2 requirement, large main bundle and seconds of cold preparation. Dependencies unchanged; no fresh audit claimed. Cross-tab draft arbitration unsupported. Git root is the parent; inspections remain scoped.

## Next milestone — description only

M6 — Final Quality and GitHub Pages Release: responsive/accessibility/reduced-motion and recovery refinements, production performance, dependency/license review, CI/Pages configuration for the actual repository, real-cube acceptance and verified public URL. Not started. Deployment still requires explicit authorization; do not claim a public release from local preview evidence.

Suggested commit: `feat: add guided cube turns with verified previews and explicit undo`
