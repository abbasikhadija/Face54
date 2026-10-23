# Current context

## Active publication follow-up (2026-10-23)

Publication run 39986024984 has now FAILED on old commit df86244: 101/102 passed; Edge immediately observed zero terminated workers after clicking Back to colors. Hash navigation and React effect cleanup are asynchronous; SolvePanel already disposes its client on unmount. The cancellation test now polls for the same exact termination count before checking that returning cannot show an old solution. No runtime lifecycle change, skipped assertion or configured retry. Ten consecutive checks (five per Chrome/Edge) passed in 35.6 s; lint passed. This correction and the zoom correction below remain local and uncommitted. Owner must stage tests/solving.spec.ts as well as the other four follow-up files, commit/push, and start a new publication run. Public deployment and physical trials remain pending.

Owner manually started Publish approved build to Pages run 39986024984. Prior Quality run 39985334986 failed only Linux Edge 156's immediate 200% zoom overflow check (101/102 browser tests passed). Local reproduction measured transient width 1,822 vs viewport 1,280, then correct 1,280 after ResizeObserver settled. Local CSS now constrains canvas to its host; quality test waits for matching renderer/host sizing before the unchanged no-overflow assertion. Lint/production build pass; quality suite 12 passed (1.1 min), foundation suite 12 passed (39.7 s), scoped diff check passed. No configured retries/skips or relaxed overflow assertion. No commit/push by agent; current remote publication uses the older commit and was still installing browsers at last check. Owner must commit/push this fix, then start a NEW manual workflow run from main (rerunning an old job keeps its old commit). Physical trials still pending.

## Latest Pages diagnosis (2026-10-23)

Owner enabled Pages after the M6 preparation commit (41fe503). Quality push workflow succeeded on GitHub. The default `pages build and deployment` run 39957674460 also succeeded, but used **Build with Jekyll**, publishing raw source instead of Vite dist. Public URL now returns HTTP 200 with source index.html (`/src/main.tsx`), while compiled assets/notices return 404: this is not a working application deployment. Select Pages source **GitHub Actions** and manually run the custom Pages workflow to publish dist. Local workflow renamed **Publish approved build to Pages** and approval description corrected to approve publication without asserting physical trials. Physical trials/final acceptance remain pending independently. No agent commit/push/dispatch/settings change/deployment. Commit/push the wording fix before following the new workflow name. Prior 404 observations below are historical.

## Current milestone

M6 — Final Quality and GitHub Pages Release INCOMPLETE (2026-10-23). Local release preparation and automated verification pass; physical cube acceptance and public release verification remain pending. M0–M5 remain complete for their recorded automated acceptance. STOPPED for user review. No commit, push, workflow dispatch, Pages settings change or deployment performed.

## Where development stopped

M5 had a complete guided virtual journey with previews, explicit confirmation/undo, completion and the real demo. This session implemented M6 local quality, dependency/license/performance review, recovery and release workflows. It did not publish the site. Owner confirmed no physical trials; repository search found no completed trial records, only pending statements. Do not call M6 or the final product complete from virtual evidence.

## Current implementation

- Existing canonical URFDLB model, fixed Western centers, entry order F/R/B/L/U/D, version-1 face54.draft, independent physical validation, typed worker pipeline and pure confirmed playback plan remain. Canonical mathematics stays independent of rendering. No algorithm, backend, tracking, accounts or automatic full-solution playback added.
- M6 separates domain colors into colors.ts and dynamically imports the shared viewer and diagnostic Proof. Review/input without an active 3D reference need not fetch Three.js. CubeView/OrientationGuide safely handle pending imports and unmounts; download failure leaves guidance/input usable. Graphics loss stops animation and blocks physical confirmation until reload/re-entry. Preview caption distinguishes temporary state.
- cubejs now resolves to file:vendor/cubejs, a local distribution of unmodified upstream 1.3.2 index/cube/solve runtime files and MIT LICENSE with replacement package metadata only. The unused npm 6 CLI dependency is omitted. Four hashes match a freshly downloaded official registry tarball. scripts/check-vendor.mjs verifies integrity on every build. Existing guarded CJS worker transform/API/algorithm remain; worker asset hash still Pg0QfE6M.
- Fresh npm audit reproduced 42 findings before (12 moderate, 27 high, 3 critical), zero known findings after. Snapshots docs/npm-audit-m6-before.json and npm-audit-m6-after.json. Vendored-source security/upstream review remains manual; audit does not maintain it automatically.
- scripts/licenses.mjs generates full MIT runtime notices for cubejs, React, React DOM, scheduler and Three.js into public/THIRD_PARTY_NOTICES.txt and dist. No application-wide license chosen. Direct versions and lockfile pinned. Node >=22.12 required for current axe tooling; verified Node 22.14.0/npm 10.9.2.
- Oxlint correctness/hooks/JSX accessibility plus separate typecheck commands added. typescript-eslint peer range excludes existing TypeScript 7, so retained compiler and used Oxlint rather than force peers/downgrade. Only prefer-tag-over-role recommendation disabled because labeled custom cube spans/groups/live statuses use valid ARIA; independent axe scans cover semantics.
- /Face54/ base is centralized in vite.config.ts for dev/build/preview. Bundler-managed worker/assets and hash routes retained. Explicit #welcome links resolve lint concerns.
- .github/workflows/quality.yml prepares read-only PR/main lint/type/unit/audit/build and Chrome/Edge browser checks. pages.yml is a separate main-only manual release dispatch with explicit release_approved input and limited deploy permissions after repeating checks. Neither workflow has run on GitHub. Owner must enable Settings > Pages > GitHub Actions and review/authorize publication after physical records are complete.
- Physical record docs/PHYSICAL_ACCEPTANCE.md has two proposed recorded scrambles and all trial outcomes pending. Do not fill it with automated observations.

## Verified results

- Normal clean npm ci passed (35 s). An earlier overlapping preview/install caused a Windows native-module lock and temporarily missing dependency; conflicting run ended, install restored, then checks rerun against a fixed build. No peer-force install, product workaround, skips or retries.
- npm run lint, npm run typecheck, npm run check:vendor, license generation and npm audit passed; resolved-tree snapshot has zero known findings. Fresh tarball comparison verified all 4 copied runtime/license files.
- `node node_modules/vitest/vitest.mjs run --disableConsoleIntercept`: 118 passed, 5 files, 20.76 s. Includes existing 103 solver/renderer and 103 typed solver cases, 1,000 legal validation states/impossible fixtures, input/orientation/persistence and all 18 mesh turns plus playback/undo boundaries. Algorithm equivalence retained.
- `npm run build`: passed integrity/notices/TypeScript/Vite, 748 ms. Initial JS 263.56 kB / 82.13 kB gzip (M5 812.39 / 218.55); on-demand renderer 549.61 / 136.83; proof 1.89 / 0.94; CSS 17.12 / 4.24; worker unchanged 23.93 kB. The renderer still triggers >500 kB warning; total 3D cost remains when requested.
- `npm run test:browser`: final 102 passed, 5.2 min; Chrome 155.0.8059.85 and Edge 155.0.4283.62, production /Face54/. All inherited full demo/manual-entry/confirmed completion, M0 mesh proof, validation, worker cancellation/retry/stale/error, orientation, persistence, keyboard and emulated touch regressions pass.
- New quality suite: 12 checks across both browsers, focused run passed in 1.0 min. Axe WCAG A/AA scans on welcome/prepare/input/invalid and valid review/playback/undo/completion and dialogs report no violations. 320 px reflow, simulated 200% CSS zoom, reduced-motion preview, chunk-download failure, graphics-context loss during preview, data preservation, public notices/base path and no external service requests pass. Not a full screen-reader or real hardware audit.
- Local measured review-then-welcome test: Chrome 876 ms, Edge 1,025 ms; includes cached app resources and a new renderer request, not a cold-load guarantee. Review-only page did not request renderer. Concurrent Node pipeline observation: initialization total 3,340.37 ms, search mean 98.83/max 913.82 ms. No FPS/hardware-independent performance claim.
- Narrow and zoom screenshots visually inspected; selected docs/screenshots/m6-guidance-320.png and m6-guidance-zoom.png. Existing M5 guide/completion captures remain representative. Test artifacts ignored.
- Scoped git diff --check -- . passed. Evidence/alternatives in docs/M6_REPORT.md and docs/DECISIONS.md; historical reports preserved.

## Repository and outstanding acceptance

Dedicated Git root now C:/Users/User/Face54 (previous parent-root warning resolved), branch main, origin https://github.com/abbasikhadija/Face54.git, verified public repository. AGENTS.md updates only the root fact; explicit no-commit/push/deploy rules remain. PROJECT_SPEC.md unchanged. Keep inspections scoped.

Intended public URL https://abbasikhadija.github.io/Face54/ returned HTTP 404 on 2026-10-23. No public worker/3D/demo/manual journey can yet be certified. Local preview and prepared workflows are not a deployment. Workflows have not run on GitHub/Linux.

Real physical trials remain PENDING, confirmed by owner and repository review. Complete more than one recorded legal scramble through all-face input, real/virtual comparison, physical generated moves and solved observation. Software cannot detect physical turns. Saved input stays original while playback is transient; re-enter current physical colors after leaving/refreshing if turns were made.

Remaining limitations: full assistive-technology audit, Firefox/Safari and real mobile hardware pending; large renderer/cold solver cost; version-sensitive bundler guard and vendored-source maintenance; unsupported cross-tab arbitration. Old M0 dependency finding snapshot is historical and resolved by repackaging, not a current 42-finding claim.

## Next action

Await user review. There is no M7; finish M6 rather than start another milestone. Remaining gates: actual physical trial records, reviewed/authorized publication (and owner commits/pushes or explicit authorization for them), enable Pages Actions source, run quality/manual Pages workflow, and verify actual public worker/renderer/demo/manual desktop/mobile journeys. Keep M6 incomplete until acceptance is met. Do not publish, commit or push automatically. Do not repeat already completed M0–M5 implementation.
