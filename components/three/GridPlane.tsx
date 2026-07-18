'use client';

import React from 'react';
import { Grid } from '@react-three/drei';
import { useVisualizerStore } from '@/store/useVisualizerStore';

/**
 * GridPlane — Subtle ground plane beneath the 3D grid.
 * Shows faint grid lines to help with spatial orientation.
 */
export default function GridPlane() {
  const rows = useVisualizerStore((s) => s.rows);
  const cols = useVisualizerStore((s) => s.cols);

  return (
    <group position={[0, -0.01, 0]}>
      {/* Subtle grid helper from drei */}
      <Grid
        args={[cols + 6, rows + 6]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1a1a2e"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#252540"
        fadeDistance={60}
        fadeStrength={1.5}
        infiniteGrid={false}
      />
      {/* Solid dark ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[cols + 10, rows + 10]} />
        <meshStandardMaterial
          color="#0a0a0f"
          roughness={1}
          metalness={0}
          transparent
          opacity={0.95}
        />
      </mesh>
    </group>
  );
}
