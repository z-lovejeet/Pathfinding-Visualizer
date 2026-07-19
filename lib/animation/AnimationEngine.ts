import gsap from 'gsap';
import { getPathCost } from '../algorithms';
import { AlgorithmResult } from '../grid/types';
import { getDelayFromSpeed } from '../constants';

/**
 * AnimationEngine — GSAP-powered cinematic animation for pathfinding visualization.
 *
 * Uses Float32Array buffers that GridMesh reads in useFrame() to drive
 * per-instance height, color phase, and emissive intensity with spring physics.
 *
 * Features:
 * - "Current node" cyan flash before visited purple transition
 * - back.out(1.7) overshoot rise for visited nodes
 * - elastic.out(1, 0.5) bounce for path nodes
 * - Live speed slider via timeline.timeScale()
 * - Real-time pathCost counter updates
 * - Pause/resume via GSAP timeline controls
 */

/** Phase enum stored in nodePhase buffer */
export const NODE_PHASE = {
  IDLE: 0,
  CURRENT: 1,
  VISITED: 2,
  PATH: 3,
} as const;

export interface AnimationBuffers {
  /** Target Y height per instance (GridMesh lerps toward this) */
  targetHeights: Float32Array;
  /** Target emissive intensity per instance */
  targetEmissives: Float32Array;
  /** Node animation phase: 0=idle, 1=current, 2=visited, 3=path */
  nodePhase: Uint8Array;
  /** Whether this engine currently owns the instance's animation values. */
  activeNodes: Uint8Array;
}

export type AnimationRunStatus = 'completed' | 'cancelled';

export class AnimationEngine {
  // --- Shared buffers (GridMesh reads these every frame) ---
  public targetHeights: Float32Array;
  public targetEmissives: Float32Array;
  public nodePhase: Uint8Array;
  public activeNodes: Uint8Array;

  private timeline: gsap.core.Timeline | null = null;
  private rows: number;
  private cols: number;
  private cancelled = false;
  private resolvePromise: ((status: AnimationRunStatus) => void) | null = null;

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    const count = rows * cols;
    this.targetHeights = new Float32Array(count);
    this.targetEmissives = new Float32Array(count).fill(0);
    this.nodePhase = new Uint8Array(count);
    this.activeNodes = new Uint8Array(count);
  }

  /**
   * Get the animation buffers for GridMesh to consume.
   */
  getBuffers(): AnimationBuffers {
    return {
      targetHeights: this.targetHeights,
      targetEmissives: this.targetEmissives,
      nodePhase: this.nodePhase,
      activeNodes: this.activeNodes,
    };
  }

  /**
   * Build and play the full animation:
   * Phase 1: Visited nodes — "current" flash → "visited" rise
   * Phase 2: Path nodes — golden elastic wave
   */
  run(
    result: AlgorithmResult,
    getSpeed: () => number,
    onVisitedStep: (count: number) => void,
    onPathStep: (count: number, cost: number) => void
  ): Promise<AnimationRunStatus> {
    this.cancel();
    this.cancelled = false;

    // Calculate delay per step from current speed
    const speed = getSpeed();
    const delayMs = getDelayFromSpeed(speed);
    const delayS = delayMs / 1000; // GSAP uses seconds

    // Current flash duration (80ms)
    const flashDuration = 0.08;

    const completion = new Promise<AnimationRunStatus>((resolve) => {
      this.resolvePromise = resolve;
    });

    // Build GSAP timeline
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        if (!this.cancelled) this.finish('completed');
      },
    });
    this.timeline = tl;

    // ─── PHASE 1: Visited Nodes ───
    const visited = result.visitedNodesInOrder;
    for (let i = 0; i < visited.length; i++) {
      const node = visited[i];
      // Skip start and end nodes
      if (node.type === 'start' || node.type === 'end') {
        const capturedI = i;
        tl.call(() => {
          if (!this.cancelled) onVisitedStep(capturedI + 1);
        }, [], i * delayS);
        continue;
      }

      const idx = node.row * this.cols + node.col;
      const staggerTime = i * delayS;

      // Step A: "Current" flash — bright cyan, taller
      const capturedIdxA = idx;
      const capturedIA = i;
      tl.call(() => {
        if (this.cancelled) return;
        this.activeNodes[capturedIdxA] = 1;
        this.nodePhase[capturedIdxA] = NODE_PHASE.CURRENT;
        this.targetHeights[capturedIdxA] = 0.5;
        this.targetEmissives[capturedIdxA] = 2.5;
        onVisitedStep(capturedIA + 1);
      }, [], staggerTime);

      // Step B: Transition to "visited" — purple, settle to final height
      const capturedIdxB = idx;
      tl.call(() => {
        if (this.cancelled) return;
        this.activeNodes[capturedIdxB] = 1;
        this.nodePhase[capturedIdxB] = NODE_PHASE.VISITED;
        this.targetHeights[capturedIdxB] = 0.4;
        this.targetEmissives[capturedIdxB] = 1.5;
      }, [], staggerTime + flashDuration);
    }

    // ─── PHASE 2: Path Nodes ───
    if (result.found && result.shortestPath.length > 0) {
      const path = result.shortestPath;
      const pathStartTime = visited.length * delayS + 0.2; // Small gap after visited
      const pathStagger = 0.05; // 50ms between path nodes

      for (let i = 0; i < path.length; i++) {
        const node = path[i];
        const capturedI = i;
        const capturedCost = getPathCost(path.slice(0, i + 1));

        if (node.type === 'start' || node.type === 'end') {
          tl.call(() => {
            if (!this.cancelled) onPathStep(capturedI + 1, capturedCost);
          }, [], pathStartTime + i * pathStagger);
          continue;
        }

        const idx = node.row * this.cols + node.col;

        const capturedIdx = idx;
        tl.call(() => {
          if (this.cancelled) return;
          this.activeNodes[capturedIdx] = 1;
          this.nodePhase[capturedIdx] = NODE_PHASE.PATH;
          this.targetHeights[capturedIdx] = 0.7;
          this.targetEmissives[capturedIdx] = 3.0;
          onPathStep(capturedI + 1, capturedCost);
        }, [], pathStartTime + i * pathStagger);
      }
    }

    // Set initial timeScale based on speed
    tl.timeScale(this.calcTimeScale(speed));

    // The resolver is registered before playback in case a zero-length timeline
    // completes in the same tick.
    tl.play();

    return completion;
  }

  /**
   * Live speed update — changes GSAP timeScale immediately.
   * Called when the speed slider moves during animation.
   */
  updateSpeed(speed: number): void {
    if (this.timeline) {
      this.timeline.timeScale(this.calcTimeScale(speed));
    }
  }

  pause(): void {
    this.timeline?.pause();
  }

  resume(): void {
    this.timeline?.resume();
  }

  cancel(): void {
    this.cancelled = true;
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    this.activeNodes.fill(0);
    this.nodePhase.fill(NODE_PHASE.IDLE);
    this.targetHeights.fill(0);
    this.targetEmissives.fill(0);
    this.finish('cancelled');
  }

  get isPaused(): boolean {
    return this.timeline?.paused() ?? false;
  }

  /**
   * Maps speed slider value (1-100) to GSAP timeScale.
   * speed=1  → timeScale 0.15 (very slow)
   * speed=50 → timeScale 1.0 (normal)
   * speed=100 → timeScale 6.0 (very fast)
   */
  private calcTimeScale(speed: number): number {
    // Exponential curve: slow speeds are more differentiated, fast speeds compress
    return 0.15 + Math.pow(speed / 100, 1.5) * 5.85;
  }

  private finish(status: AnimationRunStatus): void {
    const resolve = this.resolvePromise;
    this.resolvePromise = null;
    if (status === 'completed') this.timeline = null;
    resolve?.(status);
  }
}
