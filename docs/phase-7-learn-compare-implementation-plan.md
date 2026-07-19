# Phase 7 Implementation Plan — Learn & Compare Pages

## Purpose

Rebuild Phase 7 so the project matches the blueprint’s Learn and Compare experience without reopening completed Phase 1–6 work. The central change is a real Compare experience: **two independent 3D R3F scenes showing the same editable board and two different algorithm playbacks**, not two DOM mini-grids.

This plan is written for a coding agent to execute in order. It deliberately does **not** add regression-test files or CI configuration: those were intentionally removed from this project. Validation is therefore typecheck, lint, production build, and the manual acceptance matrix at the end of this document.

## Blueprint trace

The whole blueprint was reviewed (1,872 lines). Phase 7’s seven explicit deliverables are at [lines 1814–1821](./dsa_visualizer_blueprint.md#19-development-roadmap):

1. Learn page using `AlgorithmCard` components.
2. Shiki syntax-highlighted pseudocode.
3. Complexity tables.
4. Step-by-step accordions.
5. Compare page with dual 3D scenes.
6. Recharts comparison bar chart.
7. Automatically generated comparison text.

The detailed contract is spread across these sections and must be treated as part of Phase 7:

| Blueprint area | What it constrains |
|---|---|
| [§2](./dsa_visualizer_blueprint.md#2-tech-stack) | R3F/Drei, GSAP, Zustand, Recharts, and Shiki are the intended implementation tools. All are already installed. |
| [§5](./dsa_visualizer_blueprint.md#5-3d-visualizer--the-core-experience) | Scene vocabulary, camera controls, cinematic rise/glow/path animation, and the `InstancedMesh` requirement. |
| [§9](./dsa_visualizer_blueprint.md#9-pages--component-hierarchy) | `/learn` and `/compare` responsibilities and intended component boundaries. |
| [§10–11](./dsa_visualizer_blueprint.md#10-typescript-types) | Grid, result, stat, and run-lifecycle semantics. |
| [§13.3](./dsa_visualizer_blueprint.md#133-learn-page-learn) | Learn page card/table layout and the “Try it” journey. |
| [§13.4](./dsa_visualizer_blueprint.md#134-compare-page-compare) | Two labeled 3D grids with the same layout, summary cards, grouped bars, and a data-backed narrative. |
| [§15](./dsa_visualizer_blueprint.md#15-performance-optimization) | Typed arrays, instance rendering, throttling, memoized UI, and rendering only what changes. |
| [§17](./dsa_visualizer_blueprint.md#17-algorithm-comparison-table-for-learn--compare-pages) | Correct algorithm capability/optimality facts used by Learn, selectors, charts, and comparison text. |

## Current baseline and gap assessment

### Already usable

- [`app/learn/page.tsx`](../app/learn/page.tsx) already renders six pathfinding and four maze cards.
- [`components/learn/AlgorithmCard.tsx`](../components/learn/AlgorithmCard.tsx) already uses glass cards and keyboard-friendly native `<details>` accordions.
- [`components/learn/PseudocodeBlock.tsx`](../components/learn/PseudocodeBlock.tsx) already calls Shiki on the server.
- [`components/learn/ComplexityTable.tsx`](../components/learn/ComplexityTable.tsx) already provides a partial pathfinding comparison table.
- Compare already has one shared board layout, cloned algorithm execution, selectors, a Recharts grouped chart, and draft narrative text.

### Must be rebuilt or completed

- Compare is currently two animated **2D button grids** in [`components/compare/CompareGrid.tsx`](../components/compare/CompareGrid.tsx), not the dual 3D scenes required by the blueprint.
- [`components/three/Scene.tsx`](../components/three/Scene.tsx), `GridMesh`, lights, plane, beacons, camera, and raycaster read `useVisualizerStore` directly. They cannot be mounted twice for Compare without first becoming reusable, prop-driven scene primitives.
- `runComparison()` marks the comparison complete as soon as both algorithms compute; each 2D grid then owns an unrelated timeout animation. This permits control changes while playback is still visible and provides no reliable pause, stop, cancellation, or stale-run protection.
- The present chart mixes nodes, path length, and milliseconds on one Y-axis. Those units are not comparable, and execution-time bars disappear beside node counts.
- The insight generator treats equal path length as “same path,” ignores weighted path cost in its main claim, and does not safely cover both-no-path, one-no-path, ties, same-algorithm, or sub-millisecond timing cases.
- Shiki receives `plaintext` for all cards, so pseudocode is formatted but not meaningfully syntax highlighted.
- Learn facts are duplicated in `lib/learn/algorithmData.ts` and `lib/constants.ts`; they can drift from selectors and comparison text. The Learn comparison table also omits the blueprint’s “Nodes Explored” and “3D Visual” columns.

## Scope, non-goals, and implementation decisions

### In scope

- Finish all seven Phase 7 deliverables.
- Preserve the completed visualizer’s behavior while extracting reusable 3D primitives.
- Retain one shared editable compare board with walls, weights, start/end positions, and maze output.
- Add robust comparison playback lifecycle, accessibility equivalents, responsive layout, and a compare-specific rendering-performance preset.
- Correct learning copy when it disagrees with the code that actually runs.

### Out of scope

- Rewriting the pathfinding or maze algorithms unless a small type/metadata adapter is strictly needed.
- New backend, authentication, save/load, tutorial, page-transition, or deployment work from Phase 8.
- New regression-test suites, test runners, GitHub Actions/CI, or package dependencies.
- A single split-viewport WebGL canvas. Two canvases are simpler, map directly to the blueprint’s two panels, and remain acceptable when each uses one instanced grid and a reduced-quality preset.

### Decisions to implement, not leave ambiguous

1. **Shared source board:** both panels always read one canonical layout. They never edit independent copies.
2. **Independent results and playback:** each side gets an isolated algorithm clone, result, animation engine, live counters, and final visual overlay.
3. **Editing policy:** either canvas can edit the shared source layout while idle; both immediately reflect that edit. Editing is locked during a run. A keyboard-operable, collapsible shared board editor is provided so Canvas is not the only editing route.
4. **Camera policy:** cameras start from the same preset but are independently orbitable. Camera synchronization is explicitly deferred.
5. **Metric policy:** path steps are `max(shortestPath.length - 1, 0)`; path cost is the existing total traversal cost (the start cell is not charged); compute time means a single algorithm-execution measurement, not a benchmark.
6. **Chart policy:** use one grouped Recharts bar chart at a time with a metric selector. Do not combine different units on a shared axis.
7. **Optimality policy:** use an explicit capability contract. BFS and Bidirectional are only optimal on an unweighted board; Dijkstra and A* are optimal for non-negative weighted traversal; DFS and Greedy are not guaranteed optimal.

## Target architecture

### 1. One canonical metadata/content source

Create a typed algorithm catalog, for example `lib/algorithms/metadata.ts`, and make existing selector and Learn exports derive from it instead of duplicating facts.

The catalog must distinguish pathfinding and maze entries and include at least:

```ts
type Optimality = 'weighted' | 'unweighted' | 'none';

type PathfindingMetadata = {
  id: AlgorithmType;
  shortName: string;
  name: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  dataStructure: string;
  handlesWeights: boolean;
  usesHeuristic: boolean;
  optimality: Optimality;
  nodesExploredProfile: string;
  visualBehavior: string;
};
```

Keep longer prose, pseudocode, insight, and steps in the Learn data layer, keyed by the same typed IDs. Preserve `ALGORITHM_INFO` as an adapter if that avoids unrelated churn in existing controls; it must be derived from the catalog rather than become a second source of truth.

Before updating prose, compare every educational claim with the real implementation. In particular, do not claim a “perfect maze/exactly one path” after a reachability-repair pass unless that remains true, and do not claim algorithm-specific animation effects that the current engine does not actually render.

### 2. A reusable 3D scene model

Extract the visualizer-specific Zustand reads from the Three layer. The main visualizer should keep its public `Scene` entry point, but it becomes a thin adapter around reusable components.

Suggested component boundary:

```text
components/three/
  GridScene.tsx                 # generic Canvas wrapper and quality preset
  GridInstances.tsx             # prop-driven InstancedMesh renderer
  EndpointBeacons.tsx           # start/end props, no store reads
  GridGround.tsx                # rows/cols props, no store reads
  SceneLights.tsx               # endpoint and dimension props
  SceneCamera.tsx               # reset key / camera config props
  GridRaycastHandler.tsx        # generic interaction callbacks
  Scene.tsx                     # existing visualizer-store adapter
```

`GridScene` receives the base grid, dimensions, endpoints, animation-engine buffers, interaction configuration, camera reset token, and a quality preset. It must not import a Zustand store. `Scene.tsx` continues to select the existing visualizer state and supplies those props, so Phase 1–6 visualizer behavior does not regress.

Use `GridInstances` rather than one React `<mesh>` per node. It must retain the existing `InstancedMesh`/typed-array approach and preserve walls, weights, beacons, purple visited cells, and gold path cells when animation buffers are present.

### 3. Comparison state as immutable snapshots plus two sides

Replace the current `result1`/`result2`-only shape in `useCompareStore` with explicit board, side, and run state. Holding `AnimationEngine` instances in transient Zustand state is acceptable because the existing visualizer already does this; do not persist them.

```ts
type ComparisonStatus = 'idle' | 'running' | 'paused' | 'completed';
type SideStatus = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled';

type ComparisonMetrics = {
  found: boolean;
  visitedCount: number;
  pathNodeCount: number;
  pathStepCount: number;
  pathCost: number;
  executionTimeMs: number;
};

type ComparisonSide = {
  algorithm: AlgorithmType;
  result: AlgorithmResult | null;
  metrics: ComparisonMetrics | null;
  live: Pick<ComparisonMetrics, 'visitedCount' | 'pathNodeCount' | 'pathCost'>;
  engine: AnimationEngine | null;
  finalDisplayGrid: GridNode[][] | null;
  status: SideStatus;
};

type CompareState = {
  boardGrid: GridNode[][];
  rows: number;
  cols: number;
  startPos: Position;
  endPos: Position;
  interactionMode: InteractionMode;
  left: ComparisonSide;
  right: ComparisonSide;
  status: ComparisonStatus;
  speed: number;
  runId: number;
  layoutVersion: number;
};
```

Required invariants:

- A run receives two deep clones of exactly one captured board snapshot. No algorithm-mutated `GridNode` object can be reused by the board or the other side.
- The canonical board never receives visited/path result state. It only contains layout semantics: empty, wall, weight, start, and end.
- During playback, a scene renders the canonical board plus its own engine buffers. Once complete, materialize that side’s final display grid, release the engine, and leave the other side untouched.
- Every action that changes layout or selection increments `runId`, cancels both engines, clears stale overlays/results, and prevents an old asynchronous callback from committing state.

## Detailed execution sequence

### Step 0 — Record the baseline and protect completed work

1. Verify the current production build before changing application code.
2. Identify every consumer of `Scene`, `GridMesh`, `GridPlane`, `Beacons`, `Lights`, `CameraController`, and `RaycastHandler`.
3. Keep the current visualizer route and its public store/action names functional throughout the refactor. Do not make Compare read or mutate `useVisualizerStore`.
4. Work in small checkpoints: metadata/Learn, generic Three primitives, compare store, compare UI, chart/narrative, then polish.

**Checkpoint:** the main visualizer still mounts from `app/visualizer/page.tsx` and can render its existing board before Compare work starts.

### Step 1 — Establish the catalog and comparison semantics

1. Add the typed pathfinding/maze metadata catalog described above.
2. Make selectors, Learn cards, Learn table, comparison labels, and the insight helper consume the same fields.
3. Replace the ambiguous `guaranteesShortestPath: boolean` presentation field with `optimality` plus a helper:

   ```ts
   isOptimalForBoard(metadata, boardHasWeightedCells): boolean
   ```

4. Add helpers in a new `lib/compare/` area:

   - `cloneComparisonBoard(grid)` — layout-safe deep clone that clears algorithm bookkeeping.
   - `summarizeResult(result, executionTimeMs)` — returns the metric contract above.
   - `materializeResultOverlay(board, result)` — creates a terminal display grid without mutating `board`.
   - `boardHasWeightedCells(board)` — checks meaningful weighted traversal (`weight > 1`).
   - `buildComparisonInsight(input)` — deterministic, pure, and UI-independent.

5. Define and use one label everywhere: “Path steps” for edges and “Path nodes” only where the number of nodes is explicitly intended. Use “Total traversal cost” for `getPathCost`.

**Checkpoint:** no UI behavior changes are required yet, but a side result can be summarized without knowing about React, a chart, or a Canvas.

### Step 2 — Complete Learn without turning it into a client-heavy page

1. Keep `app/learn/page.tsx` server-rendered and retain native `<details>/<summary>` accordions.
2. Extract `components/learn/StepByStep.tsx` from the inline ordered list. Preserve native disclosure behavior, visible focus, numbered steps, and unique accessible summary labels.
3. Create `components/learn/ComparisonTable.tsx` for the complete Blueprint §17 matrix. Include:

   - Algorithm, shortest-path condition, weights, heuristic, data structure, time, space, nodes explored profile, and 3D visual behavior.
   - A table `<caption>`, `scope="col"` headers, responsive horizontal scrolling, and text labels in addition to color/icons.
   - Correct phrases such as “optimal on unweighted boards,” not a blanket “optimal” for BFS/Bidirectional.

4. Keep or convert `ComplexityTable.tsx` into a small per-card complexity presentation; do not retain two conflicting all-algorithm tables.
5. Give every pseudocode item an explicit language. Implement a local `dsa-pseudocode` TextMate grammar (keywords such as `IF`, `WHILE`, `FOR`, `RETURN`, queue/stack operations, comments, strings, numeric literals, and operators) and register it with Shiki in the server-only `PseudocodeBlock`. Cache the highlighter by theme/language. The source remains static local content; do not pass untrusted input to `dangerouslySetInnerHTML`.
6. Update card links so “Try it” opens the intended pathfinding algorithm, e.g. `/visualizer?algorithm=astar`. Maze cards can expose “Generate it” with a validated maze query. Add one-time, validated query handling in the visualizer route/store adapter; ignore invalid query values and do not reset user state on subsequent renders.
7. Reconcile educational copy with actual code behavior, including weighted A* heuristic details, bidirectional expansion behavior, maze caveats, and the true state of the current animation engine.

**Checkpoint:** Learn has all Phase 7 elements, all algorithm facts come from one source, and Shiki visibly distinguishes pseudocode tokens while remaining server-rendered.

### Step 3 — Extract generic Three primitives before mounting Compare

1. Build `GridScene` from the current `Scene` composition. It owns Canvas configuration, fog, generic camera, lights, ground, instances, optional raycasting, and optional post-processing.
2. Extract the existing `GridMesh` rendering logic into `GridInstances(props)`. It receives `grid`, `rows`, `cols`, and `animationEngine`/buffers as props. Preserve spring settling and the finished-frame behavior.
3. Convert beacons, lights, ground plane, camera controller, and raycast handler to explicit props. The raycaster must call an injected board action instead of a store action.
4. Make the existing main `Scene` an adapter that selects `useVisualizerStore` and supplies identical props to `GridScene`. Validate the main visualizer after this step before continuing.
5. Add a `quality="visualizer" | "compare"` preset:

   - `visualizer`: retain existing visual quality.
   - `compare`: cap DPR to approximately `1–1.25`, lower or disable shadows, use lower-cost bloom/vignette, and avoid unnecessary redraws at rest.
   - `prefers-reduced-motion`: skip sequential playback and render the final result immediately while preserving statistics and insight.

6. Ensure initial layout uploads happen once; subsequent animation uploads should be restricted to active/dirty instances where practical. Do not introduce 1,250 individual component meshes per scene.

**Checkpoint:** one generic `GridScene` can render the existing visualizer state, and two read-only instances can coexist without sharing a store or a camera.

### Step 4 — Rebuild `useCompareStore` around a real run lifecycle

Replace the current synchronous-complete `runComparison()` and component-owned timers with one orchestrated lifecycle in the compare store.

#### Required actions

- `runComparison(): Promise<void>`
- `pauseComparison()` / `resumeComparison()`
- `stopComparison()`
- `clearResults()` — clears overlays/metrics but preserves the board.
- `resetBoard()` — restores an empty board while preserving the configured dimensions/endpoints policy.
- `generateSharedMaze(type)` — creates one layout transaction and applies it to the canonical board.
- Shared board actions: wall paint/toggle, weight placement, erase, move start, move end, and drag handling.
- `setSpeed()` — calls `updateSpeed()` on both active engines.

#### Required run algorithm

1. Refuse a new run while `status === 'running'` or `status === 'paused'`.
2. Cancel any old engines, increment `runId`, capture board/selection snapshots, reset both side states, and lock layout editing synchronously.
3. Create independent algorithm grids from the same board snapshot. Reset only algorithm bookkeeping on those clones.
4. Measure each algorithm’s pure computation with `performance.now()`. Store it as `executionTimeMs`, rounded for display but retained at useful precision internally.
5. Create two `AnimationEngine` instances with the same dimensions. Start both from one state transaction, then await both playback promises.
6. In each engine callback, update only that side’s live visited/path/cost values if both `runId` and engine identity still match the active run.
7. When one side completes, materialize its final overlay and mark only that side complete. Keep the overall state running until both sides finish.
8. When both complete, unlock controls, mark comparison complete, set final metrics, and expose the chart/narrative.
9. On Stop, route change/unmount, selection change, board edit, clear, reset, or maze generation: increment `runId`, cancel both engines, clear transient state atomically, and ensure late callbacks are ignored.

No `setTimeout` animation loop should remain in a compare UI component after this step.

**Checkpoint:** a run visibly stays running until both 3D animations finish; Pause/Resume/Stop apply to both sides; changing the board cannot allow stale results to appear.

### Step 5 — Build the dual-3D Compare page

Replace `CompareGrid.tsx` with compare-specific scene/card components. Retire the old DOM mini-grid only after the replacement is working.

Suggested files:

```text
components/compare/
  CompareControls.tsx            # selectors, board/edit actions, playback controls
  ComparisonSceneCard.tsx        # one labeled dynamic GridScene panel
  SharedBoardEditor.tsx          # collapsible keyboard-operable editor
  ComparisonMetrics.tsx          # side cards/live metric rows
  ComparisonChart.tsx            # single-unit grouped Recharts bar chart
  ComparisonInsight.tsx          # semantic rendering of pure helper output
  CompareStats.tsx               # retire or reduce to composition wrapper
```

Required layout and interaction behavior:

1. Keep the page header and a liquid-glass control bar.
2. Provide left/right algorithm selectors with persistent cyan/violet side identity. Allow the same selection on both sides; explain it truthfully rather than silently rejecting it.
3. Include a shared editing mode selector (wall, weight, erase, start, end), shared maze selector/action, speed slider, Run, Pause/Resume, Stop, Clear Results, and Reset Board.
4. Disable board-changing controls during a run; leave speed and Pause/Stop usable. Explain disabled state in visible text or accessible descriptions.
5. Render two equally sized `ComparisonSceneCard`s with dynamic client-only import (`ssr: false`), individual matching-default OrbitControls, a compact per-side status/live-counter header, and a fallback if WebGL cannot initialize.
6. Each scene delegates pointer edits to the same canonical board actions while idle. Add a collapsible DOM board editor or equivalent keyboard route for users who cannot use Canvas pointers; it operates on the same state and is not mounted as the default visualization.
7. Desktop uses two columns; narrow layouts stack the cards while preserving a meaningful canvas height and controls that do not overflow.
8. Do not identify the sides by color alone: retain algorithm names, labels, icons/status text, and chart legend names.

**Checkpoint:** a user can create one board, see the same walls/endpoints/weights in both 3D scenes, run two algorithms, and watch distinct, synchronized-start playbacks without the main visualizer state appearing in either card.

### Step 6 — Replace the stats, chart, and generated narrative as one feature

#### Metrics surface

Show two side cards with:

- Found / no path state.
- Visited nodes.
- Path steps and, where useful, path nodes.
- Total traversal cost.
- Algorithm compute time, labeled as a single-run indicative measurement.

During playback, counters update from each side’s engine; after completion, metrics settle to the algorithm result.

#### Recharts bar chart

Use a metric selector with these grouped-bar series:

- Visited nodes (default).
- Path steps.
- Total traversal cost (show prominently when weights exist; it may remain selectable otherwise).
- Compute time (ms).

Each selected chart has one unit and one scale. Include a tooltip with unit/definition, an accessible text/table equivalent of the same data, and a no-result placeholder before both sides complete. Recharts is already installed; add no chart library.

#### Pure insight rules

`buildComparisonInsight()` must return structured, deterministic text based only on selected metadata, board characteristics, and final metrics. It must cover these branches in order:

1. Same algorithm on both sides: explain that equal outcomes are expected and do not frame timing noise as a winner.
2. Neither side finds a path: state that the shared board disconnects start from end; do not invent a winner.
3. Only one side finds a path: state that result plainly and include capability/context rather than assuming the other is incorrect.
4. Both find paths with equal cost and both are optimal for the actual board: say they found equally optimal traversal cost. Only additionally mention equal path steps if true; never call two different routes “the same path.”
5. Both find paths with equal cost but at least one is not guaranteed optimal: say the observed costs match for this board, not that both are optimal.
6. Both find different costs: describe the observed cost difference first. On weighted boards, do not prefer shorter-by-steps paths over lower-cost paths.
7. Add a node-exploration sentence only when there is a material difference, e.g. “A* visited 74% fewer nodes than BFS.”
8. Mention compute time only when it is sufficiently measurable; otherwise call it too small/noisy to compare. Never make benchmark-grade claims from a single browser run.
9. Append a short capability note when an unweighted-only algorithm is compared on a weighted board.

**Checkpoint:** the Blueprint’s A*-versus-BFS-style narrative is possible when the data supports it, but cannot be falsely emitted for weighted, no-path, tied, or non-optimal situations.

### Step 7 — Accessibility, performance, and polish gates

1. Keep native Learn accordions and semantic table markup.
2. Use headings, `<label>` elements, visible focus styles, and an `aria-live="polite"` region for comparison run state/completion/no-path announcements.
3. Give each canvas a meaningful accessible label and provide the textual status/metric counterpart outside it.
4. Ensure chart information is available without visual bars through the metric cards or a hidden/visible data table.
5. Respect `prefers-reduced-motion` for card motion and sequential playback.
6. Lazy-load the two compare scenes, cap their DPR, apply the compare quality preset, and avoid full grid uploads when nothing is changing.
7. Dispose/cancel both engines on unmount and do not retain hidden WebGL canvases after a route change.
8. Preserve the existing liquid-glass palette: cyan start/left identity, red end, purple visited, gold path, lavender weight, and readable text contrast.

## File-level change map

| File | Planned action |
|---|---|
| `lib/algorithms/metadata.ts` | Add canonical typed algorithm/maze capabilities and comparison facts. |
| `lib/learn/algorithmData.ts` | Refactor long educational content to reference catalog IDs; add explicit pseudocode language and correct claims. |
| `lib/constants.ts` | Derive or adapt `ALGORITHM_INFO` from the catalog without breaking existing consumers. |
| `lib/compare/*` | Add clone, metric summary, overlay, board-capability, and pure insight helpers. |
| `components/learn/AlgorithmCard.tsx` | Consume typed content, use real Shiki language, improve deep links and accordion labels. |
| `components/learn/PseudocodeBlock.tsx` | Register/cache the server-only pseudocode highlighter. |
| `components/learn/StepByStep.tsx` | Add reusable accessible steps component. |
| `components/learn/ComparisonTable.tsx` | Add full Blueprint §17 table; replace the partial all-algorithm table. |
| `app/learn/page.tsx` | Compose the completed Learn sections while remaining server-rendered. |
| `components/three/*` | Extract generic prop-driven `GridScene` primitives; retain `Scene.tsx` as visualizer adapter. |
| `store/useCompareStore.ts` | Replace simple results with canonical-board/two-side/run-token lifecycle and actions. |
| `components/compare/CompareControls.tsx` | Rebuild controls around shared layout and playback lifecycle. |
| `components/compare/ComparisonSceneCard.tsx` | Add one dynamic, compare-quality 3D scene panel. |
| `components/compare/SharedBoardEditor.tsx` | Add the keyboard-operable canonical layout editor. |
| `components/compare/ComparisonMetrics.tsx` | Add live/final semantic side metrics. |
| `components/compare/ComparisonChart.tsx` | Add metric-switched, single-unit Recharts grouped bars. |
| `components/compare/ComparisonInsight.tsx` | Render pure generated narrative and capability note. |
| `components/compare/CompareGrid.tsx` | Remove only after the new dual-scene implementation replaces all consumers. |
| `app/compare/page.tsx` | Compose controls, two dynamic 3D cards, stats/chart, insight, and cleanup on unmount. |
| `app/visualizer/page.tsx` / visualizer adapter | Add validated one-time deep-link handling only if needed for Learn’s “Try it” journey. |

## Manual validation matrix

Run these after each major checkpoint and before handoff. Do not create new regression-test or CI artifacts for this work.

### Build health

```bash
npm run typecheck
npm run lint
npm run build
```

### Functional scenarios

| Scenario | Expected result |
|---|---|
| BFS vs A* on an open unweighted board | Same path cost/steps; A* usually visits no more nodes; wording only calls both optimal under the unweighted condition. |
| Dijkstra vs A* with weighted cells | Same optimal traversal cost when both succeed; the chart/narrative foreground cost, not only steps. |
| BFS vs DFS around obstacles | Both may find paths; DFS is never described as guaranteed shortest. |
| BFS vs Bidirectional on an unweighted board | Both find an unweighted optimum; bidirectional’s different exploration is represented honestly. |
| Greedy vs A* | The narrative acknowledges Greedy’s lack of optimality guarantee rather than declaring a winner solely from a single board. |
| Same algorithm on both sides | No misleading performance winner or “different algorithm” wording. |
| Fully blocked board | Both no-path states are clear; no chart/narrative crash or invented winner. |
| One-side/no-path edge case | Clear side-specific state and safe narrative branch. |
| Generate each maze type | One canonical maze appears identically in both 3D scenes; results invalidate correctly. |
| Edit wall/weight/start/end while idle | Both scenes update immediately; output/result state clears. |
| Edit or change selection during playback | Actions are blocked or cancel atomically; no stale overlay returns. |
| Pause, resume, speed change, stop | Both engines respond together; completed/idle state is accurate. |
| Reduced motion | Final visual states render without sequential animation and metrics/insight remain correct. |
| Learn cards | All ten cards render, expand by keyboard, show highlighted pseudocode, and deep-link to the selected algorithm/maze. |
| Narrow/mobile viewport | Scenes stack, controls remain usable, chart/table do not overflow, and no WebGL failure leaves a blank page. |

### Performance checks

- Verify each 25×50 compare scene uses one `InstancedMesh` for its grid; never reintroduce one mesh/button component per cell for the visual scene.
- Inspect a full dual run on a normal desktop and a constrained/mobile viewport. It should remain responsive during playback, and idle canvases should not perform unnecessary grid-wide uploads.
- Confirm two compare canvases use the reduced `compare` quality preset while the full visualizer retains its current quality.
- Confirm navigation away from `/compare` cancels engines and does not leave timers, animation callbacks, or WebGL work behind.

## Definition of done

Phase 7 is complete only when all of the following are true:

- Learn has complete, accurate, typed AlgorithmCards; actual Shiki-highlighted pseudocode; accessible step accordions; a complete complexity/comparison table; and correctly targeted “Try it” journeys.
- Compare shows two simultaneously mounted, independently camera-controlled 3D scenes rendered from one canonical layout, with independent algorithm result overlays.
- Both compare runs start from a common snapshot, support speed/pause/resume/stop, reject stale callbacks, and preserve the board when results are cleared.
- Each compare pane has live/final metrics; the Recharts bar chart uses one unit per view; a deterministic narrative makes only defensible claims.
- The original visualizer remains operational after the 3D primitive extraction.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass, and the manual validation matrix succeeds.
- No regression-test files, test-runner setup, CI workflow, unrelated refactor, or new dependency has been introduced.
