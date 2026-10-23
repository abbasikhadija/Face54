# Engineering decisions

## M0 — Solver and renderer integration (2026-10-23)

**Problem:** A solver and a visually plausible cube can disagree about face order, mirroring, or move direction.

**Choice:** cubejs 1.3.2 for its existing Kociemba solver; Three.js 0.186.1 for rendering. React 19.3.1, Vite 8.3.5, TypeScript 7.0.2; exact resolved dependencies are in package-lock.json. No custom solving algorithm. A small integer geometry implementation independently applies outer face turns and maps 54 sticker planes to URFDLB facelets. The renderer is established Three.js; the cube-specific adapter is our responsibility.

**Alternative:** cubing.js / TwistyPlayer. Official docs place scramble setup (`experimental-setup-alg`) and several playback features behind experimental APIs. Registry evaluation returned cubing 0.66.1 with `MPL-2.0 OR GPL-3.0-or-later`. It was evaluated through documentation/metadata, not installed or browser-tested. Three.js offers direct inspection of arbitrary facelet colors without depending on experimental cube-player state APIs. Accepted trade-off: we own and must test the 54-sticker adapter and any future layer animation. M0 uses discrete seeking, expressly allowed by the spec. No experimental renderer APIs required.

**Coordinates:** right-handed x=R, y=U, z=F. A face grid is viewed from outside; rows go down. URFDLB order matches cubejs's published net. The six above/right landmarks in PROJECT_SPEC.md are retained exactly: F U/R, R U/B, B U/L, L U/F, U B/R, D F/R. Clockwise is -90° around the outward normal; inverse is three quarter-turns and `2` is two. Fixed colors U white, R red, F green, D yellow, L orange, B blue. Automated agreement covers all 18 turns, the recorded scramble, and 100 seeded legal scrambles with every solution boundary. Physical orientation testing is pending; no physical trial is claimed.

**Verification:** independent sticker rotations agree with cubejs's cubie implementation; all actual mesh world positions, normals and material colors reconstruct the same facelets. Solutions are rejected unless independent application ends solved. This checks all six faces, including those hidden by the camera. Pixel/browser evidence complements those assertions; a screenshot alone cannot establish all-face correctness.

**Licensing:** installed cubejs, Three.js, React and Vite license files/metadata are MIT. Preserve upstream notices when redistributing. cubing was not shipped. No project-wide legal license was invented.

**Compatibility:** installed Three.js source explicitly requires WebGL2 (WebGL1 unsupported since r163). Vite handles cubejs CommonJS and worker bundling. Test production on a non-root `/Face54/` path; do not infer public GitHub Pages deployment. Node 22.14.0 used. Firefox/Safari/mobile hardware coverage is not established by Chrome/Edge tests.

**Dependency risk:** cubejs depends on npm ^6.0.0, even though its entry point imports only lib/cube and lib/solve. `npm audit --json` recorded 42 findings (12 moderate, 27 high, 3 critical), attributable to that legacy dependency tree. Do not claim the dependency tree is clean. The worker bundle does not ship the npm CLI; this limits browser exposure but does not remove installation/tooling risk. Replacing/patching that packaging dependency or choosing a maintained solver must be resolved before release. Audit snapshot: docs/npm-audit.json. Avoid automatic `audit fix --force`, which proposes changing solver versions without compatibility proof.

**Performance:** one Node verification run: preparation 3646.46 ms; solve min 0.013 ms, mean 95.48 ms, max 949.01 ms across 103 states (includes solved/one-move). These are local observations, not guarantees or shortest-solution claims. Build observed 848 ms, main chunk 747.05 kB / 200.68 kB gzip and worker 19.55 kB; Vite emits its >500 kB warning. Cold browser results are recorded in M0_REPORT.md. The M0 renderer preserves its drawing buffer for diagnostic pixel readback; reconsider this cost for production.

Sources checked: [cubejs API and facelet net](https://github.com/ldez/cubejs), [TwistyPlayer experimental API documentation](https://js.cubing.net/cubing/twisty/), [Three.js renderer source](https://github.com/mrdoob/three.js/blob/dev/src/renderers/WebGLRenderer.js), [WCA move notation](https://www.worldcubeassociation.org/regulations/#article-12-notation). Installed package source and licenses are the version-specific evidence.

## M0 compatibility correction

Production browser testing exposed cubejs's `this.Cube || require('./cube')` access failing when top-level `this` is undefined in a module worker. `vite.config.ts` applies one guarded pre-transform to cubejs/lib/solve.js, selecting its existing CommonJS `require('./cube')` branch. It runs for app and worker builds without editing node_modules or upstream algorithms, and throws if the expected source changes. Trade-off: a version-sensitive compatibility patch requiring re-verification on upgrade. The production browser tests are the regression checks. The preview script also explicitly configures the test base path; setting only the build CLI base did not configure the preview server's base.
