'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle } from 'lucide-react';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { ALGORITHM_INFO } from '@/lib/constants';
import { AlgorithmType } from '@/lib/grid/types';

const algorithms = Object.entries(ALGORITHM_INFO) as [AlgorithmType, typeof ALGORITHM_INFO[AlgorithmType]][];

/**
 * AlgorithmSelector — Custom glass dropdown with rich algorithm descriptions,
 * complexity badges, and data structure tags.
 */
export default function AlgorithmSelector() {
  const algorithm = useVisualizerStore((s) => s.algorithm);
  const setAlgorithm = useVisualizerStore((s) => s.setAlgorithm);
  const isVisualizing = useVisualizerStore((s) => s.isVisualizing);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const menuId = useId();
  const selectedAlgorithmId = useId();

  const currentAlgo = ALGORITHM_INFO[algorithm];

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (key: AlgorithmType) => {
    setAlgorithm(key);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
      <label id={labelId} className="text-xs font-medium text-[#8888aa] uppercase tracking-wider">
        Algorithm
      </label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !isVisualizing && setIsOpen(!isOpen)}
        disabled={isVisualizing}
        aria-labelledby={`${labelId} ${selectedAlgorithmId}`}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="listbox"
        className={`w-full flex items-center justify-between gap-2 glass-select text-sm py-2 px-3 text-left
          ${isVisualizing ? 'opacity-40 pointer-events-none' : 'cursor-pointer'}
        `}
      >
        <span id={selectedAlgorithmId} className="text-[#f0f0f5] font-medium truncate">{currentAlgo.name}</span>
        <ChevronDown
          size={14}
          className={`text-[#8888aa] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={menuId}
            role="listbox"
            aria-labelledby={labelId}
            className="absolute top-full left-0 right-0 mt-1.5 z-50 glass-dropdown p-1.5 max-h-[320px] overflow-y-auto"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
          >
            {algorithms.map(([key, info]) => {
              const isSelected = key === algorithm;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelect(key)}
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group
                    ${isSelected
                      ? 'bg-[#00d4ff]/10 border-l-2 border-[#00d4ff]'
                      : 'border-l-2 border-transparent hover:bg-white/5'
                    }
                  `}
                >
                  {/* Name + check */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${isSelected ? 'text-[#00d4ff]' : 'text-[#f0f0f5]'}`}>
                      {info.name}
                    </span>
                    {isSelected && <CheckCircle size={12} className="text-[#00d4ff] ml-auto shrink-0" aria-hidden="true" />}
                  </div>

                  {/* Description */}
                  <p className="text-[10px] text-[#8888aa] leading-relaxed mb-1.5">
                    {info.description}
                  </p>

                  {/* Badges row */}
                  <div className="flex flex-wrap gap-1">
                    {/* Optimal badge */}
                    <span
                      className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                        info.isShortest
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {info.isShortest ? '✓ Optimal' : '✗ Non-optimal'}
                    </span>

                    {/* Weighted badge */}
                    <span
                      className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                        info.isWeighted
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}
                    >
                      {info.isWeighted ? '⚖ Weighted' : '○ Unweighted'}
                    </span>

                    {/* Data structure tag */}
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#00d4ff]/5 text-[#00d4ff]/70 border border-[#00d4ff]/10">
                      {info.dataStructure}
                    </span>

                    {/* Time complexity */}
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/3 text-[#555577] border border-white/5">
                      {info.timeComplexity}
                    </span>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
