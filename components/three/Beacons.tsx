'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { NODE_COLORS } from '@/lib/constants';

/**
 * Beacons — Distinct floating 3D objects for Start and End points.
 * 
 * Renders two octahedrons that smoothly bob up and down and rotate.
 * Positions update reactively when the user moves start/end via the store.
 */
export default function Beacons() {
  const startPos = useVisualizerStore((s) => s.startPos);
  const endPos = useVisualizerStore((s) => s.endPos);
  const rows = useVisualizerStore((s) => s.rows);
  const cols = useVisualizerStore((s) => s.cols);
  
  const startRef = useRef<THREE.Mesh>(null);
  const endRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Recompute world positions every frame so they track dragged start/end
    const sx = startPos.col - cols / 2 + 0.5;
    const sz = startPos.row - rows / 2 + 0.5;
    const ex = endPos.col - cols / 2 + 0.5;
    const ez = endPos.row - rows / 2 + 0.5;

    if (startRef.current) {
      startRef.current.position.set(sx, 0.8 + Math.sin(time * 3) * 0.15, sz);
      startRef.current.rotation.y += 0.02;
    }
    if (endRef.current) {
      endRef.current.position.set(ex, 0.8 + Math.sin(time * 3 + Math.PI) * 0.15, ez);
      endRef.current.rotation.y -= 0.02;
    }
  });

  return (
    <>
      {/* Start Beacon — Floating cyan octahedron */}
      <mesh ref={startRef} position={[0, 0.8, 0]} castShadow>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial 
          color={NODE_COLORS.start.css} 
          emissive={NODE_COLORS.start.css} 
          emissiveIntensity={2.5} 
          roughness={0.2} 
          metalness={0.8} 
        />
      </mesh>
      
      {/* End Beacon — Floating red octahedron */}
      <mesh ref={endRef} position={[0, 0.8, 0]} castShadow>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial 
          color={NODE_COLORS.end.css} 
          emissive={NODE_COLORS.end.css} 
          emissiveIntensity={2.5} 
          roughness={0.2} 
          metalness={0.8} 
        />
      </mesh>
    </>
  );
}
