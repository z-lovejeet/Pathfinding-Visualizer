import { Position, MazeStep } from '../grid/types';

/**
 * Recursive Division Maze Generator
 *
 * Starts with an open grid and recursively subdivides chambers
 * by placing walls with single passages. Creates structured,
 * room-like mazes with long corridors.
 *
 * Time: O(R × C)  |  Space: O(R × C)
 */
export function recursiveDivision(
  rows: number,
  cols: number,
  startPos: Position,
  endPos: Position
): MazeStep[] {
  const steps: MazeStep[] = [];

  // Protected positions — never place walls here
  const isProtected = (r: number, c: number): boolean => {
    return (r === startPos.row && c === startPos.col) ||
           (r === endPos.row && c === endPos.col);
  };

  // Add border walls
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        if (!isProtected(r, c)) {
          steps.push({ row: r, col: c, type: 'wall' });
        }
      }
    }
  }

  function divide(
    rowStart: number,
    rowEnd: number,
    colStart: number,
    colEnd: number,
    orientation: 'horizontal' | 'vertical'
  ): void {
    // Chamber too small to divide
    if (rowEnd - rowStart < 2 || colEnd - colStart < 2) return;

    const isHorizontal = orientation === 'horizontal';

    if (isHorizontal) {
      // Pick a random even row for the wall (leaves odd rows as possible passages)
      const possibleRows: number[] = [];
      for (let r = rowStart + 2; r < rowEnd; r += 2) {
        possibleRows.push(r);
      }
      if (possibleRows.length === 0) return;
      const wallRow = possibleRows[Math.floor(Math.random() * possibleRows.length)];

      // Pick a random odd col for the passage
      const possiblePassages: number[] = [];
      for (let c = colStart + 1; c < colEnd; c += 2) {
        possiblePassages.push(c);
      }
      if (possiblePassages.length === 0) return;
      const passageCol = possiblePassages[Math.floor(Math.random() * possiblePassages.length)];

      // Draw horizontal wall with gap
      for (let c = colStart; c <= colEnd; c++) {
        if (c !== passageCol && !isProtected(wallRow, c)) {
          steps.push({ row: wallRow, col: c, type: 'wall' });
        }
      }

      // Recurse on sub-chambers
      divide(rowStart, wallRow - 1, colStart, colEnd, chooseOrientation(wallRow - 1 - rowStart, colEnd - colStart));
      divide(wallRow + 1, rowEnd, colStart, colEnd, chooseOrientation(rowEnd - wallRow - 1, colEnd - colStart));
    } else {
      // Pick a random even col for the wall
      const possibleCols: number[] = [];
      for (let c = colStart + 2; c < colEnd; c += 2) {
        possibleCols.push(c);
      }
      if (possibleCols.length === 0) return;
      const wallCol = possibleCols[Math.floor(Math.random() * possibleCols.length)];

      // Pick a random odd row for the passage
      const possiblePassages: number[] = [];
      for (let r = rowStart + 1; r < rowEnd; r += 2) {
        possiblePassages.push(r);
      }
      if (possiblePassages.length === 0) return;
      const passageRow = possiblePassages[Math.floor(Math.random() * possiblePassages.length)];

      // Draw vertical wall with gap
      for (let r = rowStart; r <= rowEnd; r++) {
        if (r !== passageRow && !isProtected(r, wallCol)) {
          steps.push({ row: r, col: wallCol, type: 'wall' });
        }
      }

      // Recurse on sub-chambers
      divide(rowStart, rowEnd, colStart, wallCol - 1, chooseOrientation(rowEnd - rowStart, wallCol - 1 - colStart));
      divide(rowStart, rowEnd, wallCol + 1, colEnd, chooseOrientation(rowEnd - rowStart, colEnd - wallCol - 1));
    }
  }

  function chooseOrientation(height: number, width: number): 'horizontal' | 'vertical' {
    if (width < height) return 'horizontal';
    if (height < width) return 'vertical';
    return Math.random() < 0.5 ? 'horizontal' : 'vertical';
  }

  // Start recursion on the inner area (excluding borders)
  const innerOrientation = chooseOrientation(rows - 2, cols - 2);
  divide(1, rows - 2, 1, cols - 2, innerOrientation);

  return steps;
}
