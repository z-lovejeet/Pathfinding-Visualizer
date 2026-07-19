# Full Project Audit — DSA Visualizer

**Audit date:** 2026-07-18  
**Scope:** Entire repository: Next.js application, algorithm and maze logic, 3D/UI behavior, state management, API/database scaffolding, configuration, dependency lockfile, documentation, and quality controls.  
**Change policy observed:** Read-only audit. This report is the only file added. The pre-existing untracked `docs/` directory was preserved.

## Executive summary

The project has a strong visual and modular foundation, but it is **not release-ready** for an educational pathfinding tool. The highest-priority issues affect the correctness and trustworthiness of its core claims: A* can return a non-optimal route, generated mazes frequently have no route between the default endpoints, visualization cancellation still records a completed result, and displayed path cost is internally inconsistent.

The static type check passes, but the configured lint gate fails with eight errors. There is no automated test suite or CI workflow, which allowed several deterministic correctness regressions to remain undetected. The production dependency tree also contains a moderate PostCSS advisory via Next.js.

## Audit method and verification

### Coverage

- Reviewed all 96 tracked files and the existing project blueprint in `docs/`.
- Reviewed the App Router pages, Zustand stores, algorithms, mazes, animation engine, 3D scene, controls, API/database scaffolding, shared UI components, styles, package manifests, and lockfile.
- Inspected repository safety/deployment configuration, ignored files, and documentation.

### Read-only checks

| Check | Result |
|---|---|
| `./node_modules/.bin/tsc --noEmit --incremental false` | Passed |
| `npm run lint -- --no-cache` | Failed: 8 errors, 7 warnings |
| `npm audit --package-lock-only --ignore-scripts` | 6 moderate entries, 0 high/critical |
| Production-only dependency audit | 2 moderate entries, 0 high/critical |
| In-memory algorithm/maze property checks | Reproduced the findings below without writing test files |

I intentionally did not run `next build`, `next dev`, or other commands that create `.next/` output, to honor the no-write scope.

## Severity guide

- **High** — Core correctness, user-visible data integrity, or release blocker.
- **Medium** — Important functional, security-readiness, accessibility, or maintainability issue.
- **Low** — Defense-in-depth, documentation, deployment, or scalability improvement.

## Findings

### High

#### H-01 — A* can return a non-optimal path despite being advertised as optimal

**Evidence:** `lib/algorithms/astar.ts:36` stores mutable `GridNode` objects in the heap. Lines 59–64 mutate a node's `totalCost` and push the same object again. `MinHeap` compares that mutable property (`lib/data-structures/MinHeap.ts:15,41-67`), so an already-enqueued heap entry changes priority without being reheapified. A node can then be marked visited via a worse route before its lower-cost route is popped.

**Reproduction:** On this 7×8 weighted grid, with `S=(0,0)`, `E=(6,7)`, `#` as a wall, `5` as a weight-5 node, and `.` as weight 1:

```text
S5......
55....#.
...5.#55
...##5..
5##....5
.55#5#55
555.#..E
```

A* returns a path cost of **29** (excluding the start); Dijkstra and an independent reference implementation return **27**. The UI's current cost calculation would instead display 30 and 28 because it also counts the start node (see H-05).

**Impact:** The application's primary educational guarantee is false for valid user-created weighted grids.

**Recommendation:** Store immutable priority entries such as `{ node, priority }`, or implement a real decrease-key operation. Add deterministic optimality tests that compare A* and Dijkstra against a reference shortest-path calculation on weighted grids.

#### H-02 — Stopping or clearing an animation can still publish a completed result

**Evidence:** `AnimationEngine.cancel()` resolves the animation promise (`lib/animation/AnimationEngine.ts:198-207`) instead of signalling cancellation. `runAlgorithm()` therefore continues through the normal completion update (`store/useVisualizerStore.ts:334-355`) after `stopAlgorithm()` has cleared the engine and running state (`store/useVisualizerStore.ts:384-393`).

**Observed result:** A controlled cancellation left the store in a completed state with final node/path statistics, even though the user selected Stop. A cancelled no-path run can also reopen the no-path modal.

**Related race:** `runAlgorithm()` and `generateMaze()` wait 50 ms before setting `isVisualizing` (`store/useVisualizerStore.ts:304-320,396-415`). A second quick invocation can pass the initial guard and start a competing animation.

**Recommendation:** Use a cancellation result/rejection and a monotonically increasing run ID. Set the running state before any `await`, and only accept callbacks/completion from the active run ID.

#### H-03 — Pathfinding animation flattens walls and weighted cells

**Evidence:** Every `AnimationEngine` height buffer starts at `0.1` (`lib/animation/AnimationEngine.ts:49-55`). `GridMesh` prefers any positive engine height over the node's actual height (`components/three/GridMesh.tsx:80-90`). This overrides walls (`0.8`) and weighted cells (`0.3`) for the entire pathfinding run. The store intentionally keeps the engine after completion (`store/useVisualizerStore.ts:342-355`), so the incorrect geometry persists.

**Impact:** The 3D board can visually contradict its real collision/pathfinding state and hide the meaning of walls and weights.

**Recommendation:** Represent an inactive animation buffer explicitly (for example with a phase/valid mask), initialize each buffer from the grid's base geometry, and discard or reset it after completion before allowing edits.

#### H-04 — Maze generation does not guarantee a route between the default endpoints

**Evidence:** Endpoint cells are merely opened/protected rather than connected to the generated passage graph in `lib/maze/recursiveBacktracker.ts:79-85`, `lib/maze/prims.ts:93-99`, and `lib/maze/kruskals.ts:100-102`; recursive division similarly has no end-to-end reachability validation (`lib/maze/recursiveDivision.ts:20-24`).

**Verification:** Applying generated steps exactly as the app does and running BFS on 1,000 deterministic default-grid trials produced these unreachable results:

| Generator | Unreachable trials |
|---|---:|
| Recursive Backtracker | 14 / 1,000 |
| Randomized Prim's | 70 / 1,000 |
| Randomized Kruskal's | 656 / 1,000 |
| Recursive Division | 867 / 1,000 |

The random scatter generator may reasonably have no route, but the structured maze options are presented as generated mazes and should reliably be solvable.

**Recommendation:** Normalize start/end to valid maze cells and carve connectors to the passage network, then validate reachability before presenting a maze. Regenerate or repair any disconnected result.

#### H-05 — "Path Cost" has three conflicting definitions

**Evidence:** Dijkstra and A* charge the cost of entering a neighbor (`lib/algorithms/dijkstra.ts:46-53`, `lib/algorithms/astar.ts:56-65`). The final visualizer and comparison statistics sum every path node, including the start (`store/useVisualizerStore.ts:349-351`, `store/useCompareStore.ts:134,141`). The live animation skips both start and end (`lib/animation/AnimationEngine.ts:144-165`).

**Reproduction:** In a weighted-detour case, the algorithm's distance was 8; the final store statistic was 9; the final live-animation count was 7.

**Impact:** The displayed cost is wrong and can jump when the animation completes, undermining algorithm comparison.

**Recommendation:** Define cost once as the sum of entered nodes (normally `path.slice(1)`), implement one shared helper, and use it for algorithm results, live counters, and comparison statistics.

#### H-06 — The configured lint quality gate fails

`npm run lint -- --no-cache` exits 1 with eight errors and seven warnings.

- Synchronous state updates in effects: `components/compare/CompareGrid.tsx:54,68` and `components/ui/GlassModal.tsx:18`.
- Ref reads/writes during render: `components/three/GridMesh.tsx:44`.
- Warnings include unused imports/variables and an unsafe ref cleanup pattern.

**Impact:** A defined project quality gate is currently red, and the React issues make runtime behavior less predictable under current React tooling.

**Recommendation:** Resolve all lint errors before release and make lint/typecheck mandatory in CI.

### Medium

#### M-01 — Comparison results can be relabeled as a different algorithm

`setAlgo1` and `setAlgo2` only change the selected labels (`store/useCompareStore.ts:86-88`). After a comparison, the controls remain enabled and the UI derives labels from the newly selected algorithms (`components/compare/CompareControls.tsx:37-67`, `app/compare/page.tsx:57-76`) while retaining results computed by the old pair.

**Impact:** A user can unknowingly compare old results under new algorithm names.

**Recommendation:** Clear results whenever an algorithm changes, or bind each result/statistic to the algorithm ID that produced it and disable selectors while result animation is active.

#### M-02 — Erase converts a weight into a wall

Erase sends both walls and weights through `toggleWall()` (`components/three/RaycastHandler.tsx:63-66`). `toggleWall()` only clears existing walls; any other non-endpoint type becomes a wall (`store/useVisualizerStore.ts:150-165`).

**Impact:** Using Erase on a weight requires two actions and produces the opposite of the requested operation on the first action.

**Recommendation:** Add an explicit clear-cell action that resets both walls and weights to the canonical empty-node state.

#### M-03 — Greedy Best-First Search is described as weighted, but ignores weights

Metadata marks Greedy as weighted (`lib/constants.ts:75-81`), while its implementation prioritizes only Manhattan distance and never reads `neighbor.weight` (`lib/algorithms/greedy.ts:51-55`). The project blueprint also describes Greedy as not handling weights.

**Impact:** The algorithm selector and learning experience give contradictory guidance.

**Recommendation:** Mark it as weight-agnostic/unweighted, or explicitly explain that it traverses weighted cells but deliberately ignores their cost.

#### M-04 — The visible Share Grid feature is not implemented and has unsafe placeholder behavior

The navbar displays a Share Grid button without an `onClick` handler (`components/layout/Navbar.tsx:55-60`). `POST /api/share` accepts and logs arbitrary JSON, then returns a fixed placeholder ID; `GET` returns placeholder data (`app/api/share/route.ts:3-24`). Database setup has no migration/persistence implementation (`lib/db/setup.ts:4-14`).

**Impact:** The visible feature does nothing today. If wired to persistence without validation, it also creates a log-volume/data-leakage and unbounded-input risk.

**Recommendation:** Hide/disable the feature until it is complete, or implement a bounded validated DTO, safe structured logging, a documented public-link access model, rate limiting, durable storage, and end-to-end tests.

#### M-05 — Malformed serialized grid data can throw during deserialization

`deserializeGrid()` only checks upper bounds, not negative or integer coordinates (`lib/grid/gridUtils.ts:78-91`). A persisted cell such as `{ row: -1, col: 0 }` dereferences `undefined` and throws.

**Impact:** Future share/load functionality can fail on malformed or stale data.

**Recommendation:** Validate the whole saved-grid schema and require integer coordinates within `0 <= row < rows` and `0 <= col < cols` before indexing.

#### M-06 — Dependency audit reports moderate advisories

- `next@16.2.10` locks `postcss@8.4.31`; `postcss <8.5.10` is affected by **GHSA-qx2v-qp2m-jg93 / CVE-2026-41305**. This accounts for the two production-only moderate audit entries.
- Dev dependency `drizzle-kit@0.31.10` pulls `@esbuild-kit/esm-loader` and `esbuild@0.18.20`; `esbuild <=0.24.2` is affected by **GHSA-67mh-4wv8-2f99**.

**Recommendation:** Upgrade Next to a release that resolves the PostCSS advisory; upgrade/remove Drizzle Kit rather than forcing an incompatible nested esbuild override; regenerate the lockfile and rerun audit.

#### M-07 — There is no automated test suite, test script, or CI workflow

`package.json` has only dev/build/start/lint scripts. No test/spec files, test configuration, or CI workflow are present.

**Impact:** Core regressions in A*, cancellation, maze connectivity, and cost accounting have no automated protection.

**Recommendation:** Add unit/property tests for algorithms, maze reachability, store cancellation, and cost accounting; add a clean-install CI workflow that runs typecheck, lint, tests, and dependency audit.

#### M-08 — Accessibility gaps affect keyboard and assistive-technology use

- Compare-grid cells are clickable `div` elements without keyboard semantics (`components/compare/CompareGrid.tsx:138-154`).
- Icon-only controls lack accessible names, including the mobile navigation button (`components/layout/Navbar.tsx:63-68`), legend toggle (`components/legend/Legend.tsx:85-90`), and no-path close control (`components/ui/NoPathModal.tsx:51-56`).
- The no-path modal does not expose dialog semantics, trap focus, restore focus, or support Escape (`components/ui/NoPathModal.tsx:26-81`).
- Landing-page links wrap nested buttons (`components/landing/HeroContent.tsx:79-100`, `components/landing/CTASection.tsx:38-51`), creating invalid nested interactive controls.
- The global stylesheet defines extensive movement/pulse effects but no `prefers-reduced-motion` fallback (`app/globals.css`).

**Recommendation:** Use semantic buttons/grid controls, add accessible labels and keyboard behavior, implement modal focus management/Escape handling, and honor reduced-motion preferences.

### Low

#### L-01 — Database configuration fails open when its secret is missing

`lib/db/client.ts:5` substitutes a local non-TLS PostgreSQL URL when `DATABASE_URL` is absent. This can hide deployment misconfiguration or connect to an unintended local service.

**Recommendation:** Fail fast with a clear server-side startup error when the required database URL is missing.

#### L-02 — Secret file permissions are more open than necessary

`.env.local` is correctly ignored and is currently protected by non-traversable parent directories, but it has mode `0644`. Set it to `0600` so the secret boundary remains safe if the workspace is moved or shared.

#### L-03 — Deployment hardening is not represented in the repository

`next.config.ts` is empty, and the repository has no visible CSP, framing/referrer/permissions policies, deployment configuration, Node-version pin, `engines` field, or package-manager pin.

**Recommendation:** Define appropriate headers and deployment controls after validating embedded/hosting requirements; pin the supported Node/package-manager versions and use immutable installs in CI.

#### L-04 — Documentation and project identity are stale

`README.md` is still the create-next-app boilerplate, and `package.json` is named `tmp_app`. The README does not cover required environment variables, the 3D visualizer, the comparison page, verification commands, persistence status, or deployment expectations.

**Recommendation:** Replace it with project-specific onboarding and operational documentation, and rename the package before publication/deployment.

#### L-05 — A few implementation choices will not scale with larger grids

- BFS and bidirectional BFS use `Array.shift()` (`lib/algorithms/bfs.ts:25-27`, `lib/algorithms/bidirectional.ts:87-91`), making queue removal quadratic in the worst case.
- Prim's frontier deduplication linearly scans the frontier on each insertion (`lib/maze/prims.ts:35-46`).
- `GridMesh` updates matrices and colors for every cell on every frame (`components/three/GridMesh.tsx:74-200`).

The current 25×50 grid masks most of this, but configurable/larger grids will expose it.

**Recommendation:** Use head-index queues or deques, a keyed frontier set, and dirty-instance/buffer update strategies.

#### L-06 — Blueprint and delivered interactions differ

The blueprint describes dragging start/end beacons, while `components/three/Beacons.tsx` has no pointer handlers; the implementation instead requires choosing Start/End mode and clicking a destination. The visible behavior should be documented accurately or upgraded to the described interaction.

## Positive observations

- TypeScript strict mode passes with no emit.
- The project separates algorithms, maze generators, grid types, animation, stores, and presentation components cleanly.
- `.gitignore` correctly excludes environment files, build output, Vercel state, PEM files, and logs; no tracked credentials or client-exposed database configuration were found.
- The only `dangerouslySetInnerHTML` use is fed by local static learning data, not request/user content (`components/learn/PseudocodeBlock.tsx:14-22`). Preserve that trust boundary if the content becomes dynamic.
- No `eval`, raw SQL from requests, client-side database import, browser secret storage, uploads, server actions, or third-party runtime scripts were found.
- External new-tab navigation uses `rel="noopener noreferrer"`.

## Recommended remediation order

1. **Restore algorithm correctness:** fix A* priority handling, introduce a shared path-cost helper, and add deterministic tests for weighted optimality.
2. **Make visualization state safe:** implement real cancellation/run IDs, remove the pre-await double-start window, and preserve base wall/weight geometry in animation buffers.
3. **Make mazes trustworthy:** connect endpoints to maze passages and post-validate reachability before animation.
4. **Re-establish quality gates:** fix lint, add tests/CI, and run clean-install verification on every change.
5. **Finish or hide incomplete product paths:** correct comparison result identity, erase semantics, Greedy labeling, share persistence/input validation, and deserialization validation.
6. **Harden operations:** update vulnerable dependencies, fail closed on missing database configuration, tighten local-secret permissions, and document runtime/deployment requirements.
