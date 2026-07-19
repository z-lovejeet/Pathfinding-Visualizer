'use client';

import React from 'react';
import { useVisualizerStore } from '@/store/useVisualizerStore';

/**
 * GridPlane — Solid dark ground beneath the miniature city.
 * No grid lines — just a clean dark surface that receives shadows.
 */
export default function GridPlane() {
  const rows = useVisualizerStore((s) => s.rows);
  const cols = useVisualizerStore((s) => s.cols);

  return (
    <group position={[0, -0.01, 0]}>
      {/* Solid dark ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[cols + 10, rows + 10]} />
        <meshStandardMaterial
          color="#0d0d12"
          roughness={1}
          metalness={0}
          transparent
          opacity={0.95}
        />
      </mesh>
    </group>
  );
}
