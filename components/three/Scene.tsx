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
 * Scene — Root R3F Canvas for the miniature city visualizer.
 *
 * Sets up Three.js scene with city lighting, ground plane, buildings/roads/trees,
 * person markers, mouse interaction, and post-processing.
 */
export default function Scene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 20, 24], fov: 50 }}
        dpr={[1, 1.5]}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ background: '#0f172a' }}
      >
        <Suspense fallback={null}>
          {/* Fog for depth — city atmosphere */}
          <fog attach="fog" args={['#0f172a', 30, 65]} />

          {/* Camera controls */}
          <CameraController />

          {/* City lighting rig */}
          <Lights />

          {/* Dark ground plane */}
          <GridPlane />

          {/* Person markers for Start/End */}
          <Beacons />

          {/* Miniature city: roads, buildings, trees */}
          <GridMesh />

          {/* Invisible raycast plane for mouse interaction */}
          <RaycastHandler />

          {/* Post-processing: bloom + vignette */}
          <PostProcessing />
        </Suspense>
      </Canvas>
    </div>
  );
}

