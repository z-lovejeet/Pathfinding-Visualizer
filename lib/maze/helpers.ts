import { MinHeap } from '../data-structures/MinHeap';
import { MazeStep, Position } from '../grid/types';

const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

/**
 * Ensure a structured maze leaves a traversable route between its endpoints.
 * Generators keep their own carving strategy; this only opens the fewest walls
 * needed to repair a disconnected result.
 */
export function ensureReachableMaze(
  steps: MazeStep[],
  rows: number,
  cols: number,
  startPos: Position,
  endPos: Position
): MazeStep[] {
  if (!hasValidDimensions(rows, cols) || !isInBounds(startPos, rows, cols) || !isInBounds(endPos, rows, cols)) {
    return steps;
  }

  const passable = createPassabilityMap(steps, rows, cols, startPos, endPos);

  if (hasPassagePath(passable, startPos, endPos)) {
    return steps;
  }

  const repairSteps = carveMinimumWallPath(passable, rows, cols, startPos, endPos);
  return repairSteps.length > 0 ? [...steps, ...repairSteps] : steps;
}

function createPassabilityMap(
  steps: MazeStep[],
  rows: number,
  cols: number,
  startPos: Position,
  endPos: Position
): boolean[][] {
  // Maze animation starts from a clear board, so cells are initially open.
  const passable = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(true));

  for (const step of steps) {
    if (!isInBounds(step, rows, cols) || isEndpoint(step, startPos, endPos)) continue;
    passable[step.row][step.col] = step.type === 'passage';
  }

  // The animation deliberately preserves endpoint cells, even if a generator
  // emitted a wall step for one of them.
  passable[startPos.row][startPos.col] = true;
  passable[endPos.row][endPos.col] = true;

  return passable;
}

function carveMinimumWallPath(
  passable: boolean[][],
  rows: number,
  cols: number,
  startPos: Position,
  endPos: Position
): MazeStep[] {
  const distances = Array.from({ length: rows }, () => new Array<number>(cols).fill(Infinity));
  const previous = Array.from({ length: rows }, () => new Array<Position | null>(cols).fill(null));
  const queue = new MinHeap<QueueEntry>((a, b) => a.cost - b.cost);

  distances[startPos.row][startPos.col] = 0;
  queue.push({ ...startPos, cost: 0 });

  while (queue.size > 0) {
    const current = queue.pop()!;
    if (current.cost !== distances[current.row][current.col]) continue;
    if (current.row === endPos.row && current.col === endPos.col) break;

    for (const [rowOffset, colOffset] of DIRECTIONS) {
      const row = current.row + rowOffset;
      const col = current.col + colOffset;
      if (!isInBounds({ row, col }, rows, cols)) continue;

      const nextCost = current.cost + (passable[row][col] ? 0 : 1);
      if (nextCost < distances[row][col]) {
        distances[row][col] = nextCost;
        previous[row][col] = { row: current.row, col: current.col };
        queue.push({ row, col, cost: nextCost });
      }
    }
  }

  if (distances[endPos.row][endPos.col] === Infinity) return [];

  const repairSteps: MazeStep[] = [];
  let current: Position = endPos;

  while (current.row !== startPos.row || current.col !== startPos.col) {
    if (!passable[current.row][current.col] && !isEndpoint(current, startPos, endPos)) {
      passable[current.row][current.col] = true;
      repairSteps.push({ ...current, type: 'passage' });
    }

    const parent = previous[current.row][current.col];
    if (!parent) return [];
    current = parent;
  }

  return repairSteps.reverse();
}

function hasPassagePath(passable: boolean[][], startPos: Position, endPos: Position): boolean {
  const rows = passable.length;
  const cols = passable[0]?.length ?? 0;
  const visited = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  const queue: Position[] = [startPos];
  visited[startPos.row][startPos.col] = true;

  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    if (current.row === endPos.row && current.col === endPos.col) return true;

    for (const [rowOffset, colOffset] of DIRECTIONS) {
      const row = current.row + rowOffset;
      const col = current.col + colOffset;
      if (
        isInBounds({ row, col }, rows, cols) &&
        passable[row][col] &&
        !visited[row][col]
      ) {
        visited[row][col] = true;
        queue.push({ row, col });
      }
    }
  }

  return false;
}

function hasValidDimensions(rows: number, cols: number): boolean {
  return Number.isInteger(rows) && rows > 0 && Number.isInteger(cols) && cols > 0;
}

function isInBounds(position: Position, rows: number, cols: number): boolean {
  return (
    Number.isInteger(position.row) &&
    Number.isInteger(position.col) &&
    position.row >= 0 &&
    position.row < rows &&
    position.col >= 0 &&
    position.col < cols
  );
}

function isEndpoint(position: Position, startPos: Position, endPos: Position): boolean {
  return (
    (position.row === startPos.row && position.col === startPos.col) ||
    (position.row === endPos.row && position.col === endPos.col)
  );
}

interface QueueEntry extends Position {
  cost: number;
}
