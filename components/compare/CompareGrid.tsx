'use client';

import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
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
type AnimatedCellState = Extract<CellState, 'visited' | 'path'> | 'current';

interface AnimationState {
  sourceGrid: GridNode[][];
  sourceResult: AlgorithmResult | null;
  cells: Record<string, AnimatedCellState>;
  visitedCount: number;
  isCompleted: boolean;
}

const CELL_COLORS: Record<CellState | 'current', string> = {
  empty: NODE_COLORS.empty.css,
  wall: '#334155',
  start: NODE_COLORS.start.css,
  end: NODE_COLORS.end.css,
  weight: NODE_COLORS.weight.css,
  visited: NODE_COLORS.visited.css,
  path: NODE_COLORS.path.css,
  current: '#2563eb', // Cobalt blue for pulse
};

const CELL_LABELS: Record<CellState | 'current', string> = {
  empty: 'empty',
  wall: 'wall',
  start: 'start position',
  end: 'end position',
  weight: 'weighted cell',
  visited: 'visited cell',
  path: 'path cell',
  current: 'currently exploring',
};

const getCellKey = (row: number, col: number) => `${row}:${col}`;

/**
 * CompareGrid — 2D DOM-based mini-grid for the compare page.
 * Animates visited and path nodes while keeping the underlying grid as the
 * source of truth, so an old animation cannot survive a new comparison.
 */
function CompareGridComponent({
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
    visitedCount: 0,
    isCompleted: false,
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

    const updateCell = (node: GridNode, state: AnimatedCellState, isComplete = false) => {
      const cellKey = getCellKey(node.row, node.col);
      setAnimationState((current) => {
        if (current.sourceGrid !== grid || current.sourceResult !== result) {
          return current;
        }

        const newCells = { ...current.cells, [cellKey]: state };
        
        // Remove 'current' state from previous node if we are transitioning to path
        if (state === 'path') {
          for (const key in newCells) {
            if (newCells[key] === 'current') {
               newCells[key] = 'visited';
            }
          }
        }

        return {
          ...current,
          cells: newCells,
          visitedCount: state === 'visited' || state === 'current' ? visitedIndex + 1 : current.visitedCount,
          isCompleted: isComplete,
        };
      });
    };

    const animatePath = (pathIndex = 0) => {
      if (pathIndex >= result.shortestPath.length) {
        setAnimationState(s => ({ ...s, isCompleted: true }));
        return;
      }

      const node = result.shortestPath[pathIndex];
      if (node.type !== 'start' && node.type !== 'end') {
        updateCell(node, 'path', pathIndex === result.shortestPath.length - 1);
      } else if (pathIndex === result.shortestPath.length - 1) {
         setAnimationState(s => ({ ...s, isCompleted: true }));
      }

      schedule(() => animatePath(pathIndex + 1), Math.max(20, delay * 2));
    };

    const animateVisited = () => {
      if (visitedIndex >= result.visitedNodesInOrder.length) {
        animatePath();
        return;
      }

      // Mark previous 'current' as 'visited' implicitly by updating the new one to 'current'
      const node = result.visitedNodesInOrder[visitedIndex];
      if (node.type !== 'start' && node.type !== 'end') {
        // Find previous current and mark it visited
        setAnimationState((current) => {
           if (current.sourceGrid !== grid || current.sourceResult !== result) return current;
           const newCells = { ...current.cells };
           for (const key in newCells) {
             if (newCells[key] === 'current') {
               newCells[key] = 'visited';
             }
           }
           newCells[getCellKey(node.row, node.col)] = 'current';
           return {
             ...current,
             cells: newCells,
             visitedCount: visitedIndex + 1
           };
        });
      }

      visitedIndex += 1;
      schedule(animateVisited, delay);
    };

    schedule(() => {
      setAnimationState({ sourceGrid: grid, sourceResult: result, cells: {}, visitedCount: 0, isCompleted: false });
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

  const displayVisited = isCurrentAnimation ? animationState.visitedCount : 0;
  const totalVisited = result ? result.visitedNodesInOrder.length : 0;

  return (
    <div 
      className={`glass-elevated rounded-2xl p-4 flex flex-col gap-3 transition-colors duration-500 relative overflow-hidden ${
        animationState.isCompleted ? 'grid-flash' : ''
      }`}
      style={{
        borderTop: `3px solid ${accentColor}`,
        '--flash-color': accentColor
      } as React.CSSProperties}
    >
      {/* Label and Live Counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: accentColor }}
            aria-hidden="true"
          />
          <span className="text-sm font-bold text-white font-outfit">{label}</span>
        </div>
        {result && (
           <span className="text-xs text-[#555577] font-mono tabular-nums bg-white/5 px-2 py-0.5 rounded">
             {displayVisited} / {totalVisited} visited
           </span>
        )}
      </div>

      {/* Grid */}
      <div
        className="grid gap-[1px] mx-auto w-full"
        role="group"
        aria-label={`${label} editable grid`}
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
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
                className="w-full h-full appearance-none min-w-0 min-h-0 border-0 p-0 rounded-[1px] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#f0f0f5] disabled:cursor-not-allowed disabled:opacity-100"
                style={{
                  backgroundColor: CELL_COLORS[visualState],
                  boxShadow:
                    visualState === 'path'
                      ? `0 0 6px ${CELL_COLORS.path}`
                      : visualState === 'visited'
                        ? `0 0 3px ${CELL_COLORS.visited}40`
                        : visualState === 'current'
                          ? `0 0 8px ${CELL_COLORS.current}`
                          : 'none',
                  cursor: isEditable ? 'pointer' : 'not-allowed',
                  transform: (visualState === 'path' || visualState === 'current') ? 'scale(1.1)' : 'scale(1)',
                  zIndex: (visualState === 'path' || visualState === 'current') ? 10 : 1
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default memo(CompareGridComponent);
