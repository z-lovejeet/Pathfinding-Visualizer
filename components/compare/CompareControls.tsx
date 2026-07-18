'use client';

import React from 'react';
import { Play, Trash2, Shuffle } from 'lucide-react';
import { useCompareStore } from '@/store/useCompareStore';
import { AlgorithmType, MazeType } from '@/lib/grid/types';
import { ALGORITHM_INFO, MAZE_INFO } from '@/lib/constants';

const algorithms = Object.entries(ALGORITHM_INFO) as [AlgorithmType, { name: string }][];
const mazeTypes = Object.entries(MAZE_INFO) as [MazeType, { name: string }][];

/**
 * CompareControls — Glass panel with algorithm selectors,
 * speed slider, and action buttons for the compare page.
 */
export default function CompareControls() {
  const algo1 = useCompareStore((s) => s.algo1);
  const algo2 = useCompareStore((s) => s.algo2);
  const setAlgo1 = useCompareStore((s) => s.setAlgo1);
  const setAlgo2 = useCompareStore((s) => s.setAlgo2);
  const runComparison = useCompareStore((s) => s.runComparison);
  const clearResults = useCompareStore((s) => s.clearResults);
  const generateMaze = useCompareStore((s) => s.generateMaze);
  const isRunning = useCompareStore((s) => s.isRunning);
  const isComplete = useCompareStore((s) => s.isComplete);

  const [selectedMaze, setSelectedMaze] = React.useState<MazeType>('recursive-division');

  return (
    <div className="glass-elevated rounded-2xl p-5 flex flex-wrap items-end gap-4">
      {/* Algorithm 1 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#8888aa] uppercase tracking-wider flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#00d4ff]" />
          Algorithm 1
        </label>
        <select
          value={algo1}
          onChange={(e) => setAlgo1(e.target.value as AlgorithmType)}
          disabled={isRunning}
          className="glass-select text-sm py-2 px-3 min-w-[180px]"
        >
          {algorithms.map(([key, info]) => (
            <option key={key} value={key}>{info.name}</option>
          ))}
        </select>
      </div>

      {/* VS */}
      <span className="text-lg font-bold text-[#555577] pb-1">vs</span>

      {/* Algorithm 2 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#8888aa] uppercase tracking-wider flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#a855f7]" />
          Algorithm 2
        </label>
        <select
          value={algo2}
          onChange={(e) => setAlgo2(e.target.value as AlgorithmType)}
          disabled={isRunning}
          className="glass-select text-sm py-2 px-3 min-w-[180px]"
        >
          {algorithms.map(([key, info]) => (
            <option key={key} value={key}>{info.name}</option>
          ))}
        </select>
      </div>

      {/* Maze */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#8888aa] uppercase tracking-wider">Maze</label>
        <div className="flex gap-1.5">
          <select
            value={selectedMaze}
            onChange={(e) => setSelectedMaze(e.target.value as MazeType)}
            disabled={isRunning}
            className="glass-select text-sm py-2 px-3 min-w-[160px]"
          >
            {mazeTypes.map(([key, info]) => (
              <option key={key} value={key}>{info.name}</option>
            ))}
          </select>
          <button
            onClick={() => generateMaze(selectedMaze)}
            disabled={isRunning}
            className="glass-button flex items-center gap-1 text-sm py-2 px-3"
            title="Generate maze on both grids"
          >
            <Shuffle size={14} />
          </button>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={clearResults}
          disabled={isRunning}
          className="glass-button flex items-center gap-1.5 text-sm py-2 px-4"
        >
          <Trash2 size={14} />
          Clear
        </button>

        <button
          onClick={runComparison}
          disabled={isRunning}
          className={`glass-button-primary flex items-center gap-1.5 text-sm py-2 px-5 font-semibold ${
            isRunning ? 'opacity-40 pointer-events-none' : ''
          }`}
        >
          <Play size={14} />
          {isComplete ? 'Re-run' : 'Run Comparison'}
        </button>
      </div>
    </div>
  );
}
