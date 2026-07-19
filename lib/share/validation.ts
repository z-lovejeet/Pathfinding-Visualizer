import { DEFAULT_COLS, DEFAULT_ROWS } from '@/lib/constants';
import type { AlgorithmType } from '@/lib/grid/types';

export const MAX_SHARE_TITLE_LENGTH = 80;
export const MAX_SHARE_BODY_BYTES = 100 * 1024;

const ALGORITHM_TYPES: readonly AlgorithmType[] = [
  'bfs',
  'dfs',
  'dijkstra',
  'astar',
  'greedy',
  'bidirectional',
];

interface SharedGridCell {
  row: number;
  col: number;
  type: 'wall' | 'weight';
  weight?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Returns true when a value is one of the algorithms supported by the visualizer. */
export function isAlgorithmType(value: unknown): value is AlgorithmType {
  return typeof value === 'string' && ALGORITHM_TYPES.includes(value as AlgorithmType);
}

/** Shared links use a fixed-size visualizer board, so each saved cell must fit it. */
export function isSharedGridData(value: unknown): value is SharedGridCell[] {
  if (!Array.isArray(value) || value.length > DEFAULT_ROWS * DEFAULT_COLS) {
    return false;
  }

  return value.every((value) => {
    if (!isRecord(value)) return false;

    const { row, col, type, weight } = value;
    const isInBounds =
      typeof row === 'number' &&
      typeof col === 'number' &&
      Number.isInteger(row) &&
      Number.isInteger(col) &&
      row >= 0 &&
      row < DEFAULT_ROWS &&
      col >= 0 &&
      col < DEFAULT_COLS;

    if (!isInBounds || (type !== 'wall' && type !== 'weight')) return false;

    return type === 'wall' || (
      typeof weight === 'number' &&
      Number.isFinite(weight) &&
      weight > 0
    );
  });
}

export function isValidShareTitle(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.trim().length <= MAX_SHARE_TITLE_LENGTH
  );
}
