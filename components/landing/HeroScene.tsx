'use client';

import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { aStar } from '@/lib/algorithms/astar';
import { Position } from '@/lib/grid/types';
import { createEmptyGrid } from '@/lib/grid/gridUtils';

const HERO_ROWS = 15;
const HERO_COLS = 30;

/**
 * Self-contained mini grid that runs a looping pathfinding demo.
 * Uses local state only — does NOT import useVisualizerStore.
 */
function HeroGrid({ shouldAnimate }: { shouldAnimate: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = HERO_ROWS * HERO_COLS;

  // Animation state — fully local
  const stateRef = useRef({
    nodePhases: new Uint8Array(count),      // 0=idle, 1=current, 2=visited, 3=path
    targetHeights: new Float32Array(count).fill(0.08),
    targetEmissives: new Float32Array(count).fill(0),
    heights: new Float32Array(count).fill(0.08),
    velocities: new Float32Array(count),
    emissives: new Float32Array(count),
    colors: Array.from({ length: count }, () => new THREE.Color(0x1a1a2e)),
    isAnimating: false,
    isDisposed: false,
    timeoutId: null as ReturnType<typeof setTimeout> | null,
    timeoutResolve: null as (() => void) | null,
  });

  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Generate random walls
  const generateWalls = useCallback((): Set<number> => {
    const walls = new Set<number>();
    for (let i = 0; i < count; i++) {
      if (Math.random() < 0.28) {
        walls.add(i);
      }
    }
    // Keep start/end area clear
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        walls.delete((7 + dr) * HERO_COLS + (3 + dc));
        walls.delete((7 + dr) * HERO_COLS + (26 + dc));
      }
    }
    return walls;
  }, [count]);

  const waitFor = useCallback((delay: number): Promise<boolean> => {
    const state = stateRef.current;

    if (state.isDisposed) return Promise.resolve(false);

    return new Promise((resolve) => {
      const complete = () => {
        state.timeoutId = null;
        state.timeoutResolve = null;
        resolve(!state.isDisposed);
      };

      state.timeoutResolve = complete;
      state.timeoutId = setTimeout(complete, delay);
    });
  }, []);

  // Run one demo cycle
  const runDemoCycle = useCallback(async () => {
    const s = stateRef.current;
    if (s.isAnimating || s.isDisposed) return;
    s.isAnimating = true;

    // Reset
    s.nodePhases.fill(0);
    s.targetHeights.fill(0.08);
    s.targetEmissives.fill(0);

    // Generate walls
    const walls = generateWalls();
    walls.forEach((idx) => {
      s.targetHeights[idx] = 0.5;
      s.nodePhases[idx] = 0;
    });

    // Wait for walls to rise
    if (!(await waitFor(600))) {
      s.isAnimating = false;
      return;
    }

    // Create a grid for algorithm
    const start: Position = { row: 7, col: 3 };
    const end: Position = { row: 7, col: 26 };
    const grid = createEmptyGrid(HERO_ROWS, HERO_COLS, start, end);

    // Apply walls to grid
    walls.forEach((idx) => {
      const row = Math.floor(idx / HERO_COLS);
      const col = idx % HERO_COLS;
      if (grid[row]?.[col] && grid[row][col].type !== 'start' && grid[row][col].type !== 'end') {
        grid[row][col] = { ...grid[row][col], type: 'wall' };
      }
    });

    // Run A* algorithm
    const startNode = grid[start.row][start.col];
    const endNode = grid[end.row][end.col];
    const result = aStar(grid, startNode, endNode);

    // Animate visited nodes
    for (let i = 0; i < result.visitedNodesInOrder.length; i++) {
      const node = result.visitedNodesInOrder[i];
      if (node.type === 'start' || node.type === 'end') continue;
      const idx = node.row * HERO_COLS + node.col;

      // Current flash
      s.nodePhases[idx] = 1;
      s.targetHeights[idx] = 0.35;
      s.targetEmissives[idx] = 1.5;

      if (!(await waitFor(12))) {
        s.isAnimating = false;
        return;
      }

      // Visited
      s.nodePhases[idx] = 2;
      s.targetHeights[idx] = 0.25;
      s.targetEmissives[idx] = 0.8;
    }

    // Animate path
    if (result.found) {
      if (!(await waitFor(200))) {
        s.isAnimating = false;
        return;
      }

      for (let i = 0; i < result.shortestPath.length; i++) {
        const node = result.shortestPath[i];
        if (node.type === 'start' || node.type === 'end') continue;
        const idx = node.row * HERO_COLS + node.col;

        s.nodePhases[idx] = 3;
        s.targetHeights[idx] = 0.45;
        s.targetEmissives[idx] = 1.8;

        if (!(await waitFor(40))) {
          s.isAnimating = false;
          return;
        }
      }
    }

    // Hold result visible
    if (!(await waitFor(3000))) {
      s.isAnimating = false;
      return;
    }

    // Fade out
    s.nodePhases.fill(0);
    s.targetHeights.fill(0.08);
    s.targetEmissives.fill(0);

    if (!(await waitFor(1500))) {
      s.isAnimating = false;
      return;
    }

    s.isAnimating = false;
  }, [generateWalls, waitFor]);

  // Start the loop
  useEffect(() => {
    if (!shouldAnimate) return;

    let cancelled = false;
    const state = stateRef.current;
    state.isDisposed = false;

    const loop = async () => {
      while (!cancelled) {
        try {
          await runDemoCycle();
          if (!cancelled) await waitFor(500);
        } catch {
          break;
        }
      }
    };

    loop();

    return () => {
      cancelled = true;
      state.isDisposed = true;
      if (state.timeoutId !== null) clearTimeout(state.timeoutId);
      state.timeoutId = null;
      state.timeoutResolve?.();
      state.timeoutResolve = null;
      state.isAnimating = false;
    };
  }, [runDemoCycle, shouldAnimate, waitFor]);

  // Colors for phases (reduced intensity for background effect)
  const phaseColors = useMemo(() => ({
    0: 0x1a1a2e,  // idle
    1: 0x22d3ee,  // current (cyan)
    2: 0x7c3aed,  // visited (purple, dimmer)
    3: 0xf59e0b,  // path (gold)
  }), []);

  const phaseEmissiveColors = useMemo(() => ({
    0: new THREE.Color(0x000000),
    1: new THREE.Color(0x22d3ee),
    2: new THREE.Color(0x8b5cf6),
    3: new THREE.Color(0xfbbf24),
  }), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const s = stateRef.current;
    const dt = Math.min(delta, 0.05);
    let needsUpdate = false;

    for (let i = 0; i < count; i++) {
      const phase = s.nodePhases[i];
      const targetH = s.targetHeights[i];

      // Spring physics
      const stiffness = phase === 3 ? 100 : phase === 1 ? 350 : 160;
      const damping = phase === 3 ? 7 : phase === 1 ? 24 : 14;

      const disp = targetH - s.heights[i];
      const force = stiffness * disp - damping * s.velocities[i];
      s.velocities[i] += force * dt;
      s.heights[i] += s.velocities[i] * dt;

      if (Math.abs(disp) < 0.001 && Math.abs(s.velocities[i]) < 0.001) {
        s.heights[i] = targetH;
        s.velocities[i] = 0;
      } else {
        needsUpdate = true;
      }

      // Emissive
      const targetE = s.targetEmissives[i];
      const eDiff = targetE - s.emissives[i];
      if (Math.abs(eDiff) > 0.01) {
        s.emissives[i] += eDiff * (1 - Math.pow(0.001, dt));
        needsUpdate = true;
      } else {
        s.emissives[i] = targetE;
      }

      // Color
      const targetHex = phaseColors[phase as keyof typeof phaseColors] ?? 0x1a1a2e;
      tempColor.set(targetHex);

      // Blend emissive
      if (s.emissives[i] > 0.1) {
        const eCol = phaseEmissiveColors[phase as keyof typeof phaseEmissiveColors];
        if (eCol) {
          const blend = Math.min(s.emissives[i] * 0.2, 0.5);
          tempColor.lerp(eCol, blend);
        }
      }

      const colorLerp = 1 - Math.pow(0.001, dt);
      if (
        Math.abs(s.colors[i].r - tempColor.r) > 0.005 ||
        Math.abs(s.colors[i].g - tempColor.g) > 0.005 ||
        Math.abs(s.colors[i].b - tempColor.b) > 0.005
      ) {
        s.colors[i].lerp(tempColor, colorLerp);
        needsUpdate = true;
      }

      // Transform
      const row = Math.floor(i / HERO_COLS);
      const col = i % HERO_COLS;
      const x = col - HERO_COLS / 2 + 0.5;
      const z = row - HERO_ROWS / 2 + 0.5;

      tempObject.position.set(x, s.heights[i] / 2, z);
      tempObject.scale.set(0.88, Math.max(0.01, s.heights[i]), 0.88);
      tempObject.updateMatrix();

      meshRef.current.setMatrixAt(i, tempObject.matrix);
      meshRef.current.setColorAt(i, s.colors[i]);
    }

    if (needsUpdate) {
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        vertexColors
        roughness={0.35}
        metalness={0.1}
        emissive="#8b5cf6"
        emissiveIntensity={0.2}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

/**
 * HeroScene — Landing page 3D background.
 *
 * Self-contained R3F canvas with a mini grid running A* in a loop.
 * Non-interactive, purely cinematic.
 */
export default function HeroScene() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 16, 20], fov: 45, near: 0.1, far: 100 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 5]} intensity={0.6} />

        <HeroGrid shouldAnimate={!prefersReducedMotion} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate={!prefersReducedMotion}
          autoRotateSpeed={0.3}
        />

        <EffectComposer>
          <Bloom
            intensity={0.4}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
