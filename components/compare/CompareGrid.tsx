'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GridNode, AlgorithmResult } from '@/lib/grid/types';
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

const CELL_COLORS: Record<CellState, string> = {
  empty: NODE_COLORS.empty.css,
  wall: '#2a2a3e',
  start: NODE_COLORS.start.css,
  end: NODE_COLORS.end.css,
  weight: NODE_COLORS.weight.css,
  visited: NODE_COLORS.visited.css,
  path: NODE_COLORS.path.css,
};

/**
 * CompareGrid — 2D DOM-based mini-grid for the compare page.
 * Animates visited and path nodes with CSS transitions.
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
  // Cell visual states — starts matching the grid
  const [cellStates, setCellStates] = useState<CellState[][]>(() =>
    grid.map((row) => row.map((node) => node.type as CellState))
  );
  const animRef = useRef<NodeJS.Timeout | null>(null);

  // Reset cell states when grid changes
  useEffect(() => {
    setCellStates(grid.map((row) => row.map((node) => node.type as CellState)));
  }, [grid]);

  // Animate result when it appears
  useEffect(() => {
    if (!result) return;

    // Cancel any previous animation
    if (animRef.current) clearTimeout(animRef.current);

    const delay = Math.max(3, Math.floor(200 * Math.pow(0.95, speed) * 0.5));
    let i = 0;

    // Reset to grid base states
    setCellStates(grid.map((row) => row.map((node) => node.type as CellState)));

    const animateVisited = () => {
      if (i >= result.visitedNodesInOrder.length) {
        // Start path animation
        let j = 0;
        const animatePath = () => {
          if (j >= result.shortestPath.length) return;
          const node = result.shortestPath[j];
          if (node.type !== 'start' && node.type !== 'end') {
            setCellStates((prev) => {
              const next = prev.map((r) => [...r]);
              next[node.row][node.col] = 'path';
              return next;
            });
          }
          j++;
          animRef.current = setTimeout(animatePath, Math.max(20, delay * 2));
        };
        animatePath();
        return;
      }

      const node = result.visitedNodesInOrder[i];
      if (node.type !== 'start' && node.type !== 'end') {
        setCellStates((prev) => {
          const next = prev.map((r) => [...r]);
          next[node.row][node.col] = 'visited';
          return next;
        });
      }
      i++;
      animRef.current = setTimeout(animateVisited, delay);
    };

    animRef.current = setTimeout(animateVisited, 100);

    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [result, grid, speed]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (isRunning) return;
      onToggleWall(row, col);
    },
    [isRunning, onToggleWall]
  );

  return (
    <div className="glass-elevated rounded-2xl p-4 flex flex-col gap-3">
      {/* Label */}
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <span className="text-sm font-bold text-white font-outfit">{label}</span>
      </div>

      {/* Grid */}
      <div
        className="grid gap-[1px] mx-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          maxWidth: '100%',
          aspectRatio: `${cols} / ${rows}`,
        }}
      >
        {cellStates.map((row, r) =>
          row.map((state, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              className="rounded-[1px] transition-all duration-200 cursor-pointer hover:brightness-125"
              style={{
                backgroundColor: CELL_COLORS[state],
                boxShadow:
                  state === 'path'
                    ? `0 0 6px ${CELL_COLORS.path}`
                    : state === 'visited'
                      ? `0 0 3px ${CELL_COLORS.visited}40`
                      : 'none',
                transform: state === 'path' ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
