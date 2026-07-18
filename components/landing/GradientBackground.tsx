'use client';

import React from 'react';

/**
 * GradientBackground — Animated mesh gradient background with drifting orbs.
 *
 * Pure CSS animation, zero JS runtime cost.
 * Use on non-visualizer pages (landing, learn) for ambient depth.
 */
export default function GradientBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Cyan orb — top-right */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-30"
        style={{
          top: '10%',
          right: '15%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
          animation: 'orbDrift1 12s ease-in-out infinite',
        }}
      />

      {/* Purple orb — bottom-left */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-30"
        style={{
          bottom: '15%',
          left: '10%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
          animation: 'orbDrift2 15s ease-in-out infinite',
        }}
      />

      {/* Gold orb — center */}
      <div
        className="absolute w-[350px] h-[350px] rounded-full opacity-20"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)',
          animation: 'orbDrift3 18s ease-in-out infinite',
        }}
      />
    </div>
  );
}
