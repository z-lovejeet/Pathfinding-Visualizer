import { GridNode } from '../grid/types';

/**
 * Get valid 4-directional neighbors (up, right, down, left).
 * Filters out-of-bounds cells.
 */
export function getNeighbors(node: GridNode, grid: GridNode[][]): GridNode[] {
  const { row, col } = node;
  const rows = grid.length;
  const cols = grid[0].length;
  const neighbors: GridNode[] = [];

  // Up
  if (row > 0) neighbors.push(grid[row - 1][col]);
  // Right
  if (col < cols - 1) neighbors.push(grid[row][col + 1]);
  // Down
  if (row < rows - 1) neighbors.push(grid[row + 1][col]);
  // Left
  if (col > 0) neighbors.push(grid[row][col - 1]);

  return neighbors;
}

/**
 * Walk the previousNode chain from end → start, return reversed path.
 */
export function reconstructPath(endNode: GridNode): GridNode[] {
  const path: GridNode[] = [];
  let current: GridNode | null = endNode;

  while (current !== null) {
    path.unshift(current);
    current = current.previousNode;
  }

  return path;
}

/**
 * Manhattan distance heuristic: |r1-r2| + |c1-c2|
 * Admissible for 4-directional movement — guarantees A* optimality.
 */
export function manhattanDistance(a: GridNode, b: GridNode): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * Calculate the cost of a path using the same edge-cost model as the weighted
 * algorithms: moving into a node costs that node's weight. The start node is
 * already occupied, so it is not charged.
 */
export function getPathCost(path: readonly GridNode[]): number {
  return path.slice(1).reduce((cost, node) => cost + node.weight, 0);
}

/**
 * Reset algorithm-specific state on all nodes.
 * Preserves walls, weights, start, end, and type.
 */
export function resetAlgorithmState(grid: GridNode[][]): void {
  for (const row of grid) {
    for (const node of row) {
      node.isVisited = false;
      node.distance = Infinity;
      node.heuristic = 0;
      node.totalCost = Infinity;
      node.previousNode = null;
      node.visualState = 'unvisited';
      // Reset 3D animation values based on type
      if (node.type === 'start' || node.type === 'end') {
        node.height = 0.3;
        node.scaleY = 1;
        node.emissiveIntensity = 2.0;
      } else if (node.type === 'wall') {
        node.height = 0.8;
        node.scaleY = 1;
        node.emissiveIntensity = 0;
      } else if (node.type === 'weight') {
        node.height = 0.3;
        node.scaleY = 1;
        node.emissiveIntensity = 0.5;
      } else {
        node.height = 0.1;
        node.scaleY = 1;
        node.emissiveIntensity = 0;
      }
    }
  }
}

/**
 * Deep-clone the grid for algorithm execution.
 * Algorithms mutate node state (isVisited, distance, etc.), so we
 * work on a clone to keep the original grid clean for re-runs.
 */
export function cloneGrid(grid: GridNode[][]): GridNode[][] {
  return grid.map(row =>
    row.map(node => ({
      ...node,
      previousNode: null, // Don't clone circular references
    }))
  );
}
