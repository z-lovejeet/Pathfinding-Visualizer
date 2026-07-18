import { Position, MazeStep } from '../grid/types';

/**
 * Random Scatter Maze Generator
 *
 * Randomly places walls with configurable density. Simple but
 * effective for quick testing and demonstrating algorithm differences.
 *
 * Time: O(R × C)  |  Space: O(R × C)
 */
export function randomMaze(
  rows: number,
  cols: number,
  startPos: Position,
  endPos: Position,
  density: number = 0.3
): MazeStep[] {
  const steps: MazeStep[] = [];
  const clampedDensity = Math.max(0.1, Math.min(0.5, density));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Never place walls on start or end
      if (r === startPos.row && c === startPos.col) continue;
      if (r === endPos.row && c === endPos.col) continue;

      if (Math.random() < clampedDensity) {
        steps.push({ row: r, col: c, type: 'wall' });
      }
    }
  }

  return steps;
}
