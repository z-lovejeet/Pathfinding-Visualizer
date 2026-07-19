'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Scale3d, Eraser, Navigation, Target, LucideIcon, ChevronUp, ChevronDown, Settings2, Info } from 'lucide-react';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { InteractionMode } from '@/lib/grid/types';
import { ALGORITHM_INFO } from '@/lib/constants';
import AlgorithmSelector from './AlgorithmSelector';
import SpeedSlider from './SpeedSlider';
import MazeSelector from './MazeSelector';
import ActionButtons from './ActionButtons';

/**
 * ControlPanel — Floating glass panel overlaid on the 3D scene.
 *
 * Desktop: Fixed left sidebar (scrollable) with collapsible info + shortcut hints.
 * Mobile: Collapsible bottom sheet with toggle button.
 */
export default function ControlPanel() {
  const interactionMode = useVisualizerStore((s) => s.interactionMode);
  const setInteractionMode = useVisualizerStore((s) => s.setInteractionMode);
  const isVisualizing = useVisualizerStore((s) => s.isVisualizing);
  const algorithm = useVisualizerStore((s) => s.algorithm);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(false);

  const algoInfo = ALGORITHM_INFO[algorithm];

  const modes: { mode: InteractionMode; label: string; icon: LucideIcon }[] = [
    { mode: 'wall', label: 'Wall', icon: Box },
    { mode: 'weight', label: 'Weight', icon: Scale3d },
    { mode: 'erase', label: 'Erase', icon: Eraser },
    { mode: 'start', label: 'Start', icon: Navigation },
    { mode: 'end', label: 'End', icon: Target },
  ];

  const panelContent = (
    <>
      {/* Algorithm selection */}
      <AlgorithmSelector />

      {/* Speed control */}
      <SpeedSlider />

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Maze generator */}
      <MazeSelector />

      {/* Interaction mode selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#8888aa] uppercase tracking-wider">
          Tool
        </label>
        <div className="flex gap-1" role="group" aria-label="Grid editing tool">
          {modes.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setInteractionMode(mode)}
              disabled={isVisualizing}
              aria-pressed={interactionMode === mode}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all duration-200 text-xs
                ${
                  interactionMode === mode
                    ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 shadow-[0_0_12px_rgba(0,212,255,0.15)]'
                    : 'text-[#8888aa] hover:text-[#f0f0f5] hover:bg-white/5 border border-transparent'
                }
                ${isVisualizing ? 'opacity-40 pointer-events-none' : ''}
              `}
              title={label}
            >
              <Icon size={16} aria-hidden="true" />
              <span className="font-medium leading-none">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Action buttons */}
      <ActionButtons />
    </>
  );

  return (
    <>
      {/* Desktop panel — top-left sidebar, scrollable */}
      <motion.div
        className="absolute top-4 left-4 z-10 glass-elevated w-[260px] rounded-2xl hidden md:flex md:flex-col"
        style={{ maxHeight: 'calc(100vh - 120px)' }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring' as const, stiffness: 200, damping: 20, delay: 0.05 }}
      >
        {/* Scrollable content area */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1 scrollbar-hide">
          {panelContent}
        </div>

        {/* Fixed footer — Info + Shortcuts (always visible) */}
        <div className="border-t border-white/5 p-3 flex flex-col gap-2 shrink-0">
          {/* Collapsible Algorithm Info section */}
          <button
            type="button"
            onClick={() => setInfoExpanded(!infoExpanded)}
            className="flex items-center gap-1.5 text-[#8888aa] hover:text-[#f0f0f5] transition-colors duration-200 w-full"
            aria-expanded={infoExpanded}
            aria-controls="algorithm-information"
          >
            <Info size={12} aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-wider">Info</span>
            <ChevronDown
              size={12}
              aria-hidden="true"
              className={`ml-auto transition-transform duration-200 ${infoExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {infoExpanded && (
              <motion.div
                id="algorithm-information"
                className="overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              >
                <div className="pb-2 flex flex-col gap-1">
                  <p className="text-[11px] text-[#8888aa] leading-relaxed">
                    {algoInfo.description}
                  </p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1">
                    <span className="text-[10px] text-[#555577]">Time</span>
                    <span className="text-[10px] font-mono text-[#00d4ff]">{algoInfo.timeComplexity}</span>
                    <span className="text-[10px] text-[#555577]">Space</span>
                    <span className="text-[10px] font-mono text-[#8b5cf6]">O(V)</span>
                    <span className="text-[10px] text-[#555577]">Optimal</span>
                    <span className={`text-[10px] font-medium ${algoInfo.isShortest ? 'text-emerald-400' : 'text-red-400'}`}>
                      {algoInfo.isShortest ? '✓ Yes' : '✗ No'}
                    </span>
                    <span className="text-[10px] text-[#555577]">Weights</span>
                    <span className={`text-[10px] font-medium ${algoInfo.isWeighted ? 'text-purple-400' : 'text-gray-400'}`}>
                      {algoInfo.isWeighted ? '✓ Yes' : '✗ No'}
                    </span>
                    <span className="text-[10px] text-[#555577]">Structure</span>
                    <span className="text-[10px] font-mono text-[#fbbf24]">{algoInfo.dataStructure}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Keyboard shortcut hint bar */}
          <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-white/5">
            <span className="kbd-badge">Space</span>
            <span className="text-[8px] text-[#555577]">Run</span>
            <span className="text-[8px] text-[#555577] mx-0.5">·</span>
            <span className="kbd-badge">C</span>
            <span className="text-[8px] text-[#555577]">Clear</span>
            <span className="text-[8px] text-[#555577] mx-0.5">·</span>
            <span className="kbd-badge">R</span>
            <span className="text-[8px] text-[#555577]">Camera</span>
          </div>
        </div>
      </motion.div>

      {/* Mobile — bottom sheet */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-20">
        {/* Toggle button (always visible) */}
        <button
          type="button"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="w-full glass-elevated p-3 rounded-2xl flex items-center justify-between"
          aria-expanded={mobileExpanded}
          aria-controls="mobile-visualizer-controls"
        >
          <div className="flex items-center gap-2">
            <Settings2 size={16} className="text-[#00d4ff]" aria-hidden="true" />
            <span className="text-sm font-medium text-[#f0f0f5]">Controls</span>
          </div>
          <ChevronUp
            size={16}
            aria-hidden="true"
            className={`text-[#8888aa] transition-transform duration-300 ${mobileExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Expandable panel */}
        <AnimatePresence>
          {mobileExpanded && (
            <motion.div
              id="mobile-visualizer-controls"
              className="glass-elevated p-4 rounded-2xl mt-2 flex flex-col gap-4 max-h-[60vh] overflow-y-auto"
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            >
              {panelContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
