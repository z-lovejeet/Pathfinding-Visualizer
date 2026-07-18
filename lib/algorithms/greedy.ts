import { GridNode, AlgorithmResult } from '../grid/types';
import { getNeighbors, reconstructPath, manhattanDistance } from './helpers';
import { MinHeap } from '../data-structures/MinHeap';

/**
 * Greedy Best-First Search
 *
 * Only considers the heuristic — f(n) = h(n).
 * Ignores the actual cost g(n). This makes it EXTREMELY fast
 * but it does NOT guarantee the shortest path.
 *
 * Key Difference from A*:
 *   A*:     f(n) = g(n) + h(n)
 *   Greedy: f(n) = h(n)
 *
 * Time:  O((V + E) log V)
 * Space: O(V)
 *
 * 3D Visual: Laser beam — even more directional than A*.
 */
export function greedy(
  grid: GridNode[][],
  startNode: GridNode,
  endNode: GridNode
): AlgorithmResult {
  const visitedNodesInOrder: GridNode[] = [];

  startNode.heuristic = manhattanDistance(startNode, endNode);
  startNode.distance = 0;

  const openSet = new MinHeap<GridNode>((a, b) => a.heuristic - b.heuristic);
  openSet.push(startNode);

  while (openSet.size > 0) {
    const current = openSet.pop()!;

    if (current.isVisited) continue;
    if (current.type === 'wall') continue;

    current.isVisited = true;
    visitedNodesInOrder.push(current);

    if (current === endNode) {
      return {
        visitedNodesInOrder,
        shortestPath: reconstructPath(endNode),
        found: true,
      };
    }

    for (const neighbor of getNeighbors(current, grid)) {
      if (!neighbor.isVisited && neighbor.type !== 'wall') {
        neighbor.heuristic = manhattanDistance(neighbor, endNode);
        neighbor.previousNode = current;
        openSet.push(neighbor);
      }
    }
  }

  return { visitedNodesInOrder, shortestPath: [], found: false };
}
