// Node states
export type NodeType = 'empty' | 'wall' | 'start' | 'end' | 'weight';
export type VisualState = 'unvisited' | 'visited' | 'path' | 'current';

// Grid position
export interface Position {
  row: number;
  col: number;
}

// Grid node
export interface GridNode {
  row: number;
  col: number;
  type: NodeType;
  visualState: VisualState;
  weight: number;
  distance: number;
  heuristic: number;
  totalCost: number;
  isVisited: boolean;
  previousNode: GridNode | null;
  // 3D animation values
  height: number;
  scaleY: number;
  emissiveIntensity: number;
}

// Algorithm result
export interface AlgorithmResult {
  visitedNodesInOrder: GridNode[];
  shortestPath: GridNode[];
  found: boolean;
}

// Algorithm type enum
export type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'greedy' | 'bidirectional';

// Interaction modes
export type InteractionMode = 'wall' | 'weight' | 'erase' | 'start' | 'end' | 'none';

// Maze types
export type MazeType = 'recursive-division' | 'recursive-backtracker' | 'prims' | 'kruskals' | 'random';

// Maze generation step (for animated wall building)
export interface MazeStep {
  row: number;
  col: number;
  type: 'wall' | 'passage';
}

// Statistics
export interface Stats {
  nodesVisited: number;
  pathLength: number;
  pathCost: number;
  executionTime: number;
}
