'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import GridMesh from './GridMesh';
import GridPlane from './GridPlane';
import Lights from './Lights';
import CameraController from './CameraController';
import RaycastHandler from './RaycastHandler';
import PostProcessing from './PostProcessing';
import Beacons from './Beacons';

/**
 * Scene — Root R3F Canvas wrapper.
 *
 * Sets up the Three.js scene with camera, lighting, grid, interaction,
 * and post-processing. Wrapped in Suspense with a loading fallback.
 */
export default function Scene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 18, 22], fov: 50 }}
        dpr={[1, 1.5]}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ background: '#050508' }}
      >
        <Suspense fallback={null}>
          {/* Fog for depth */}
          <fog attach="fog" args={['#050508', 30, 65]} />

          {/* Camera controls */}
          <CameraController />

          {/* Lighting rig */}
          <Lights />

          {/* Ground plane with grid lines */}
          <GridPlane />

          {/* Floating Start/End Beacons */}
          <Beacons />

          {/* The main InstancedMesh grid */}
          <GridMesh />

          {/* Invisible raycast plane for mouse interaction */}
          <RaycastHandler />

          {/* Post-processing effects */}
          <PostProcessing />
        </Suspense>
      </Canvas>
    </div>
  );
}
