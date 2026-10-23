# Cube Solver — M0 technical proof

A browser-only 3×3 cube solver feasibility spike. This is a diagnostic page, not the product interface. M1 has not started.

## Run

Use Node 22.14 or a compatible version satisfying Vite's engine range (20.19+ or 22.12+).

```sh
npm ci
npm run dev
npm test
npm run build
npm run test:browser
```

The browser suite uses locally installed Chrome and Edge. `npm run build` checks TypeScript and builds with `/Face54/` as a deliberately non-root test path. `npm run preview` serves the proof at http://localhost:4173/Face54/. This is not a deployed URL; the actual repository/Pages path must be established in M6.

The page solves one recorded legal scramble in a bundled module worker. Use the diagnostic slider to seek individual solution boundaries, including the initial and final states. It does not automatically play the solution.

## Architecture and limits

`src/cube.ts` defines URFDLB row-major facelets and independent integer sticker geometry. `src/solver.ts` adapts cubejs and independently verifies its answer; `src/solver.worker.ts` keeps initialization off the UI thread. `src/viewer.ts` creates 54 Three.js sticker planes and reads the actual material colors/world transforms back to facelets. `src/main.tsx` is only the M0 harness. Vitest cross-checks cubejs, independent geometry, and meshes; Playwright exercises the production worker and WebGL renderer under a subpath.

No arbitrary user input is accepted: complete physical-state validation belongs to M3. Parsing with cubejs is not proof of physical validity. Request IDs, cancellation/retry, and stale-response handling belong to M4; this one-request worker is not that production pipeline. Real cube trials are pending and are mandatory before final acceptance. Screenshots are generated under ignored `test-results/` by browser tests.

See docs/DECISIONS.md, docs/M0_REPORT.md and context.md for results, risks, and next action. No public deployment has occurred.
