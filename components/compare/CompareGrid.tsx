'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlgorithmResult, GridNode } from '@/lib/grid/types';
import { NODE_COLORS } from '@/lib/constants';

interface CompareGridProps {
  grid: GridNode[][];
  rows: number;
  cols: number;
  result: AlgorithmResult | null;
  speed: number;
  label: string;
  accentColor: string;
  isRunning: boolean;
  onToggleWall: (row: number, col: number) => void;
}

type CellState = 'empty' | 'wall' | 'start' | 'end' | 'weight' | 'visited' | 'path';
type AnimatedCellState = Extract<CellState, 'visited' | 'path'>;

interface AnimationState {
  sourceGrid: GridNode[][];
  sourceResult: AlgorithmResult | null;
  cells: Record<string, AnimatedCellState>;
}

const CELL_COLORS: Record<CellState, string> = {
  empty: NODE_COLORS.empty.css,
  wall: '#2a2a3e',
  start: NODE_COLORS.start.css,
  end: NODE_COLORS.end.css,
  weight: NODE_COLORS.weight.css,
  visited: NODE_COLORS.visited.css,
  path: NODE_COLORS.path.css,
};

const CELL_LABELS: Record<CellState, string> = {
  empty: 'empty',
  wall: 'wall',
  start: 'start position',
  end: 'end position',
  weight: 'weighted cell',
  visited: 'visited cell',
  path: 'path cell',
};

const getCellKey = (row: number, col: number) => `${row}:${col}`;

/**
 * CompareGrid — 2D DOM-based mini-grid for the compare page.
 * Animates visited and path nodes while keeping the underlying grid as the
 * source of truth, so an old animation cannot survive a new comparison.
 */
export default function CompareGrid({
  grid,
  rows,
  cols,
  result,
  speed,
  label,
  accentColor,
  isRunning,
  onToggleWall,
}: CompareGridProps) {
  const [animationState, setAnimationState] = useState<AnimationState>(() => ({
    sourceGrid: grid,
    sourceResult: null,
    cells: {},
  }));
  const animationTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!result) return;

    let cancelled = false;
    const delay = Math.max(3, Math.floor(200 * Math.pow(0.95, speed) * 0.5));
    let visitedIndex = 0;

    const clearTimer = () => {
      if (animationTimer.current !== null) {
        window.clearTimeout(animationTimer.current);
        animationTimer.current = null;
      }
    };

    const schedule = (callback: () => void, timeout: number) => {
      animationTimer.current = window.setTimeout(() => {
        if (!cancelled) callback();
      }, timeout);
    };

    const updateCell = (node: GridNode, state: AnimatedCellState) => {
      const cellKey = getCellKey(node.row, node.col);
      setAnimationState((current) => {
        if (current.sourceGrid !== grid || current.sourceResult !== result) {
          return current;
        }

        return {
          ...current,
          cells: { ...current.cells, [cellKey]: state },
        };
      });
    };

    const animatePath = (pathIndex = 0) => {
      if (pathIndex >= result.shortestPath.length) return;

      const node = result.shortestPath[pathIndex];
      if (node.type !== 'start' && node.type !== 'end') {
        updateCell(node, 'path');
      }

      schedule(() => animatePath(pathIndex + 1), Math.max(20, delay * 2));
    };

    const animateVisited = () => {
      if (visitedIndex >= result.visitedNodesInOrder.length) {
        animatePath();
        return;
      }

      const node = result.visitedNodesInOrder[visitedIndex];
      if (node.type !== 'start' && node.type !== 'end') {
        updateCell(node, 'visited');
      }

      visitedIndex += 1;
      schedule(animateVisited, delay);
    };

    schedule(() => {
      setAnimationState({ sourceGrid: grid, sourceResult: result, cells: {} });
      animateVisited();
    }, 100);

    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [grid, result, speed]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (isRunning) return;
      onToggleWall(row, col);
    },
    [isRunning, onToggleWall]
  );

  const isCurrentAnimation =
    result !== null &&
    animationState.sourceGrid === grid &&
    animationState.sourceResult === result;

  return (
    <div className="glass-elevated rounded-2xl p-4 flex flex-col gap-3">
      {/* Label */}
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: accentColor }}
          aria-hidden="true"
        />
        <span className="text-sm font-bold text-white font-outfit">{label}</span>
      </div>

      {/* Grid */}
      <div
        className="grid gap-[1px] mx-auto"
        role="group"
        aria-label={`${label} editable grid`}
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          maxWidth: '100%',
          aspectRatio: `${cols} / ${rows}`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((node, colIndex) => {
            const baseState = node.type as CellState;
            const visualState = isCurrentAnimation
              ? animationState.cells[getCellKey(rowIndex, colIndex)] ?? baseState
              : baseState;
            const isEditable = !isRunning && baseState !== 'start' && baseState !== 'end';
            const action = isEditable
              ? baseState === 'wall'
                ? 'Activate to remove the wall.'
                : 'Activate to add a wall.'
              : baseState === 'start' || baseState === 'end'
                ? 'This endpoint cannot be edited here.'
                : 'Grid editing is unavailable while a comparison is running.';

            return (
              <button
                key={getCellKey(rowIndex, colIndex)}
                type="button"
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={!isEditable}
                aria-pressed={baseState === 'wall'}
                aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}: ${CELL_LABELS[visualState]}. ${action}`}
                className="appearance-none min-w-0 min-h-0 border-0 p-0 rounded-[1px] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#f0f0f5] disabled:cursor-not-allowed disabled:opacity-100"
                style={{
                  backgroundColor: CELL_COLORS[visualState],
                  boxShadow:
                    visualState === 'path'
                      ? `0 0 6px ${CELL_COLORS.path}`
                      : visualState === 'visited'
                        ? `0 0 3px ${CELL_COLORS.visited}40`
                        : 'none',
                  cursor: isEditable ? 'pointer' : 'not-allowed',
                  transform: visualState === 'path' ? 'scale(1.1)' : 'scale(1)',
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
