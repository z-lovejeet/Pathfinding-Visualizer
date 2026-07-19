'use client';

import React from 'react';
import { useVisualizerStore } from '@/store/useVisualizerStore';

/**
 * Lights — City-themed lighting rig.
 *
 * - Warm ambient for base fill (city glow feel)
 * - Directional key light with shadows for buildings
 * - Indigo fill light for cool contrast
 * - Dynamic point lights tracking start (cyan) and end (purple) persons
 * - Warm corner street lamps for city atmosphere
 */
export default function Lights() {
  const startPos = useVisualizerStore((s) => s.startPos);
  const endPos = useVisualizerStore((s) => s.endPos);
  const rows = useVisualizerStore((s) => s.rows);
  const cols = useVisualizerStore((s) => s.cols);

  const startX = startPos.col - cols / 2 + 0.5;
  const startZ = startPos.row - rows / 2 + 0.5;
  const endX = endPos.col - cols / 2 + 0.5;
  const endZ = endPos.row - rows / 2 + 0.5;

  // Corner positions for street lamps
  const hw = cols / 2 - 2;
  const hh = rows / 2 - 2;

  return (
    <>
      {/* Warm ambient fill — city glow */}
      <ambientLight intensity={0.25} color="#cbd5e1" />

      {/* Key directional light with shadows */}
      <directionalLight
        position={[10, 15, 10]}
        intensity={0.7}
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

      {/* Cool fill light from opposite side */}
      <directionalLight
        position={[-8, 10, -8]}
        intensity={0.25}
        color="#94a3b8"
      />

      {/* Blue point light tracking Person A */}
      <pointLight
        position={[startX, 2, startZ]}
        intensity={4}
        color="#3b82f6"
        distance={12}
        decay={2}
      />

      {/* Pink point light tracking Person B */}
      <pointLight
        position={[endX, 2, endZ]}
        intensity={4}
        color="#ec4899"
        distance={12}
        decay={2}
      />

      {/* Street lamp corner lights — clean glow */}
      <pointLight position={[-hw, 3, -hh]} intensity={1.0} color="#e2e8f0" distance={18} decay={2} />
      <pointLight position={[hw, 3, -hh]} intensity={1.0} color="#e2e8f0" distance={18} decay={2} />
      <pointLight position={[-hw, 3, hh]} intensity={1.0} color="#e2e8f0" distance={18} decay={2} />
      <pointLight position={[hw, 3, hh]} intensity={1.0} color="#e2e8f0" distance={18} decay={2} />
    </>
  );
}
