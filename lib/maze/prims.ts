import { Position, MazeStep } from '../grid/types';

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

  // Frontier: walls adjacent to passages
  const frontier: [number, number][] = [];

  function addFrontier(r: number, c: number): void {
    const dirs: [number, number][] = [[-2, 0], [2, 0], [0, -2], [0, 2]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 1 && nr < rows - 1 && nc >= 1 && nc < cols - 1 && !isPassage[nr][nc]) {
        // Check if not already in frontier (simple approach: mark and check)
        if (!frontier.some(([fr, fc]) => fr === nr && fc === nc)) {
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
    frontier.splice(randomIdx, 1);

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

  // Ensure start and end are passages
  if (!isPassage[startPos.row][startPos.col]) {
    steps.push({ row: startPos.row, col: startPos.col, type: 'passage' });
  }
  if (!isPassage[endPos.row][endPos.col]) {
    steps.push({ row: endPos.row, col: endPos.col, type: 'passage' });
  }

  return steps;
}
