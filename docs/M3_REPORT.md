# M3 — Review and Physical Validation

Date: 2026-10-23. M3 COMPLETE for automated acceptance. M2 was complete at session start. Only M3 was implemented; M4 has not started. Physical cube trials remain pending.

## Implemented

- Compact outside-view unfolded net, exact sticker mapping, color initials/accessibility labels, completion, missing entries, color counts, per-face Edit and one primary Check cube action.
- Independent staged physical validator: 54 slots/known colors, incomplete input, fixed centers, nine of each color, 12 distinct valid edges, 8 distinct correctly ordered corners, orientation constraints and matching permutation parity.
- Structured errors distinguish incomplete, invalid counts, invalid piece identities, duplicate/missing pieces, edge orientation, corner orientation, permutation parity, unsupported scheme and internal failure.
- Evidence-based review/editor marks and correction navigation. Global constraints do not guess affected stickers; candidate piece/count groups are explicitly described as groups to recheck. Fixed centers are excluded from excess-color candidates.
- Validation preserves all input and stored colors. Editing clears outdated evidence; results are transient and bound to the checked facelets. Success confirms physical possibility but does not solve entered input or initialize a solver worker.
- Existing welcome, input, persistence, fixed demo and M0 proof remain. No dependency changes, commits, pushes or deployment.

## Engineering decisions

Use the established Kociemba/cubejs cubie convention with independent strict decoding. Exact cyclic corner matching rejects reflections. Verify group geometry as well as tables and legal-state behavior. No renderer or solver dependency is used by validation.

cubejs parsing is not a validator: tests prove three classes of impossible state survive even a facelet round-trip. Their orientation/permutation invariants must be checked separately. Primary references and alternatives are recorded in DECISIONS.md.

Stop at valid-state confirmation because entered-state worker solving is M4. Do not add a fake loader or an enabled Solve action that cannot complete the authorized flow.

## Verification

- Final unit suite: 64 passed across three files (27.05 s). Final combined browser suite: 58 passed (2.2 min), Chrome 155.0.8059.85 and Edge 155.0.4283.62 against the production /Face54/ path.
- Scoped `git diff --check -- .` passed. No commit, push or deployment performed.
- Unit tests cover existing solver/input/orientation/persistence behavior and new validation cases. New checks include 1,000 deterministic legal scrambles with upstream cubie comparisons, all specified impossible states, all isolated edge flips/corner twists, all pair swaps, balanced counterexamples, geometric table checks, malformed data and structured exception handling.
- `npm run build`: TypeScript and production build passed. Last build 926 ms; JavaScript 801.13 kB / 215.31 kB gzip; CSS 15.81 kB / 3.99 kB gzip; worker unchanged at 19.54 kB. Existing >500 kB warning remains.
- Focused review suite: 24 Chrome/Edge tests passed (53.4 s), covering exact 54-slot net, desktop/mobile, valid/invalid states, missing/count/piece/global errors, preserved stored colors, correction loops, stale-result clearing, keyboard/native emulated touch and zero workers started by review.
- Validation-only timing observation in a full unit run concurrent with browser checks: 1,000 legal states took 144.85 ms in the validator, mean 0.145 ms. Not a hardware-independent guarantee; excludes rendering, solver initialization and assertions.
- Valid desktop/mobile and global parity-error screenshots visually inspected. Selected final captures are saved under docs/screenshots/m3-review-*.png. Tests regenerate other captures under ignored test-results/.

## Files changed

- New: src/validation.ts, src/validation.test.ts, src/Review.tsx, tests/review.spec.ts.
- Updated: src/main.tsx, src/InputEditor.tsx, src/styles.css, src/cubejs.d.ts (existing public toJSON API typing for test comparisons).
- Handoff: README.md, context.md, docs/DECISIONS.md, docs/M3_REPORT.md and screenshots. PROJECT_SPEC.md, AGENTS.md, canonical transformations, solver/worker, renderer and persistence schema unchanged.

## What to understand

Nine stickers of each color can still describe an impossible cube. Individual pieces must exist, and their total twists, flips and permutation parity must fit normal cube turns.

A parity error is a global inconsistency, not evidence identifying one wrong sticker. The correction UI preserves the data and asks users to recheck faces rather than suggesting a fabricated repair.

## Issues

No new physical trial is claimed. Real-cube entry/orientation/solving acceptance, Firefox/Safari, real mobile hardware and full assistive-technology verification remain pending. The validator establishes whether the entered colors are physically possible; it cannot determine whether those colors match the user's actual cube.

Existing release risks remain: cubejs's legacy audit snapshot has 42 findings (3 critical), its worker build patch is version-sensitive, WebGL2 is required for 3D, the main bundle is large, and cold solver initialization takes seconds. Dependencies did not change, so no fresh audit was claimed. Cross-tab draft arbitration remains unsupported. Git inspection stays scoped because of the recorded parent-repository warning.

## Next milestone — description only

M4 — Production Solving Pipeline: validated real input to a typed worker protocol, request IDs/stale-result protection, cancellation/retry, failure recovery and independent verification of returned solutions. Not started; await review/authorization.

Suggested commit: `feat: add cube review and physical state validation`
