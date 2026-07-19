# DSA Visualizer

An interactive 3D pathfinding visualizer built with Next.js, React, Three.js, and Zustand. Build a grid, place walls or weighted cells, generate a maze, and watch the selected algorithm explore the board.

## What it includes

- Breadth-first search, depth-first search, Dijkstra, A*, greedy best-first search, and bidirectional BFS.
- Weighted pathfinding for Dijkstra and A*; displayed path cost is the sum of entered cells, excluding the start cell.
- Recursive Division, Recursive Backtracker, Randomized Prim's, Randomized Kruskal's, and Random Scatter maze generators.
- A comparison view for running two algorithms on the same grid.
- Keyboard-accessible controls, reduced-motion support, route-level loading/error/404 states, and security response headers.

Structured maze generators produce a connected route between the default start and end positions. Random Scatter intentionally remains a random wall layout and can be unsolvable.

## Requirements

- Node.js `24.11.1` (see [`.nvmrc`](./.nvmrc)); the supported range is Node `>=20.9.0 <25`.
- npm `11.6.2` or later within the supported npm 11 range.

## Run locally

```bash
nvm use
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The primary routes are:

- `/` — landing page
- `/visualizer` — interactive 3D grid
- `/compare` — side-by-side algorithm comparison
- `/learn` — algorithm and maze explanations

## Controls

Choose an edit mode to place walls, weighted cells, the start, or the end. Use **Run** to animate the selected algorithm, **Stop** to cancel the active run, and **Generate** to build the selected maze. The comparison view uses the same cell meanings and resets old results when either selected algorithm changes.

## Commands

```bash
npm run dev          # Start the development server
npm run build        # Create a production build
npm run start        # Serve a production build
npm run typecheck    # Run TypeScript without emitting files
npm run lint         # Run ESLint
npm run verify       # Type-check and lint
npm run audit:prod   # Audit production dependencies
```

Use `npm ci`, `npm run verify`, and `npm run audit:prod` before deployment.

## Database and sharing status

The visualizer does not require a database for normal use. The database client is intentionally strict: any server-side feature that initializes it must provide `DATABASE_URL`; it will not fall back to a local unauthenticated database.

For a future database-backed server feature, add this server-only value to `.env.local` (never prefix it with `NEXT_PUBLIC_`):

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

Public share links are not currently available. The UI action is hidden and the `/api/share` endpoint returns `501 Not Implemented` rather than accepting or logging arbitrary grid data. Before enabling sharing, add durable storage, schema migrations, bounded server-side input validation, and an explicit access/rate-limit policy.

## Security and deployment

`next.config.ts` sets a Content Security Policy plus framing, MIME-sniffing, referrer, permissions, and cross-origin isolation headers. The policy allows Next.js development tooling only in development; validate it again if you introduce third-party scripts, remote images, analytics, or embedded content.

Keep secrets in `.env.local` (ignored by Git) and restrict the file to its owner:

```bash
chmod 600 .env.local
```

Use immutable installs (`npm ci`) in deployment. The lockfile includes targeted dependency overrides for the current PostCSS and esbuild advisories; retain the clean audit check when updating dependencies.

## Project layout

```text
app/                 App Router pages, route handlers, and route fallbacks
components/          3D scene, controls, comparison UI, and shared interface pieces
lib/algorithms/      Pathfinding implementations and shared helpers
lib/maze/            Maze generators and connectivity repair
lib/animation/       Animation engine and render-state buffers
lib/grid/            Grid types, serialization, and mutation helpers
store/               Zustand visualizer and comparison state
```
