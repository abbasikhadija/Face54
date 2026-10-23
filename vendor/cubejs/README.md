# cubejs 1.3.2 runtime distribution

These runtime files and LICENSE are byte-for-byte copies from the previously installed npm cubejs@1.3.2 package: index.js, lib/cube.js, lib/solve.js. Upstream: https://github.com/ldez/cubejs. Registry source: https://registry.npmjs.org/cubejs/-/cubejs-1.3.2.tgz.

Only package metadata is replaced. The unused npm@^6 dependency, development tools and async worker wrapper are omitted. Face54 already supplies its own verified typed worker. No solving algorithm was changed or claimed as original work. SHA256.json records original runtime/license hashes and scripts/check-vendor.mjs checks them. Preserve LICENSE when redistributing.

The existing guarded Vite transform of `this.Cube || require('./cube')` remains a build-time compatibility fix; the source here stays unmodified. Future solver upgrades require deliberate upstream/source/license/hash review and the full solver, validation, mesh and browser regressions. Vendoring removes the legacy CLI dependency tree, not the obligation to review future solver issues.
