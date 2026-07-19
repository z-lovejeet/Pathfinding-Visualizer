import { GridNode, AlgorithmResult } from '../grid/types';
import { getNeighbors, reconstructPath } from './helpers';
import { MinHeap } from '../data-structures/MinHeap';

/**
 * Dijkstra's Algorithm
 *
 * Finds the shortest path in WEIGHTED graphs. Uses a MinHeap (priority queue)
 * to always process the node with the smallest known distance first.
 * Generalized version of BFS for weighted edges.
 *
 * Time:  O((V + E) log V)
 * Space: O(V)
 *
 * 3D Visual: Wave that avoids heavy weighted nodes.
 */
export function dijkstra(
  grid: GridNode[][],
  startNode: GridNode,
  endNode: GridNode
): AlgorithmResult {
  const visitedNodesInOrder: GridNode[] = [];
  startNode.distance = 0;

  // Store immutable distances so a later relaxation cannot change the
  // priority of an entry that is already inside the heap.
  const pq = new MinHeap<QueueEntry>((a, b) => a.distance - b.distance);
  pq.push({ node: startNode, distance: 0 });

  while (pq.size > 0) {
    const entry = pq.pop()!;
    const current = entry.node;

    if (entry.distance !== current.distance || current.isVisited) continue;
    if (current.type === 'wall') continue;
    if (current.distance === Infinity) break; // Unreachable

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
        const newDist = current.distance + neighbor.weight;
        if (newDist < neighbor.distance) {
          neighbor.distance = newDist;
          neighbor.previousNode = current;
          pq.push({ node: neighbor, distance: newDist });
        }
      }
    }
  }

  return { visitedNodesInOrder, shortestPath: [], found: false };
}

interface QueueEntry {
  node: GridNode;
  distance: number;
}
