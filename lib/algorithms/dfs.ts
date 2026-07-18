import { GridNode, AlgorithmResult } from '../grid/types';
import { getNeighbors, reconstructPath } from './helpers';

/**
 * Depth-First Search (DFS)
 *
 * Dives as deep as possible along one path before backtracking.
 * Uses a Stack (LIFO). Does NOT guarantee shortest path.
 *
 * Time:  O(V + E) = O(R × C)
 * Space: O(V) = O(R × C)
 *
 * 3D Visual: Snaking single-file chain through the grid.
 */
export function dfs(
  grid: GridNode[][],
  startNode: GridNode,
  endNode: GridNode
): AlgorithmResult {
  const visitedNodesInOrder: GridNode[] = [];
  const stack: GridNode[] = [startNode];

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (current.isVisited) continue;
    current.isVisited = true;
    visitedNodesInOrder.push(current);

    if (current === endNode) {
      return {
        visitedNodesInOrder,
        shortestPath: reconstructPath(endNode),
        found: true,
      };
    }

    // Push neighbors in reverse order so the first neighbor (up) is processed first
    const neighbors = getNeighbors(current, grid);
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i];
      if (!neighbor.isVisited && neighbor.type !== 'wall') {
        neighbor.previousNode = current;
        stack.push(neighbor);
      }
    }
  }

  return { visitedNodesInOrder, shortestPath: [], found: false };
}
