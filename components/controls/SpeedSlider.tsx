'use client';

import React from 'react';
import { useVisualizerStore } from '@/store/useVisualizerStore';

const speedLevels = [
  { max: 15, label: 'Slow', color: '#8888aa' },
  { max: 35, label: 'Medium', color: '#f0f0f5' },
  { max: 65, label: 'Fast', color: '#00d4ff' },
  { max: 85, label: 'Turbo', color: '#a855f7' },
  { max: 101, label: '⚡', color: '#fbbf24' },
];

/**
 * SpeedSlider — Glass-styled range slider with gradient fill track,
 * tick marks, and color-coded speed labels.
 */
export default function SpeedSlider() {
  const speed = useVisualizerStore((s) => s.speed);
  const setSpeed = useVisualizerStore((s) => s.setSpeed);

  const currentLevel = speedLevels.find((l) => speed <= l.max) || speedLevels[4];
  const fillPercent = ((speed - 1) / 99) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-[#8888aa] uppercase tracking-wider">
          Speed
        </label>
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs font-semibold transition-colors duration-200"
            style={{ color: currentLevel.color }}
          >
            {currentLevel.label}
          </span>
          <span className="text-[10px] font-mono text-[#555577] tabular-nums">
            {speed}
          </span>
        </div>
      </div>

      {/* Slider with gradient fill */}
      <div className="relative h-[18px] flex items-center">
        {/* Gradient fill track */}
        <div
          className="glass-slider-fill"
          style={{ width: `${fillPercent}%` }}
        />

        {/* Native range input */}
        <input
          type="range"
          className="glass-slider relative z-10"
          min={1}
          max={100}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
      </div>

      {/* Tick marks */}
      <div className="flex justify-between px-[1px]">
        {['Slow', 'Med', 'Fast', 'Turbo', '⚡'].map((tick) => (
          <span key={tick} className="text-[9px] text-[#555577]">{tick}</span>
        ))}
      </div>
    </div>
  );
}
