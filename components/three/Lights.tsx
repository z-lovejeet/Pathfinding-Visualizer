'use client';

import React from 'react';
import { useVisualizerStore } from '@/store/useVisualizerStore';

/**
 * Lights — Lighting rig for the 3D scene.
 *
 * - Ambient light for base fill
 * - Directional light as key light with shadows
 * - Dynamic point lights at start (cyan) and end (red) node positions
 */
export default function Lights() {
  const startPos = useVisualizerStore((s) => s.startPos);
  const endPos = useVisualizerStore((s) => s.endPos);
  const rows = useVisualizerStore((s) => s.rows);
  const cols = useVisualizerStore((s) => s.cols);

  // Convert grid positions to 3D coordinates
  const startX = startPos.col - cols / 2 + 0.5;
  const startZ = startPos.row - rows / 2 + 0.5;
  const endX = endPos.col - cols / 2 + 0.5;
  const endZ = endPos.row - rows / 2 + 0.5;

  return (
    <>
      {/* Base ambient fill */}
      <ambientLight intensity={0.3} color="#b0b0cc" />

      {/* Key directional light with shadows */}
      <directionalLight
        position={[10, 15, 10]}
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Fill light from opposite side */}
      <directionalLight
        position={[-8, 10, -8]}
        intensity={0.3}
        color="#6366f1"
      />

      {/* Cyan point light at start node */}
      <pointLight
        position={[startX, 2, startZ]}
        intensity={4}
        color="#00d4ff"
        distance={15}
        decay={2}
      />

      {/* Red point light at end node */}
      <pointLight
        position={[endX, 2, endZ]}
        intensity={4}
        color="#ff4757"
        distance={15}
        decay={2}
      />
    </>
  );
}
