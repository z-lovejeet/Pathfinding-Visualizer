import { Position, MazeStep } from '../grid/types';
import { ensureReachableMaze } from './helpers';

/**
 * Randomized Prim's Maze Generator
 *
 * Grows the maze outward from a seed cell by randomly selecting
 * frontier walls and carving passages. Creates mazes with many
 * short dead ends and a branching structure.
 *
 * Time: O(R × C)  |  Space: O(R × C)
 */
export function primsMaze(
  rows: number,
  cols: number,
  startPos: Position,
  endPos: Position
): MazeStep[] {
  const steps: MazeStep[] = [];

  // Track which cells are passages
  const isPassage: boolean[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(false)
  );

  // Fill grid with walls
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      steps.push({ row: r, col: c, type: 'wall' });
    }
  }

  if (rows < 3 || cols < 3) {
    return ensureReachableMaze(steps, rows, cols, startPos, endPos);
  }

  // Frontier: walls adjacent to passages
  const frontier: [number, number][] = [];
  const frontierSet = new Set<number>();

  function addFrontier(r: number, c: number): void {
    const dirs: [number, number][] = [[-2, 0], [2, 0], [0, -2], [0, 2]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 1 && nr < rows - 1 && nc >= 1 && nc < cols - 1 && !isPassage[nr][nc]) {
        const frontierKey = nr * cols + nc;
        if (!frontierSet.has(frontierKey)) {
          frontierSet.add(frontierKey);
          frontier.push([nr, nc]);
        }
      }
    }
  }

  // Start from a random odd cell
  const seedR = 1 + 2 * Math.floor(Math.random() * Math.floor((rows - 1) / 2));
  const seedC = 1 + 2 * Math.floor(Math.random() * Math.floor((cols - 1) / 2));

  isPassage[seedR][seedC] = true;
  steps.push({ row: seedR, col: seedC, type: 'passage' });
  addFrontier(seedR, seedC);

  while (frontier.length > 0) {
    // Pick random frontier cell
    const randomIdx = Math.floor(Math.random() * frontier.length);
    const [fr, fc] = frontier[randomIdx];
    const last = frontier.pop()!;
    if (randomIdx < frontier.length) {
      frontier[randomIdx] = last;
    }
    frontierSet.delete(fr * cols + fc);

    if (isPassage[fr][fc]) continue;

    // Find which adjacent cells are passages
    const passageNeighbors: [number, number][] = [];
    const dirs: [number, number][] = [[-2, 0], [2, 0], [0, -2], [0, 2]];
    for (const [dr, dc] of dirs) {
      const nr = fr + dr;
      const nc = fc + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && isPassage[nr][nc]) {
        passageNeighbors.push([nr, nc]);
      }
    }

    if (passageNeighbors.length > 0) {
      // Connect to a random passage neighbor
      const [pr, pc] = passageNeighbors[Math.floor(Math.random() * passageNeighbors.length)];
      const wallR = fr + (pr - fr) / 2;
      const wallC = fc + (pc - fc) / 2;

      // Carve the frontier cell and the wall between
      isPassage[fr][fc] = true;
      isPassage[wallR][wallC] = true;

      steps.push({ row: wallR, col: wallC, type: 'passage' });
      steps.push({ row: fr, col: fc, type: 'passage' });

      addFrontier(fr, fc);
    }
  }

  return ensureReachableMaze(steps, rows, cols, startPos, endPos);
}
