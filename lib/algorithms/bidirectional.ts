import { GridNode, AlgorithmResult } from '../grid/types';
import { getNeighbors } from './helpers';

/**
 * Bidirectional BFS
 *
 * Run BFS from BOTH start and end simultaneously.
 * When the two frontiers collide, the path is found.
 * Explores roughly half the nodes of regular BFS:
 *   π r² vs. 2 × π(r/2)² = πr²/2
 *
 * Time:  O(V + E) — but ~50% fewer nodes explored
 * Space: O(V)
 *
 * 3D Visual: Two expanding waves — cyan from start, red from end — colliding.
 */
export function bidirectional(
  grid: GridNode[][],
  startNode: GridNode,
  endNode: GridNode
): AlgorithmResult {
  const visitedNodesInOrder: GridNode[] = [];

  // Forward BFS state
  const queueForward: GridNode[] = [startNode];
  const visitedForward = new Set<GridNode>([startNode]);
  const parentForward = new Map<GridNode, GridNode>();

  // Backward BFS state
  const queueBackward: GridNode[] = [endNode];
  const visitedBackward = new Set<GridNode>([endNode]);
  const parentBackward = new Map<GridNode, GridNode>();

  while (queueForward.length > 0 && queueBackward.length > 0) {
    // ── Forward step ──
    const meetingNodeForward = expandLevel(
      queueForward,
      visitedForward,
      visitedBackward,
      parentForward,
      grid,
      visitedNodesInOrder
    );

    if (meetingNodeForward) {
      return {
        visitedNodesInOrder,
        shortestPath: mergePaths(parentForward, parentBackward, meetingNodeForward),
        found: true,
      };
    }

    // ── Backward step ──
    const meetingNodeBackward = expandLevel(
      queueBackward,
      visitedBackward,
      visitedForward,
      parentBackward,
      grid,
      visitedNodesInOrder
    );

    if (meetingNodeBackward) {
      return {
        visitedNodesInOrder,
        shortestPath: mergePaths(parentForward, parentBackward, meetingNodeBackward),
        found: true,
      };
    }
  }

  return { visitedNodesInOrder, shortestPath: [], found: false };
}

/**
 * Expand one level of BFS from a queue.
 * Returns the meeting node if the two frontiers collide, or null.
 */
function expandLevel(
  queue: GridNode[],
  visitedOwn: Set<GridNode>,
  visitedOther: Set<GridNode>,
  parentMap: Map<GridNode, GridNode>,
  grid: GridNode[][],
  visitedNodesInOrder: GridNode[]
): GridNode | null {
  const levelSize = queue.length;

  for (let i = 0; i < levelSize; i++) {
    const current = queue.shift()!;
    visitedNodesInOrder.push(current);

    // Check if we've met the other search
    if (visitedOther.has(current)) {
      return current;
    }

    for (const neighbor of getNeighbors(current, grid)) {
      if (!visitedOwn.has(neighbor) && neighbor.type !== 'wall') {
        visitedOwn.add(neighbor);
        parentMap.set(neighbor, current);
        queue.push(neighbor);

        // Immediate collision check
        if (visitedOther.has(neighbor)) {
          visitedNodesInOrder.push(neighbor);
          return neighbor;
        }
      }
    }
  }

  return null;
}

/**
 * Merge forward and backward paths at the meeting point.
 */
function mergePaths(
  parentForward: Map<GridNode, GridNode>,
  parentBackward: Map<GridNode, GridNode>,
  meetingNode: GridNode
): GridNode[] {
  // Build forward path: start → meeting
  const forwardPath: GridNode[] = [];
  let current: GridNode | undefined = meetingNode;
  while (current !== undefined) {
    forwardPath.unshift(current);
    current = parentForward.get(current);
  }

  // Build backward path: meeting → end
  const backwardPath: GridNode[] = [];
  current = parentBackward.get(meetingNode);
  while (current !== undefined) {
    backwardPath.push(current);
    current = parentBackward.get(current);
  }

  return [...forwardPath, ...backwardPath];
}
