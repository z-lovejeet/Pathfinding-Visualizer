import { GridNode, AlgorithmResult, VisualState, MazeStep } from '../grid/types';
import { getDelayFromSpeed, NODE_COLORS } from '../constants';

/**
 * AnimationController — Used for MAZE GENERATION animation only.
 *
 * For pathfinding visualization, use AnimationEngine instead (GSAP-powered,
 * spring physics, per-instance emissive, live speed control).
 *
 * This controller uses setTimeout-based delays to update node properties
 * step-by-step. The GridMesh component reads these values every frame.
 * Supports pause, resume, and cancel.
 */
export class AnimationController {
  private visitedIndex = 0;
  private pathIndex = 0;
  private isPaused = false;
  private isCancelled = false;
  private resolveWait: (() => void) | null = null;

  /**
   * Run the full animation: visited nodes → shortest path.
   */
  async run(
    result: AlgorithmResult,
    speed: number,
    updateGrid: (updater: (grid: GridNode[][]) => GridNode[][]) => void,
    onVisitedStep: (count: number) => void,
    onPathStep: (count: number) => void
  ): Promise<void> {
    this.reset();

    // Phase 1: Animate visited nodes
    await this.animateVisited(result.visitedNodesInOrder, speed, updateGrid, onVisitedStep);

    if (this.isCancelled) return;

    // Phase 2: Animate shortest path
    if (result.found) {
      await this.animatePath(result.shortestPath, speed, updateGrid, onPathStep);
    }
  }

  /**
   * Animate visited nodes one-by-one with delay based on speed.
   */
  private async animateVisited(
    visitedNodes: GridNode[],
    speed: number,
    updateGrid: (updater: (grid: GridNode[][]) => GridNode[][]) => void,
    onStep: (count: number) => void
  ): Promise<void> {
    const delay = getDelayFromSpeed(speed);

    for (this.visitedIndex = 0; this.visitedIndex < visitedNodes.length; this.visitedIndex++) {
      if (this.isCancelled) return;

      // Wait while paused
      while (this.isPaused && !this.isCancelled) {
        await this.waitForResume();
      }
      if (this.isCancelled) return;

      const node = visitedNodes[this.visitedIndex];

      // Skip start and end nodes (they keep their special appearance)
      if (node.type === 'start' || node.type === 'end') {
        onStep(this.visitedIndex + 1);
        continue;
      }

      // Update node visual state in the grid
      updateGrid((grid) => {
        const newGrid = grid.map(row => [...row]);
        const targetNode = newGrid[node.row][node.col];
        newGrid[node.row][node.col] = {
          ...targetNode,
          visualState: 'visited' as VisualState,
          height: 0.4,
          scaleY: 3,
          emissiveIntensity: 1.5,
        };
        return newGrid;
      });

      onStep(this.visitedIndex + 1);

      // Delay between steps
      await this.sleep(delay);
    }
  }

  /**
   * Animate shortest path with golden glow wave.
   */
  private async animatePath(
    pathNodes: GridNode[],
    speed: number,
    updateGrid: (updater: (grid: GridNode[][]) => GridNode[][]) => void,
    onStep: (count: number) => void
  ): Promise<void> {
    // Path animation is faster than visited
    const delay = Math.max(20, getDelayFromSpeed(speed) * 2);

    for (this.pathIndex = 0; this.pathIndex < pathNodes.length; this.pathIndex++) {
      if (this.isCancelled) return;

      while (this.isPaused && !this.isCancelled) {
        await this.waitForResume();
      }
      if (this.isCancelled) return;

      const node = pathNodes[this.pathIndex];

      // Skip start and end nodes
      if (node.type === 'start' || node.type === 'end') {
        onStep(this.pathIndex + 1);
        continue;
      }

      updateGrid((grid) => {
        const newGrid = grid.map(row => [...row]);
        const targetNode = newGrid[node.row][node.col];
        newGrid[node.row][node.col] = {
          ...targetNode,
          visualState: 'path' as VisualState,
          height: 0.6,
          scaleY: 5,
          emissiveIntensity: 3.0,
        };
        return newGrid;
      });

      onStep(this.pathIndex + 1);
      await this.sleep(delay);
    }
  }

  /**
   * Animate maze generation step-by-step.
   * Each step places a wall or carves a passage with a delay.
   */
  async animateMaze(
    steps: MazeStep[],
    speed: number,
    updateGrid: (updater: (grid: GridNode[][]) => GridNode[][]) => void,
    onStep: (count: number) => void
  ): Promise<void> {
    this.reset();

    // Faster delay for maze generation — walls appear rapidly
    const delay = Math.max(2, Math.floor(getDelayFromSpeed(speed) * 0.3));

    for (let i = 0; i < steps.length; i++) {
      if (this.isCancelled) return;

      while (this.isPaused && !this.isCancelled) {
        await this.waitForResume();
      }
      if (this.isCancelled) return;

      const step = steps[i];

      updateGrid((grid) => {
        const newGrid = grid.map((row) => [...row]);
        const node = newGrid[step.row]?.[step.col];
        if (!node) return newGrid;

        // Don't overwrite start/end
        if (node.type === 'start' || node.type === 'end') return newGrid;

        if (step.type === 'wall') {
          newGrid[step.row][step.col] = {
            ...node,
            type: 'wall',
            visualState: 'unvisited' as VisualState,
            height: NODE_COLORS.wall.height,
            emissiveIntensity: 0,
            weight: 1,
          };
        } else {
          newGrid[step.row][step.col] = {
            ...node,
            type: 'empty',
            visualState: 'unvisited' as VisualState,
            height: NODE_COLORS.empty.height,
            emissiveIntensity: 0,
            weight: 1,
          };
        }

        return newGrid;
      });

      onStep(i + 1);

      // Only delay every few steps for dense mazes (keeps it smooth)
      if (delay > 0 && i % 3 === 0) {
        await this.sleep(delay);
      }
    }
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
    if (this.resolveWait) {
      this.resolveWait();
      this.resolveWait = null;
    }
  }

  cancel(): void {
    this.isCancelled = true;
    this.isPaused = false;
    if (this.resolveWait) {
      this.resolveWait();
      this.resolveWait = null;
    }
  }

  reset(): void {
    this.visitedIndex = 0;
    this.pathIndex = 0;
    this.isPaused = false;
    this.isCancelled = false;
    this.resolveWait = null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private waitForResume(): Promise<void> {
    return new Promise((resolve) => {
      this.resolveWait = resolve;
    });
  }
}
