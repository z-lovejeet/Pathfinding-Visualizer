import { GridNode, AlgorithmResult, AlgorithmType } from '../grid/types';
import { bfs } from './bfs';
import { dfs } from './dfs';
import { dijkstra } from './dijkstra';
import { aStar } from './astar';
import { greedy } from './greedy';
import { bidirectional } from './bidirectional';

export type AlgorithmFunction = (
  grid: GridNode[][],
  startNode: GridNode,
  endNode: GridNode
) => AlgorithmResult;

const algorithmMap: Record<AlgorithmType, AlgorithmFunction> = {
  bfs,
  dfs,
  dijkstra,
  astar: aStar,
  greedy,
  bidirectional,
};

/**
 * Get the algorithm function for a given type.
 */
export function getAlgorithm(type: AlgorithmType): AlgorithmFunction {
  return algorithmMap[type];
}

// Re-export all algorithms for direct imports
export { bfs } from './bfs';
export { dfs } from './dfs';
export { dijkstra } from './dijkstra';
export { aStar } from './astar';
export { greedy } from './greedy';
export { bidirectional } from './bidirectional';
export { getNeighbors, reconstructPath, manhattanDistance, resetAlgorithmState, cloneGrid } from './helpers';
