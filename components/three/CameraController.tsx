'use client';

import React, { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

// Default camera position
const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 22, 28);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

/**
 * CameraController — OrbitControls with constrained angles + smooth reset.
 *
 * Press R to smoothly interpolate camera back to the default position.
 * Uses cameraResetTrigger from store to detect reset requests.
 */
export default function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const isResettingRef = useRef(false);
  const resetProgressRef = useRef(0);
  const { camera } = useThree();

  const cameraResetTrigger = useVisualizerStore((s) => s.cameraResetTrigger);

  // Watch for reset trigger
  useEffect(() => {
    if (cameraResetTrigger > 0) {
      isResettingRef.current = true;
      resetProgressRef.current = 0;
    }
  }, [cameraResetTrigger]);

  // Smooth camera reset animation
  useFrame((_, delta) => {
    if (!isResettingRef.current || !controlsRef.current) return;

    resetProgressRef.current += delta * 2.5; // ~400ms total
    const t = Math.min(resetProgressRef.current, 1);
    // Smooth step easing
    const eased = t * t * (3 - 2 * t);

    camera.position.lerp(DEFAULT_CAMERA_POS, eased);
    controlsRef.current.target.lerp(DEFAULT_TARGET, eased);
    controlsRef.current.update();

    if (t >= 1) {
      isResettingRef.current = false;
      camera.position.copy(DEFAULT_CAMERA_POS);
      controlsRef.current.target.copy(DEFAULT_TARGET);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={10}
      maxDistance={45}
      minPolarAngle={Math.PI / 8}
      maxPolarAngle={Math.PI / 2.2}
      target={[0, 0, 0]}
      enablePan
      panSpeed={0.8}
      rotateSpeed={0.6}
      zoomSpeed={1.2}
      makeDefault
    />
  );
}
