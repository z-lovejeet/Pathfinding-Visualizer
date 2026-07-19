import { Position, MazeStep } from '../grid/types';
import { UnionFind } from '../data-structures/UnionFind';
import { ensureReachableMaze } from './helpers';

/**
 * Randomized Kruskal's Maze Generator
 *
 * Uses Union-Find to randomly join disjoint cells. Starts with
 * all walls, shuffles all possible edges, and removes walls
 * between cells in different sets.
 *
 * Time: O(R × C × α(R×C)) ≈ O(R × C)  |  Space: O(R × C)
 */
export function kruskalsMaze(
  rows: number,
  cols: number,
  startPos: Position,
  endPos: Position
): MazeStep[] {
  const steps: MazeStep[] = [];

  // Fill grid with walls
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      steps.push({ row: r, col: c, type: 'wall' });
    }
  }

  // Cell index helper (only odd cells are "rooms")
  const cellId = (r: number, c: number): number => {
    const cellRow = (r - 1) / 2;
    const cellCol = (c - 1) / 2;
    const cellCols = Math.floor((cols - 1) / 2);
    return cellRow * cellCols + cellCol;
  };

  const cellRows = Math.floor((rows - 1) / 2);
  const cellCols = Math.floor((cols - 1) / 2);
  const totalCells = cellRows * cellCols;
  const uf = new UnionFind(totalCells);

  // Mark all odd cells as passages first
  for (let r = 1; r < rows - 1; r += 2) {
    for (let c = 1; c < cols - 1; c += 2) {
      steps.push({ row: r, col: c, type: 'passage' });
    }
  }

  // Build list of all walls between adjacent cells
  interface Edge {
    wallR: number;
    wallC: number;
    cell1R: number;
    cell1C: number;
    cell2R: number;
    cell2C: number;
  }

  const edges: Edge[] = [];

  // Horizontal walls (between cells in the same row)
  for (let r = 1; r < rows - 1; r += 2) {
    for (let c = 2; c < cols - 1; c += 2) {
      edges.push({
        wallR: r, wallC: c,
        cell1R: r, cell1C: c - 1,
        cell2R: r, cell2C: c + 1,
      });
    }
  }

  // Vertical walls (between cells in the same column)
  for (let r = 2; r < rows - 1; r += 2) {
    for (let c = 1; c < cols - 1; c += 2) {
      edges.push({
        wallR: r, wallC: c,
        cell1R: r - 1, cell1C: c,
        cell2R: r + 1, cell2C: c,
      });
    }
  }

  // Fisher-Yates shuffle
  for (let i = edges.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [edges[i], edges[j]] = [edges[j], edges[i]];
  }

  // Process edges
  for (const edge of edges) {
    const id1 = cellId(edge.cell1R, edge.cell1C);
    const id2 = cellId(edge.cell2R, edge.cell2C);

    if (!uf.connected(id1, id2)) {
      uf.union(id1, id2);
      // Remove the wall between the two cells
      steps.push({ row: edge.wallR, col: edge.wallC, type: 'passage' });
    }
  }

  return ensureReachableMaze(steps, rows, cols, startPos, endPos);
}
