'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { getEmissiveColor, getNodeColor } from '@/lib/animation/colorUtils';
import { NODE_PHASE } from '@/lib/animation/AnimationEngine';
import { NODE_COLORS } from '@/lib/constants';

/**
 * GridMesh — InstancedMesh rendering of the entire grid.
 *
 * Uses a single InstancedMesh for all 1,250 nodes (25×50) for maximum performance.
 * Reads animation buffers from AnimationEngine for cinematic spring-physics
 * height interpolation with overshoot (visited) and elastic bounce (path).
 *
 * Per-instance emissive glow is achieved by blending the base color toward
 * a bright emissive tint based on the emissive intensity buffer.
 */
export default function GridMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const grid = useVisualizerStore((s) => s.grid);
  const rows = useVisualizerStore((s) => s.rows);
  const cols = useVisualizerStore((s) => s.cols);
  const animationEngine = useVisualizerStore((s) => s.animationEngine);

  const count = rows * cols;

  // Temp objects for instance matrix calculation
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempTargetColor = useMemo(() => new THREE.Color(), []);
  const tempEmissiveColor = useMemo(() => new THREE.Color(), []);

  // State arrays for smooth interpolation
  const stateRef = useRef<{
    heights: Float32Array;
    velocities: Float32Array; // For spring physics
    colors: THREE.Color[];
    emissives: Float32Array;
  } | null>(null);
  const needsRenderRef = useRef(true);

  // Keep imperative spring state outside React's render state. Reinitialize it
  // after a grid resize, before the next visible animation frame.
  useEffect(() => {
    stateRef.current = {
      heights: new Float32Array(count).fill(0.1),
      velocities: new Float32Array(count), // spring velocity
      colors: Array.from({ length: count }, () => new THREE.Color(0x1a1a2e)),
      emissives: new Float32Array(count),
    };
    needsRenderRef.current = true;
  }, [count]);

  // Once the spring state has settled, there is no need to rewrite all 1,250
  // instance matrices every frame. An engine remains polled while it is active
  // because it can update its buffers independently of React.
  useEffect(() => {
    needsRenderRef.current = true;
  }, [animationEngine, grid]);

  // Get emissive color for a node phase
  const getPhaseEmissiveColor = (phase: number): number => {
    switch (phase) {
      case NODE_PHASE.CURRENT: return 0x22d3ee; // Bright cyan
      case NODE_PHASE.VISITED: return 0x8b5cf6; // Purple
      case NODE_PHASE.PATH: return 0xfbbf24;    // Gold
      default: return 0x000000;
    }
  };

  useFrame((_, delta) => {
    const animationState = stateRef.current;
    if (!meshRef.current || !grid || grid.length === 0 || !animationState) return;
    if (!animationEngine && !needsRenderRef.current) return;
    const forceUpload = needsRenderRef.current;

    const { heights, velocities, colors, emissives } = animationState;
    const buffers = animationEngine?.getBuffers();

    // Clamp delta to prevent huge jumps on tab-switch
    const dt = Math.min(delta, 0.05);

    let needsUpdate = false;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        const node = grid[row]?.[col];
        if (!node) continue;

        // ─── TARGET HEIGHT ───
        // If animation engine has buffers, use those; otherwise fall back to node data
        let targetHeight = node.height || 0.1;
        const activeBuffers =
          buffers?.activeNodes[index] === 1 ? buffers : null;
        const isAnimated = activeBuffers !== null;

        // Engine buffers only own cells it has explicitly animated. Preserve
        // semantic wall and weight heights even when a weighted node is visited.
        if (activeBuffers && node.type !== 'wall' && node.type !== 'weight') {
          targetHeight = activeBuffers.targetHeights[index];
        }

        // ─── SPRING PHYSICS INTERPOLATION ───
        // Critical damping spring: feels organic with overshoot
        const phase = activeBuffers
          ? activeBuffers.nodePhase[index]
          : NODE_PHASE.IDLE;
        let stiffness: number;
        let damping: number;

        switch (phase) {
          case NODE_PHASE.CURRENT:
            stiffness = 400; damping = 28; // Fast snap
            break;
          case NODE_PHASE.VISITED:
            stiffness = 180; damping = 12; // Overshoot bounce (like back.out)
            break;
          case NODE_PHASE.PATH:
            stiffness = 120; damping = 8;  // Elastic bounce
            break;
          default:
            stiffness = 200; damping = 20; // Default smooth
        }

        const displacement = targetHeight - heights[index];
        const springForce = stiffness * displacement;
        const dampingForce = damping * velocities[index];
        const acceleration = springForce - dampingForce;

        velocities[index] += acceleration * dt;
        heights[index] += velocities[index] * dt;

        // Settle when close enough
        if (Math.abs(displacement) < 0.001 && Math.abs(velocities[index]) < 0.001) {
          heights[index] = targetHeight;
          velocities[index] = 0;
        } else {
          needsUpdate = true;
        }

        // ─── EMISSIVE INTENSITY ───
        let targetEmissive = node.emissiveIntensity;
        if (activeBuffers) {
          targetEmissive = activeBuffers.targetEmissives[index];
        }

        // Smooth lerp for emissive
        const emissiveLerp = 1 - Math.pow(0.001, dt);
        if (Math.abs(emissives[index] - targetEmissive) > 0.01) {
          emissives[index] += (targetEmissive - emissives[index]) * emissiveLerp;
          needsUpdate = true;
        } else {
          emissives[index] = targetEmissive;
        }

        // ─── COLOR ───
        // Base color from node state
        let targetHex = getNodeColor(node);

        // Override with phase-based color when animation engine is active
        if (isAnimated && phase > NODE_PHASE.IDLE) {
          switch (phase) {
            case NODE_PHASE.CURRENT:
              targetHex = NODE_COLORS.current.hex;
              break;
            case NODE_PHASE.VISITED:
              targetHex = NODE_COLORS.visited.hex;
              break;
            case NODE_PHASE.PATH:
              targetHex = NODE_COLORS.path.hex;
              break;
          }
        }

        tempTargetColor.set(targetHex);

        // Blend emissive glow into the display color for per-instance bloom effect
        if (emissives[index] > 0.1) {
          const emissiveHex =
            phase > NODE_PHASE.IDLE
              ? getPhaseEmissiveColor(phase)
              : getEmissiveColor(node);
          tempEmissiveColor.set(emissiveHex);
          // Additive blend: mix base color with emissive based on intensity
          const blendFactor = Math.min(emissives[index] * 0.15, 0.6);
          tempTargetColor.lerp(tempEmissiveColor, blendFactor);
        }

        // Smooth color interpolation
        const colorLerp = 1 - Math.pow(0.0005, dt);
        if (
          Math.abs(colors[index].r - tempTargetColor.r) > 0.005 ||
          Math.abs(colors[index].g - tempTargetColor.g) > 0.005 ||
          Math.abs(colors[index].b - tempTargetColor.b) > 0.005
        ) {
          colors[index].lerp(tempTargetColor, colorLerp);
          needsUpdate = true;
        } else {
          colors[index].copy(tempTargetColor);
        }

        // ─── APPLY MATRICES AND COLORS ───
        const x = col - cols / 2 + 0.5;
        const z = row - rows / 2 + 0.5;

        tempObject.position.set(x, heights[index] / 2, z);
        tempObject.scale.set(0.9, Math.max(0.01, heights[index]), 0.9);
        tempObject.updateMatrix();

        meshRef.current.setMatrixAt(index, tempObject.matrix);
        meshRef.current.setColorAt(index, colors[index]);
      }
    }

    if (needsUpdate || forceUpload) {
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }
    }

    if (!animationEngine) needsRenderRef.current = needsUpdate;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        vertexColors
        roughness={0.3}
        metalness={0.15}
        emissive="#8b5cf6"
        emissiveIntensity={0.3}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
