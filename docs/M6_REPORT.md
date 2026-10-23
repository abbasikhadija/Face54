# M6 — Final Quality and GitHub Pages Release

Date: 2026-10-23. **INCOMPLETE: local release preparation implemented; physical and public release acceptance pending.** M5 was complete and scoped status clean at session start. Only M6 worked on. No commit, push, workflow dispatch, Pages settings change or deployment.

## Implemented

- Oxlint correctness/hooks/JSX accessibility checks, separate TypeScript command, exact direct versions, reproducible lockfile and Node >=22.12 requirement (verified Node 22.14.0/npm 10.9.2).
- Repackaged the unchanged MIT cubejs 1.3.2 runtime locally without its unused npm 6 CLI tree. Four runtime/license files match SHA-256 values from a freshly downloaded official registry tarball. Build checks integrity; the existing guarded worker compatibility transform remains. Solver algorithm/API and production worker hash are unchanged.
- Fresh dependency review: before 42 findings (12 moderate, 27 high, 3 critical), after zero known findings in the resolved tree. Before/after audit snapshots preserved. Five full MIT runtime notices generated into the public build; no project-wide application license invented.
- Domain colors separated from WebGL imports, shared renderer/technical proof loaded on demand. Initial app chunk is substantially smaller; direct review navigation does not fetch WebGL. Clear chunk-download failure guidance, usable text/input fallback and graphics-context-loss handling that stops previews and disables physical confirmation.
- Preview caption distinguishes temporary preview from confirmed state; welcome links use explicit hash targets. Existing minimalist graphite journey remains.
- Base path /Face54/ centralized in Vite for dev/build/preview. Prepared read-only PR/main quality CI and separate main-only, manually approved Pages publication after repeated checks. Actions pinned to revisions in current official Vite guidance. GitHub workflows are prepared, not claimed as executed.
- Physical acceptance record with two proposed recorded scrambles and all outcome fields pending. Repository search found no completed physical-trial evidence; owner confirmed no trials performed.

## Engineering decisions

Retain the established solver and architectural separation. Replace package metadata/distribution rather than changing solver versions or using an empty npm override. Vendored source needs deliberate upstream security review; npm audit cannot maintain it automatically. Avoid forcing typescript-eslint's incompatible peer range or downgrading TypeScript 7; use Oxlint. The optional prefer-tag-over-role recommendation is disabled because valid labeled cube spans/groups/live statuses have no suitable suggested native replacement; independent axe checks validate the implemented semantics.

Use genuine on-demand module loading instead of splitting chunks merely to silence warnings. Total 3D cost still exists when requested. Treat lost graphics as unverifiable state and block physical progress until reload/re-entry. No generic framework, tracking, backend or remote assets added. See DECISIONS.md for alternatives and official references.

## Verification

- Clean `npm ci` passed after resolving a Windows lock from an overlapping preview run. An initial browser launch during install failed to import a temporarily removed dependency; final checks run against the restored installation. No product workaround, peer-force install or skipped tests.
- `npm run lint`, `npm run typecheck`, `npm run check:vendor` and license generation passed. `npm audit` snapshot reports zero known vulnerabilities. Fresh upstream tarball comparison confirms all four copied source/license hashes.
- `node node_modules/vitest/vitest.mjs run --disableConsoleIntercept`: 118 passed across five files, 20.76 s. Includes 103 solver/renderer states, 103 typed worker requests, physical/input/persistence validation and all playback geometry/undo checks. Local pipeline observation: total preparation 3,340.37 ms, mean search 98.83 ms, max 913.82 ms; concurrent-run observations only, not guarantees.
- Focused new quality browser suite: 12 passed in 1.0 min, Chrome/Edge. Axe scans cover welcome, preparation, input, invalid/valid review, playback/undo/completion and reset/exit dialogs with WCAG A/AA tags. No violations reported. These automated scans do not replace full assistive-technology testing.
- `npm run test:browser`: final 102 passed in 5.2 min, Chrome 155.0.8059.85 and Edge 155.0.4283.62 against the fixed production /Face54/ build. No skips/retries added. Scoped `git diff --check -- .` passed.
- Checks include 320 px reflow, simulated 200% CSS zoom, reduced-motion preview, context loss during a preview, renderer-chunk download failure, original-color preservation, notices/base path and no external services. Existing full journeys remain under regression.
- Final build passed TypeScript/integrity/licenses and Vite in 748 ms: initial JS 263.56 kB / 82.13 kB gzip (was 812.39 / 218.55), renderer 549.61 / 136.83, proof 1.89 / 0.94, CSS 17.12 / 4.24, worker unchanged 23.93 kB. Renderer retains the >500 kB warning; no measured FPS or universal load-time promise.
- Narrow/zoom screenshots visually inspected. Selected captures saved under docs/screenshots/m6-*.png. Local /Face54/ is not evidence of public deployment.

## Files changed

New: vendor/cubejs runtime/license/provenance, .gitattributes, .oxlintrc.json, scripts/integrity/license tooling, public/THIRD_PARTY_NOTICES.txt, two GitHub workflows, src/colors.ts, tests/quality.spec.ts, audit snapshots, physical acceptance record and this report/screenshots. Updated package/lock, Vite base, viewer/CubeView/OrientationGuide loading/recovery, domain color imports, main/proof loading and hash links, preview caption, small lint fixes in tests, README/context/DECISIONS. Mathematical transforms, validator implementation, solver/worker/client, input/persistence schema and product scope retained. AGENTS.md corrects only the obsolete parent-root fact; authorization rules remain. PROJECT_SPEC.md unchanged.

## What to understand

An unchanged algorithm can be packaged without unrelated vulnerable tooling. Integrity, audit and solver equivalence tests check different properties; none alone establishes all three. Likewise, local browser success does not establish physical cube correctness or a working public deployment.

## Remaining release gates and limitations

- **Physical trials not run.** Complete both records in PHYSICAL_ACCEPTANCE.md with actual all-face real/virtual comparisons and generated physical moves to solved. The owner confirmed no trials and no prior completed record was found.
- **Public release not verified.** Origin is https://github.com/abbasikhadija/Face54.git, main. Intended https://abbasikhadija.github.io/Face54/ returned HTTP 404 on 2026-10-23. No publishing authorization was supplied. Enable Pages source GitHub Actions, review/authorize publication, execute reviewed workflow, then verify real worker/3D/demo/manual journey on the actual public URL before M6 completion.
- CI workflows have not run on GitHub; local Windows checks do not claim Linux runner execution. Full screen-reader audit, Firefox/Safari and real mobile hardware remain pending. Large renderer, cold initialization, version-sensitive guarded compatibility patch, vendored-source maintenance and unsupported cross-tab draft arbitration remain limitations.

## Next milestone

No M7. Finish these remaining M6 acceptance gates after user review; do not repeat completed M0–M5 work or declare the product released from local evidence.

Suggested commit: `chore: prepare audited accessible GitHub Pages release`
