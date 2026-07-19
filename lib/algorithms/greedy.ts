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

  const openSet = new MinHeap<QueueEntry>((a, b) => a.priority - b.priority);
  const discovered = new Set<GridNode>([startNode]);
  openSet.push({ node: startNode, priority: startNode.heuristic });

  while (openSet.size > 0) {
    const current = openSet.pop()!.node;

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
      if (!neighbor.isVisited && !discovered.has(neighbor) && neighbor.type !== 'wall') {
        discovered.add(neighbor);
        // Greedy Best-First deliberately ignores node weights; distance here
        // records hops only and is not used to prioritize the frontier.
        neighbor.distance = current.distance + 1;
        neighbor.heuristic = manhattanDistance(neighbor, endNode);
        neighbor.totalCost = neighbor.heuristic;
        neighbor.previousNode = current;
        openSet.push({ node: neighbor, priority: neighbor.heuristic });
      }
    }
  }

  return { visitedNodesInOrder, shortestPath: [], found: false };
}

interface QueueEntry {
  node: GridNode;
  priority: number;
}
