'use client';

import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

/**
 * PostProcessing — Bloom glow + Vignette focus.
 *
 * Makes emissive nodes (visited, path, start, end) glow dramatically.
 * Vignette focuses attention on the center of the scene.
 */
export default function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.4}
        luminanceSmoothing={0.9}
        intensity={1.2}
        mipmapBlur
      />
      <Vignette
        eskil={false}
        offset={0.1}
        darkness={0.7}
      />
    </EffectComposer>
  );
}
