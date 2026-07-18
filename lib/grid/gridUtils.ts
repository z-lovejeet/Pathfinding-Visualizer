import { GridNode, NodeType, Position, VisualState } from './types';

/**
 * Create a fresh empty grid with start and end nodes placed.
 */
export function createEmptyGrid(
  rows: number,
  cols: number,
  startPos: Position,
  endPos: Position
): GridNode[][] {
  const grid: GridNode[][] = [];

  for (let r = 0; r < rows; r++) {
    const currentRow: GridNode[] = [];
    for (let c = 0; c < cols; c++) {
      let type: NodeType = 'empty';
      if (r === startPos.row && c === startPos.col) type = 'start';
      if (r === endPos.row && c === endPos.col) type = 'end';

      currentRow.push({
        row: r,
        col: c,
        type,
        visualState: 'unvisited' as VisualState,
        weight: 1,
        distance: Infinity,
        heuristic: 0,
        totalCost: Infinity,
        isVisited: false,
        previousNode: null,
        height: type === 'start' || type === 'end' ? 0.3 : 0.1,
        scaleY: 1,
        emissiveIntensity: type === 'start' || type === 'end' ? 2.0 : 0,
      });
    }
    grid.push(currentRow);
  }

  return grid;
}

/**
 * Serialize grid for database storage.
 * Only stores walls and weights (empty/start/end are reconstructed from positions).
 */
export function serializeGrid(
  grid: GridNode[][]
): { row: number; col: number; type: 'wall' | 'weight'; weight?: number }[] {
  const data: { row: number; col: number; type: 'wall' | 'weight'; weight?: number }[] = [];

  for (const row of grid) {
    for (const node of row) {
      if (node.type === 'wall') {
        data.push({ row: node.row, col: node.col, type: 'wall' });
      } else if (node.type === 'weight') {
        data.push({ row: node.row, col: node.col, type: 'weight', weight: node.weight });
      }
    }
  }

  return data;
}

/**
 * Deserialize grid from database.
 * Restores walls and weights onto a fresh grid.
 */
export function deserializeGrid(
  data: { row: number; col: number; type: 'wall' | 'weight'; weight?: number }[],
  rows: number,
  cols: number,
  startPos: Position,
  endPos: Position
): GridNode[][] {
  const grid = createEmptyGrid(rows, cols, startPos, endPos);

  for (const cell of data) {
    if (cell.row < rows && cell.col < cols) {
      const node = grid[cell.row][cell.col];
      if (node.type !== 'start' && node.type !== 'end') {
        node.type = cell.type;
        if (cell.type === 'wall') {
          node.height = 0.8;
        } else if (cell.type === 'weight') {
          node.weight = cell.weight ?? 5;
          node.height = 0.3;
          node.emissiveIntensity = 0.5;
        }
      }
    }
  }

  return grid;
}
