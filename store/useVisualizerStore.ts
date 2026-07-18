import { create } from 'zustand';
import { AlgorithmType, GridNode, InteractionMode, MazeType, Position, Stats, VisualState } from '../lib/grid/types';
import { DEFAULT_COLS, DEFAULT_END, DEFAULT_ROWS, DEFAULT_START } from '../lib/constants';
import { createEmptyGrid } from '../lib/grid/gridUtils';
import { getAlgorithm, resetAlgorithmState } from '../lib/algorithms';
import { AnimationController } from '../lib/animation/animationController';
import { AnimationEngine } from '../lib/animation/AnimationEngine';
import { getMazeGenerator } from '../lib/maze';

interface VisualizerState {
  // Grid
  grid: GridNode[][];
  rows: number;
  cols: number;

  // Nodes
  startPos: Position;
  endPos: Position;

  // Algorithm
  algorithm: AlgorithmType;
  mazeType: MazeType;
  speed: number;
  isVisualizing: boolean;
  isPaused: boolean;
  isComplete: boolean;

  // Interaction
  interactionMode: InteractionMode;
  isMouseDown: boolean;

  // Stats
  nodesVisited: number;
  pathLength: number;
  pathCost: number;
  executionTime: number;

  // No-path modal
  showNoPathModal: boolean;

  // Camera reset
  cameraResetTrigger: number;

  // Animation references
  animationController: AnimationController | null; // Maze generation only
  animationEngine: AnimationEngine | null;          // Pathfinding visualization

  // Live timer
  visualizationStartTime: number | null;

  // Actions
  initGrid: (rows?: number, cols?: number) => void;
  setAlgorithm: (algo: AlgorithmType) => void;
  setMazeType: (type: MazeType) => void;
  setSpeed: (speed: number) => void;
  setInteractionMode: (mode: InteractionMode) => void;
  setMouseDown: (isDown: boolean) => void;
  toggleWall: (row: number, col: number) => void;
  setWeight: (row: number, col: number, weight: number) => void;
  setStart: (row: number, col: number) => void;
  setEnd: (row: number, col: number) => void;
  clearPath: () => void;
  clearBoard: () => void;
  setVisualizing: (v: boolean) => void;
  setPaused: (p: boolean) => void;
  setComplete: (c: boolean) => void;
  updateStats: (stats: Partial<Stats>) => void;
  resetStats: () => void;
  dismissNoPathModal: () => void;
  resetCamera: () => void;

  // Core algorithm actions
  runAlgorithm: () => Promise<void>;
  pauseAlgorithm: () => void;
  resumeAlgorithm: () => void;
  stopAlgorithm: () => void;
  generateMaze: () => Promise<void>;
  updateGridNodes: (updater: (grid: GridNode[][]) => GridNode[][]) => void;
}

const initialStats: Stats = {
  nodesVisited: 0,
  pathLength: 0,
  pathCost: 0,
  executionTime: 0,
};

export const useVisualizerStore = create<VisualizerState>((set, get) => ({
  grid: createEmptyGrid(DEFAULT_ROWS, DEFAULT_COLS, DEFAULT_START, DEFAULT_END),
  rows: DEFAULT_ROWS,
  cols: DEFAULT_COLS,

  startPos: DEFAULT_START,
  endPos: DEFAULT_END,

  algorithm: 'bfs',
  mazeType: 'recursive-division' as MazeType,
  speed: 50,
  isVisualizing: false,
  isPaused: false,
  isComplete: false,

  interactionMode: 'wall',
  isMouseDown: false,

  ...initialStats,

  showNoPathModal: false,
  cameraResetTrigger: 0,

  animationController: null,
  animationEngine: null,

  visualizationStartTime: null,

  initGrid: (rows = DEFAULT_ROWS, cols = DEFAULT_COLS) => {
    const { startPos, endPos, animationController, animationEngine } = get();
    // Cancel any running animation
    if (animationController) animationController.cancel();
    if (animationEngine) animationEngine.cancel();
    set({
      rows,
      cols,
      grid: createEmptyGrid(rows, cols, startPos, endPos),
      isVisualizing: false,
      isPaused: false,
      isComplete: false,
      animationController: null,
      animationEngine: null,
      showNoPathModal: false,
      ...initialStats,
    });
  },

  setAlgorithm: (algo) => set({ algorithm: algo }),
  setMazeType: (type) => set({ mazeType: type }),

  // Speed setter — also live-updates the animation engine's timeScale
  setSpeed: (speed) => {
    const { animationEngine } = get();
    if (animationEngine) {
      animationEngine.updateSpeed(speed);
    }
    set({ speed });
  },

  setInteractionMode: (mode) => set({ interactionMode: mode }),
  setMouseDown: (isDown) => set({ isMouseDown: isDown }),

  toggleWall: (row, col) => {
    set((state) => {
      if (state.isVisualizing) return state; // Block during visualization
      const newGrid = state.grid.map((r) => [...r]);
      const node = newGrid[row][col];
      if (node.type !== 'start' && node.type !== 'end') {
        const isWall = node.type === 'wall';
        newGrid[row][col] = {
          ...node,
          type: isWall ? 'empty' : 'wall',
          height: isWall ? 0.1 : 0.8,
          weight: 1,
          emissiveIntensity: 0,
        };
      }
      return { grid: newGrid };
    });
  },

  setWeight: (row, col, weight) => {
    set((state) => {
      if (state.isVisualizing) return state;
      const newGrid = state.grid.map((r) => [...r]);
      const node = newGrid[row][col];
      if (node.type !== 'start' && node.type !== 'end' && node.type !== 'wall') {
        newGrid[row][col] = {
          ...node,
          type: 'weight',
          weight,
          height: 0.3,
          emissiveIntensity: 0.5,
        };
      }
      return { grid: newGrid };
    });
  },

  setStart: (row, col) => {
    set((state) => {
      if (state.isVisualizing) return state;
      const newGrid = state.grid.map((r) => [...r]);
      const oldStart = state.startPos;

      // Clear old start
      if (newGrid[oldStart.row]?.[oldStart.col]) {
        newGrid[oldStart.row][oldStart.col] = {
          ...newGrid[oldStart.row][oldStart.col],
          type: 'empty',
          height: 0.1,
          emissiveIntensity: 0,
        };
      }

      // Set new start
      if (newGrid[row]?.[col]) {
        newGrid[row][col] = {
          ...newGrid[row][col],
          type: 'start',
          height: 0.3,
          emissiveIntensity: 2.0,
        };
      }

      return { grid: newGrid, startPos: { row, col } };
    });
  },

  setEnd: (row, col) => {
    set((state) => {
      if (state.isVisualizing) return state;
      const newGrid = state.grid.map((r) => [...r]);
      const oldEnd = state.endPos;

      if (newGrid[oldEnd.row]?.[oldEnd.col]) {
        newGrid[oldEnd.row][oldEnd.col] = {
          ...newGrid[oldEnd.row][oldEnd.col],
          type: 'empty',
          height: 0.1,
          emissiveIntensity: 0,
        };
      }

      if (newGrid[row]?.[col]) {
        newGrid[row][col] = {
          ...newGrid[row][col],
          type: 'end',
          height: 0.3,
          emissiveIntensity: 2.0,
        };
      }

      return { grid: newGrid, endPos: { row, col } };
    });
  },

  clearPath: () => {
    const { animationController, animationEngine } = get();
    if (animationController) animationController.cancel();
    if (animationEngine) animationEngine.cancel();

    set((state) => {
      const newGrid = state.grid.map((row) =>
        row.map((node) => ({
          ...node,
          visualState: 'unvisited' as VisualState,
          isVisited: false,
          distance: Infinity,
          heuristic: 0,
          totalCost: Infinity,
          previousNode: null,
          height:
            node.type === 'start' || node.type === 'end' || node.type === 'weight'
              ? 0.3
              : node.type === 'wall'
                ? 0.8
                : 0.1,
          scaleY: 1,
          emissiveIntensity:
            node.type === 'start' || node.type === 'end' ? 2.0 : node.type === 'weight' ? 0.5 : 0,
        }))
      );

      return {
        grid: newGrid,
        isComplete: false,
        isVisualizing: false,
        isPaused: false,
        animationController: null,
        animationEngine: null,
        showNoPathModal: false,
        ...initialStats,
      };
    });
  },

  clearBoard: () => {
    get().initGrid(get().rows, get().cols);
  },

  setVisualizing: (v) => set({ isVisualizing: v }),
  setPaused: (p) => set({ isPaused: p }),
  setComplete: (c) => set({ isComplete: c }),

  updateStats: (stats) => set((state) => ({ ...state, ...stats })),
  resetStats: () => set(initialStats),
  dismissNoPathModal: () => set({ showNoPathModal: false }),
  resetCamera: () => set((state) => ({ cameraResetTrigger: state.cameraResetTrigger + 1 })),

  updateGridNodes: (updater) => {
    set((state) => ({ grid: updater(state.grid) }));
  },

  // ═══════════════ CORE ALGORITHM ACTIONS ═══════════════

  runAlgorithm: async () => {
    const state = get();
    if (state.isVisualizing) return;

    // 1. Clear any previous visualization
    get().clearPath();

    // Small delay to let clearPath settle
    await new Promise((r) => setTimeout(r, 50));

    const { grid, algorithm, speed, startPos, endPos, rows, cols } = get();

    // 2. Reset algorithm state on all nodes
    resetAlgorithmState(grid);

    // 3. Mark as visualizing
    set({ isVisualizing: true, isComplete: false, showNoPathModal: false, visualizationStartTime: performance.now(), ...initialStats });

    // 4. Run algorithm (synchronous — computes result instantly)
    const startTime = performance.now();
    const algorithmFn = getAlgorithm(algorithm);
    const startNode = grid[startPos.row][startPos.col];
    const endNode = grid[endPos.row][endPos.col];
    const result = algorithmFn(grid, startNode, endNode);
    const executionTime = performance.now() - startTime;

    // 5. Create GSAP AnimationEngine and animate
    const engine = new AnimationEngine(rows, cols);
    set({ animationEngine: engine });

    try {
      await engine.run(
        result,
        () => get().speed, // Live speed getter — re-reads slider every step
        (visitedCount) => set({ nodesVisited: visitedCount }),
        (pathCount, pathCost) => set({ pathLength: pathCount, pathCost })
      );

      // 6. Update final stats
      set({
        isVisualizing: false,
        isComplete: true,
        visualizationStartTime: null,
        nodesVisited: result.visitedNodesInOrder.length,
        pathLength: result.shortestPath.length,
        pathCost: result.found
          ? result.shortestPath.reduce((sum, n) => sum + n.weight, 0)
          : 0,
        executionTime: Math.round(executionTime * 100) / 100,
        showNoPathModal: !result.found,
        // Keep engine alive so GridMesh can read final buffer state
      });
    } catch {
      // Animation was cancelled
      set({ isVisualizing: false, visualizationStartTime: null, animationEngine: null });
    }
  },

  pauseAlgorithm: () => {
    const { animationController, animationEngine } = get();
    if (animationEngine) {
      animationEngine.pause();
      set({ isPaused: true });
    } else if (animationController) {
      animationController.pause();
      set({ isPaused: true });
    }
  },

  resumeAlgorithm: () => {
    const { animationController, animationEngine } = get();
    if (animationEngine) {
      animationEngine.resume();
      set({ isPaused: false });
    } else if (animationController) {
      animationController.resume();
      set({ isPaused: false });
    }
  },

  stopAlgorithm: () => {
    const { animationController, animationEngine } = get();
    if (animationController) animationController.cancel();
    if (animationEngine) animationEngine.cancel();
    set({
      isVisualizing: false,
      isPaused: false,
      animationController: null,
      animationEngine: null,
    });
  },

  generateMaze: async () => {
    const state = get();
    if (state.isVisualizing) return;

    // Clear board first
    get().clearBoard();
    await new Promise((r) => setTimeout(r, 50));

    const { mazeType, speed, rows, cols, startPos, endPos } = get();

    // Generate maze steps
    const generator = getMazeGenerator(mazeType);
    const steps = generator(rows, cols, startPos, endPos);

    // Mark as visualizing
    set({ isVisualizing: true, isComplete: false });

    // Maze generation still uses AnimationController (setTimeout-based, works well for walls)
    const controller = new AnimationController();
    set({ animationController: controller });

    try {
      await controller.animateMaze(
        steps,
        speed,
        get().updateGridNodes,
        () => {} // No stats callback needed for maze gen
      );

      set({
        isVisualizing: false,
        animationController: null,
      });
    } catch {
      set({ isVisualizing: false, animationController: null });
    }
  },
}));
