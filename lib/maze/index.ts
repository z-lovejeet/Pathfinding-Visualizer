import { Position, MazeStep, MazeType } from '../grid/types';
import { recursiveDivision } from './recursiveDivision';
import { recursiveBacktracker } from './recursiveBacktracker';
import { primsMaze } from './prims';
import { kruskalsMaze } from './kruskals';
import { randomMaze } from './random';

export type MazeFunction = (
  rows: number,
  cols: number,
  startPos: Position,
  endPos: Position
) => MazeStep[];

/**
 * Get the maze generator function for the given type.
 */
export function getMazeGenerator(type: MazeType): MazeFunction {
  const map: Record<MazeType, MazeFunction> = {
    'recursive-division': recursiveDivision,
    'recursive-backtracker': recursiveBacktracker,
    'prims': primsMaze,
    'kruskals': kruskalsMaze,
    'random': randomMaze,
  };
  return map[type];
}

export { recursiveDivision, recursiveBacktracker, primsMaze, kruskalsMaze, randomMaze };
