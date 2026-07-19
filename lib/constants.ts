import { AlgorithmType, MazeType, Position } from './grid/types';

// Grid defaults
export const DEFAULT_ROWS = 25;
export const DEFAULT_COLS = 50;
export const DEFAULT_START: Position = { row: 12, col: 10 };
export const DEFAULT_END: Position = { row: 12, col: 40 };

// Speed mapping (slider value 1-100 → ms delay per node step)
export const SPEED_MAP = {
  min: 1,     // Slowest: e.g., 200ms per node
  max: 100,   // Fastest: e.g., 5ms per node
  default: 50 // Default: ~50ms per node
};

// Calculate delay based on speed slider value (1-100)
export const getDelayFromSpeed = (speed: number) => {
  // Map 1-100 to 200ms-5ms using exponential/inverse curve for better feel
  return Math.max(5, Math.floor(200 * Math.pow(0.95, speed)));
};

// 3D Node colors (CSS + Three.js hex + emissive)
export const NODE_COLORS = {
  empty: { css: '#1a1a2e', hex: 0x1a1a2e, emissive: 0x000000, intensity: 0, height: 0.1 },
  wall: { css: '#1e1e2e', hex: 0x1e1e2e, emissive: 0x000000, intensity: 0, height: 0.8 },
  start: { css: '#00d4ff', hex: 0x00d4ff, emissive: 0x00d4ff, intensity: 2.0, height: 0.3 },
  end: { css: '#ff4757', hex: 0xff4757, emissive: 0xff4757, intensity: 2.0, height: 0.3 },
  weight: { css: '#a78bfa', hex: 0xa78bfa, emissive: 0xa78bfa, intensity: 0.5, height: 0.3 },
  visited: { css: '#8b5cf6', hex: 0x8b5cf6, emissive: 0x8b5cf6, intensity: 1.5, height: 0.4 },
  path: { css: '#fbbf24', hex: 0xfbbf24, emissive: 0xfbbf24, intensity: 3.0, height: 0.6 },
  current: { css: '#22d3ee', hex: 0x22d3ee, emissive: 0x22d3ee, intensity: 2.5, height: 0.5 },
};

// Algorithm metadata
export const ALGORITHM_INFO: Record<AlgorithmType, {
  name: string;
  description: string;
  isWeighted: boolean;
  isShortest: boolean;
  dataStructure: string;
  timeComplexity: string;
}> = {
  bfs: {
    name: 'Breadth-First Search',
    description: 'Explores level by level. Unweighted, guarantees shortest path.',
    isWeighted: false,
    isShortest: true,
    dataStructure: 'Queue',
    timeComplexity: 'O(V+E)',
  },
  dfs: {
    name: 'Depth-First Search',
    description: 'Dives deep before backtracking. Unweighted, does NOT guarantee shortest path.',
    isWeighted: false,
    isShortest: false,
    dataStructure: 'Stack',
    timeComplexity: 'O(V+E)',
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description: 'Explores lowest cost first. Weighted, guarantees shortest path.',
    isWeighted: true,
    isShortest: true,
    dataStructure: 'Min-Heap',
    timeComplexity: 'O((V+E) log V)',
  },
  astar: {
    name: 'A* Search',
    description: 'Uses heuristics to guide search. Weighted, guarantees shortest path much faster.',
    isWeighted: true,
    isShortest: true,
    dataStructure: 'Min-Heap',
    timeComplexity: 'O((V+E) log V)',
  },
  greedy: {
    name: 'Greedy Best-First',
    description: 'Relies solely on a heuristic and ignores weights. Does NOT guarantee the shortest path but is very fast.',
    isWeighted: false,
    isShortest: false,
    dataStructure: 'Min-Heap',
    timeComplexity: 'O((V+E) log V)',
  },
  bidirectional: {
    name: 'Bidirectional BFS',
    description: 'Searches from both start and end simultaneously. Unweighted, guarantees shortest path.',
    isWeighted: false,
    isShortest: true,
    dataStructure: '2×Queue',
    timeComplexity: 'O(V+E)',
  },
};

export const MAZE_INFO: Record<MazeType, { name: string; description: string; difficulty: number }> = {
  'recursive-division': { name: 'Recursive Division', description: 'Divides space into chambers with passages', difficulty: 3 },
  'recursive-backtracker': { name: 'Recursive Backtracker', description: 'DFS-based corridor carving', difficulty: 2 },
  prims: { name: "Randomized Prim's", description: 'Grows outward from a seed cell', difficulty: 2 },
  kruskals: { name: "Randomized Kruskal's", description: 'Joins random disjoint sets', difficulty: 1 },
  random: { name: 'Random Scatter', description: 'Random 30% wall fill', difficulty: 1 },
};

// 3D Animation configuration
export const ANIMATION_CONFIG = {
  // Visited node animation
  visited: {
    currentFlashDurationMs: 80,   // Cyan flash before turning purple
    targetHeight: 0.4,
    targetEmissive: 1.5,
    springDamping: 12,            // Spring interpolation (higher = faster settle)
  },
  // Path node animation
  path: {
    targetHeight: 0.7,
    targetEmissive: 3.0,
    staggerMs: 50,                // Delay between path nodes
    springDamping: 8,             // Slower, bouncier spring
  },
  // Current node flash
  current: {
    targetHeight: 0.5,
    targetEmissive: 2.5,
    springDamping: 25,            // Very fast snap
  },
};
