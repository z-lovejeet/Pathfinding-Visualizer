import { create } from 'zustand';
import { AlgorithmResult, AlgorithmType, GridNode, InteractionMode, MazeType, NodeType, Position, Stats, VisualState } from '../lib/grid/types';
import { ANIMATION_CONFIG, DEFAULT_COLS, DEFAULT_END, DEFAULT_ROWS, DEFAULT_START, NODE_COLORS } from '../lib/constants';
import { createEmptyGrid, deserializeGrid } from '../lib/grid/gridUtils';
import { getAlgorithm, getPathCost, resetAlgorithmState } from '../lib/algorithms';
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
  /** Monotonically increases whenever an animation is started or invalidated. */
  runId: number;

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
  clearCell: (row: number, col: number) => void;
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
  loadGrid: (data: unknown, algo: AlgorithmType) => void;
}

const initialStats: Stats = {
  nodesVisited: 0,
  pathLength: 0,
  pathCost: 0,
  executionTime: 0,
};

const resetNodeState = (
  node: GridNode,
  type: NodeType = node.type,
  weight = type === 'weight' ? node.weight : 1
): GridNode => {
  const appearance = NODE_COLORS[type];

  return {
    ...node,
    type,
    weight,
    visualState: 'unvisited',
    isVisited: false,
    distance: Infinity,
    heuristic: 0,
    totalCost: Infinity,
    previousNode: null,
    height: appearance.height,
    scaleY: 1,
    emissiveIntensity: appearance.intensity,
  };
};

const nodeKey = (row: number, col: number) => `${row}:${col}`;

/**
 * Persist the terminal animation frame on the grid, then release the engine.
 * Keeping the result in the grid prevents an old engine buffer from masking
 * walls or weights after the user begins editing again.
 */
const applyCompletedVisualization = (
  grid: GridNode[][],
  result: AlgorithmResult
): GridNode[][] => {
  const visited = new Set(
    result.visitedNodesInOrder.map((node) => nodeKey(node.row, node.col))
  );
  const path = new Set(
    result.shortestPath.map((node) => nodeKey(node.row, node.col))
  );

  return grid.map((row) =>
    row.map((node) => {
      const resetNode = resetNodeState(node);

      // Endpoints and walls always retain their semantic geometry and color.
      if (
        resetNode.type === 'start' ||
        resetNode.type === 'end' ||
        resetNode.type === 'wall'
      ) {
        return resetNode;
      }

      const key = nodeKey(node.row, node.col);
      const visualState: VisualState = path.has(key)
        ? 'path'
        : visited.has(key)
          ? 'visited'
          : 'unvisited';

      if (visualState === 'unvisited') return resetNode;

      const animation =
        visualState === 'path' ? ANIMATION_CONFIG.path : ANIMATION_CONFIG.visited;

      return {
        ...resetNode,
        visualState,
        // Weighted cells remain visibly raised throughout and after a run.
        height: resetNode.type === 'weight' ? resetNode.height : animation.targetHeight,
        emissiveIntensity: animation.targetEmissive,
      };
    })
  );
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
  runId: 0,

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
      visualizationStartTime: null,
      runId: get().runId + 1,
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
      if (state.isVisualizing) return state;
      const newGrid = state.grid.map((r) => [...r]);
      const node = newGrid[row][col];
      if (node.type !== 'start' && node.type !== 'end') {
        newGrid[row][col] = resetNodeState(
          node,
          node.type === 'wall' ? 'empty' : 'wall'
        );
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
        newGrid[row][col] = resetNodeState(node, 'weight', weight);
      }
      return { grid: newGrid };
    });
  },

  clearCell: (row, col) => {
    set((state) => {
      if (state.isVisualizing) return state;
      const newGrid = state.grid.map((r) => [...r]);
      const node = newGrid[row]?.[col];
      if (!node || node.type === 'start' || node.type === 'end') return state;

      newGrid[row][col] = resetNodeState(node, 'empty');
      return { grid: newGrid };
    });
  },

  setStart: (row, col) => {
    set((state) => {
      if (state.isVisualizing) return state;
      const newGrid = state.grid.map((r) => [...r]);
      const oldStart = state.startPos;

      if (newGrid[oldStart.row]?.[oldStart.col]) {
        newGrid[oldStart.row][oldStart.col] = resetNodeState(
          newGrid[oldStart.row][oldStart.col],
          'empty'
        );
      }

      if (newGrid[row]?.[col]) {
        newGrid[row][col] = resetNodeState(newGrid[row][col], 'start');
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
        newGrid[oldEnd.row][oldEnd.col] = resetNodeState(
          newGrid[oldEnd.row][oldEnd.col],
          'empty'
        );
      }

      if (newGrid[row]?.[col]) {
        newGrid[row][col] = resetNodeState(newGrid[row][col], 'end');
      }

      return { grid: newGrid, endPos: { row, col } };
    });
  },

  clearPath: () => {
    const { animationController, animationEngine } = get();
    if (animationController) animationController.cancel();
    if (animationEngine) animationEngine.cancel();

    set((state) => {
      const newGrid = state.grid.map((row) => row.map((node) => resetNodeState(node)));

      return {
        grid: newGrid,
        isComplete: false,
        isVisualizing: false,
        isPaused: false,
        animationController: null,
        animationEngine: null,
        showNoPathModal: false,
        visualizationStartTime: null,
        runId: state.runId + 1,
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

  loadGrid: (data: unknown, algo: AlgorithmType) => {
    set((state) => {
      // Stop running animations
      if (state.animationEngine) {
        state.animationEngine.cancel();
      }
      if (state.animationController) {
        state.animationController.cancel();
      }

      const grid = deserializeGrid(
        data,
        state.rows,
        state.cols,
        state.startPos,
        state.endPos
      );

      return {
        grid,
        algorithm: algo,
        isVisualizing: false,
        isPaused: false,
        isComplete: false,
        runId: state.runId + 1,
        animationEngine: null,
        animationController: null,
      };
    });
    get().resetStats();
  },

  // ═══════════════ CORE ALGORITHM ACTIONS ═══════════════

  runAlgorithm: async () => {
    if (get().isVisualizing) return;

    // This invalidates completed buffers as well as any prior asynchronous run.
    get().clearPath();

    const state = get();
    const runId = state.runId + 1;
    const { grid, algorithm, startPos, endPos, rows, cols } = state;

    resetAlgorithmState(grid);

    // Mark synchronously, before any asynchronous animation work can begin.
    set({
      runId,
      isVisualizing: true,
      isPaused: false,
      isComplete: false,
      showNoPathModal: false,
      visualizationStartTime: performance.now(),
      animationController: null,
      animationEngine: null,
      ...initialStats,
    });

    const startTime = performance.now();
    const algorithmFn = getAlgorithm(algorithm);
    const startNode = grid[startPos.row][startPos.col];
    const endNode = grid[endPos.row][endPos.col];
    const result = algorithmFn(grid, startNode, endNode);
    const executionTime = performance.now() - startTime;

    const engine = new AnimationEngine(rows, cols);
    set({ animationEngine: engine });

    const isActiveRun = () => {
      const current = get();
      return current.runId === runId && current.animationEngine === engine;
    };

    const status = await engine.run(
      result,
      () => get().speed,
      (visitedCount) => {
        if (isActiveRun()) set({ nodesVisited: visitedCount });
      },
      (pathCount, pathCost) => {
        if (isActiveRun()) set({ pathLength: pathCount, pathCost });
      }
    );

    if (status !== 'completed' || !isActiveRun()) return;

    set((current) => {
      if (current.runId !== runId || current.animationEngine !== engine) return current;

      return {
        grid: applyCompletedVisualization(current.grid, result),
        isVisualizing: false,
        isPaused: false,
        isComplete: true,
        visualizationStartTime: null,
        animationEngine: null,
        nodesVisited: result.visitedNodesInOrder.length,
        pathLength: result.shortestPath.length,
        pathCost: result.found ? getPathCost(result.shortestPath) : 0,
        executionTime: Math.round(executionTime * 100) / 100,
        showNoPathModal: !result.found,
      };
    });
  },

  pauseAlgorithm: () => {
    const { animationController, animationEngine, isVisualizing } = get();
    if (!isVisualizing) return;

    if (animationEngine) {
      animationEngine.pause();
      set({ isPaused: true });
    } else if (animationController) {
      animationController.pause();
      set({ isPaused: true });
    }
  },

  resumeAlgorithm: () => {
    const { animationController, animationEngine, isVisualizing } = get();
    if (!isVisualizing) return;

    if (animationEngine) {
      animationEngine.resume();
      set({ isPaused: false });
    } else if (animationController) {
      animationController.resume();
      set({ isPaused: false });
    }
  },

  stopAlgorithm: () => {
    get().clearPath();
  },

  generateMaze: async () => {
    if (get().isVisualizing) return;

    get().clearBoard();

    const state = get();
    const runId = state.runId + 1;
    const { mazeType, speed, rows, cols, startPos, endPos } = state;

    // Set the running state synchronously so two quick clicks cannot overlap.
    set({
      runId,
      isVisualizing: true,
      isPaused: false,
      isComplete: false,
      showNoPathModal: false,
      visualizationStartTime: null,
      animationController: null,
      animationEngine: null,
      ...initialStats,
    });

    const generator = getMazeGenerator(mazeType);
    const steps = generator(rows, cols, startPos, endPos);

    const controller = new AnimationController();
    set({ animationController: controller });

    const isActiveRun = () => {
      const current = get();
      return current.runId === runId && current.animationController === controller;
    };

    try {
      await controller.animateMaze(
        steps,
        speed,
        (updater) => {
          if (isActiveRun()) get().updateGridNodes(updater);
        },
        () => {}
      );

      if (!isActiveRun()) return;

      set((current) => {
        if (current.runId !== runId || current.animationController !== controller) return current;

        return {
          isVisualizing: false,
          isPaused: false,
          animationController: null,
        };
      });
    } catch {
      if (!isActiveRun()) return;
      set({ isVisualizing: false, isPaused: false, animationController: null });
    }
  },
}));
