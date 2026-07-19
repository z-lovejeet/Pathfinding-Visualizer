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
  const minimumTraversalCost = getMinimumTraversalCost(grid);
  const heuristicFor = (node: GridNode) =>
    manhattanDistance(node, endNode) * minimumTraversalCost;

  startNode.distance = 0;
  startNode.heuristic = heuristicFor(startNode);
  startNode.totalCost = startNode.heuristic;

  // Heap entries must keep their priority immutable. Nodes are updated when a
  // better route is found, and comparing mutable node fields can corrupt heap
  // ordering before the updated entry is popped.
  const openSet = new MinHeap<QueueEntry>((a, b) =>
    a.priority - b.priority || a.distance - b.distance
  );
  openSet.push({ node: startNode, distance: 0, priority: startNode.totalCost });

  while (openSet.size > 0) {
    const entry = openSet.pop()!;
    const current = entry.node;

    // Ignore stale entries left behind when a node's distance improved.
    if (entry.distance !== current.distance || current.isVisited) continue;
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
          neighbor.heuristic = heuristicFor(neighbor);
          neighbor.totalCost = neighbor.distance + neighbor.heuristic;
          neighbor.previousNode = current;
          openSet.push({
            node: neighbor,
            distance: tentativeG,
            priority: neighbor.totalCost,
          });
        }
      }
    }
  }

  return { visitedNodesInOrder, shortestPath: [], found: false };
}

interface QueueEntry {
  node: GridNode;
  distance: number;
  priority: number;
}

/**
 * Scale Manhattan distance by the cheapest traversable cell. This keeps the
 * heuristic admissible even when a restored grid contains weights below one.
 */
function getMinimumTraversalCost(grid: GridNode[][]): number {
  let minimum = Infinity;

  for (const row of grid) {
    for (const node of row) {
      if (node.type !== 'wall' && Number.isFinite(node.weight) && node.weight >= 0) {
        minimum = Math.min(minimum, node.weight);
      }
    }
  }

  return minimum === Infinity ? 0 : minimum;
}
