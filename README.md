# Pathfinding Visualizer

**Pathfinding Visualizer** is an interactive 3D pathfinding visualizer for exploring algorithms, maze generation, and the trade-offs behind every route. Build a board, place obstacles or weighted terrain, generate a maze, and watch the selected algorithm explore the world in real time.

It is built as a polished, browser-first experience: a React Three Fiber scene for the primary visualizer, a glassmorphism interface, live run statistics, an educational Learn area, and an optional share-link workflow backed by Neon PostgreSQL.

**Live demo:** [pathfinding-visualizer-flax-one.vercel.app](https://pathfinding-visualizer-flax-one.vercel.app/)

## Highlights

- **Interactive 3D visualizer** — a `25 × 50` board rendered with React Three Fiber, Three.js, instanced geometry, bloom, vignette, and orbit controls.
- **Six pathfinding algorithms** — BFS, DFS, Dijkstra, A*, Greedy Best-First Search, and Bidirectional BFS.
- **Five maze generators** — Recursive Division, Recursive Backtracker, Randomized Prim's, Randomized Kruskal's, and Random Scatter.
- **Meaningful terrain** — walls, weighted cells, movable endpoints, live visited/path animation, and no-path feedback.
- **Learn by doing** — algorithm cards, Shiki-rendered pseudocode, step-by-step explanations, and complexity comparisons.
- **Compare outcomes** — run two algorithms on the same comparison board and inspect animated traversals, metrics, a grouped Recharts bar chart, and generated insight text.
- **Optional share links** — persist a board layout and selected algorithm to PostgreSQL, then reopen it through a URL.
- **Production-minded defaults** — strict TypeScript, lint/type checks, a dependency audit script, security response headers, bounded share payload validation, and committed database migrations.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Product landing page and feature overview. |
| `/visualizer` | The main interactive 3D pathfinding experience. |
| `/learn` | Educational algorithm and maze reference material. |
| `/compare` | Two animated comparison boards, metrics, chart, and generated insight. |
| `POST /api/share` | Saves a validated shared board when PostgreSQL is configured. |
| `GET /api/share/:id` | Loads a validated shared board by UUID. |

## What you can visualize

### Board states

The visualizer uses a deliberate, high-contrast city/road palette so each state remains distinguishable during playback.

| State | Representation | Color |
| --- | --- | --- |
| Road | Traversable grid tile | `#CBD5E1` |
| Building / wall | Blocked terrain | `#334155` |
| Start | Person A beacon | `#14B8A6` |
| End | Person B beacon | `#F43F5E` |
| Current node | Active exploration pulse | `#2563EB` |
| Explored / visited | Settled explored tile | `#7C3AED` |
| Route / path | Final route | `#F59E0B` |
| Weighted terrain | Dark-green tree / park | Dark green |

Movement is four-directional only: up, right, down, and left. Diagonal traversal is intentionally not part of the model.

### Pathfinding algorithms

| Algorithm | Weights | Guarantee | Core structure | Time complexity |
| --- | :---: | --- | --- | --- |
| Breadth-First Search | No | Shortest path by steps on an unweighted board | Queue | `O(V + E)` |
| Depth-First Search | No | Does not guarantee a shortest path | Stack / recursion | `O(V + E)` |
| Dijkstra's Algorithm | Yes | Lowest traversal cost with non-negative weights | Min-heap | `O((V + E) log V)` |
| A* Search | Yes | Lowest traversal cost with non-negative weights | Min-heap + Manhattan heuristic | `O((V + E) log V)` |
| Greedy Best-First Search | No | Does not guarantee shortest path or lowest cost | Min-heap + heuristic | `O((V + E) log V)` |
| Bidirectional BFS | No | Shortest path by steps on an unweighted board | Two queues | `O(V + E)` |

Notes:

- Only **Dijkstra** and **A*** account for weighted-cell traversal costs.
- The Weight tool creates terrain with a cost of `5`.
- Displayed path cost sums entered-cell weights; the start cell is not charged.
- Displayed path length is the number of nodes in the returned route, including its endpoints.

### Maze generators

| Generator | Behavior | Path guarantee |
| --- | --- | --- |
| Recursive Division | Repeatedly divides space into chambers and opens passages. | Reachability is repaired between the current endpoints. |
| Recursive Backtracker | Carves deep, winding corridors using depth-first exploration. | Reachability is repaired between the current endpoints. |
| Randomized Prim's | Grows a maze outward from a seed cell. | Reachability is repaired between the current endpoints. |
| Randomized Kruskal's | Joins disjoint regions with a Union-Find structure. | Reachability is repaired between the current endpoints. |
| Random Scatter | Adds walls at random with a 30% default density. | Intentionally may be unsolvable. |

Maze generation is animated in the main 3D visualizer. On the Compare page, maze creation is applied instantly to the shared comparison board.

## Explore, learn, and compare

### Main visualizer

The `/visualizer` route is the core experience. It renders road tiles, buildings for walls, dark-green trees for weighted cells, and endpoint beacons in a browser-only 3D scene. You can orbit, pan, and zoom the camera; reset it with `R`; select an algorithm and speed; edit the board; animate a maze; and pause, resume, stop, clear, or reset a run.

### Learn

The `/learn` route contains six pathfinding cards and four maze cards (Recursive Division, Recursive Backtracker, Randomized Prim's, and Randomized Kruskal's). Each card provides expandable explanations, Shiki-rendered pseudocode, a copy action, and a step-by-step walkthrough. A comparison table summarizes the educational records.

### Compare

The current `/compare` implementation provides two animated **2D DOM grids** backed by one shared comparison layout. It is intentionally separate from the main visualizer board. Select an algorithm for each side, edit walls while idle, generate a maze, run the comparison, and review visited-node, path-length, and path-cost differences in the result cards and Recharts chart.

The detailed Phase 7 blueprint for evolving Compare into dual 3D scenes is available in [docs/phase-7-learn-compare-implementation-plan.md](./docs/phase-7-learn-compare-implementation-plan.md). This README describes the behavior that is implemented today rather than that planned future state.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router, React 19 |
| Language | TypeScript with strict compiler settings |
| Styling | Tailwind CSS 4 and a custom glassmorphism system |
| 3D rendering | Three.js, React Three Fiber, Drei, React Three Postprocessing |
| Animation | GSAP and Framer Motion |
| State | Zustand |
| Charts | Recharts |
| Code highlighting | Shiki |
| Database | Neon serverless PostgreSQL with Drizzle ORM |
| Icons | Lucide React |

## Quick start

### Prerequisites

- Node.js `24.11.1` is the preferred version (see [`.nvmrc`](./.nvmrc)).
- The supported Node.js range is `>=20.9.0 <25`.
- npm `>=11.6.2 <12`; the project pins `npm@11.6.2`.

```bash
nvm use
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app itself does not require a database for local visualization, learning, or comparison. Add the environment variable below only if you want to exercise Share Grid locally.

## Environment and Share Grid

Copy the safe template, then replace the placeholder with your Neon/PostgreSQL connection string:

```bash
cp .env.example .env.local
```

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

`DATABASE_URL` is server-only. Never use a `NEXT_PUBLIC_` prefix and never commit `.env.local`.

### What a share link stores

The Share Grid feature stores a title, the selected algorithm, walls, and weighted cells (including their weights). A link opened at `/visualizer?share=<id>` restores those layout values on the default board.

It does **not** persist custom start/end positions, grid dimensions, a completed result, camera position, or animation state.

The API accepts a bounded, validated payload and returns generic database errors. For a public deployment, still configure rate limiting before broadly exposing the write endpoint; see the Vercel deployment checklist below.

### Database migrations

The initial `shares` table migration is committed under [`drizzle/`](./drizzle). Run it against a new database before enabling Share Grid:

```bash
npm run db:migrate
```

If a database already contains a `shares` table, inspect it and establish a baseline before applying the initial migration. Do not blindly run a `CREATE TABLE` migration against an unknown existing schema.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Next.js development server. |
| `npm run build` | Creates an optimized production build. |
| `npm run start` | Serves the production build locally. |
| `npm run typecheck` | Runs TypeScript without emitting files. |
| `npm run lint` | Runs ESLint. |
| `npm run verify` | Runs type checking and linting together. |
| `npm run audit:prod` | Audits production dependencies at the moderate severity threshold. |
| `npm run db:generate` | Generates a Drizzle migration after an intentional schema change. |
| `npm run db:migrate` | Applies committed Drizzle migrations to the database selected by `DATABASE_URL`. |
| `npm run db:check` | Checks Drizzle migration consistency. |

Before a release, run:

```bash
npm run verify
npm run audit:prod
npm run build
```

This project intentionally does not include regression-test files or CI workflows. The commands above are the local release gate.

## Keyboard shortcuts

These shortcuts apply on `/visualizer`:

| Shortcut | Action |
| --- | --- |
| `Space` | Run, pause, or resume the selected algorithm. |
| `Esc` | Stop the current run. |
| `C` | Clear the visualized path. |
| `X` | Reset the board. |
| `M` | Generate the selected maze. |
| `W` | Toggle weight / wall editing mode. |
| `E` | Toggle erase / wall editing mode. |
| `R` | Reset the 3D camera. |
| `+` or `=` | Increase animation speed. |
| `-` | Decrease animation speed. |
| `1`–`6` | Select a pathfinding algorithm. |

## Project structure

```text
app/                 App Router pages, metadata, fallbacks, and API routes
components/
  three/             R3F scene, camera, meshes, lighting, and interaction
  controls/          Visualizer controls and share-link UI
  compare/           Comparison controls, 2D grids, chart, and result cards
  learn/             Educational cards, Shiki blocks, and comparison table
  landing/           Home-page sections
  layout/, ui/       Shared navigation, dialogs, and interface primitives
lib/
  algorithms/        BFS, DFS, Dijkstra, A*, Greedy, and Bidirectional BFS
  maze/              Maze generators and reachability helper
  animation/         Visualization and maze animation engines
  grid/              Types, grid creation, serialization, and restoration
  data-structures/   MinHeap and UnionFind
  db/                Drizzle schema and lazy Neon client
  share/             Server/client-safe shared-grid validation
store/               Zustand visualizer and comparison state
hooks/               Keyboard shortcuts
docs/                Product blueprint and Phase 7 implementation plan
drizzle/             Committed database migrations and migration metadata
public/              Local static assets
```

## Deploy to Vercel

This repository is a standard Next.js application; no `vercel.json` is required for the current architecture.

1. Push the repository to GitHub and import it into Vercel.
2. Keep the repository root as the Root Directory, use the detected Next.js framework preset, and set Node.js to `24.x` to match `.nvmrc`.
3. Add `DATABASE_URL` to **Production** if Share Grid should be enabled there. Add a separate Neon database/branch and environment variable for **Preview** if you want share links in preview deployments.
4. Deploy once with the normal Vercel build. The core visualizer works without `DATABASE_URL`; Share Grid returns a clear configuration response until a database is configured.
5. From a linked local checkout, apply the migration to a **new** production database exactly once:

   ```bash
   npx vercel env run -e production -- npm run db:migrate
   ```

   Do not put database migration commands in Vercel's Build Command: preview or concurrent deployments must not mutate your production schema.

6. After deployment, open the visualizer, create a share link, and open it in a fresh browser session to verify the end-to-end database path.
7. In the Vercel Firewall, add a WAF rate-limiting rule scoped to `POST /api/share`. Start in **Log** mode to observe traffic, then move to the appropriate enforcement action for the project. Vercel documents WAF rate limiting, request-source keys, and its 429/Log/Deny/Challenge options in its [rate-limiting guide](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).

Vercel environment variables are scoped to Development, Preview, and Production, and updates apply to new deployments. Review Vercel's [environment variable documentation](https://vercel.com/docs/environment-variables) and [environment management guide](https://vercel.com/docs/environment-variables/manage-across-environments) when configuring the project.

## Security and data notes

- `next.config.ts` sends a Content Security Policy, frame protection, MIME-sniffing protection, referrer policy, permissions policy, and cross-origin opener/resource policies. It also disables the `X-Powered-By` header.
- `.gitignore` excludes `.env*`, `.vercel`, build output, `node_modules`, `.DS_Store`, and other local artifacts while keeping the safe `.env.example` template tracked.
- Share Grid is anonymous by design. UUIDs are not an authorization model; do not store personal, private, or sensitive information in share titles or board layouts.
- Public write APIs need operational controls in addition to code validation. Rate limit the share endpoint and monitor database usage after deploying.

## Reference material

- [Master product blueprint](./docs/dsa_visualizer_blueprint.md)
- [Phase 7 Learn & Compare implementation plan](./docs/phase-7-learn-compare-implementation-plan.md)
- [Source repository](https://github.com/z-lovejeet/Pathfinding-Visualizer)
