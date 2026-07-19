'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualizerStore } from '@/store/useVisualizerStore';

/**
 * Beacons — Miniature 3D person models for Start and End points.
 *
 * Each person is a group with: ground glow disc, capsule body,
 * sphere head, and floating diamond marker above.
 * Positions track startPos/endPos reactively from the store.
 */
export default function Beacons() {
  const startPos = useVisualizerStore((s) => s.startPos);
  const endPos = useVisualizerStore((s) => s.endPos);
  const rows = useVisualizerStore((s) => s.rows);
  const cols = useVisualizerStore((s) => s.cols);

  const startRef = useRef<THREE.Group>(null);
  const endRef = useRef<THREE.Group>(null);
  const startMarkerRef = useRef<THREE.Mesh>(null);
  const endMarkerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    const sx = startPos.col - cols / 2 + 0.5;
    const sz = startPos.row - rows / 2 + 0.5;
    const ex = endPos.col - cols / 2 + 0.5;
    const ez = endPos.row - rows / 2 + 0.5;

    // Position person groups on top of road tiles
    if (startRef.current) {
      startRef.current.position.set(sx, 0.08, sz);
    }
    if (endRef.current) {
      endRef.current.position.set(ex, 0.08, ez);
    }

    // Animate floating markers (bob + rotate)
    if (startMarkerRef.current) {
      startMarkerRef.current.position.y = 0.75 + Math.sin(time * 3) * 0.08;
      startMarkerRef.current.rotation.y += 0.025;
    }
    if (endMarkerRef.current) {
      endMarkerRef.current.position.y = 0.75 + Math.sin(time * 3 + Math.PI) * 0.08;
      endMarkerRef.current.rotation.y -= 0.025;
    }
  });

  return (
    <>
      {/* ─── Person A (Start) — Cyan ─── */}
      <group ref={startRef}>
        {/* Ground glow disc */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <circleGeometry args={[0.35, 16]} />
          <meshStandardMaterial
            color="#14b8a6"
            emissive="#14b8a6"
            emissiveIntensity={2}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Body */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.18, 4, 8]} />
          <meshStandardMaterial
            color="#14b8a6"
            emissive="#14b8a6"
            emissiveIntensity={1.2}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color="#e6fffb"
            emissive="#14b8a6"
            emissiveIntensity={0.6}
            roughness={0.4}
          />
        </mesh>

        {/* Floating marker diamond */}
        <mesh ref={startMarkerRef} position={[0, 0.75, 0]}>
          <octahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial
            color="#14b8a6"
            emissive="#14b8a6"
            emissiveIntensity={3}
            roughness={0.2}
            metalness={0.8}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ─── Person B (End) — Purple ─── */}
      <group ref={endRef}>
        {/* Ground glow disc */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <circleGeometry args={[0.35, 16]} />
          <meshStandardMaterial
            color="#f43f5e"
            emissive="#f43f5e"
            emissiveIntensity={2}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Body */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.18, 4, 8]} />
          <meshStandardMaterial
            color="#f43f5e"
            emissive="#f43f5e"
            emissiveIntensity={1.2}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color="#fff1f2"
            emissive="#f43f5e"
            emissiveIntensity={0.6}
            roughness={0.4}
          />
        </mesh>

        {/* Floating marker diamond */}
        <mesh ref={endMarkerRef} position={[0, 0.75, 0]}>
          <octahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial
            color="#f43f5e"
            emissive="#f43f5e"
            emissiveIntensity={3}
            roughness={0.2}
            metalness={0.8}
            toneMapped={false}
          />
        </mesh>
      </group>
    </>
  );
}
