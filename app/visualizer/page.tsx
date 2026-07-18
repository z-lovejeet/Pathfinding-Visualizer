'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import ControlPanel from '@/components/controls/ControlPanel';
import StatsPanel from '@/components/stats/StatsPanel';
import Legend from '@/components/legend/Legend';
import { NoPathModal } from '@/components/ui/NoPathModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// Dynamic import to prevent Three.js SSR — R3F requires browser APIs
const Scene = dynamic(() => import('@/components/three/Scene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#050508]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-[#8b5cf6]/20 border border-white/10 flex items-center justify-center animate-pulse">
          <div className="w-6 h-6 rounded-md bg-[#00d4ff]/30" />
        </div>
        <p className="text-sm text-[#8888aa] font-medium">Loading 3D Scene...</p>
      </div>
    </div>
  ),
});

/**
 * Visualizer Page — The core experience.
 *
 * Full-viewport 3D grid with floating glass control panels.
 */
export default function VisualizerPage() {
  useKeyboardShortcuts();

  return (
    <div className="flex-1 relative bg-[#050508] overflow-hidden">
      {/* 3D Canvas — fills entire viewport below navbar */}
      <Scene />

      {/* Glass overlays — absolutely positioned over the canvas */}
      <ControlPanel />
      <StatsPanel />
      <Legend />

      {/* No path found modal */}
      <NoPathModal />
    </div>
  );
}
