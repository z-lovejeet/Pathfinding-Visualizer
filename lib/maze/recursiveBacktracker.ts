import { Position, MazeStep } from '../grid/types';

/**
 * Recursive Backtracker (DFS Maze Generator)
 *
 * Starts with all walls, then carves passages using DFS.
 * Creates long, winding corridors with few dead ends.
 * Uses a stack to backtrack when hitting dead ends.
 *
 * Time: O(R × C)  |  Space: O(R × C)
 */
export function recursiveBacktracker(
  rows: number,
  cols: number,
  startPos: Position,
  endPos: Position
): MazeStep[] {
  const steps: MazeStep[] = [];

  // Track which cells are passages (carved out)
  const isPassage: boolean[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(false)
  );

  // Fill grid with walls first — record all as wall steps
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      steps.push({ row: r, col: c, type: 'wall' });
    }
  }

  // Helper: get unvisited neighbors 2 cells away
  function getUnvisitedNeighbors(r: number, c: number): [number, number][] {
    const neighbors: [number, number][] = [];
    const dirs: [number, number][] = [[-2, 0], [2, 0], [0, -2], [0, 2]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 1 && nr < rows - 1 && nc >= 1 && nc < cols - 1 && !isPassage[nr][nc]) {
        neighbors.push([nr, nc]);
      }
    }
    return neighbors;
  }

  // Start from a random odd cell
  const startR = 1 + 2 * Math.floor(Math.random() * Math.floor((rows - 1) / 2));
  const startC = 1 + 2 * Math.floor(Math.random() * Math.floor((cols - 1) / 2));

  isPassage[startR][startC] = true;
  steps.push({ row: startR, col: startC, type: 'passage' });

  const stack: [number, number][] = [[startR, startC]];

  while (stack.length > 0) {
    const [cr, cc] = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(cr, cc);

    if (neighbors.length > 0) {
      // Pick random unvisited neighbor
      const [nr, nc] = neighbors[Math.floor(Math.random() * neighbors.length)];

      // Carve wall between current and chosen
      const wallR = cr + (nr - cr) / 2;
      const wallC = cc + (nc - cc) / 2;

      isPassage[wallR][wallC] = true;
      isPassage[nr][nc] = true;

      steps.push({ row: wallR, col: wallC, type: 'passage' });
      steps.push({ row: nr, col: nc, type: 'passage' });

      stack.push([nr, nc]);
    } else {
      stack.pop(); // Backtrack
    }
  }

  // Ensure start and end positions are passages
  if (!isPassage[startPos.row][startPos.col]) {
    steps.push({ row: startPos.row, col: startPos.col, type: 'passage' });
  }
  if (!isPassage[endPos.row][endPos.col]) {
    steps.push({ row: endPos.row, col: endPos.col, type: 'passage' });
  }

  return steps;
}
