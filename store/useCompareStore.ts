import { create } from 'zustand';
import {
  AlgorithmType,
  AlgorithmResult,
  GridNode,
  MazeType,
  Position,
  VisualState,
} from '../lib/grid/types';
import { createEmptyGrid } from '../lib/grid/gridUtils';
import { getAlgorithm, resetAlgorithmState } from '../lib/algorithms';
import { getMazeGenerator } from '../lib/maze';
import { DEFAULT_ROWS, DEFAULT_COLS, DEFAULT_START, DEFAULT_END } from '../lib/constants';

export interface CompareStats {
  nodesVisited: number;
  pathLength: number;
  pathCost: number;
  executionTime: number;
  found: boolean;
}

interface CompareState {
  // Grid (shared between both algorithms)
  grid: GridNode[][];
  rows: number;
  cols: number;
  startPos: Position;
  endPos: Position;

  // Algorithms
  algo1: AlgorithmType;
  algo2: AlgorithmType;
  speed: number;

  // Results
  result1: AlgorithmResult | null;
  result2: AlgorithmResult | null;
  stats1: CompareStats | null;
  stats2: CompareStats | null;

  isRunning: boolean;
  isComplete: boolean;

  // Actions
  initGrid: () => void;
  setAlgo1: (a: AlgorithmType) => void;
  setAlgo2: (a: AlgorithmType) => void;
  setSpeed: (s: number) => void;
  runComparison: () => void;
  clearResults: () => void;
  generateMaze: (type: MazeType) => void;
  toggleWall: (row: number, col: number) => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  grid: createEmptyGrid(DEFAULT_ROWS, DEFAULT_COLS, DEFAULT_START, DEFAULT_END),
  rows: DEFAULT_ROWS,
  cols: DEFAULT_COLS,
  startPos: DEFAULT_START,
  endPos: DEFAULT_END,

  algo1: 'bfs',
  algo2: 'astar',
  speed: 50,

  result1: null,
  result2: null,
  stats1: null,
  stats2: null,
  isRunning: false,
  isComplete: false,

  initGrid: () => {
    const { rows, cols, startPos, endPos } = get();
    set({
      grid: createEmptyGrid(rows, cols, startPos, endPos),
      result1: null,
      result2: null,
      stats1: null,
      stats2: null,
      isComplete: false,
    });
  },

  setAlgo1: (a) => set({ algo1: a }),
  setAlgo2: (a) => set({ algo2: a }),
  setSpeed: (s) => set({ speed: s }),

  runComparison: () => {
    const { grid, algo1, algo2, startPos, endPos } = get();
    set({ isRunning: true, isComplete: false, result1: null, result2: null, stats1: null, stats2: null });

    // Deep copy grid for each algorithm run
    const makeGridCopy = (): GridNode[][] =>
      grid.map((row) =>
        row.map((node) => ({
          ...node,
          isVisited: false,
          distance: Infinity,
          heuristic: 0,
          totalCost: Infinity,
          previousNode: null,
          visualState: 'unvisited' as VisualState,
        }))
      );

    // Run algorithm 1
    const grid1 = makeGridCopy();
    resetAlgorithmState(grid1);
    const fn1 = getAlgorithm(algo1);
    const start1 = grid1[startPos.row][startPos.col];
    const end1 = grid1[endPos.row][endPos.col];
    const t1Start = performance.now();
    const r1 = fn1(grid1, start1, end1);
    const t1End = performance.now();

    // Run algorithm 2
    const grid2 = makeGridCopy();
    resetAlgorithmState(grid2);
    const fn2 = getAlgorithm(algo2);
    const start2 = grid2[startPos.row][startPos.col];
    const end2 = grid2[endPos.row][endPos.col];
    const t2Start = performance.now();
    const r2 = fn2(grid2, start2, end2);
    const t2End = performance.now();

    set({
      result1: r1,
      result2: r2,
      stats1: {
        nodesVisited: r1.visitedNodesInOrder.length,
        pathLength: r1.shortestPath.length,
        pathCost: r1.found ? r1.shortestPath.reduce((sum, n) => sum + n.weight, 0) : 0,
        executionTime: Math.round((t1End - t1Start) * 100) / 100,
        found: r1.found,
      },
      stats2: {
        nodesVisited: r2.visitedNodesInOrder.length,
        pathLength: r2.shortestPath.length,
        pathCost: r2.found ? r2.shortestPath.reduce((sum, n) => sum + n.weight, 0) : 0,
        executionTime: Math.round((t2End - t2Start) * 100) / 100,
        found: r2.found,
      },
      isRunning: false,
      isComplete: true,
    });
  },

  clearResults: () => {
    get().initGrid();
  },

  generateMaze: (type: MazeType) => {
    const { rows, cols, startPos, endPos } = get();

    // Reset grid first
    const freshGrid = createEmptyGrid(rows, cols, startPos, endPos);

    // Generate maze
    const generator = getMazeGenerator(type);
    const steps = generator(rows, cols, startPos, endPos);

    // Apply all steps instantly (no animation for compare mode)
    const newGrid = freshGrid.map((row) => [...row]);
    for (const step of steps) {
      const node = newGrid[step.row]?.[step.col];
      if (!node || node.type === 'start' || node.type === 'end') continue;
      if (step.type === 'wall') {
        newGrid[step.row][step.col] = { ...node, type: 'wall', height: 0.8, weight: 1 };
      } else {
        newGrid[step.row][step.col] = { ...node, type: 'empty', height: 0.1, weight: 1 };
      }
    }

    set({
      grid: newGrid,
      result1: null,
      result2: null,
      stats1: null,
      stats2: null,
      isComplete: false,
    });
  },

  toggleWall: (row, col) => {
    set((state) => {
      if (state.isRunning) return state;
      const newGrid = state.grid.map((r) => [...r]);
      const node = newGrid[row][col];
      if (node.type !== 'start' && node.type !== 'end') {
        const isWall = node.type === 'wall';
        newGrid[row][col] = { ...node, type: isWall ? 'empty' : 'wall', height: isWall ? 0.1 : 0.8 };
      }
      return { grid: newGrid, result1: null, result2: null, stats1: null, stats2: null, isComplete: false };
    });
  },
}));
