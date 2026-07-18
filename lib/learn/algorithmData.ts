/**
 * Algorithm Learn Data — Single source of truth for the Learn page.
 *
 * All content sourced from the Master Blueprint §6 and §8.
 */

export interface AlgorithmLearnData {
  id: string;
  name: string;
  category: 'pathfinding' | 'maze';
  tagline: string;
  explanation: string;
  pseudocode: string;
  timeComplexity: string;
  spaceComplexity: string;
  dataStructure: string;
  guaranteesShortestPath: boolean;
  handlesWeights: boolean;
  usesHeuristic: boolean;
  visualBehavior: string;
  keyInsight: string;
  steps: string[];
}

export const LEARN_DATA: AlgorithmLearnData[] = [
  // ══════════════════════════════════════
  //  PATHFINDING ALGORITHMS
  // ══════════════════════════════════════
  {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    category: 'pathfinding',
    tagline: 'Explores level by level like ripples in water. Guarantees the shortest path on unweighted graphs.',
    explanation: `BFS explores the graph level by level, like ripples expanding from a stone dropped in water. It uses a Queue (FIFO) — first in, first out. Because it processes all nodes at distance d before any node at distance d+1, the first time it reaches the target is guaranteed to be the shortest path on unweighted graphs.

This makes BFS the go-to algorithm when all edges have equal weight. It's simple, reliable, and produces the most visually satisfying "wave" animation.`,
    pseudocode: `BFS(start, end):
    queue ← empty Queue
    visited ← empty Set
    parent ← empty Map

    ENQUEUE(queue, start)
    ADD(visited, start)

    WHILE queue is NOT empty:
        current ← DEQUEUE(queue)           ← Takes from FRONT

        IF current = end:
            RETURN reconstruct_path(parent, end)

        FOR each neighbor of current:
            IF neighbor NOT in visited AND neighbor is NOT wall:
                ADD(visited, neighbor)
                parent[neighbor] ← current
                ENQUEUE(queue, neighbor)    ← Adds to BACK

    RETURN "No path found"`,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    dataStructure: 'Queue (FIFO)',
    guaranteesShortestPath: true,
    handlesWeights: false,
    usesHeuristic: false,
    visualBehavior: 'Expands outward as a concentric wave — nodes rise in circular rings from the start node.',
    keyInsight: 'BFS guarantees the shortest path on unweighted graphs because it processes ALL nodes at distance d before any at distance d+1.',
    steps: [
      'Initialize a queue with the start node and mark it as visited.',
      'Dequeue the front node — this is "current".',
      'If current is the target, reconstruct the path using parent pointers.',
      'Otherwise, examine all unvisited, non-wall neighbors.',
      'Mark each neighbor as visited, record its parent, and enqueue it.',
      'Repeat until the queue is empty (no path) or the target is found.',
    ],
  },
  {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    category: 'pathfinding',
    tagline: 'Dives as deep as possible before backtracking. Fast but does NOT guarantee the shortest path.',
    explanation: `DFS dives as deep as possible along one path before backtracking. It uses a Stack (LIFO) — last in, first out. It does NOT guarantee the shortest path because it commits fully to one direction before trying others.

Despite not finding optimal paths, DFS is fundamental to many algorithms (topological sort, cycle detection, maze generation) and produces dramatic "snaking" visualizations.`,
    pseudocode: `DFS(start, end):
    stack ← empty Stack
    visited ← empty Set
    parent ← empty Map

    PUSH(stack, start)

    WHILE stack is NOT empty:
        current ← POP(stack)               ← Takes from TOP

        IF current in visited:
            CONTINUE

        ADD(visited, current)

        IF current = end:
            RETURN reconstruct_path(parent, end)

        FOR each neighbor of current:
            IF neighbor NOT in visited AND neighbor is NOT wall:
                parent[neighbor] ← current
                PUSH(stack, neighbor)       ← Adds to TOP

    RETURN "No path found"`,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    dataStructure: 'Stack (LIFO)',
    guaranteesShortestPath: false,
    handlesWeights: false,
    usesHeuristic: false,
    visualBehavior: 'Snakes through the grid as a long winding path — nodes rise in a single-file chain.',
    keyInsight: 'DFS explores one branch completely before trying another. This makes it fast for checking reachability but unreliable for finding shortest paths.',
    steps: [
      'Initialize a stack with the start node.',
      'Pop the top node from the stack — this is "current".',
      'If current was already visited, skip it (continue).',
      'Mark current as visited. If it\'s the target, reconstruct the path.',
      'Push all unvisited, non-wall neighbors onto the stack.',
      'Repeat. The stack naturally backtracks when a dead end is reached.',
    ],
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'pathfinding',
    tagline: 'Finds the shortest path in weighted graphs. The generalization of BFS for edges with different costs.',
    explanation: `Dijkstra's algorithm finds the shortest path in weighted graphs. It uses a Priority Queue (Min-Heap) to always process the node with the smallest known distance first. It's the generalized version of BFS for weighted edges.

On an unweighted graph, Dijkstra degenerates into BFS because all edges have equal weight — the priority queue becomes a regular queue. This is why Dijkstra is strictly more powerful than BFS.`,
    pseudocode: `DIJKSTRA(start, end):
    dist ← Map with all nodes set to ∞
    parent ← empty Map
    visited ← empty Set
    pq ← empty MinHeap (ordered by dist)

    dist[start] ← 0
    INSERT(pq, start, 0)

    WHILE pq is NOT empty:
        current ← EXTRACT_MIN(pq)

        IF current in visited: CONTINUE
        ADD(visited, current)

        IF current = end:
            RETURN reconstruct_path(parent, end)

        FOR each neighbor of current:
            IF neighbor is NOT wall AND neighbor NOT in visited:
                newDist ← dist[current] + weight(neighbor)

                IF newDist < dist[neighbor]:
                    dist[neighbor] ← newDist
                    parent[neighbor] ← current
                    INSERT(pq, neighbor, newDist)

    RETURN "No path found"`,
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    dataStructure: 'Min-Heap (Priority Queue)',
    guaranteesShortestPath: true,
    handlesWeights: true,
    usesHeuristic: false,
    visualBehavior: 'Similar to BFS on unweighted grids. On weighted grids, the wave avoids heavy nodes — you see it flowing around weighted areas.',
    keyInsight: 'Dijkstra always processes the globally closest unvisited node. This greedy choice is provably optimal because edge weights are non-negative.',
    steps: [
      'Initialize all distances to ∞ except start (0). Insert start into min-heap.',
      'Extract the node with minimum distance from the heap — this is "current".',
      'If current was already visited, skip it.',
      'Mark current as visited. If it\'s the target, reconstruct the path.',
      'For each unvisited neighbor, calculate tentative distance = current.dist + edge weight.',
      'If tentative distance is less than the known distance, update it and insert into the heap.',
      'Repeat until the heap is empty or the target is found.',
    ],
  },
  {
    id: 'astar',
    name: 'A* Search',
    category: 'pathfinding',
    tagline: 'The gold standard for pathfinding. Combines Dijkstra with a heuristic to visit dramatically fewer nodes.',
    explanation: `A* is the gold standard for pathfinding. It combines Dijkstra's guarantee with a heuristic function that guides the search toward the target. It visits dramatically fewer nodes than Dijkstra while still finding the optimal path.

The formula is f(n) = g(n) + h(n), where g(n) is the actual cost from start to n, and h(n) is the heuristic estimate from n to the target. With Manhattan distance as the heuristic (admissible for 4-directional grids), A* is guaranteed to find the optimal path.`,
    pseudocode: `A_STAR(start, end):
    g ← Map with all nodes set to ∞
    f ← Map with all nodes set to ∞
    parent ← empty Map
    openSet ← empty MinHeap (ordered by f)
    closedSet ← empty Set

    g[start] ← 0
    f[start] ← heuristic(start, end)
    INSERT(openSet, start)

    WHILE openSet is NOT empty:
        current ← EXTRACT_MIN(openSet)    ← Lowest f

        IF current = end:
            RETURN reconstruct_path(parent, end)

        ADD(closedSet, current)

        FOR each neighbor of current:
            IF neighbor in closedSet OR is wall:
                CONTINUE

            tentative_g ← g[current] + weight(neighbor)

            IF tentative_g < g[neighbor]:
                parent[neighbor] ← current
                g[neighbor] ← tentative_g
                f[neighbor] ← g[neighbor] + heuristic(neighbor, end)

                IF neighbor NOT in openSet:
                    INSERT(openSet, neighbor)

    RETURN "No path found"`,
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    dataStructure: 'Min-Heap (Priority Queue)',
    guaranteesShortestPath: true,
    handlesWeights: true,
    usesHeuristic: true,
    visualBehavior: 'A directed beam shoots toward the target, expanding only in the direction of the goal. Far fewer nodes visited than BFS or Dijkstra.',
    keyInsight: 'A* is optimal because its heuristic (Manhattan distance) is admissible — it never overestimates. This means A* will never skip over the true shortest path.',
    steps: [
      'Initialize g(start) = 0, f(start) = heuristic(start, end). Insert start into open set.',
      'Extract the node with minimum f value — this is "current".',
      'If current is the target, reconstruct the path.',
      'Move current to closed set (visited).',
      'For each neighbor not in closed set, calculate tentative_g = g(current) + weight.',
      'If tentative_g < g(neighbor), update g, f, parent, and add to open set.',
      'The heuristic guides search toward the goal, pruning irrelevant branches.',
    ],
  },
  {
    id: 'greedy',
    name: 'Greedy Best-First Search',
    category: 'pathfinding',
    tagline: 'Only considers the heuristic — extremely fast but does NOT guarantee the shortest path.',
    explanation: `Greedy BFS only considers the heuristic — f(n) = h(n). It ignores the actual cost g(n). This makes it extremely fast but it does NOT guarantee the shortest path.

The key difference from A*: A* uses f(n) = g(n) + h(n) while Greedy uses f(n) = h(n). By ignoring g(n), Greedy can be fooled by obstacles into taking suboptimal paths. However, in open spaces, it reaches the target almost instantly.`,
    pseudocode: `GREEDY_BFS(start, end):
    openSet ← empty MinHeap (ordered by heuristic ONLY)
    visited ← empty Set
    parent ← empty Map

    INSERT(openSet, start, heuristic(start, end))

    WHILE openSet is NOT empty:
        current ← EXTRACT_MIN(openSet)

        IF current in visited: CONTINUE
        ADD(visited, current)

        IF current = end:
            RETURN reconstruct_path(parent, end)

        FOR each neighbor of current:
            IF neighbor NOT in visited AND NOT wall:
                parent[neighbor] ← current
                INSERT(openSet, neighbor, heuristic(neighbor, end))

    RETURN "No path found"`,
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    dataStructure: 'Min-Heap (Priority Queue)',
    guaranteesShortestPath: false,
    handlesWeights: false,
    usesHeuristic: true,
    visualBehavior: 'A laser beam — even more directional than A*, but the resulting path may not be shortest.',
    keyInsight: 'Greedy BFS shows the tradeoff between speed and optimality. It\'s the fastest heuristic search but can be "tricked" by walls into long detours.',
    steps: [
      'Initialize open set with start node, priority = heuristic(start, end).',
      'Extract the node with minimum heuristic value.',
      'If it was already visited, skip it.',
      'Mark as visited. If it\'s the target, reconstruct the path.',
      'For each unvisited neighbor, set parent and insert with heuristic priority.',
      'Note: g(n) is never computed — only h(n) matters.',
    ],
  },
  {
    id: 'bidirectional',
    name: 'Bidirectional BFS',
    category: 'pathfinding',
    tagline: 'Searches from both start AND end simultaneously. Two waves collide in the middle.',
    explanation: `Bidirectional BFS runs BFS from both start and end simultaneously. When the two frontiers collide, the path is found. This explores roughly half the nodes of regular BFS.

The math: one circle of radius r has area πr². Two circles of radius r/2 have total area 2 × π(r/2)² = πr²/2 — half the search area. This makes Bidirectional BFS the most efficient unweighted pathfinding algorithm in practice.`,
    pseudocode: `BIDIRECTIONAL_BFS(start, end):
    queueFwd ← [start]     visitedFwd ← {start}
    queueBwd ← [end]       visitedBwd ← {end}
    parentFwd ← {}          parentBwd ← {}

    WHILE queueFwd AND queueBwd are NOT empty:
        ── Forward step ──
        current ← DEQUEUE(queueFwd)
        IF current in visitedBwd:
            RETURN merge_paths(parentFwd, parentBwd, current)
        FOR each neighbor:
            IF not visitedFwd: mark, set parent, enqueue

        ── Backward step ──
        current ← DEQUEUE(queueBwd)
        IF current in visitedFwd:
            RETURN merge_paths(parentFwd, parentBwd, current)
        FOR each neighbor:
            IF not visitedBwd: mark, set parent, enqueue

    RETURN "No path found"`,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    dataStructure: '2 × Queue',
    guaranteesShortestPath: true,
    handlesWeights: false,
    usesHeuristic: false,
    visualBehavior: 'Two expanding waves — one cyan from start, one red from end — colliding in the middle. The most visually spectacular animation.',
    keyInsight: 'Two small search circles cover less area than one large circle. Bidirectional BFS roughly halves the number of nodes explored.',
    steps: [
      'Initialize two queues: one from start (forward), one from end (backward).',
      'Alternate: process one node from the forward queue, then one from the backward queue.',
      'For each node, check if it exists in the OTHER visited set — if so, paths have met.',
      'When frontiers collide at a meeting node, merge the forward and backward parent chains.',
      'The result is the shortest path from start → meeting → end.',
      'Continue alternating until both queues are empty (no path) or collision is found.',
    ],
  },

  // ══════════════════════════════════════
  //  MAZE GENERATION ALGORITHMS
  // ══════════════════════════════════════
  {
    id: 'recursive-division',
    name: 'Recursive Division',
    category: 'maze',
    tagline: 'Divides space into chambers by placing walls with single passages. Creates structured, room-like mazes.',
    explanation: `Recursive Division starts with an open grid and recursively subdivides it by placing walls. Each wall has a single gap (passage) randomly placed. The algorithm chooses horizontal or vertical orientation based on the chamber's aspect ratio.

This produces mazes with a distinctive "grid of rooms" appearance with long corridors and visible structure. It's one of the fastest maze generation algorithms.`,
    pseudocode: `RECURSIVE_DIVISION(chamber):
    IF chamber is too small: RETURN

    orientation ← choose HORIZONTAL or VERTICAL

    IF orientation = HORIZONTAL:
        wallRow ← random even row in chamber
        passageCol ← random odd col in chamber
        Draw horizontal wall with gap at passageCol
    ELSE:
        wallCol ← random even col in chamber
        passageRow ← random odd row in chamber
        Draw vertical wall with gap at passageRow

    RECURSE on the two resulting sub-chambers`,
    timeComplexity: 'O(R × C)',
    spaceComplexity: 'O(R × C)',
    dataStructure: 'Recursion (Call Stack)',
    guaranteesShortestPath: false,
    handlesWeights: false,
    usesHeuristic: false,
    visualBehavior: 'Walls appear as horizontal and vertical lines that progressively subdivide the grid into smaller chambers.',
    keyInsight: 'Orientation choice based on aspect ratio prevents long, narrow corridors and creates balanced mazes.',
    steps: [
      'Start with a completely open grid (no walls except borders).',
      'Choose orientation: horizontal if chamber is wider, vertical if taller.',
      'Place a wall across the chamber at a random even position.',
      'Punch a passage (gap) in the wall at a random odd position.',
      'Recursively divide the two resulting sub-chambers.',
      'Base case: stop when a chamber is too small to subdivide (< 2 cells).',
    ],
  },
  {
    id: 'recursive-backtracker',
    name: 'Recursive Backtracker',
    category: 'maze',
    tagline: 'DFS-based corridor carving. Creates long, winding passages with few dead ends.',
    explanation: `The Recursive Backtracker starts with a grid full of walls and carves passages using DFS. It picks a random unvisited neighbor two cells away, carves a passage to it, and continues. When it hits a dead end, it backtracks.

This produces mazes with long, winding corridors and relatively few dead ends — the "perfect maze" used in most video games. Every cell is reachable and there's exactly one path between any two points.`,
    pseudocode: `RECURSIVE_BACKTRACKER(grid):
    stack ← [random starting cell]
    Mark starting cell as part of maze

    WHILE stack is NOT empty:
        current ← PEEK(stack)
        unvisited ← unvisited neighbors 2 steps away

        IF unvisited is NOT empty:
            chosen ← random from unvisited
            Remove wall BETWEEN current and chosen
            Mark chosen as visited
            PUSH(stack, chosen)
        ELSE:
            POP(stack)    ← Backtrack`,
    timeComplexity: 'O(R × C)',
    spaceComplexity: 'O(R × C)',
    dataStructure: 'Stack (LIFO)',
    guaranteesShortestPath: false,
    handlesWeights: false,
    usesHeuristic: false,
    visualBehavior: 'A single path snakes through the grid, carving corridors and backtracking from dead ends.',
    keyInsight: 'Moving 2 cells at a time ensures walls remain between passages, creating the classic "perfect maze" pattern.',
    steps: [
      'Fill the entire grid with walls.',
      'Pick a random starting cell and mark it as a passage.',
      'Look for unvisited neighbors exactly 2 cells away (up/down/left/right).',
      'If found: pick one randomly, carve the wall between, mark as passage, push to stack.',
      'If no unvisited neighbors: pop the stack (backtrack to previous cell).',
      'Continue until the stack is empty — all reachable cells have been visited.',
    ],
  },
  {
    id: 'prims',
    name: "Randomized Prim's",
    category: 'maze',
    tagline: 'Grows the maze outward from a seed. Creates mazes with many short dead ends.',
    explanation: `Randomized Prim's maze algorithm starts with a grid of walls, picks a random cell as a seed, and grows the maze outward by randomly selecting frontier walls and carving passages to unvisited cells.

Unlike the Recursive Backtracker which creates long corridors, Prim's creates mazes with many short dead ends and a branching, tree-like structure. The randomness of frontier selection makes each maze unique.`,
    pseudocode: `PRIMS_MAZE(grid):
    Start with grid full of walls
    Pick random cell, mark as passage
    Add its wall-neighbors to wallList

    WHILE wallList is NOT empty:
        wall ← random from wallList
        cells ← cells on either side of wall

        IF exactly ONE cell is a passage:
            Make wall a passage
            Add new wall-neighbors to wallList

        REMOVE wall from wallList`,
    timeComplexity: 'O(R × C)',
    spaceComplexity: 'O(R × C)',
    dataStructure: 'List (Frontier Set)',
    guaranteesShortestPath: false,
    handlesWeights: false,
    usesHeuristic: false,
    visualBehavior: 'Passages radiate outward from a seed point, branching in all directions like a growing tree.',
    keyInsight: 'Random frontier selection creates organic-looking mazes. The more walls in the frontier, the more branching occurs.',
    steps: [
      'Fill the grid with walls. Pick a random cell and mark as passage.',
      'Add all wall-cells 2 steps away from the passage to the frontier list.',
      'Pick a random wall from the frontier.',
      'Check cells on both sides: if exactly one is a passage, carve through.',
      'Add the new cell\'s wall-neighbors to the frontier.',
      'Remove the processed wall. Repeat until frontier is empty.',
    ],
  },
  {
    id: 'kruskals',
    name: "Randomized Kruskal's",
    category: 'maze',
    tagline: 'Joins random disjoint sets using Union-Find. Creates uniform, unbiased mazes.',
    explanation: `Randomized Kruskal's maze uses the Union-Find data structure. It starts with every cell as its own set, shuffles all possible walls, and processes them randomly. If a wall separates two cells in different sets, it removes the wall and unions the sets.

This produces very uniform, unbiased mazes where every wall removal is equally likely. The resulting mazes have no directional bias and look more "random" than those from DFS-based generators.`,
    pseudocode: `KRUSKALS_MAZE(grid):
    Create a set for each cell (Union-Find)
    edges ← all walls between adjacent cells
    SHUFFLE(edges)

    FOR each edge in edges:
        cell1, cell2 ← cells on either side

        IF FIND(cell1) ≠ FIND(cell2):
            Remove the wall (make it passage)
            UNION(cell1, cell2)`,
    timeComplexity: 'O(R × C × α(R×C))',
    spaceComplexity: 'O(R × C)',
    dataStructure: 'Union-Find (Disjoint Set)',
    guaranteesShortestPath: false,
    handlesWeights: false,
    usesHeuristic: false,
    visualBehavior: 'Walls disappear at random positions across the grid simultaneously, gradually connecting all regions.',
    keyInsight: 'Union-Find ensures no cycles: walls are only removed between disconnected regions. The result is a spanning tree of the grid graph.',
    steps: [
      'Fill the grid with walls. Create a Union-Find set for each cell.',
      'Build a list of all walls between adjacent cells.',
      'Shuffle the wall list randomly (Fisher-Yates).',
      'For each wall: check if cells on either side are in different sets.',
      'If different: remove the wall and UNION the two sets.',
      'If same: skip (removing would create a cycle). Continue until done.',
    ],
  },
];
