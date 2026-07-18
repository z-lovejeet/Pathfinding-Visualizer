import { GridNode, AlgorithmResult } from '../grid/types';
import { getNeighbors, reconstructPath, manhattanDistance } from './helpers';
import { MinHeap } from '../data-structures/MinHeap';

/**
 * A* Search — The Gold Standard for Pathfinding
 *
 * Combines Dijkstra's guarantee with a heuristic function that guides
 * the search toward the target. Visits dramatically fewer nodes than
 * Dijkstra while still finding the optimal path.
 *
 * Formula: f(n) = g(n) + h(n)
 *   g(n) = actual cost from start to node n
 *   h(n) = heuristic estimate from node n to target (Manhattan distance)
 *   f(n) = total estimated cost through node n
 *
 * Manhattan distance is ADMISSIBLE (never overestimates) for 4-directional
 * movement, which guarantees A* finds the optimal path.
 *
 * Time:  O((V + E) log V) — but visits far fewer nodes
 * Space: O(V)
 *
 * 3D Visual: Directed beam shooting toward the target.
 */
export function aStar(
  grid: GridNode[][],
  startNode: GridNode,
  endNode: GridNode
): AlgorithmResult {
  const visitedNodesInOrder: GridNode[] = [];

  startNode.distance = 0;
  startNode.heuristic = manhattanDistance(startNode, endNode);
  startNode.totalCost = startNode.heuristic;

  const openSet = new MinHeap<GridNode>((a, b) => a.totalCost - b.totalCost);
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
        const tentativeG = current.distance + neighbor.weight;
        if (tentativeG < neighbor.distance) {
          neighbor.distance = tentativeG;
          neighbor.heuristic = manhattanDistance(neighbor, endNode);
          neighbor.totalCost = neighbor.distance + neighbor.heuristic;
          neighbor.previousNode = current;
          openSet.push(neighbor);
        }
      }
    }
  }

  return { visitedNodesInOrder, shortestPath: [], found: false };
}
