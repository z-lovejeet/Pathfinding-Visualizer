'use client';

import React, { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { MazeType } from '@/lib/grid/types';
import { MAZE_INFO } from '@/lib/constants';

const mazeTypes = Object.entries(MAZE_INFO) as [MazeType, typeof MAZE_INFO[MazeType]][];

/**
 * MazeSelector — Glass dropdown + generate button with animated description
 * swap, spinning icon feedback, and difficulty dot indicator.
 */
export default function MazeSelector() {
  const mazeType = useVisualizerStore((s) => s.mazeType);
  const setMazeType = useVisualizerStore((s) => s.setMazeType);
  const generateMaze = useVisualizerStore((s) => s.generateMaze);
  const isVisualizing = useVisualizerStore((s) => s.isVisualizing);
  const [isGenerating, setIsGenerating] = useState(false);
  const mazeSelectId = useId();

  const currentMaze = MAZE_INFO[mazeType];

  const handleGenerate = async () => {
    setIsGenerating(true);
    await generateMaze();
    // Brief delay so user sees spin
    setTimeout(() => setIsGenerating(false), 400);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={mazeSelectId} className="text-xs font-medium text-[#8888aa] uppercase tracking-wider">
        Maze
      </label>

      <div className="flex gap-2">
        {/* Maze type dropdown */}
        <select
          id={mazeSelectId}
          value={mazeType}
          onChange={(e) => setMazeType(e.target.value as MazeType)}
          disabled={isVisualizing}
          className={`flex-1 min-w-0 glass-select text-xs py-2 px-3 ${isVisualizing ? 'opacity-40 pointer-events-none' : ''}`}
        >
          {mazeTypes.map(([type, info]) => (
            <option key={type} value={type}>
              {info.name}
            </option>
          ))}
        </select>

        {/* Generate button with spinning icon */}
        <motion.button
          type="button"
          onClick={handleGenerate}
          disabled={isVisualizing}
          className={`glass-button shrink-0 flex items-center gap-1.5 text-xs py-2 px-3 whitespace-nowrap
            ${isVisualizing ? 'opacity-40 pointer-events-none' : ''}
          `}
          title="Generate maze"
          aria-label={`Generate ${currentMaze.name} maze`}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            animate={isGenerating ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <Shuffle size={14} aria-hidden="true" />
          </motion.div>
          <span>Generate</span>
        </motion.button>
      </div>

      {/* Animated description + difficulty dots */}
      <div className="flex items-start gap-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={mazeType}
            className="text-[10px] text-[#555577] leading-tight flex-1"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {currentMaze.description}
          </motion.p>
        </AnimatePresence>

        {/* Difficulty dots */}
        <div className="flex items-center gap-0.5 mt-0.5 shrink-0" aria-label={`Difficulty: ${currentMaze.difficulty} of 3`}>
          {[1, 2, 3].map((level) => (
            <div
              key={level}
              className={`difficulty-dot ${
                level <= currentMaze.difficulty ? 'difficulty-dot--active' : 'difficulty-dot--inactive'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
