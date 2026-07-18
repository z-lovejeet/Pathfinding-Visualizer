import { GridNode, AlgorithmResult } from '../grid/types';
import { getNeighbors, reconstructPath } from './helpers';

/**
 * Breadth-First Search (BFS)
 *
 * Explores the graph level by level using a Queue (FIFO).
 * Guarantees shortest path on UNWEIGHTED graphs.
 *
 * Time:  O(V + E) = O(R × C)
 * Space: O(V) = O(R × C)
 *
 * 3D Visual: Concentric wave ripple expanding from start.
 */
export function bfs(
  grid: GridNode[][],
  startNode: GridNode,
  endNode: GridNode
): AlgorithmResult {
  const visitedNodesInOrder: GridNode[] = [];
  const queue: GridNode[] = [startNode];
  startNode.isVisited = true;
  startNode.distance = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
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
        neighbor.isVisited = true;
        neighbor.distance = current.distance + 1;
        neighbor.previousNode = current;
        queue.push(neighbor);
      }
    }
  }

  return { visitedNodesInOrder, shortestPath: [], found: false };
}
